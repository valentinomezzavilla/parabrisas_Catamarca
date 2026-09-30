"use server";

import { redirect } from "next/navigation";
import { erroresDeZod, fallo, texto, type EstadoFormulario } from "@/lib/formularios";
import { cerrarSesion, iniciarSesion } from "@/lib/sesion";
import { loginSchema } from "@/modules/usuarios/schemas";
import { autenticar } from "@/modules/usuarios/usuario.service";

export async function iniciarSesionAccion(_previo: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const password = fd.get("password");
  const datos = loginSchema.safeParse({ usuario: texto(fd, "usuario"), password: typeof password === "string" ? password : "" });
  if (!datos.success) return fallo(erroresDeZod(datos.error));

  const usuario = await autenticar(datos.data.usuario, datos.data.password);
  // Mismo mensaje para usuario inexistente, clave incorrecta y cuenta inactiva.
  if (!usuario) return { ok: false, mensaje: "Usuario o contraseña incorrectos" };

  await iniciarSesion(usuario.id);
  redirect("/");
}

export async function salir() {
  await cerrarSesion();
  redirect("/login");
}
