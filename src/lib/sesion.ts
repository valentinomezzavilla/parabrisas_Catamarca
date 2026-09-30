import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { rolAlcanza, type Rol } from "@/modules/usuarios/reglas";
import { obtenerUsuarioActivo, type UsuarioSesion } from "@/modules/usuarios/usuario.service";
import { DURACION_SESION_SEGUNDOS, NOMBRE_COOKIE, firmarToken, obtenerSecreto, verificarToken } from "./token";

// Solo servidor. Las funciones que escriben la cookie (iniciarSesion / cerrarSesion)
// se llaman desde Server Actions: Next no permite modificar cookies al renderizar.

export async function iniciarSesion(usuarioId: string): Promise<void> {
  const token = await firmarToken(usuarioId, obtenerSecreto());
  (await cookies()).set(NOMBRE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION_SESION_SEGUNDOS,
  });
}

export async function cerrarSesion(): Promise<void> {
  (await cookies()).delete(NOMBRE_COOKIE);
}

/**
 * Usuario de la sesión actual o `null`. Valida la firma y vuelve a leer al usuario en la base
 * (así un usuario desactivado o con otro rol lo nota en el próximo request). No redirige.
 */
export const obtenerSesion = cache(async (): Promise<UsuarioSesion | null> => {
  const token = (await cookies()).get(NOMBRE_COOKIE)?.value;
  const id = await verificarToken(token, obtenerSecreto());
  return id ? obtenerUsuarioActivo(id) : null;
});

/** Usuario logueado, o redirige a `/login`. Va al principio de cada página y de cada Server Action del panel. */
export async function verificarSesion(): Promise<UsuarioSesion> {
  const usuario = await obtenerSesion();
  if (!usuario) redirect("/login");
  return usuario;
}

/** Como `verificarSesion`, pero si el rol no alcanza redirige a `/` sin ejecutar nada más. */
export async function requerirRol(rol: Rol): Promise<UsuarioSesion> {
  const usuario = await verificarSesion();
  if (!rolAlcanza(usuario.rol, rol)) redirect("/");
  return usuario;
}
