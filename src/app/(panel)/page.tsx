import Link from "next/link";
import { connection } from "next/server";
import { AlertTriangle, ArrowRight, CalendarCheck, CalendarClock, Hourglass, PackageMinus, Undo2 } from "lucide-react";
import { boton, EncabezadoPagina, Estadistica, Insignia, tarjeta, Vacio } from "@/components/ui";
import { BotonEnviar } from "@/components/ui/cliente";
import { pesos } from "@/lib/formato";
import { formatearFecha, formatearHora, hoy } from "@/lib/tiempo";
import { liberarVencidos, listarPagosParaDevolver } from "@/modules/pagos/pagos.service";
import { marcarPagoDevuelto } from "./turnos/acciones";
import { cristalesConStockBajo } from "@/modules/inventario/cristal.service";
import { listarTurnosDelDia } from "@/modules/turnos/turno.service";
import { ESTADOS } from "./turnos/estados";
import { verificarSesion } from "@/lib/sesion";

export const metadata = { title: "Panel" };

function Seccion({ titulo, href, enlace, children }: { titulo: string; href: string; enlace: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold">{titulo}</h2>
        <Link href={href} className="flex min-h-9 items-center gap-1 text-sm font-semibold text-acento hover:underline">
          {enlace} <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
      {children}
    </section>
  );
}

export default async function Panel() {
  await verificarSesion();
  await connection(); // siempre datos al momento, nunca una versión precalculada
  await liberarVencidos();
  const fecha = hoy();
  const [turnos, stockBajo, aDevolver] = await Promise.all([listarTurnosDelDia(fecha), cristalesConStockBajo(), listarPagosParaDevolver()]);
  const activos = turnos.filter((t) => !["CANCELADO", "AUSENTE"].includes(t.estado));
  const pendientes = activos.filter((t) => t.estado === "PENDIENTE").length;

  return (
    <>
      <EncabezadoPagina seccion="Panel" titulo="Resumen del local" descripcion={formatearFecha(fecha).replace(/^./, (c) => c.toUpperCase())} />

      {aDevolver.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold">Pagos para devolver</h2>
          <ul className={`${tarjeta} divide-y divide-borde overflow-hidden`}>
            {aDevolver.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                <Undo2 className="size-4 shrink-0 text-alerta" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    {p.turno.cliente.nombre} · {pesos(p.monto)}
                  </span>
                  <span className="block text-xs text-texto-suave">
                    {p.turno.servicio.nombre} · {p.motivoDevolucion}
                  </span>
                </span>
                <form action={marcarPagoDevuelto.bind(null, p.id)}>
                  <BotonEnviar variante="secundario" className={boton.chico}>Ya lo devolví</BotonEnviar>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* En celular las tres tarjetas van en una fila compacta en lugar de apilarse. */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <Estadistica etiqueta="Turnos hoy" valor={activos.length} Icono={CalendarCheck} tono="marca" />
        <Estadistica etiqueta="Sin confirmar" valor={pendientes} Icono={Hourglass} tono={pendientes ? "alerta" : "exito"} />
        <Estadistica etiqueta="Para reponer" valor={stockBajo.length} Icono={PackageMinus} tono={stockBajo.length ? "alerta" : "exito"} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <Seccion titulo="Turnos de hoy" href="/turnos" enlace="Ver agenda">
          {turnos.length === 0 ? (
            <Vacio Icono={CalendarClock}>No hay turnos para hoy.</Vacio>
          ) : (
            <ul className={`${tarjeta} divide-y divide-borde overflow-hidden`}>
              {turnos.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: t.servicio.color }} aria-hidden />
                  <span className="w-12 shrink-0 font-display font-bold tabular-nums">{formatearHora(t.inicio)}</span>
                  <span className="min-w-0 flex-1 truncate">
                    {t.servicio.nombre} · <span className="text-texto-suave">{t.cliente.nombre}</span>
                  </span>
                  <Insignia tono={ESTADOS[t.estado].tono}>{ESTADOS[t.estado].etiqueta}</Insignia>
                </li>
              ))}
            </ul>
          )}
        </Seccion>

        <Seccion titulo="Stock para reponer" href="/stock" enlace="Ver stock">
          {stockBajo.length === 0 ? (
            <Vacio Icono={PackageMinus}>No hay cristales por debajo del stock mínimo.</Vacio>
          ) : (
            <ul className={`${tarjeta} divide-y divide-borde overflow-hidden`}>
              {stockBajo.map((c) => (
                <li key={c.id}>
                  <Link href={`/stock/${c.id}`} className="flex min-h-14 items-center gap-3 px-4 py-3 text-sm hover:bg-grafito-500/5">
                    <AlertTriangle className={`size-4 shrink-0 ${c.cantidad === 0 ? "text-peligro" : "text-alerta"}`} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{c.descripcion}</span>
                      <span className="font-mono text-xs text-texto-suave">{c.codigo}</span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">
                      {c.cantidad} <span className="font-normal text-texto-suave">/ mín. {c.stockMinimo}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Seccion>
      </div>

      <Link
        href="/reservar"
        target="_blank"
        className="group relative flex items-center gap-4 overflow-hidden rounded-tarjeta bg-grafito-900 p-4 text-sm text-grafito-100 shadow-tarjeta ring-1 ring-grafito-800 transition-colors hover:ring-marca sm:p-5"
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-marca" />
        <CalendarClock className="ml-1 size-6 shrink-0 text-marca" aria-hidden />
        <span className="min-w-0 flex-1">
          <strong className="block font-display text-base text-white">Página pública de turnos</strong>
          <span className="text-grafito-300">
            Compartí <code className="rounded bg-white/10 px-1 text-marca">/reservar</code> para que los clientes reserven solos.
          </span>
        </span>
        <ArrowRight className="size-5 shrink-0 text-grafito-400 transition-transform group-hover:translate-x-0.5 group-hover:text-marca" aria-hidden />
      </Link>
    </>
  );
}
