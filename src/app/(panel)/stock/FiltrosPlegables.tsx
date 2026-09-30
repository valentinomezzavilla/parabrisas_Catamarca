"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

/**
 * En celular los filtros avanzados se pliegan detrás de un botón (el buscador por código queda siempre
 * a la vista); desde `md` se muestran siempre. El contenido sigue siendo parte del formulario del servidor.
 */
export function FiltrosPlegables({ abiertoInicial, activos, children }: { abiertoInicial: boolean; activos: number; children: ReactNode }) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  return (
    <>
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls="filtros-avanzados"
        onClick={() => setAbierto((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-borde px-3 text-sm font-semibold md:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="size-4" aria-hidden /> Filtros
          {activos > 0 && <span className="rounded-full bg-marca px-2 py-0.5 text-xs text-sobre-marca">{activos}</span>}
        </span>
        <ChevronDown className={`size-4 transition-transform ${abierto ? "rotate-180" : ""}`} aria-hidden />
      </button>
      <div id="filtros-avanzados" className={`${abierto ? "grid" : "hidden"} gap-3 md:grid md:grid-cols-2 lg:grid-cols-4`}>
        {children}
      </div>
    </>
  );
}
