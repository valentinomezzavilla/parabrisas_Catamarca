import type { NextFunction, Request, Response } from "express";
import { rolAlcanza, type Rol } from "@/modules/usuarios/reglas";
import { obtenerUsuarioActivo, type UsuarioSesion } from "@/modules/usuarios/usuario.service";
import { DURACION_SESION_SEGUNDOS, NOMBRE_COOKIE, firmarToken, obtenerSecreto, verificarToken } from "./token";

// Sesión del panel: un JWT firmado en una cookie httpOnly. El token solo identifica al usuario;
// el rol y el estado se leen de la base en cada request.

export async function iniciarSesion(res: Response, usuarioId: string): Promise<void> {
  const token = await firmarToken(usuarioId, obtenerSecreto());
  res.cookie(NOMBRE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION_SESION_SEGUNDOS * 1000,
  });
}

export function cerrarSesion(res: Response): void {
  res.clearCookie(NOMBRE_COOKIE, { path: "/" });
}

const sesiones = new WeakMap<Request, Promise<UsuarioSesion | null>>();

/**
 * Usuario de la sesión actual o `null`. Valida la firma y vuelve a leer al usuario en la base
 * (así un usuario desactivado o con otro rol lo nota en el próximo request). No redirige.
 * Se resuelve una sola vez por request.
 */
export function obtenerSesion(req: Request): Promise<UsuarioSesion | null> {
  let sesion = sesiones.get(req);
  if (!sesion) {
    sesion = (async () => {
      const id = await verificarToken(req.cookies?.[NOMBRE_COOKIE], obtenerSecreto());
      return id ? obtenerUsuarioActivo(id) : null;
    })();
    sesiones.set(req, sesion);
  }
  return sesion;
}

/** Usuario logueado del request. Solo se usa detrás de `verificarSesion`, que garantiza que existe. */
export function usuarioDe(res: Response): UsuarioSesion {
  const usuario = res.locals.usuario;
  if (!usuario) throw new Error("usuarioDe() se llamó en una ruta sin verificarSesion");
  return usuario;
}

/** Middleware: deja pasar solo con sesión válida (y la expone en `res.locals.usuario`); si no, redirige a `/login`. */
export async function verificarSesion(req: Request, res: Response, next: NextFunction): Promise<void> {
  const usuario = await obtenerSesion(req);
  if (!usuario) return res.redirect(303, "/login");
  res.locals.usuario = usuario;
  next();
}

/** Middleware: como `verificarSesion`, pero si el rol no alcanza redirige a `/` sin ejecutar nada más. */
export function requerirRol(rol: Rol) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const usuario = await obtenerSesion(req);
    if (!usuario) return res.redirect(303, "/login");
    if (!rolAlcanza(usuario.rol, rol)) return res.redirect(303, "/");
    res.locals.usuario = usuario;
    next();
  };
}
