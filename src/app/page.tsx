import { AlertTriangle, Clock, Users } from "lucide-react";
import { minutosAHora } from "@/lib/tiempo";
import { cristalesConStockBajo } from "@/modules/inventario/cristal.service";
import { listarServicios } from "@/modules/turnos/servicio.service";

export const dynamic = "force-dynamic";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default async function Panel() {
  const [servicios, stockBajo] = await Promise.all([listarServicios(), cristalesConStockBajo()]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="text-sm font-semibold tracking-widest text-acento uppercase">Panel</p>
        <h1 className="font-display text-3xl font-extrabold">Resumen del local</h1>
      </header>

      <section aria-labelledby="titulo-servicios" className="space-y-4">
        <h2 id="titulo-servicios" className="font-display text-lg font-bold">
          Servicios del turnero
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((s) => {
            const dias = [...new Set(s.horarios.map((h) => h.diaSemana))].map((d) => DIAS[d]).join(" · ");
            const franjas = [
              ...new Set(s.horarios.map((h) => `${minutosAHora(h.horaInicio)}–${minutosAHora(h.horaFin)}`)),
            ];
            return (
              <article
                key={s.id}
                className="overflow-hidden rounded-tarjeta border border-borde bg-superficie"
              >
                <div className="h-1.5" style={{ background: s.color }} />
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-bold">{s.nombre}</h3>
                    {!s.activo && (
                      <span className="rounded bg-grafito-100 px-2 py-0.5 text-xs text-grafito-600">Pausado</span>
                    )}
                  </div>
                  <p className="text-sm text-texto-suave">{s.descripcion}</p>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-acento" aria-hidden />
                      <dt className="sr-only">Duración</dt>
                      <dd>{s.duracionMinutos} min por trabajo</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-acento" aria-hidden />
                      <dt className="sr-only">Capacidad</dt>
                      <dd>
                        {s.capacidad} {s.capacidad === 1 ? "vehículo" : "vehículos"} a la vez
                      </dd>
                    </div>
                  </dl>
                  <p className="border-t border-borde pt-3 text-xs text-texto-suave">
                    {dias}
                    <br />
                    {franjas.join(" y ")}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="titulo-stock" className="space-y-4">
        <h2 id="titulo-stock" className="font-display text-lg font-bold">
          Stock para reponer
        </h2>
        {stockBajo.length === 0 ? (
          <p className="rounded-tarjeta border border-dashed border-borde p-6 text-sm text-texto-suave">
            No hay cristales por debajo del stock mínimo.
          </p>
        ) : (
          <ul className="divide-y divide-borde rounded-tarjeta border border-borde bg-superficie">
            {stockBajo.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <AlertTriangle className="size-4 shrink-0 text-alerta" aria-hidden />
                <span className="font-mono text-xs text-texto-suave">{c.codigo}</span>
                <span className="flex-1 truncate">{c.descripcion}</span>
                <span className="font-semibold tabular-nums">
                  {c.cantidad} / mín. {c.stockMinimo}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
