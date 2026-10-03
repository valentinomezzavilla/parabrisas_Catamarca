import { Router } from "express";
import { crudo, erroresDeZod, texto } from "@/lib/formularios";
import { cerrarSesion, iniciarSesion, obtenerSesion } from "@/lib/sesion";
import { loginSchema } from "@/modules/usuarios/schemas";
import { autenticar } from "@/modules/usuarios/usuario.service";
import { mostrar } from "@/web/vistas";

export const rutasAuth = Router();

const vista = { titulo: "Ingresar", layout: "auth" } as const;

rutasAuth.get("/login", async (req, res) => {
  // Con sesión válida no tiene sentido ver el login. `obtenerSesion` no redirige:
  // una cookie vencida o de un usuario desactivado muestra el formulario.
  if (await obtenerSesion(req)) return res.redirect("/");
  await mostrar(res, "auth/login", { ...vista, usuarioIngresado: "", errores: {}, mensaje: null });
});

rutasAuth.post("/login", async (req, res) => {
  const usuarioIngresado = texto(req.body, "usuario") ?? "";
  const datos = loginSchema.safeParse({ usuario: texto(req.body, "usuario"), password: crudo(req.body, "password") ?? "" });
  if (!datos.success) {
    return mostrar(res, "auth/login", { ...vista, usuarioIngresado, errores: erroresDeZod(datos.error), mensaje: "Revisá los datos marcados" }, 422);
  }

  const resultado = await autenticar(datos.data.usuario, datos.data.password);
  if (resultado.tipo !== "ok") {
    // Mismo mensaje para usuario inexistente, clave incorrecta y cuenta inactiva.
    const mensaje =
      resultado.tipo === "bloqueado"
        ? `Demasiados intentos. Probá de nuevo en ${resultado.minutos} ${resultado.minutos === 1 ? "minuto" : "minutos"}.`
        : "Usuario o contraseña incorrectos";
    return mostrar(res, "auth/login", { ...vista, usuarioIngresado, errores: {}, mensaje }, resultado.tipo === "bloqueado" ? 429 : 401);
  }

  await iniciarSesion(res, resultado.usuario.id);
  res.redirect(303, "/");
});

rutasAuth.post("/salir", (_req, res) => {
  cerrarSesion(res);
  res.redirect(303, "/login");
});
