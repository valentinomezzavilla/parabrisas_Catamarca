"use client";

import { useEffect, useRef } from "react";
import { boton, input } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import { resetearPasswordAccion } from "./acciones";

export function FormularioPassword({ id }: { id: string }) {
  const { estado, enviar, pendiente, error } = useFormularioAccion(resetearPasswordAccion.bind(null, id));
  const formulario = useRef<HTMLFormElement>(null);

  // Tras guardar, se vacía el campo para que la clave nueva no quede en pantalla.
  useEffect(() => {
    if (estado.ok) formulario.current?.reset();
  }, [estado]);

  return (
    <form ref={formulario} onSubmit={enviar} className="flex flex-wrap items-start gap-2">
      <div>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 5 caracteres"
          aria-label="Nueva contraseña"
          aria-invalid={!!error("password")}
          className={`${input} max-w-56`}
        />
        {error("password") && <p className="mt-1 text-xs text-peligro">{error("password")}</p>}
      </div>
      <button type="submit" disabled={pendiente} className={`${boton.primario} ${boton.chico}`}>
        {pendiente ? "Guardando…" : "Guardar"}
      </button>
      {estado.ok && (
        <span role="status" className="self-center text-xs text-exito">
          {estado.mensaje}
        </span>
      )}
      {!estado.ok && estado.mensaje && !estado.errores && (
        <span role="alert" className="self-center text-xs text-peligro">
          {estado.mensaje}
        </span>
      )}
    </form>
  );
}
