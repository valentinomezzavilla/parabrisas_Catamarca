"use client";

import Link from "next/link";
import { boton, Campo, input, tarjeta } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import { crearUsuarioAccion } from "./acciones";

export function FormularioUsuario() {
  const { estado, enviar, pendiente, error } = useFormularioAccion(crearUsuarioAccion);

  return (
    <form onSubmit={enviar} noValidate className={`${tarjeta} max-w-xl space-y-4 p-6`}>
      {estado.mensaje && !estado.ok && (
        <p role="alert" className="rounded-lg border border-peligro/40 bg-peligro/10 px-3 py-2 text-sm text-peligro">
          {estado.mensaje}
        </p>
      )}

      <Campo etiqueta="Nombre" htmlFor="nombre" error={error("nombre")}>
        <input id="nombre" name="nombre" autoComplete="off" className={input} aria-invalid={!!error("nombre")} />
      </Campo>

      <Campo
        etiqueta="Usuario"
        htmlFor="usuario"
        error={error("usuario")}
        ayuda="Con el que va a ingresar. Letras, números y . _ @ - (sin espacios)."
      >
        <input id="usuario" name="usuario" type="text" autoCapitalize="none" spellCheck={false} autoComplete="off" className={input} aria-invalid={!!error("usuario")} />
      </Campo>

      <Campo etiqueta="Contraseña" htmlFor="password" error={error("password")} ayuda="Mínimo 5 caracteres, sin otras reglas. Se la pasás vos a la persona.">
        <input id="password" name="password" type="password" autoComplete="new-password" className={input} aria-invalid={!!error("password")} />
      </Campo>

      <Campo
        etiqueta="Rol"
        htmlFor="rol"
        error={error("rol")}
        ayuda="Admin gestiona usuarios y servicios. Empleado maneja turnos y stock."
      >
        <select id="rol" name="rol" defaultValue="EMPLEADO" className={input}>
          <option value="EMPLEADO">Empleado</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </Campo>

      <div className="flex gap-2">
        <button type="submit" disabled={pendiente} className={boton.primario}>
          {pendiente ? "Guardando…" : "Crear usuario"}
        </button>
        <Link href="/usuarios" className={boton.secundario}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
