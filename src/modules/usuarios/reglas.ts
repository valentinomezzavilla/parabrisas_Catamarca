// Reglas puras: sin Prisma ni Next, para poder testearlas solas.

export type Rol = "ADMIN" | "EMPLEADO";

export interface UsuarioBasico {
  id: string;
  rol: Rol;
  activo: boolean;
}

export type Cambio = { tipo: "rol"; rol: Rol } | { tipo: "activo"; activo: boolean };

/** El Admin puede todo lo del Empleado; el Empleado no puede lo del Admin. */
export function rolAlcanza(rol: Rol, requerido: Rol): boolean {
  return requerido === "EMPLEADO" || rol === "ADMIN";
}

/**
 * Motivo por el que un cambio sobre un usuario no se permite, o `null` si se puede aplicar.
 * `adminsActivos` es la cantidad de administradores activos antes del cambio.
 */
export function motivoDeRechazo(
  actor: { id: string },
  objetivo: UsuarioBasico,
  cambio: Cambio,
  adminsActivos: number,
): string | null {
  const esUnoMismo = actor.id === objetivo.id;

  if (cambio.tipo === "rol") {
    if (cambio.rol === objetivo.rol) return null;
    if (esUnoMismo) return "No podés cambiar tu propio rol.";
  } else {
    if (cambio.activo === objetivo.activo) return null;
    if (esUnoMismo && !cambio.activo) return "No podés desactivar tu propia cuenta.";
  }

  const dejaDeSerAdminActivo =
    objetivo.rol === "ADMIN" &&
    objetivo.activo &&
    ((cambio.tipo === "rol" && cambio.rol !== "ADMIN") || (cambio.tipo === "activo" && !cambio.activo));

  if (dejaDeSerAdminActivo && adminsActivos <= 1) return "Tiene que quedar al menos un administrador activo.";
  return null;
}
