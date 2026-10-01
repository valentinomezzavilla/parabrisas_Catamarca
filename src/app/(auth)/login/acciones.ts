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

  const resultado = await autenticar(datos.data.usuario, datos.data.password);
  if (resultado.tipo === "bloqueado") {
    const unidad = resultado.minutos === 1 ? "minuto" : "minutos";
    return { ok: false, mensaje: `Demasiados intentos. Probá de nuevo en ${resultado.minutos} ${unidad}.` };
  }
  // Mismo mensaje para usuario inexistente, clave incorrecta y cuenta inactiva.
  if (resultado.tipo === "invalido") return { ok: false, mensaje: "Usuario o contraseña incorrectos" };

  await iniciarSesion(resultado.usuario.id);
  redirect("/");
}

export async function salir() {
  await cerrarSesion();
  redirect("/login");
}
