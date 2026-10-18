import { Router, type Request, type Response } from "express";
import { ZodError } from "zod";
import { TipoBeneficio } from "@/generated/prisma/enums";
import { erroresDeZod, numero, texto, type Errores } from "@/lib/formularios";
import { requerirRol, usuarioDe } from "@/lib/sesion";
import { diaAFecha, hoy } from "@/lib/tiempo";
import { estadoVisible, mensajeCumple, textoOferta } from "@/modules/clientes/beneficio";
import {
  cerrarBeneficio,
  ClienteError,
  contarClientes,
  crearBeneficio,
  crearCliente,
  editarCliente,
  historialDe,
  LIMITE_CLIENTES,
  listarClientes,
  obtenerCliente,
  registrarSaludo,
  TelefonoRepetidoError,
} from "@/modules/clientes/cliente.service";
import { cumpleEnVentana, edadEn } from "@/modules/clientes/cumpleanos";
import { agruparAlfabetico } from "@/modules/clientes/reglas";
import { enlaceWhatsapp } from "@/modules/pagos/transferencia";
import { numeroWhatsappCliente } from "@/modules/turnos/aviso-cliente";
import { avisar } from "@/web/avisos";
import { param } from "@/web/parametros";
import { mostrar } from "@/web/vistas";

export const rutasClientes = Router();

// Ven y editan todos; los beneficios (descuentos) los carga y cierra solo el Admin.
rutasClientes.use("/:id/beneficios", requerirRol("ADMIN"));

const esAdmin = (res: Response) => usuarioDe(res).rol === "ADMIN";
const fichaDe = (id: string, ancla?: string) => `/clientes/${id}${ancla ? `#${ancla}` : ""}`;

// --- Lista (alfabética) --------------------------------------------------------------------

rutasClientes.get("/", async (req, res) => {
  const busqueda = param(req, "texto")?.trim() || undefined;
  const [clientes, total] = await Promise.all([listarClientes(busqueda, hoy()), contarClientes()]);
  await mostrar(res, "clientes/listado", {
    titulo: "Clientes",
    busqueda: busqueda ?? "",
    grupos: agruparAlfabetico(clientes),
    cantidad: clientes.length,
    total,
    limite: LIMITE_CLIENTES,
  });
});

// --- Alta y edición --------------------------------------------------------------------------

const CAMPOS = ["nombre", "telefono", "email", "fechaNacimiento", "notas"] as const;
type Valores = Record<(typeof CAMPOS)[number], string>;

interface EstadoFormulario {
  valores?: Valores;
  errores?: Errores;
  mensaje?: string | null;
  repetido?: { id: string; nombre: string } | null;
}

async function paginaFormulario(res: Response, id: string | null, formulario: EstadoFormulario = {}, estado = 200) {
  const cliente = id ? await obtenerCliente(id) : null;
  if (id && !cliente) return mostrar(res, "errores/404", { titulo: "No encontrado" }, 404);

  const guardados: Valores = cliente
    ? {
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        email: cliente.email ?? "",
        fechaNacimiento: cliente.fechaNacimiento ? diaAFecha(cliente.fechaNacimiento) : "",
        notas: cliente.notas ?? "",
      }
    : { nombre: "", telefono: "", email: "", fechaNacimiento: "", notas: "" };

  await mostrar(
    res,
    "clientes/formulario",
    {
      titulo: cliente ? `Editar ${cliente.nombre}` : "Nuevo cliente",
      cliente,
      hoy: hoy(),
      valores: formulario.valores ?? guardados,
      errores: formulario.errores ?? {},
      mensaje: formulario.mensaje ?? null,
      repetido: formulario.repetido ?? null,
    },
    estado,
  );
}

const leerCliente = (cuerpo: Record<string, unknown>) => ({
  nombre: texto(cuerpo, "nombre") ?? "",
  telefono: texto(cuerpo, "telefono"),
  email: texto(cuerpo, "email"),
  fechaNacimiento: texto(cuerpo, "fechaNacimiento"),
  notas: texto(cuerpo, "notas"),
});
const valoresEnviados = (cuerpo: Record<string, unknown>) => Object.fromEntries(CAMPOS.map((c) => [c, texto(cuerpo, c) ?? ""])) as Valores;

/** Un error de validación o de teléfono repetido se muestra en el mismo formulario; el resto sigue su camino. */
function errorDeFormulario(e: unknown, valores: Valores) {
  if (e instanceof ZodError) return { valores, errores: erroresDeZod(e), mensaje: "Revisá los datos marcados" };
  if (e instanceof TelefonoRepetidoError) return { valores, errores: { telefono: "Ese teléfono ya está cargado" }, mensaje: e.message, repetido: e.existente };
  return null;
}

rutasClientes.get("/nuevo", (_req, res) => paginaFormulario(res, null));

rutasClientes.post("/nuevo", async (req, res) => {
  let id: string;
  try {
    id = (await crearCliente(leerCliente(req.body))).id;
  } catch (e) {
    const formulario = errorDeFormulario(e, valoresEnviados(req.body));
    if (!formulario) throw e;
    return paginaFormulario(res, null, formulario, 422);
  }
  avisar(res, "Cliente creado.");
  res.redirect(303, fichaDe(id));
});

rutasClientes.get("/:id/editar", (req, res) => paginaFormulario(res, req.params.id));

rutasClientes.post("/:id/editar", async (req, res, next) => {
  if (!(await obtenerCliente(req.params.id))) return next();
  try {
    await editarCliente(req.params.id, leerCliente(req.body));
  } catch (e) {
    const formulario = errorDeFormulario(e, valoresEnviados(req.body));
    if (!formulario) throw e;
    return paginaFormulario(res, req.params.id, formulario, 422);
  }
  avisar(res, "Cambios guardados.");
  res.redirect(303, fichaDe(req.params.id));
});

