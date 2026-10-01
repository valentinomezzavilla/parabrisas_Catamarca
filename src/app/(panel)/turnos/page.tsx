import Link from "next/link";
import { Car, ChevronLeft, ChevronRight, Phone, Plus, StickyNote } from "lucide-react";
import { boton, EncabezadoPagina, Insignia, input, tarjeta, Vacio } from "@/components/ui";
import { BotonEnviar } from "@/components/ui/cliente";
import { pesos } from "@/lib/formato";
import { DIAS_CORTOS, diaSemana, formatearFecha, formatearHora, hoy, sumarDias } from "@/lib/tiempo";
import { liberarVencidos } from "@/modules/pagos/pagos.service";
import { listarServicios, obtenerDisponibilidad } from "@/modules/turnos/servicio.service";
import { contarTurnosPorDia, cristalesDisponibles, listarTurnosDelDia } from "@/modules/turnos/turno.service";
import { actualizarCristalTurno } from "./acciones";
import { AccionesTurno } from "./AccionesTurno";
import { ESTADOS } from "./estados";
import { verificarSesion } from "@/lib/sesion";

export const metadata = { title: "Turnos" };

export default async function PaginaTurnos({ searchParams }: { searchParams: Promise<{ fecha?: string }> }) {
  await verificarSesion();
  await liberarVencidos();
  const { fecha: param } = await searchParams;
  const fecha = param && /^\d{4}-\d{2}-\d{2}$/.test(param) ? param : hoy();
  const lunes = sumarDias(fecha, -((diaSemana(fecha) + 6) % 7));

  const [turnos, porDia, servicios, cristales] = await Promise.all([
    listarTurnosDelDia(fecha),
    contarTurnosPorDia(lunes, 7),
    listarServicios(),
    cristalesDisponibles(),
  ]);
  const activos = servicios.filter((s) => s.activo);
  const libres = await Promise.all(activos.map((s) => obtenerDisponibilidad(s.id, fecha)));

  return (
    <>
      <EncabezadoPagina
        seccion="Agenda"
        titulo={formatearFecha(fecha).replace(/^./, (c) => c.toUpperCase())}
        descripcion={fecha === hoy() ? "Hoy" : undefined}
        acciones={
          <>
            <Link href="/turnos" className={boton.secundario}>Hoy</Link>
            <Link href="/reservar" className={boton.primario}>
              <Plus className="size-4" aria-hidden /> Nuevo turno
            </Link>
          </>
        }
      />

      <nav aria-label="Semana" className="flex items-center gap-1">
        <Link href={`/turnos?fecha=${sumarDias(fecha, -7)}`} aria-label="Semana anterior" className={`${boton.fantasma} px-2`}>
          <ChevronLeft className="size-4" />
        </Link>
        <div className="grid flex-1 grid-cols-7 gap-1">
          {[...porDia].map(([dia, cantidad]) => {
            const actual = dia === fecha;
            return (
              <Link
                key={dia}
                href={`/turnos?fecha=${dia}`}
                aria-current={actual ? "date" : undefined}
                className={`rounded-lg border px-1 py-2 text-center transition-colors ${
                  actual ? "border-marca bg-marca text-sobre-marca" : "border-borde bg-superficie hover:border-grafito-400"
                }`}
              >
                <span className="block text-xs">{DIAS_CORTOS[diaSemana(dia)]}</span>
                <span className="block font-display text-lg font-bold">{Number(dia.slice(8))}</span>
                <span className={`block text-[11px] ${actual ? "" : "text-texto-suave"}`}>
                  {cantidad ? `${cantidad} turno${cantidad > 1 ? "s" : ""}` : "—"}
                </span>
              </Link>
            );
          })}
        </div>
        <Link href={`/turnos?fecha=${sumarDias(fecha, 7)}`} aria-label="Semana siguiente" className={`${boton.fantasma} px-2`}>
          <ChevronRight className="size-4" />
        </Link>
      </nav>

      {activos.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {activos.map((s, i) => (
            <span key={s.id} className="flex items-center gap-1.5 rounded-full border border-borde bg-superficie px-3 py-1">
              <span className="size-2 rounded-full" style={{ background: s.color }} />
              {s.nombre}: <strong>{libres[i].length}</strong> horarios libres
            </span>
          ))}
        </div>
      )}

      {turnos.length === 0 ? (
        <Vacio>No hay turnos para este día.</Vacio>
      ) : (
        <ol className="space-y-3">
          {turnos.map((t) => {
            const cerrado = ["CANCELADO", "AUSENTE"].includes(t.estado);
            return (
              <li key={t.id} className={`${tarjeta} flex overflow-hidden ${cerrado ? "opacity-60" : ""}`}>
                <div className="w-1.5 shrink-0" style={{ background: t.servicio.color }} />
                <div className="grid flex-1 gap-4 p-4 sm:grid-cols-[7rem_1fr_auto]">
                  <div>
                    <p className="font-display text-xl font-bold tabular-nums">{formatearHora(t.inicio)}</p>
                    <p className="text-xs text-texto-suave">hasta {formatearHora(t.fin)}</p>
                    <p className="mt-1 font-mono text-[11px] tracking-wider text-texto-suave">#{t.codigo}</p>
                  </div>

                  <div className="min-w-0 space-y-1.5 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{t.servicio.nombre}</span>
                      <Insignia tono={ESTADOS[t.estado].tono}>{ESTADOS[t.estado].etiqueta}</Insignia>
                      {t.pagos[0] && <Insignia tono="exito">Seña pagada {pesos(t.pagos[0].monto)}</Insignia>}
                      {t.estado === "ESPERANDO_PAGO" && t.venceEn && (
                        <span className="text-xs text-texto-suave">vence a las {formatearHora(t.venceEn)}</span>
                      )}
                    </div>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>{t.cliente.nombre}</span>
                      <a href={`tel:${t.cliente.telefono}`} className="flex items-center gap-1 text-acento hover:underline">
                        <Phone className="size-3.5" aria-hidden />{t.cliente.telefono}
                      </a>
                    </p>
                    {(t.vehiculo || t.patente) && (
                      <p className="flex items-center gap-1.5 text-texto-suave">
                        <Car className="size-3.5" aria-hidden />
                        {[t.vehiculo, t.patente].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {t.notas && (
                      <p className="flex items-start gap-1.5 text-texto-suave">
                        <StickyNote className="mt-0.5 size-3.5 shrink-0" aria-hidden />{t.notas}
                      </p>
                    )}

                    {t.servicio.requiereCristal && !cerrado && (
                      t.estado === "COMPLETADO" ? (
                        t.cristal && <p className="text-xs text-texto-suave">Cristal colocado: {t.cristal.codigo}</p>
                      ) : (
                        <form action={actualizarCristalTurno.bind(null, t.id)} className="flex max-w-md flex-wrap gap-2 pt-1">
                          <select name="cristalId" defaultValue={t.cristalId ?? ""} aria-label="Cristal a colocar" className={`${input} flex-1 py-1.5 text-xs`}>
                            <option value="">Sin cristal asignado</option>
                            {t.cristal && !cristales.some((c) => c.id === t.cristal!.id) && (
                              <option value={t.cristal.id}>{t.cristal.codigo} · sin stock</option>
                            )}
                            {cristales.map((c) => (
                              <option key={c.id} value={c.id}>{c.codigo} · {c.descripcion} ({c.cantidad})</option>
                            ))}
                          </select>
                          <BotonEnviar variante="secundario" className={boton.chico}>Asignar</BotonEnviar>
                        </form>
                      )
                    )}
                  </div>

                  <div className="sm:text-right">
                    <AccionesTurno id={t.id} estado={t.estado} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
