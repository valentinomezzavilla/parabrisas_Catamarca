"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Plus, X } from "lucide-react";
import { Aviso, boton, Campo, input, tarjeta } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import { DIAS_LARGOS, minutosAHora, SEMANA } from "@/lib/tiempo";
import { guardarServicio } from "./acciones";

export interface ServicioEditable {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  duracionMinutos: number;
  intervaloMinutos: number;
  margenMinutos: number;
  capacidad: number;
  anticipacionMinutos: number;
  precioBase: number | null;
  color: string;
  requiereCristal: boolean;
  activo: boolean;
  orden: number;
  horarios: { diaSemana: number; horaInicio: number; horaFin: number }[];
}

interface Franja {
  diaSemana: number;
  desde: string;
  hasta: string;
}

const ANTICIPACIONES = [
  [0, "Sin anticipación"],
  [30, "30 minutos"],
  [60, "1 hora"],
  [120, "2 horas"],
  [240, "4 horas"],
  [720, "12 horas"],
  [1440, "1 día"],
  [2880, "2 días"],
] as const;

const FRANJA_NUEVA = { desde: "08:30", hasta: "12:30" };

export function FormularioServicio({ servicio }: { servicio?: ServicioEditable }) {
  const { estado, enviar, pendiente, error } = useFormularioAccion(guardarServicio.bind(null, servicio?.id ?? null));

  const [franjas, setFranjas] = useState<Franja[]>(
    servicio?.horarios.map((h) => ({
      diaSemana: h.diaSemana,
      desde: minutosAHora(h.horaInicio),
      hasta: minutosAHora(h.horaFin),
    })) ?? [1, 2, 3, 4, 5].map((diaSemana) => ({ diaSemana, ...FRANJA_NUEVA })),
  );

  const agregar = (diaSemana: number) => {
    const delDia = franjas.filter((f) => f.diaSemana === diaSemana);
    const nueva = delDia.length ? { desde: "16:30", hasta: "20:00" } : FRANJA_NUEVA;
    setFranjas([...franjas, { diaSemana, ...nueva }]);
  };
  const quitar = (indice: number) => setFranjas(franjas.filter((_, i) => i !== indice));
  const editar = (indice: number, cambios: Partial<Franja>) =>
    setFranjas(franjas.map((f, i) => (i === indice ? { ...f, ...cambios } : f)));
  const copiarLunes = () => {
    const lunes = franjas.filter((f) => f.diaSemana === 1);
    setFranjas([...franjas.filter((f) => ![1, 2, 3, 4, 5].includes(f.diaSemana)), ...[1, 2, 3, 4, 5].flatMap((d) => lunes.map((f) => ({ ...f, diaSemana: d })))]);
  };

  return (
    <form onSubmit={enviar} className="space-y-6" noValidate>
      {estado.mensaje && !estado.ok && <Aviso tono="peligro">{estado.mensaje}</Aviso>}

      {servicio && (
        <>
          <input type="hidden" name="slug" value={servicio.slug} />
          <input type="hidden" name="orden" value={servicio.orden} />
        </>
      )}
      <input type="hidden" name="horarios" value={JSON.stringify(franjas)} />

      <section className={`${tarjeta} grid gap-5 p-5 sm:grid-cols-2`}>
        <h2 className="font-display font-bold sm:col-span-2">Datos del servicio</h2>
        <Campo etiqueta="Nombre" htmlFor="nombre" error={error("nombre")}>
          <input id="nombre" name="nombre" defaultValue={servicio?.nombre} className={input} aria-invalid={!!error("nombre")} />
        </Campo>
        <Campo etiqueta="Precio base (opcional)" htmlFor="precioBase" error={error("precioBase")} ayuda="Se muestra como referencia al reservar">
          <input id="precioBase" name="precioBase" type="number" min={0} step="0.01" defaultValue={servicio?.precioBase ?? ""} className={input} />
        </Campo>
        <Campo etiqueta="Descripción" htmlFor="descripcion" error={error("descripcion")} className="sm:col-span-2">
          <textarea id="descripcion" name="descripcion" rows={2} defaultValue={servicio?.descripcion ?? ""} className={input} />
        </Campo>
        <Campo etiqueta="Color en la agenda" htmlFor="color" error={error("color")}>
          <input id="color" name="color" type="color" defaultValue={servicio?.color ?? "#FDDD3D"} className="h-10 w-20 cursor-pointer rounded-lg border border-borde bg-superficie p-1" />
        </Campo>
        <div className="space-y-3 self-center">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="activo" defaultChecked={servicio?.activo ?? true} className="size-4 accent-amarillo-500" />
            Activo (se ofrece en el turnero)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="requiereCristal" defaultChecked={servicio?.requiereCristal} className="size-4 accent-amarillo-500" />
            Usa un cristal del stock (colocaciones)
          </label>
        </div>
      </section>

      <section className={`${tarjeta} grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4`}>
        <h2 className="font-display font-bold sm:col-span-2 lg:col-span-4">Tiempos y capacidad</h2>
        <Campo etiqueta="Duración (min)" htmlFor="duracionMinutos" error={error("duracionMinutos")} ayuda="Tiempo estimado del trabajo">
          <input id="duracionMinutos" name="duracionMinutos" type="number" min={5} step={5} defaultValue={servicio?.duracionMinutos ?? 60} className={input} aria-invalid={!!error("duracionMinutos")} />
        </Campo>
        <Campo etiqueta="Turnos cada (min)" htmlFor="intervaloMinutos" error={error("intervaloMinutos")} ayuda="Cada cuánto se ofrece un horario">
          <input id="intervaloMinutos" name="intervaloMinutos" type="number" min={5} step={5} defaultValue={servicio?.intervaloMinutos ?? 30} className={input} />
        </Campo>
        <Campo etiqueta="Margen entre trabajos (min)" htmlFor="margenMinutos" error={error("margenMinutos")} ayuda="Limpieza o preparación">
          <input id="margenMinutos" name="margenMinutos" type="number" min={0} step={5} defaultValue={servicio?.margenMinutos ?? 0} className={input} />
        </Campo>
        <Campo etiqueta="Vehículos a la vez" htmlFor="capacidad" error={error("capacidad")} ayuda="Boxes u operarios disponibles">
          <input id="capacidad" name="capacidad" type="number" min={1} defaultValue={servicio?.capacidad ?? 1} className={input} />
        </Campo>
        <Campo etiqueta="Anticipación mínima" htmlFor="anticipacionMinutos" error={error("anticipacionMinutos")} className="sm:col-span-2">
          <select id="anticipacionMinutos" name="anticipacionMinutos" defaultValue={servicio?.anticipacionMinutos ?? 60} className={input}>
            {ANTICIPACIONES.map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>{etiqueta}</option>
            ))}
          </select>
        </Campo>
      </section>

      <section className={`${tarjeta} space-y-4 p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display font-bold">Días y horarios de atención</h2>
            <p className="text-sm text-texto-suave">Podés cargar más de una franja por día (horario cortado).</p>
          </div>
          <button type="button" onClick={copiarLunes} className={`${boton.secundario} ${boton.chico}`}>
            <Copy className="size-3.5" aria-hidden /> Copiar lunes a días hábiles
          </button>
        </div>
        {error("horarios") && <p className="text-sm text-peligro">{error("horarios")}</p>}

        <div className="divide-y divide-borde">
          {SEMANA.map((dia) => {
            const delDia = franjas.map((f, i) => ({ ...f, i })).filter((f) => f.diaSemana === dia);
            return (
              <div key={dia} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start">
                <span className={`w-28 pt-2 text-sm font-semibold ${delDia.length ? "" : "text-texto-suave"}`}>{DIAS_LARGOS[dia]}</span>
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  {delDia.length === 0 && <span className="py-2 text-sm text-texto-suave">Cerrado</span>}
                  {delDia.map((f) => {
                    const fallo = error(`horarios.${f.i}.hasta`) ?? error(`horarios.${f.i}.desde`);
                    return (
                      <div key={f.i} className="flex flex-col">
                        <div className={`flex items-center gap-1 rounded-lg border px-2 py-1 ${fallo ? "border-peligro" : "border-borde"}`}>
                          <input type="time" aria-label={`${DIAS_LARGOS[dia]} desde`} value={f.desde} onChange={(e) => editar(f.i, { desde: e.target.value })} className="bg-transparent text-sm" />
                          <span className="text-texto-suave">–</span>
                          <input type="time" aria-label={`${DIAS_LARGOS[dia]} hasta`} value={f.hasta} onChange={(e) => editar(f.i, { hasta: e.target.value })} className="bg-transparent text-sm" />
                          <button type="button" onClick={() => quitar(f.i)} aria-label="Quitar franja" className="rounded p-1 text-texto-suave hover:text-peligro">
                            <X className="size-3.5" />
                          </button>
                        </div>
                        {fallo && <span className="text-xs text-peligro">{fallo}</span>}
                      </div>
                    );
                  })}
                  <button type="button" onClick={() => agregar(dia)} className={`${boton.fantasma} ${boton.chico}`}>
                    <Plus className="size-3.5" aria-hidden /> {delDia.length ? "Franja" : "Abrir"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end gap-2">
        <Link href="/servicios" className={boton.secundario}>Cancelar</Link>
        <button type="submit" disabled={pendiente} className={boton.primario}>
          {pendiente ? "Guardando…" : servicio ? "Guardar cambios" : "Crear servicio"}
        </button>
      </div>
    </form>
  );
}
