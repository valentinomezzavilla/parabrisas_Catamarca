"use client";

import { boton, Campo, input } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import { iniciarSesionAccion } from "./acciones";

export function FormularioLogin() {
  const { estado, enviar, pendiente, error } = useFormularioAccion(iniciarSesionAccion);

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold">Ingresar</h1>

      {estado.mensaje && (
        <p role="alert" className="rounded-lg border border-peligro/40 bg-peligro/10 px-3 py-2 text-sm text-peligro">
          {estado.mensaje}
        </p>
      )}

      <Campo etiqueta="Usuario" htmlFor="usuario" error={error("usuario")}>
        <input id="usuario" name="usuario" type="text" autoCapitalize="none" spellCheck={false} autoComplete="username" autoFocus required className={input} aria-invalid={!!error("usuario")} />
      </Campo>

      <Campo etiqueta="Contraseña" htmlFor="password" error={error("password")}>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={input} aria-invalid={!!error("password")} />
      </Campo>

      <button type="submit" disabled={pendiente} className={`${boton.primario} w-full py-3 text-base`}>
        {pendiente ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
