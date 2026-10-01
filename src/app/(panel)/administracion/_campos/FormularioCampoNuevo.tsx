"use client";

import Link from "next/link";
import { useState } from "react";
import { boton, Campo, input, tarjeta } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import { MODULOS, type ModuloAdmin } from "@/modules/campos/modulos";
import { ETIQUETA_TIPO, TIPOS_CAMPO, type TipoCampo } from "@/modules/campos/tipos";
import { crearCampoAccion } from "./acciones";

export function FormularioCampoNuevo({ modulo }: { modulo: ModuloAdmin }) {
  const { estado, enviar, pendiente, error } = useFormularioAccion(crearCampoAccion.bind(null, modulo));
  const [tipo, setTipo] = useState<TipoCampo>("TEXTO");

  return (
    <form onSubmit={enviar} noValidate className={`${tarjeta} max-w-xl space-y-4 p-6`}>
      {estado.mensaje && !estado.ok && !estado.errores && (
        <p role="alert" className="rounded-lg border border-peligro/40 bg-peligro/10 px-3 py-2 text-sm text-peligro">{estado.mensaje}</p>
      )}

      <Campo etiqueta="Nombre del campo" htmlFor="etiqueta" error={error("etiqueta")} ayuda="Como se va a ver en el formulario y en la ficha.">
        <input id="etiqueta" name="etiqueta" autoComplete="off" className={input} aria-invalid={!!error("etiqueta")} />
      </Campo>

      <Campo etiqueta="Tipo de dato" htmlFor="tipo" error={error("tipo")}>
        <select id="tipo" name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoCampo)} className={input}>
          {TIPOS_CAMPO.map((t) => <option key={t} value={t}>{ETIQUETA_TIPO[t]}</option>)}
        </select>
      </Campo>

      {tipo === "LISTA" && (
        <Campo etiqueta="Opciones" htmlFor="opcionesTexto" error={error("opcionesTexto")} ayuda="Una opción por renglón. Después las podés renombrar, desactivar y sumar más.">
          <textarea id="opcionesTexto" name="opcionesTexto" rows={5} className={input} aria-invalid={!!error("opcionesTexto")} />
        </Campo>
      )}

      {tipo === "NUMERO" && (
        <Campo etiqueta="Unidad" htmlFor="unidad" error={error("unidad")} ayuda="Opcional. Ej. mm, kg.">
          <input id="unidad" name="unidad" className={input} />
        </Campo>
      )}

      <Campo etiqueta="Ayuda" htmlFor="ayuda" error={error("ayuda")} ayuda="Opcional. Aparece debajo del campo.">
        <input id="ayuda" name="ayuda" className={input} />
      </Campo>

      {tipo !== "SI_NO" && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="requerido" className="size-4 accent-amarillo-500" />
          Obligatorio al cargar {MODULOS[modulo].objeto}
        </label>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={pendiente} className={boton.primario}>{pendiente ? "Guardando…" : "Crear campo"}</button>
        <Link href={MODULOS[modulo].base} className={boton.secundario}>Cancelar</Link>
      </div>
    </form>
  );
}
