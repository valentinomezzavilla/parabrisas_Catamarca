import Link from "next/link";
import { Clock, Pencil, Plus, Users } from "lucide-react";
import { Aviso, boton, EncabezadoPagina, Insignia, tarjeta, Vacio } from "@/components/ui";
import { BotonConfirmar, BotonEnviar } from "@/components/ui/cliente";
import { pesos } from "@/lib/formato";
import { DIAS_CORTOS, minutosAHora, SEMANA } from "@/lib/tiempo";
import { calcularSena } from "@/modules/pagos/sena";
import { obtenerCampos } from "@/modules/campos/campo.service";
import { formatearValor } from "@/modules/campos/extras";
import type { Extras } from "@/modules/campos/tipos";
import { listarServicios } from "@/modules/turnos/servicio.service";
import { alternarServicio, borrarServicio } from "./acciones";
import { requerirRol } from "@/lib/sesion";

export const metadata = { title: "Servicios" };

const AVISOS: Record<string, string> = {
  creado: "Servicio creado.",
  actualizado: "Cambios guardados.",
  eliminado: "Servicio eliminado.",
  archivado: "El servicio tenía turnos, así que se archivó: ya no se ofrece, pero su historial se conserva.",
};

/** Resume las franjas: "Lun a Vie 08:30–12:30 y 16:30–20:00 · Sáb 09:00–13:00". */
function resumenHorario(horarios: { diaSemana: number; horaInicio: number; horaFin: number }[]) {
  const porDia = new Map<number, string>();
  for (const d of SEMANA) {
    const franjas = horarios.filter((h) => h.diaSemana === d).map((h) => `${minutosAHora(h.horaInicio)}–${minutosAHora(h.horaFin)}`);
    if (franjas.length) porDia.set(d, franjas.join(" y "));
  }
  const grupos: { dias: number[]; franjas: string }[] = [];
  for (const [dia, franjas] of porDia) {
    const ultimo = grupos.at(-1);
    const anterior = ultimo?.dias.at(-1);
    const consecutivo = anterior !== undefined && SEMANA.indexOf(dia) === SEMANA.indexOf(anterior) + 1;
    if (ultimo && consecutivo && ultimo.franjas === franjas) ultimo.dias.push(dia);
    else grupos.push({ dias: [dia], franjas });
  }
  return grupos.map(({ dias, franjas }) => {
    const nombre = dias.length > 1 ? `${DIAS_CORTOS[dias[0]]} a ${DIAS_CORTOS[dias.at(-1)!]}` : DIAS_CORTOS[dias[0]];
    return `${nombre} ${franjas}`;
  });
}

export default async function PaginaServicios({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  await requerirRol("ADMIN");
  const [{ aviso }, servicios, campos] = await Promise.all([searchParams, listarServicios(), obtenerCampos("SERVICIO")]);
  const propios = campos.filter((c) => c.origen === "PROPIO" && c.visible);

  return (
    <>
      <EncabezadoPagina
        seccion="Turnero"
        titulo="Servicios"
        descripcion="Lo que se puede reservar, con sus horarios y tiempos."
        acciones={
          <Link href="/servicios/nuevo" className={boton.primario}>
            <Plus className="size-4" aria-hidden /> Nuevo servicio
          </Link>
        }
      />
      {aviso && AVISOS[aviso] && <Aviso tono={aviso === "archivado" ? "alerta" : "exito"}>{AVISOS[aviso]}</Aviso>}

      {servicios.length === 0 ? (
        <Vacio>Todavía no hay servicios. Creá el primero para empezar a dar turnos.</Vacio>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {servicios.map((s) => (
            <li key={s.id} className={`${tarjeta} flex overflow-hidden`}>
              <div className="w-1.5 shrink-0" style={{ background: s.color }} />
              <div className="flex-1 space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold">{s.nombre}</h2>
                    {s.descripcion && <p className="text-sm text-texto-suave">{s.descripcion}</p>}
                  </div>
                  {s.activo ? <Insignia tono="exito">Activo</Insignia> : <Insignia>Pausado</Insignia>}
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                  <span className="flex items-center gap-1.5"><Clock className="size-4 text-acento" aria-hidden />{s.duracionMinutos} min</span>
                  <span className="flex items-center gap-1.5"><Users className="size-4 text-acento" aria-hidden />{s.capacidad} a la vez</span>
                  {s.precioBase && <span className="font-semibold">${Number(s.precioBase).toLocaleString("es-AR")}</span>}
                </div>

                {(() => {
                  const sena = calcularSena(s.precioBase);
                  return sena === null ? (
                    <p className="text-xs text-texto-suave">Sin precio: se reserva sin seña.</p>
                  ) : (
                    <p className="text-xs text-texto-suave">Seña al reservar: <strong>{pesos(sena)}</strong></p>
                  );
                })()}

                <ul className="space-y-0.5 text-xs text-texto-suave">
                  {s.horarios.length ? resumenHorario(s.horarios).map((linea) => <li key={linea}>{linea}</li>) : <li>Sin horarios cargados</li>}
                </ul>

                {(() => {
                  const extras = s.extras as Extras;
                  const cargados = propios.filter((c) => extras[c.clave] !== undefined);
                  if (cargados.length === 0) return null;
                  return (
                    <dl className="grid gap-x-4 gap-y-0.5 border-t border-borde pt-3 text-xs sm:grid-cols-2">
                      {cargados.map((c) => (
                        <div key={c.clave} className="flex gap-1">
                          <dt className="text-texto-suave">{c.etiqueta}:</dt>
                          <dd className="font-medium">{formatearValor(c, extras[c.clave])}</dd>
                        </div>
                      ))}
                    </dl>
                  );
                })()}

                <div className="flex flex-wrap items-center gap-1 border-t border-borde pt-3">
                  <Link href={`/servicios/${s.id}`} className={`${boton.secundario} ${boton.chico}`}>
                    <Pencil className="size-3.5" aria-hidden /> Editar
                  </Link>
                  <form action={alternarServicio.bind(null, s.id, !s.activo)}>
                    <BotonEnviar variante="fantasma" className={boton.chico}>{s.activo ? "Pausar" : "Activar"}</BotonEnviar>
                  </form>
                  <div className="ml-auto">
                    <BotonConfirmar accion={borrarServicio.bind(null, s.id)} pregunta="¿Eliminar servicio?" confirmar="Eliminar" chico>
                      Eliminar
                    </BotonConfirmar>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
