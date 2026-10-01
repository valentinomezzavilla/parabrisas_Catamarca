"use client";

import { useState, useTransition } from "react";
import type { EstadoTurno } from "@/generated/prisma/client";
import { boton } from "@/components/ui";
import { actualizarEstadoTurno } from "./acciones";

type Accion = { estado: EstadoTurno; etiqueta: string; variante: keyof typeof boton; confirmar?: boolean };

/** Próximos pasos posibles según el estado actual del turno. */
const ACCIONES: Partial<Record<EstadoTurno, Accion[]>> = {
  ESPERANDO_PAGO: [{ estado: "CANCELADO", etiqueta: "Cancelar", variante: "fantasma", confirmar: true }],
  PENDIENTE: [
    { estado: "CONFIRMADO", etiqueta: "Confirmar", variante: "primario" },
    { estado: "CANCELADO", etiqueta: "Cancelar", variante: "fantasma", confirmar: true },
  ],
  CONFIRMADO: [
    { estado: "EN_CURSO", etiqueta: "Iniciar trabajo", variante: "primario" },
    { estado: "AUSENTE", etiqueta: "No vino", variante: "fantasma", confirmar: true },
    { estado: "CANCELADO", etiqueta: "Cancelar", variante: "fantasma", confirmar: true },
  ],
  EN_CURSO: [{ estado: "COMPLETADO", etiqueta: "Completar", variante: "primario" }],
};

export function AccionesTurno({ id, estado }: { id: string; estado: EstadoTurno }) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string>();
  const [aConfirmar, setAConfirmar] = useState<Accion>();

  const ejecutar = (accion: Accion) =>
    iniciar(async () => {
      setError(undefined);
      setAConfirmar(undefined);
      const r = await actualizarEstadoTurno(id, accion.estado);
      if (!r.ok) setError(r.mensaje);
    });

  const acciones = ACCIONES[estado] ?? [];
  if (acciones.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {aConfirmar ? (
          <>
            <span className="text-xs text-texto-suave">¿{aConfirmar.etiqueta}?</span>
            <button type="button" disabled={pendiente} onClick={() => ejecutar(aConfirmar)} className={`${boton.peligro} ${boton.chico}`}>
              Sí
            </button>
            <button type="button" onClick={() => setAConfirmar(undefined)} className={`${boton.fantasma} ${boton.chico}`}>
              No
            </button>
          </>
        ) : (
          acciones.map((a) => (
            <button
              key={a.estado}
              type="button"
              disabled={pendiente}
              onClick={() => (a.confirmar ? setAConfirmar(a) : ejecutar(a))}
              className={`${boton[a.variante]} ${boton.chico}`}
            >
              {a.etiqueta}
            </button>
          ))
        )}
      </div>
      {error && <p role="alert" className="text-xs text-peligro">{error}</p>}
    </div>
  );
}
