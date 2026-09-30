"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { boton, input } from "@/components/ui";
import type { OperacionOpcion } from "@/modules/campos/campo.service";
import type { OpcionCampo } from "@/modules/campos/tipos";
import { opcionAccion } from "../../acciones";

export function EditorOpciones({ id, opciones }: { id: string; opciones: OpcionCampo[] }) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string>();
  const [nueva, setNueva] = useState("");
  const [editadas, setEditadas] = useState<Record<string, string>>({});

  const ejecutar = (operacion: OperacionOpcion, despues?: () => void) =>
    iniciar(async () => {
      setError(undefined);
      const r = await opcionAccion(id, operacion);
      if (!r.ok) setError(r.mensaje);
      else despues?.();
    });

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {opciones.map((o) => {
          const texto = editadas[o.id] ?? o.etiqueta;
          return (
            <li key={o.id} className={`flex flex-wrap items-center gap-2 ${o.activo ? "" : "opacity-60"}`}>
              <input
                aria-label="Nombre de la opción"
                value={texto}
                onChange={(e) => setEditadas({ ...editadas, [o.id]: e.target.value })}
                className={`${input} max-w-64`}
              />
              {texto !== o.etiqueta && (
                <button
                  type="button"
                  disabled={pendiente}
                  onClick={() => ejecutar({ tipo: "renombrar", opcionId: o.id, etiqueta: texto }, () => setEditadas(({ [o.id]: _, ...resto }) => resto))}
                  className={`${boton.primario} ${boton.chico}`}
                >
                  Guardar nombre
                </button>
              )}
              <button
                type="button"
                disabled={pendiente}
                onClick={() => ejecutar({ tipo: "alternar", opcionId: o.id, activo: !o.activo })}
                className={`${boton.fantasma} ${boton.chico}`}
              >
                {o.activo ? "Desactivar" : "Activar"}
              </button>
              <button
                type="button"
                disabled={pendiente}
                onClick={() => ejecutar({ tipo: "quitar", opcionId: o.id })}
                aria-label="Borrar opción"
                className={`${boton.fantasma} ${boton.chico}`}
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
      {error && <p role="alert" className="text-sm text-peligro">{error}</p>}
      <div className="flex gap-2">
        <input aria-label="Nueva opción" placeholder="Nueva opción" value={nueva} onChange={(e) => setNueva(e.target.value)} className={`${input} max-w-64`} />
        <button
          type="button"
          disabled={pendiente || nueva.trim() === ""}
          onClick={() => ejecutar({ tipo: "agregar", etiqueta: nueva }, () => setNueva(""))}
          className={`${boton.secundario} ${boton.chico}`}
        >
          <Plus className="size-3.5" aria-hidden /> Agregar
        </button>
      </div>
      <p className="text-xs text-texto-suave">Una opción en uso no se puede borrar: desactivala y deja de ofrecerse, pero se sigue viendo donde ya está cargada.</p>
    </div>
  );
}
