"use client";

import Link from "next/link";
import { boton, Campo, input, tarjeta } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import type { TipoCampo } from "@/modules/campos/tipos";
import { MODULOS, type ModuloAdmin } from "@/modules/campos/modulos";
import { guardarCampoPropioAccion } from "./acciones";

export function FormularioCampoPropio(props: {
  modulo: ModuloAdmin;
  id: string;
  etiqueta: string;
  ayuda: string;
  tipo: TipoCampo;
  requerido: boolean;
  unidad: string;
  visible: boolean;
}) {
  const { estado, enviar, pendiente, error } = useFormularioAccion(guardarCampoPropioAccion.bind(null, props.modulo, props.id));
  return (
    <form onSubmit={enviar} noValidate className={`${tarjeta} space-y-4 p-5`}>
      {estado.mensaje && !estado.ok && !estado.errores && (
        <p role="alert" className="rounded-lg border border-peligro/40 bg-peligro/10 px-3 py-2 text-sm text-peligro">{estado.mensaje}</p>
      )}
      <Campo etiqueta="Nombre del campo" htmlFor="etiqueta" error={error("etiqueta")}>
        <input id="etiqueta" name="etiqueta" defaultValue={props.etiqueta} className={input} aria-invalid={!!error("etiqueta")} />
      </Campo>
      <Campo etiqueta="Ayuda" htmlFor="ayuda" error={error("ayuda")}>
        <input id="ayuda" name="ayuda" defaultValue={props.ayuda} className={input} />
      </Campo>
      {props.tipo === "NUMERO" && (
        <Campo etiqueta="Unidad" htmlFor="unidad" error={error("unidad")}>
          <input id="unidad" name="unidad" defaultValue={props.unidad} className={input} />
        </Campo>
      )}
      {props.tipo !== "SI_NO" && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="requerido" defaultChecked={props.requerido} className="size-4 accent-amarillo-500" />
          Obligatorio al cargar {MODULOS[props.modulo].objeto}
        </label>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="visible" defaultChecked={props.visible} className="size-4 accent-amarillo-500" />
        Mostrar este campo en el formulario y en la ficha
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={pendiente} className={boton.primario}>{pendiente ? "Guardando…" : "Guardar"}</button>
        <Link href={MODULOS[props.modulo].base} className={boton.secundario}>Cancelar</Link>
      </div>
    </form>
  );
}