// --- Ficha ---------------------------------------------------------------------------------------

interface EstadoFicha {
  beneficio?: { valores: Record<string, string>; errores: Errores; mensaje: string | null };
}

async function paginaFicha(req: Request, res: Response, ficha: EstadoFicha = {}, estado = 200) {
  const cliente = await obtenerCliente(req.params.id as string);
  if (!cliente) return mostrar(res, "errores/404", { titulo: "No encontrado" }, 404);

  const dia = hoy();
  const nacimiento = cliente.fechaNacimiento ? diaAFecha(cliente.fechaNacimiento) : null;
  const telefono = numeroWhatsappCliente(cliente.telefono);
  // Los vigentes primero (son los que se pueden aplicar); dentro de cada grupo, el más nuevo arriba.
  const beneficios = cliente.beneficios
    .map((b) => {
      const hasta = b.vigenteHasta ? diaAFecha(b.vigenteHasta) : null;
      return { ...b, hasta, vista: estadoVisible({ estado: b.estado, vigenteHasta: hasta }, dia), oferta: textoOferta(b) };
    })
    .sort((a, b) => Number(b.vista === "VIGENTE") - Number(a.vista === "VIGENTE") || b.creadoEn.getTime() - a.creadoEn.getTime());

  await mostrar(
    res,
    "clientes/ficha",
    {
      titulo: cliente.nombre,
      cliente,
      admin: esAdmin(res),
      nacimiento,
      edad: nacimiento ? edadEn(nacimiento, dia) : null,
      cumple: nacimiento ? cumpleEnVentana(nacimiento, dia, 30) : null,
      whatsapp: telefono ? enlaceWhatsapp(telefono, `Hola ${cliente.nombre}, te escribimos de Parabrisas Catamarca.`) : null,
      beneficios,
      vigentes: beneficios.filter((b) => b.vista === "VIGENTE").length,
      historial: await historialDe(cliente.id),
      TIPOS_BENEFICIO: Object.values(TipoBeneficio),
      hoy: dia,
      beneficio: ficha.beneficio ?? { valores: { tipo: "PORCENTAJE" }, errores: {}, mensaje: null },
    },
    estado,
  );
}

rutasClientes.get("/:id", (req, res) => paginaFicha(req, res));

// --- Beneficios (solo Admin) -------------------------------------------------------------------

const CAMPOS_BENEFICIO = ["titulo", "tipo", "valor", "descripcion", "vigenteHasta"] as const;

rutasClientes.post("/:id/beneficios", async (req, res, next) => {
  if (!(await obtenerCliente(req.params.id))) return next();
  const valores = Object.fromEntries(CAMPOS_BENEFICIO.map((c) => [c, texto(req.body, c) ?? ""]));
  try {
    await crearBeneficio(req.params.id, {
      titulo: texto(req.body, "titulo") ?? "",
      tipo: (texto(req.body, "tipo") ?? "") as TipoBeneficio,
      valor: numero(req.body, "valor"),
      descripcion: texto(req.body, "descripcion"),
      vigenteHasta: texto(req.body, "vigenteHasta"),
    });
  } catch (e) {
    if (!(e instanceof ZodError)) throw e;
    return paginaFicha(req, res, { beneficio: { valores, errores: erroresDeZod(e), mensaje: "Revisá los datos marcados" } }, 422);
  }
  avisar(res, "Beneficio cargado.", { ancla: "beneficios" });
  res.redirect(303, fichaDe(req.params.id, "beneficios"));
});

for (const [accion, estado, mensaje] of [
  ["usado", "USADO", "Beneficio marcado como usado."],
  ["anulado", "ANULADO", "Beneficio anulado."],
] as const) {
  rutasClientes.post(`/:id/beneficios/:beneficioId/${accion}`, async (req, res, next) => {
    if (!(await obtenerCliente(req.params.id))) return next();
    try {
      await cerrarBeneficio(req.params.id, req.params.beneficioId, estado);
      avisar(res, mensaje, { ancla: "beneficios" });
    } catch (e) {
      if (!(e instanceof ClienteError)) throw e;
      avisar(res, e.message, { tono: "peligro", ancla: "beneficios" });
    }
    res.redirect(303, fichaDe(req.params.id, "beneficios"));
  });
}

// --- Saludo de cumpleaños -------------------------------------------------------------------

/**
 * Deja asentado el saludo de este año y manda a WhatsApp con el mensaje armado. El formulario abre una pestaña nueva
 * (`target="_blank"`), así el panel sigue abierto y al recargarlo el cliente figura como saludado.
 */
rutasClientes.post("/:id/cumple", async (req, res, next) => {
  const cliente = await obtenerCliente(req.params.id);
  if (!cliente) return next();
  const numeroWsp = numeroWhatsappCliente(cliente.telefono);
  if (!numeroWsp) {
    avisar(res, `${cliente.nombre} no tiene un teléfono válido para WhatsApp.`, { tono: "peligro" });
    return res.redirect(303, "/");
  }
  try {
    const { oferta } = await registrarSaludo(cliente.id, hoy(), { beneficioId: texto(req.body, "beneficio"), ofertaLibre: texto(req.body, "otro") });
    return res.redirect(303, enlaceWhatsapp(numeroWsp, mensajeCumple(cliente.nombre, oferta)));
  } catch (e) {
    if (!(e instanceof ClienteError)) throw e;
    avisar(res, e.message, { tono: "peligro" });
    res.redirect(303, "/");
  }
});
