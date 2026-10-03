import { Router, type Response } from "express";
import { crudo, erroresDeZod, esDuplicado, texto, type Errores } from "@/lib/formularios";
import { usuarioDe } from "@/lib/sesion";
import { crearUsuarioSchema, resetPasswordSchema, rolSchema } from "@/modules/usuarios/schemas";
import {
  cambiarActivo,
  cambiarRol,
  CambioNoPermitidoError,
  crearUsuario,
  listarUsuarios,
  resetearPassword,
} from "@/modules/usuarios/usuario.service";
import { avisar } from "@/web/avisos";
import { mostrar } from "@/web/vistas";

export const rutasUsuarios = Router();

/** Lee un campo de contraseña sin recortarlo (los espacios cuentan). */
const clave = (cuerpo: Record<string, unknown>, campo: string) => crudo(cuerpo, campo) || undefined;

rutasUsuarios.get("/", async (_req, res) => {
  await mostrar(res, "usuarios/listado", { titulo: "Usuarios", usuarios: await listarUsuarios() });
});

const nuevo = (valores: Record<string, string> = { rol: "EMPLEADO" }, errores: Errores = {}, mensaje: string | null = null) => ({
  titulo: "Nuevo usuario",
  valores,
  errores,
  mensaje,
});

rutasUsuarios.get("/nuevo", (_req, res) => mostrar(res, "usuarios/nuevo", nuevo()));

rutasUsuarios.post("/nuevo", async (req, res) => {
  const valores = { nombre: texto(req.body, "nombre") ?? "", usuario: texto(req.body, "usuario") ?? "", rol: texto(req.body, "rol") ?? "EMPLEADO" };
  const datos = crearUsuarioSchema.safeParse({
    nombre: texto(req.body, "nombre"),
    usuario: texto(req.body, "usuario"),
    password: clave(req.body, "password"),
    rol: texto(req.body, "rol"),
  });
  if (!datos.success) return mostrar(res, "usuarios/nuevo", nuevo(valores, erroresDeZod(datos.error), "Revisá los datos marcados"), 422);

  try {
    await crearUsuario(datos.data);
  } catch (e) {
    if (!esDuplicado(e)) throw e;
    return mostrar(res, "usuarios/nuevo", nuevo(valores, { usuario: "Ese nombre de usuario ya está en uso" }, "Revisá los datos marcados"), 422);
  }
  avisar(res, "Usuario creado.");
  res.redirect(303, "/usuarios");
});

/** Aplica un cambio sobre un usuario y vuelve a la lista; si las reglas no lo permiten, muestra el motivo junto a ese usuario. */
async function cambiar(res: Response, id: string, accion: () => Promise<void>, exito?: string) {
  const ancla = `u-${id}`;
  try {
    await accion();
    if (exito) avisar(res, exito, { ancla });
  } catch (e) {
    if (!(e instanceof CambioNoPermitidoError)) throw e;
    avisar(res, e.message, { tono: "peligro", ancla });
  }
  res.redirect(303, `/usuarios#${ancla}`);
}

rutasUsuarios.post("/:id/rol", async (req, res) => {
  const actor = usuarioDe(res);
  const rol = rolSchema.safeParse(texto(req.body, "rol"));
  if (!rol.success) {
    avisar(res, "Rol inválido.", { tono: "peligro", ancla: `u-${req.params.id}` });
    return res.redirect(303, `/usuarios#u-${req.params.id}`);
  }
  await cambiar(res, req.params.id, () => cambiarRol(actor, req.params.id, rol.data));
});

rutasUsuarios.post("/:id/activo", async (req, res) => {
  const actor = usuarioDe(res);
  await cambiar(res, req.params.id, () => cambiarActivo(actor, req.params.id, texto(req.body, "activo") === "1"));
});

rutasUsuarios.post("/:id/password", async (req, res) => {
  const datos = resetPasswordSchema.safeParse({ password: clave(req.body, "password") });
  if (!datos.success) {
    avisar(res, `Contraseña: ${erroresDeZod(datos.error).password ?? "inválida"}`, { tono: "peligro", ancla: `u-${req.params.id}` });
    return res.redirect(303, `/usuarios#u-${req.params.id}`);
  }
  // Tras guardar se vuelve a la lista: la clave nueva no queda en pantalla.
  await cambiar(res, req.params.id, () => resetearPassword(req.params.id, datos.data.password), "Contraseña actualizada.");
});
