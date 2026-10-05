import { Router, type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { casilla, crudo, erroresDeZod, esDuplicado, texto, type Errores } from "@/lib/formularios";
import {
  actualizarCampoPropio,
  actualizarCampoSistema,
  archivarCampoPropio,
  cambiarTipoCampo,
  CampoInvalidoError,
  ConfirmacionRequeridaError,
  crearCampoPropio,
  eliminarCampoPropio,
  modificarOpciones,
  moverCampoAdmin,
  obtenerCampos,
  type OperacionOpcion,
} from "@/modules/campos/campo.service";
import type { CampoFinal } from "@/modules/campos/combinar";
import {
  activarItem,
  cambiarTieneLado,
  crearItem,
  eliminarItem,
  ListaError,
  moverUbicacion,
  obtenerListas,
  renombrarItem,
  type ListaId,
} from "@/modules/campos/lista.service";
import { esModulo, MODULOS, type ModuloAdmin } from "@/modules/campos/modulos";
import { REGISTRO, SECCIONES } from "@/modules/campos/registro";
import { ETIQUETA_TIPO, TIPOS_CAMPO, type TipoCampo } from "@/modules/campos/tipos";
import { avisar } from "@/web/avisos";
import { param, url } from "@/web/parametros";
import { mostrar } from "@/web/vistas";

export const rutasAdministracion = Router();

const comunes = { ETIQUETA_TIPO, TIPOS_CAMPO, SECCIONES, MODULOS };

rutasAdministracion.get("/", (_req, res) => mostrar(res, "administracion/inicio", { titulo: "Administración" }));

// --- Listas de Stock (marcas, tipos, ubicaciones, vehículos) ---------------------------
// Van antes que las rutas con `:modulo` para que "listas" no se tome como un campo.

const LISTAS = ["marcas", "tipos", "ubicaciones", "marcasVehiculo", "modelos"] as const;
const esLista = (v: string): v is ListaId => (LISTAS as readonly string[]).includes(v);
const BASE_LISTAS = "/administracion/stock/listas";

rutasAdministracion.get("/stock/listas", async (req, res) => {
  await mostrar(res, "administracion/listas", {
    titulo: "Administración · Listas de Stock",
    modulo: "stock",
    ...comunes,
    listas: await obtenerListas(),
    marcaAbierta: param(req, "abierta") ?? null,
  });
});

/** Ejecuta una operación sobre una lista y vuelve a su sección; los errores esperados se muestran ahí. */
async function operarLista(req: Request, res: Response, lista: string, operacion: () => Promise<unknown>) {
  const marcaId = lista === "modelos" ? texto(req.body, "marcaId") : undefined;
  const ancla = marcaId ? `m-${marcaId}` : lista;
  try {
    await operacion();
  } catch (e) {
    const mensaje =
      e instanceof ZodError
        ? "El nombre debe tener entre 1 y 80 caracteres."
        : e instanceof ListaError
          ? e.message
          : esDuplicado(e)
            ? "Ya existe un elemento con ese nombre."
            : null;
    if (mensaje === null) throw e;
    avisar(res, mensaje, { tono: "peligro", ancla });
  }
  res.redirect(303, url(BASE_LISTAS, { abierta: marcaId }, ancla));
}

function listaValida(req: Request, _res: Response, next: NextFunction) {
  if (!esLista(req.params.lista as string)) return next("route");
  next();
}

rutasAdministracion.post("/stock/listas/:lista", listaValida, (req, res) =>
  operarLista(req, res, req.params.lista as string, () =>
    crearItem(req.params.lista as ListaId, {
      nombre: crudo(req.body, "nombre") ?? "",
      marcaId: texto(req.body, "marcaId"),
      tieneLado: casilla(req.body, "tieneLado"),
    }),
  ),
);

rutasAdministracion.post("/stock/listas/:lista/:id/nombre", listaValida, (req, res) =>
  operarLista(req, res, req.params.lista as string, () => renombrarItem(req.params.lista as ListaId, req.params.id as string, crudo(req.body, "nombre") ?? "")),
);

rutasAdministracion.post("/stock/listas/:lista/:id/activo", listaValida, (req, res) =>
  operarLista(req, res, req.params.lista as string, () => activarItem(req.params.lista as ListaId, req.params.id as string, texto(req.body, "activo") === "1")),
);

rutasAdministracion.post("/stock/listas/:lista/:id/eliminar", listaValida, (req, res) =>
  operarLista(req, res, req.params.lista as string, () => eliminarItem(req.params.lista as ListaId, req.params.id as string)),
);

rutasAdministracion.post("/stock/listas/ubicaciones/:id/mover", (req, res) => {
  const direccion = texto(req.body, "direccion");
  return operarLista(req, res, "ubicaciones", async () => {
    if (direccion === "ARRIBA" || direccion === "ABAJO") await moverUbicacion(req.params.id as string, direccion);
  });
});

rutasAdministracion.post("/stock/listas/ubicaciones/:id/lado", (req, res) => {
  return operarLista(req, res, "ubicaciones", () => cambiarTieneLado(req.params.id as string, casilla(req.body, "tieneLado")));
});

// --- Campos de cada módulo ---------------------------------------------------------

/** El módulo viene en la URL: solo se aceptan los que existen. */
function moduloDe(req: Request): ModuloAdmin | null {
  const modulo = req.params.modulo;
  return esModulo(modulo) ? modulo : null;
}

rutasAdministracion.get("/:modulo", async (req, res, next) => {
  const modulo = moduloDe(req);
  if (!modulo) return next();
  const campos = await obtenerCampos(MODULOS[modulo].entidad);
  await mostrar(res, "administracion/campos", { titulo: `Administración · Campos de ${MODULOS[modulo].titulo}`, modulo, campos, ...comunes });
});

// Alta de un campo propio.

const nuevoCampo = (modulo: ModuloAdmin, valores: Record<string, string> = { tipo: "TEXTO" }, errores: Errores = {}, mensaje: string | null = null) => ({
  titulo: "Administración · Nuevo campo",
  modulo,
  valores,
  errores,
  mensaje,
  ...comunes,
});

rutasAdministracion.get("/:modulo/campos/nuevo", (req, res, next) => {
  const modulo = moduloDe(req);
  if (!modulo) return next();
  return mostrar(res, "administracion/campo-nuevo", nuevoCampo(modulo));
});

/** Traduce los errores esperados del servicio a errores de formulario; el resto se propaga. */
function erroresDe(e: unknown): { errores: Errores; mensaje: string } {
  if (e instanceof ZodError) return { errores: erroresDeZod(e), mensaje: "Revisá los datos marcados" };
  if (e instanceof CampoInvalidoError) return { errores: e.campo ? { [e.campo]: e.message } : {}, mensaje: e.message };
  if (esDuplicado(e)) return { errores: { etiqueta: "Ya hay un campo con ese nombre." }, mensaje: "Ya hay un campo con ese nombre." };
  throw e;
}

rutasAdministracion.post("/:modulo/campos/nuevo", async (req, res, next) => {
  const modulo = moduloDe(req);
  if (!modulo) return next();
  const tipo = (texto(req.body, "tipo") ?? "") as TipoCampo;
  const valores = {
    etiqueta: texto(req.body, "etiqueta") ?? "",
    ayuda: texto(req.body, "ayuda") ?? "",
    tipo,
    unidad: texto(req.body, "unidad") ?? "",
    opcionesTexto: crudo(req.body, "opcionesTexto") ?? "",
    requerido: casilla(req.body, "requerido") ? "on" : "",
  };
  try {
    await crearCampoPropio(MODULOS[modulo].entidad, {
      etiqueta: valores.etiqueta,
      ayuda: texto(req.body, "ayuda"),
      tipo,
      // Una casilla Sí / No no puede ser obligatoria: el formulario ni lo ofrece.
      requerido: tipo !== "SI_NO" && casilla(req.body, "requerido"),
      unidad: texto(req.body, "unidad"),
      opcionesTexto: valores.opcionesTexto,
    });
  } catch (e) {
    const { errores, mensaje } = erroresDe(e);
    return mostrar(res, "administracion/campo-nuevo", nuevoCampo(modulo, valores, errores, mensaje), 422);
  }
  avisar(res, "Campo creado.");
  res.redirect(303, MODULOS[modulo].base);
});

// Edición de un campo.

interface EstadoEdicion {
  formulario?: { valores: Record<string, string | boolean>; errores: Errores; mensaje: string | null };
  /** Cambio de tipo pendiente de confirmar (borraría valores), o con error. */
  tipo?: { elegido: string; opcionesTexto: string; confirmar: string | null; error: string | null; errores: Errores };
  /** Eliminación pendiente de confirmar. */
  eliminar?: { confirmar: string | null };
}

async function campoDe(modulo: ModuloAdmin, clave: string): Promise<CampoFinal | null> {
  const campo = (await obtenerCampos(MODULOS[modulo].entidad)).find((c) => c.clave === clave);
  // Los campos fijos no se pueden ajustar: no hay pantalla de edición para ellos.
  return campo && !campo.fijo ? campo : null;
}

async function paginaEditar(res: Response, modulo: ModuloAdmin, campo: CampoFinal, estado: EstadoEdicion = {}, status = 200) {
  const guardados =
    campo.origen === "SISTEMA"
      ? { etiqueta: campo.etiqueta, ayuda: campo.ayuda ?? "", visible: campo.visible }
      : {
          etiqueta: campo.etiqueta,
          ayuda: campo.ayuda ?? "",
          unidad: campo.unidad ?? "",
          requerido: campo.requerido,
          visible: campo.visible || campo.archivado,
        };
  await mostrar(
    res,
    "administracion/campo-editar",
    {
      titulo: "Administración · Editar campo",
      modulo,
      campoActual: campo,
      fabrica: REGISTRO[MODULOS[modulo].entidad].find((c) => c.clave === campo.clave)?.etiqueta ?? campo.etiqueta,
      formulario: estado.formulario ?? { valores: guardados, errores: {}, mensaje: null },
      cambioTipo: estado.tipo ?? { elegido: campo.tipo, opcionesTexto: "", confirmar: null, error: null, errores: {} },
      eliminar: estado.eliminar ?? { confirmar: null },
      ...comunes,
    },
    status,
  );
}

/** Resuelve módulo y campo de la URL; si alguno no existe, sigue de largo (404). */
async function cargarCampo(req: Request, res: Response, next: NextFunction) {
  const modulo = moduloDe(req);
  const campo = modulo ? await campoDe(modulo, req.params.clave as string) : null;
  if (!modulo || !campo) return next("route");
  // Nombres propios: `res.locals` llega a las vistas, donde `campo` es un helper.
  res.locals.moduloAdmin = modulo;
  res.locals.campoAdmin = campo;
  next();
}

const delRequest = (res: Response) => ({ modulo: res.locals.moduloAdmin as ModuloAdmin, campo: res.locals.campoAdmin as CampoFinal });
const urlCampo = (modulo: ModuloAdmin, clave: string) => `${MODULOS[modulo].base}/campos/${encodeURIComponent(clave)}`;

rutasAdministracion.get("/:modulo/campos/:clave", cargarCampo, async (_req, res) => {
  const { modulo, campo } = delRequest(res);
  await paginaEditar(res, modulo, campo);
});

rutasAdministracion.post("/:modulo/campos/:clave", cargarCampo, async (req, res) => {
  const { modulo, campo } = delRequest(res);
  const { entidad, base } = MODULOS[modulo];
  let valores: Record<string, string | boolean>;
  try {
    if (campo.origen === "SISTEMA") {
      // Los campos protegidos no muestran la casilla "visible": sin la marca `puedeOcultar` nunca se ocultan.
      const oculto = crudo(req.body, "puedeOcultar") === "1" ? !casilla(req.body, "visible") : false;
      valores = { etiqueta: texto(req.body, "etiqueta") ?? "", ayuda: texto(req.body, "ayuda") ?? "", visible: !oculto };
      await actualizarCampoSistema(entidad, campo.clave, { etiqueta: texto(req.body, "etiqueta"), ayuda: texto(req.body, "ayuda"), oculto });
    } else {
      valores = {
        etiqueta: texto(req.body, "etiqueta") ?? "",
        ayuda: texto(req.body, "ayuda") ?? "",
        unidad: texto(req.body, "unidad") ?? "",
        requerido: casilla(req.body, "requerido"),
        visible: casilla(req.body, "visible"),
      };
      await actualizarCampoPropio(
        campo.id!,
        {
          etiqueta: texto(req.body, "etiqueta") as string,
          ayuda: texto(req.body, "ayuda"),
          requerido: campo.tipo !== "SI_NO" && casilla(req.body, "requerido"),
          unidad: texto(req.body, "unidad"),
          visible: casilla(req.body, "visible"),
        },
        entidad,
      );
    }
  } catch (e) {
    const { errores, mensaje } = erroresDe(e);
    return paginaEditar(res, modulo, campo, { formulario: { valores: valores!, errores, mensaje } }, 422);
  }
  avisar(res, "Cambios guardados.");
  res.redirect(303, base);
});

rutasAdministracion.post("/:modulo/campos/:clave/mover", cargarCampo, async (req, res) => {
  const { modulo, campo } = delRequest(res);
  const direccion = texto(req.body, "direccion");
  try {
    if (direccion === "ARRIBA" || direccion === "ABAJO") await moverCampoAdmin(MODULOS[modulo].entidad, campo.clave, direccion);
  } catch (e) {
    avisar(res, erroresDe(e).mensaje, { tono: "peligro" });
  }
  res.redirect(303, `${MODULOS[modulo].base}#c-${campo.clave}`);
});

/** Lo que sigue solo aplica a campos propios. */
function soloPropio(_req: Request, res: Response, next: NextFunction) {
  if (delRequest(res).campo.origen !== "PROPIO") return next("route");
  next();
}

rutasAdministracion.post("/:modulo/campos/:clave/tipo", cargarCampo, soloPropio, async (req, res) => {
  const { modulo, campo } = delRequest(res);
  const elegido = texto(req.body, "tipo") ?? "";
  const opcionesTexto = crudo(req.body, "opcionesTexto") ?? "";
  try {
    await cambiarTipoCampo(campo.id!, elegido as TipoCampo, {
      opcionesTexto,
      confirmar: crudo(req.body, "confirmar") === "1",
      entidad: MODULOS[modulo].entidad,
    });
  } catch (e) {
    const tipo = { elegido, opcionesTexto, confirmar: null as string | null, error: null as string | null, errores: {} as Errores };
    if (e instanceof ConfirmacionRequeridaError) tipo.confirmar = e.message;
    else ({ errores: tipo.errores, mensaje: tipo.error } = erroresDe(e));
    return paginaEditar(res, modulo, campo, { tipo }, e instanceof ConfirmacionRequeridaError ? 200 : 422);
  }
  avisar(res, "Tipo cambiado.", { ancla: "tipo" });
  res.redirect(303, `${urlCampo(modulo, campo.clave)}#tipo`);
});

rutasAdministracion.post("/:modulo/campos/:clave/archivar", cargarCampo, soloPropio, async (_req, res) => {
  const { modulo, campo } = delRequest(res);
  await archivarCampoPropio(campo.id!, !campo.archivado, MODULOS[modulo].entidad);
  res.redirect(303, `${urlCampo(modulo, campo.clave)}#zona-peligro`);
});

/** Sin datos se elimina directo; con datos pide confirmación y espera un segundo envío con `confirmar=1`. */
rutasAdministracion.post("/:modulo/campos/:clave/eliminar", cargarCampo, soloPropio, async (req, res) => {
  const { modulo, campo } = delRequest(res);
  try {
    await eliminarCampoPropio(campo.id!, { confirmar: crudo(req.body, "confirmar") === "1", entidad: MODULOS[modulo].entidad });
  } catch (e) {
    if (!(e instanceof ConfirmacionRequeridaError)) throw e;
    return paginaEditar(res, modulo, campo, { eliminar: { confirmar: e.message } });
  }
  avisar(res, "Campo eliminado.");
  res.redirect(303, MODULOS[modulo].base);
});

rutasAdministracion.post("/:modulo/campos/:clave/opciones", cargarCampo, soloPropio, async (req, res) => {
  const { modulo, campo } = delRequest(res);
  const opcionId = texto(req.body, "opcionId") ?? "";
  const etiqueta = crudo(req.body, "etiqueta") ?? "";
  const operaciones: Record<string, OperacionOpcion> = {
    agregar: { tipo: "agregar", etiqueta },
    renombrar: { tipo: "renombrar", opcionId, etiqueta },
    alternar: { tipo: "alternar", opcionId, activo: texto(req.body, "activo") === "1" },
    quitar: { tipo: "quitar", opcionId },
  };
  const nombre = texto(req.body, "operacion") ?? "";
  const operacion = Object.hasOwn(operaciones, nombre) ? operaciones[nombre] : undefined;
  try {
    if (!operacion) throw new CampoInvalidoError("Operación inválida.");
    await modificarOpciones(campo.id!, operacion, MODULOS[modulo].entidad);
  } catch (e) {
    avisar(res, erroresDe(e).mensaje, { tono: "peligro", ancla: "opciones" });
  }
  res.redirect(303, `${urlCampo(modulo, campo.clave)}#opciones`);
});
