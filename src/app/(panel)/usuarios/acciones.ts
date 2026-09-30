"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { erroresDeZod, esDuplicado, fallo, texto, type EstadoFormulario } from "@/lib/formularios";
import { requerirRol } from "@/lib/sesion";
import { crearUsuarioSchema, resetPasswordSchema, rolSchema } from "@/modules/usuarios/schemas";
import {
  cambiarActivo,
  cambiarRol,
  CambioNoPermitidoError,
  crearUsuario,
  resetearPassword,
} from "@/modules/usuarios/usuario.service";

/** Lee un campo de contraseña sin recortarlo (los espacios cuentan). */
function clave(fd: FormData, campo: string): string | undefined {
  const v = fd.get(campo);
  return typeof v === "string" && v !== "" ? v : undefined;
}

export async function crearUsuarioAccion(_previo: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await requerirRol("ADMIN");
  const datos = crearUsuarioSchema.safeParse({
    nombre: texto(fd, "nombre"),
    usuario: texto(fd, "usuario"),
    password: clave(fd, "password"),
    rol: texto(fd, "rol"),
  });
  if (!datos.success) return fallo(erroresDeZod(datos.error));

  try {
    await crearUsuario(datos.data);
  } catch (e) {
    if (esDuplicado(e)) return fallo({ usuario: "Ese nombre de usuario ya está en uso" });
    throw e;
  }

  revalidatePath("/usuarios");
  redirect("/usuarios?aviso=creado");
}

export async function cambiarRolAccion(id: string, rol: string): Promise<EstadoFormulario> {
  const actor = await requerirRol("ADMIN");
  const rolValido = rolSchema.safeParse(rol);
  if (!rolValido.success) return { ok: false, mensaje: "Rol inválido." };

  try {
    await cambiarRol(actor, id, rolValido.data);
  } catch (e) {
    if (e instanceof CambioNoPermitidoError) return { ok: false, mensaje: e.message };
    throw e;
  }
  revalidatePath("/usuarios");
  return { ok: true };
}

export async function alternarActivoAccion(id: string, activo: boolean): Promise<EstadoFormulario> {
  const actor = await requerirRol("ADMIN");
  try {
    await cambiarActivo(actor, id, activo === true);
  } catch (e) {
    if (e instanceof CambioNoPermitidoError) return { ok: false, mensaje: e.message };
    throw e;
  }
  revalidatePath("/usuarios");
  return { ok: true };
}

export async function resetearPasswordAccion(
  id: string,
  _previo: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  await requerirRol("ADMIN");
  const datos = resetPasswordSchema.safeParse({ password: clave(fd, "password") });
  if (!datos.success) return fallo(erroresDeZod(datos.error));

  try {
    await resetearPassword(id, datos.data.password);
  } catch (e) {
    if (e instanceof CambioNoPermitidoError) return { ok: false, mensaje: e.message };
    throw e;
  }
  return { ok: true, mensaje: "Contraseña actualizada." };
}
