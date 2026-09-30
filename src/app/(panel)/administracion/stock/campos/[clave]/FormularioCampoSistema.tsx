"use client";

import Link from "next/link";
import { boton, Campo, input, tarjeta } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import { guardarCampoSistemaAccion } from "../../acciones";

export function FormularioCampoSistema(props: {
  clave: string;
  etiqueta: string;
  ayuda: string;
  visible: boolean;
  ocultable: boolean;
  fabrica: string;
}) {
  const { estado, enviar, pendiente, error } = useFormularioAccion(guardarCampoSistemaAccion.bind(null, props.clave));
  return (
    <form onSubmit={enviar} noValidate className={`${tarjeta} space-y-4 p-5`}>
      {estado.mensaje && !estado.ok && !estado.errores && (
        <p role="alert" className="rounded-lg border border-peligro/40 bg-peligro/10 px-3 py-2 text-sm text-peligro">{estado.mensaje}</p>
      )}
      <Campo etiqueta="Nombre que se muestra" htmlFor="etiqueta" error={error("etiqueta")} ayuda={`De fábrica: ${props.fabrica}. Dejalo vacío para volver a ese nombre.`}>
        <input id="etiqueta" name="etiqueta" defaultValue={props.etiqueta} className={input} aria-invalid={!!error("etiqueta")} />
      </Campo>
      <Campo etiqueta="Ayuda" htmlFor="ayuda" error={error("ayuda")} ayuda="Aparece debajo del campo. Vacío = la de fábrica.">
        <input id="ayuda" name="ayuda" defaultValue={props.ayuda} className={input} />
      </Campo>
      {props.ocultable ? (
        <>
          <input type="hidden" name="puedeOcultar" value="1" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="visible" defaultChecked={props.visible} className="size-4 accent-amarillo-500" />
            Mostrar este campo en el formulario y en la ficha
          </label>
          {error("oculto") && <p className="text-xs text-peligro">{error("oculto")}</p>}
        </>
      ) : (
        <p className="text-sm text-texto-suave">Este campo es necesario para que el sistema funcione: no se puede ocultar.</p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={pendiente} className={boton.primario}>{pendiente ? "Guardando…" : "Guardar"}</button>
        <Link href="/administracion/stock" className={boton.secundario}>Cancelar</Link>
      </div>
    </form>
  );
}
