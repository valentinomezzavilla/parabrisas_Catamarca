"use client";

import { useState, useTransition } from "react";
import { boton } from "@/components/ui";
import type { EstadoConConteo } from "@/lib/formularios";
import { archivarCampoAccion, eliminarCampoAccion } from "../../acciones";

export function ZonaPeligro({ id, archivado }: { id: string; archivado: boolean }) {
  const [pendiente, iniciar] = useTransition();
  const [resultado, setResultado] = useState<EstadoConConteo>();

  const eliminar = (confirmar: boolean) =>
    iniciar(async () => {
      const r = await eliminarCampoAccion(id, confirmar); // sin datos, o ya confirmado: redirige y no vuelve acá
      if (r) setResultado(r);
    });
  const pideConfirmar = resultado && !resultado.ok && resultado.afectados !== undefined;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pendiente} onClick={() => iniciar(async () => { await archivarCampoAccion(id, !archivado); })} className={boton.secundario}>
          {archivado ? "Restaurar" : "Archivar"}
        </button>
        <button type="button" disabled={pendiente} onClick={() => eliminar(false)} className={boton.peligro}>
          Eliminar
        </button>
      </div>
      <p className="text-xs text-texto-suave">Archivar oculta el campo pero conserva sus valores. Eliminar borra el campo y sus valores de todos los cristales.</p>
      {pideConfirmar && (
        <div role="alert" className="space-y-2 rounded-lg border border-peligro/40 bg-peligro/10 p-3 text-sm">
          <p>{resultado.mensaje} No se puede deshacer.</p>
          <div className="flex gap-2">
            <button type="button" disabled={pendiente} onClick={() => eliminar(true)} className={`${boton.peligro} ${boton.chico}`}>Sí, eliminar el campo y sus valores</button>
            <button type="button" onClick={() => setResultado(undefined)} className={`${boton.fantasma} ${boton.chico}`}>No</button>
          </div>
        </div>
      )}
      {resultado && !resultado.ok && resultado.afectados === undefined && <p role="alert" className="text-sm text-peligro">{resultado.mensaje}</p>}
    </div>
  );
}
