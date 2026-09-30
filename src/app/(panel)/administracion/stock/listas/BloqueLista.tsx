"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { boton, input } from "@/components/ui";
import type { EstadoFormulario } from "@/lib/formularios";
import type { ListaId } from "@/modules/campos/lista.service";
import {
  activarItemAccion,
  crearItemAccion,
  eliminarItemAccion,
  moverUbicacionAccion,
  renombrarItemAccion,
  tieneLadoAccion,
} from "./acciones";

export interface ItemVista {
  id: string;
  nombre: string;
  activo: boolean;
  enUso: number;
  tieneLado?: boolean;
}

export function BloqueLista({ lista, items, marcaId }: { lista: ListaId; items: ItemVista[]; marcaId?: string }) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string>();
  const [nuevo, setNuevo] = useState("");
  const [nuevoConLado, setNuevoConLado] = useState(false);
  const [editados, setEditados] = useState<Record<string, string>>({});

  const ejecutar = (accion: () => Promise<EstadoFormulario>, despues?: () => void) =>
    iniciar(async () => {
      setError(undefined);
      const r = await accion();
      if (!r.ok) setError(r.mensaje);
      else despues?.();
    });

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {items.length === 0 && <li className="text-sm text-texto-suave">Todavía no hay elementos.</li>}
        {items.map((it, i) => {
          const texto = editados[it.id] ?? it.nombre;
          return (
            <li key={it.id} className={`flex flex-wrap items-center gap-2 ${it.activo ? "" : "opacity-60"}`}>
              {lista === "ubicaciones" && (
                <span className="flex">
                  <button type="button" disabled={pendiente || i === 0} onClick={() => ejecutar(() => moverUbicacionAccion(it.id, "ARRIBA"))} aria-label="Subir" className={`${boton.fantasma} ${boton.chico}`}>
                    <ArrowUp className="size-3.5" aria-hidden />
                  </button>
                  <button type="button" disabled={pendiente || i === items.length - 1} onClick={() => ejecutar(() => moverUbicacionAccion(it.id, "ABAJO"))} aria-label="Bajar" className={`${boton.fantasma} ${boton.chico}`}>
                    <ArrowDown className="size-3.5" aria-hidden />
                  </button>
                </span>
              )}
              <input
                aria-label="Nombre"
                value={texto}
                onChange={(e) => setEditados({ ...editados, [it.id]: e.target.value })}
                className={`${input} max-w-64`}
              />
              {texto !== it.nombre && (
                <button
                  type="button"
                  disabled={pendiente}
                  onClick={() => ejecutar(() => renombrarItemAccion(lista, it.id, texto), () => setEditados(({ [it.id]: _, ...resto }) => resto))}
                  className={`${boton.primario} ${boton.chico}`}
                >
                  Guardar nombre
                </button>
              )}
              {lista === "ubicaciones" && (
                <label className="flex items-center gap-1.5 text-xs text-texto-suave">
                  <input
                    type="checkbox"
                    checked={it.tieneLado ?? false}
                    disabled={pendiente}
                    onChange={(e) => ejecutar(() => tieneLadoAccion(it.id, e.target.checked))}
                    className="size-4 accent-amarillo-500"
                  />
                  Tiene lado (izq./der.)
                </label>
              )}
              <span className="text-xs text-texto-suave">{it.enUso > 0 ? `En uso: ${it.enUso}` : "Sin uso"}</span>
              <button type="button" disabled={pendiente} onClick={() => ejecutar(() => activarItemAccion(lista, it.id, !it.activo))} className={`${boton.fantasma} ${boton.chico}`}>
                {it.activo ? "Desactivar" : "Activar"}
              </button>
              <button
                type="button"
                disabled={pendiente || it.enUso > 0}
                title={it.enUso > 0 ? "Está en uso: desactivalo en lugar de borrarlo" : "Borrar"}
                onClick={() => ejecutar(() => eliminarItemAccion(lista, it.id))}
                aria-label="Borrar"
                className={`${boton.fantasma} ${boton.chico}`}
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>

      {error && <p role="alert" className="text-sm text-peligro">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <input aria-label="Nuevo elemento" placeholder="Nuevo elemento" value={nuevo} onChange={(e) => setNuevo(e.target.value)} className={`${input} max-w-64`} />
        {lista === "ubicaciones" && (
          <label className="flex items-center gap-1.5 text-xs text-texto-suave">
            <input type="checkbox" checked={nuevoConLado} onChange={(e) => setNuevoConLado(e.target.checked)} className="size-4 accent-amarillo-500" />
            Tiene lado
          </label>
        )}
        <button
          type="button"
          disabled={pendiente || nuevo.trim() === ""}
          onClick={() => ejecutar(() => crearItemAccion(lista, marcaId ?? null, nuevo, nuevoConLado), () => { setNuevo(""); setNuevoConLado(false); })}
          className={`${boton.secundario} ${boton.chico}`}
        >
          <Plus className="size-3.5" aria-hidden /> Agregar
        </button>
      </div>
    </div>
  );
}
