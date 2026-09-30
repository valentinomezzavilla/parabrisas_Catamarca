import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { boton, tarjeta, Vacio } from "@/components/ui";
import { pesos } from "@/lib/formato";
import { DIAS_CORTOS, diaSemana, formatearFecha, formatearHora, hoy, sumarDias } from "@/lib/tiempo";
import { listarServicios, obtenerDisponibilidad, obtenerServicioReservable } from "@/modules/turnos/servicio.service";
import { FormularioReserva } from "./FormularioReserva";

export const metadata = { title: "Reservar turno" };

const DIAS_A_MOSTRAR = 14;

function Paso({ numero, titulo, children }: { numero: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold">
        <span className="flex size-7 items-center justify-center rounded-full bg-marca text-sm text-sobre-marca">{numero}</span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export default async function PaginaReservar({
  searchParams,
}: {
  searchParams: Promise<{ servicio?: string; fecha?: string; inicio?: string }>;
}) {
  const params = await searchParams;
  const servicio = params.servicio ? await obtenerServicioReservable(params.servicio) : null;

  // Paso 1: elegir servicio
  if (!servicio) {
    const servicios = (await listarServicios()).filter((s) => s.activo);
    return (
      <Paso numero={1} titulo="¿Qué necesitás?">
        {servicios.length === 0 ? (
          <Vacio>En este momento no hay servicios disponibles para reservar online.</Vacio>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {servicios.map((s) => (
              <li key={s.id}>
                <Link href={`/reservar?servicio=${s.slug}`} className={`${tarjeta} group flex h-full overflow-hidden transition-colors hover:border-marca`}>
                  <span className="w-1.5 shrink-0" style={{ background: s.color }} />
                  <span className="flex-1 space-y-1 p-4">
                    <span className="block font-display font-bold group-hover:text-acento">{s.nombre}</span>
                    {s.descripcion && <span className="block text-sm text-texto-suave">{s.descripcion}</span>}
                    <span className="flex items-center gap-3 pt-1 text-xs text-texto-suave">
                      <span className="flex items-center gap-1"><Clock className="size-3.5" aria-hidden />{s.duracionMinutos} min aprox.</span>
                      {s.precioBase && <span>Desde {pesos(s.precioBase)}</span>}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Paso>
    );
  }

  // Paso 2: elegir día (se calcula cuántos horarios quedan en cada uno)
  const dias = Array.from({ length: DIAS_A_MOSTRAR }, (_, i) => sumarDias(hoy(), i));
  const libresPorDia = new Map<string, number>();
  for (const dia of dias) {
    const atiende = servicio.horarios.some((h) => h.diaSemana === diaSemana(dia));
    libresPorDia.set(dia, atiende ? (await obtenerDisponibilidad(servicio.id, dia)).length : 0);
  }
  const fecha = params.fecha && libresPorDia.has(params.fecha) ? params.fecha : undefined;
  const turnos = fecha ? await obtenerDisponibilidad(servicio.id, fecha) : [];
  const elegido = params.inicio ? turnos.find((t) => t.inicio.toISOString() === params.inicio) : undefined;
  const base = `/reservar?servicio=${servicio.slug}`;

  return (
    <>
      <div className={`${tarjeta} flex items-center justify-between gap-3 p-4`}>
        <div>
          <p className="text-xs text-texto-suave">Servicio</p>
          <p className="font-display font-bold">{servicio.nombre}</p>
        </div>
        <Link href="/reservar" className={`${boton.fantasma} ${boton.chico}`}>
          <ArrowLeft className="size-3.5" aria-hidden /> Cambiar
        </Link>
      </div>

      <Paso numero={2} titulo="Elegí el día">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {dias.map((dia) => {
            const libres = libresPorDia.get(dia) ?? 0;
            const actual = dia === fecha;
            const contenido = (
              <>
                <span className="block text-xs">{DIAS_CORTOS[diaSemana(dia)]}</span>
                <span className="block font-display text-lg font-bold">{Number(dia.slice(8))}</span>
                <span className="block text-[11px]">{formatearFecha(dia, { month: "short" })}</span>
              </>
            );
            const clase = "rounded-lg border px-1 py-2 text-center";
            return libres === 0 ? (
              <span key={dia} className={`${clase} border-borde text-texto-suave opacity-50`} title="Sin horarios disponibles">
                {contenido}
              </span>
            ) : (
              <Link
                key={dia}
                href={`${base}&fecha=${dia}`}
                aria-current={actual ? "date" : undefined}
                className={`${clase} transition-colors ${actual ? "border-marca bg-marca text-sobre-marca" : "border-borde bg-superficie hover:border-marca"}`}
              >
                {contenido}
              </Link>
            );
          })}
        </div>
      </Paso>

      {fecha && (
        <Paso numero={3} titulo={`Horarios del ${formatearFecha(fecha)}`}>
          {turnos.length === 0 ? (
            <Vacio>No quedan horarios para este día. Probá con otro.</Vacio>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {turnos.map((t) => {
                const iso = t.inicio.toISOString();
                const actual = elegido?.inicio.getTime() === t.inicio.getTime();
                return (
                  <Link
                    key={iso}
                    href={`${base}&fecha=${fecha}&inicio=${encodeURIComponent(iso)}#datos`}
                    className={`rounded-lg border py-2 text-center font-semibold tabular-nums transition-colors ${
                      actual ? "border-marca bg-marca text-sobre-marca" : "border-borde bg-superficie hover:border-marca"
                    }`}
                  >
                    {formatearHora(t.inicio)}
                  </Link>
                );
              })}
            </div>
          )}
          {params.inicio && !elegido && (
            <p className="text-sm text-peligro">El horario que elegiste ya no está disponible. Elegí otro, por favor.</p>
          )}
        </Paso>
      )}

      {fecha && elegido && (
        <div id="datos" className="scroll-mt-4">
          <Paso numero={4} titulo="Tus datos">
            <div className={`${tarjeta} space-y-4 p-5`}>
              <p className="rounded-lg bg-marca/15 px-4 py-3 text-sm">
                <strong>{servicio.nombre}</strong> · {formatearFecha(fecha)} a las <strong>{formatearHora(elegido.inicio)}</strong> hs
              </p>
              <FormularioReserva servicioId={servicio.id} inicio={elegido.inicio.toISOString()} />
            </div>
          </Paso>
        </div>
      )}
    </>
  );
}
