import Link from "next/link";
import { connection } from "next/server";
import { AlertTriangle, ArrowRight, CalendarClock } from "lucide-react";
import { EncabezadoPagina, Insignia, tarjeta, Vacio } from "@/components/ui";
import { formatearFecha, formatearHora, hoy } from "@/lib/tiempo";
import { cristalesConStockBajo } from "@/modules/inventario/cristal.service";
import { listarTurnosDelDia } from "@/modules/turnos/turno.service";
import { ESTADOS } from "./turnos/estados";
import { verificarSesion } from "@/lib/sesion";

export const metadata = { title: "Panel" };

function Seccion({ titulo, href, enlace, children }: { titulo: string; href: string; enlace: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold">{titulo}</h2>
        <Link href={href} className="flex items-center gap-1 text-sm font-semibold text-acento hover:underline">
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
  const fecha = hoy();
  const [turnos, stockBajo] = await Promise.all([listarTurnosDelDia(fecha), cristalesConStockBajo()]);
  const activos = turnos.filter((t) => !["CANCELADO", "AUSENTE"].includes(t.estado));
  const pendientes = activos.filter((t) => t.estado === "PENDIENTE").length;

  return (
    <>
      <EncabezadoPagina seccion="Panel" titulo="Resumen del local" descripcion={formatearFecha(fecha).replace(/^./, (c) => c.toUpperCase())} />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { etiqueta: "Turnos hoy", valor: activos.length, tono: "" },
          { etiqueta: "Sin confirmar", valor: pendientes, tono: pendientes ? "text-alerta" : "" },
          { etiqueta: "Cristales para reponer", valor: stockBajo.length, tono: stockBajo.length ? "text-alerta" : "" },
        ].map((k) => (
          <div key={k.etiqueta} className={`${tarjeta} p-5`}>
            <p className="text-sm text-texto-suave">{k.etiqueta}</p>
            <p className={`font-display text-4xl font-extrabold tabular-nums ${k.tono}`}>{k.valor}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Seccion titulo="Turnos de hoy" href="/turnos" enlace="Ver agenda">
          {turnos.length === 0 ? (
            <Vacio>No hay turnos para hoy.</Vacio>
          ) : (
            <ul className={`${tarjeta} divide-y divide-borde`}>
              {turnos.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: t.servicio.color }} />
                  <span className="w-12 font-semibold tabular-nums">{formatearHora(t.inicio)}</span>
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
            <Vacio>No hay cristales por debajo del stock mínimo.</Vacio>
          ) : (
            <ul className={`${tarjeta} divide-y divide-borde`}>
              {stockBajo.map((c) => (
                <li key={c.id}>
                  <Link href={`/stock/${c.id}`} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-grafito-500/5">
                    <AlertTriangle className={`size-4 shrink-0 ${c.cantidad === 0 ? "text-peligro" : "text-alerta"}`} aria-hidden />
                    <span className="font-mono text-xs text-texto-suave">{c.codigo}</span>
                    <span className="min-w-0 flex-1 truncate">{c.descripcion}</span>
                    <span className="font-semibold tabular-nums">
                      {c.cantidad} / mín. {c.stockMinimo}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Seccion>
      </div>

      <Link href="/reservar" target="_blank" className={`${tarjeta} flex items-center gap-3 p-4 text-sm hover:border-marca`}>
        <CalendarClock className="size-5 text-acento" aria-hidden />
        <span className="flex-1">
          <strong>Página pública de turnos:</strong> compartí <code className="rounded bg-grafito-500/10 px-1">/reservar</code> para que los clientes reserven solos.
        </span>
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </>
  );
}
