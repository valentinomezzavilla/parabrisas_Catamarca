"use client";

import { useState, useTransition } from "react";
import { boton, input } from "@/components/ui";
import type { EstadoConConteo } from "@/lib/formularios";
import { ETIQUETA_TIPO, TIPOS_CAMPO, type TipoCampo } from "@/modules/campos/tipos";
import type { ModuloAdmin } from "@/modules/campos/modulos";
import { cambiarTipoAccion } from "./acciones";

export function CambiarTipo({ modulo, id, tipoActual }: { modulo: ModuloAdmin; id: string; tipoActual: TipoCampo }) {
  const [pendiente, iniciar] = useTransition();
  const [tipo, setTipo] = useState<TipoCampo>(tipoActual);
  const [opciones, setOpciones] = useState("");
  const [resultado, setResultado] = useState<EstadoConConteo>();

  const enviar = (confirmar: boolean) =>
    iniciar(async () => setResultado(await cambiarTipoAccion(modulo, id, tipo, opciones, confirmar)));
  const pideConfirmar = resultado && !resultado.ok && resultado.afectados !== undefined;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Nuevo tipo" value={tipo} onChange={(e) => { setTipo(e.target.value as TipoCampo); setResultado(undefined); }} className={`${input} max-w-56`}>
          {TIPOS_CAMPO.map((t) => <option key={t} value={t}>{ETIQUETA_TIPO[t]}</option>)}
        </select>
        <button type="button" disabled={pendiente || tipo === tipoActual} onClick={() => enviar(false)} className={boton.secundario}>
          Cambiar tipo
        </button>
      </div>
      {tipo === "LISTA" && tipo !== tipoActual && (
        <textarea aria-label="Opciones, una por renglón" placeholder="Una opción por renglón" rows={4} value={opciones} onChange={(e) => setOpciones(e.target.value)} className={input} />
      )}
      {pideConfirmar && (
        <div role="alert" className="space-y-2 rounded-lg border border-alerta/40 bg-alerta/10 p-3 text-sm">
          <p>{resultado.mensaje} Cambiar el tipo borra esos valores y no se puede deshacer.</p>
          <div className="flex gap-2">
            <button type="button" disabled={pendiente} onClick={() => enviar(true)} className={`${boton.peligro} ${boton.chico}`}>Sí, cambiar y borrar los valores</button>
            <button type="button" onClick={() => setResultado(undefined)} className={`${boton.fantasma} ${boton.chico}`}>No</button>
          </div>
        </div>
      )}
      {resultado && !resultado.ok && resultado.afectados === undefined && <p role="alert" className="text-sm text-peligro">{resultado.mensaje}</p>}
      {resultado?.ok && <p role="status" className="text-sm text-exito">{resultado.mensaje}</p>}
    </div>
  );
}
