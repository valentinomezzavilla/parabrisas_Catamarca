import { Router, type Request, type Response } from "express";
import { ZodError } from "zod";
import { EstadoOrden, MedioCobro, PagadorCobro, TipoOrden } from "@/generated/prisma/enums";
import { erroresDeZod, numero, texto, type Cuerpo, type Errores } from "@/lib/formularios";
import { pesos } from "@/lib/formato";
import { requerirRol, usuarioDe } from "@/lib/sesion";
import { diaAFecha, diaSemana, fechaLocal, formatearFecha, formatearHora, hoy, sumarDias } from "@/lib/tiempo";
import {
  DIAS_ALERTA_COBRO,
  ESTADOS_ABIERTOS,
  ESTADOS_MANUALES,
  ESTADOS_ORDEN,
  motivoCambioNoPermitido,
  puedeDarTurno,
  situacionCobro,
} from "@/modules/ordenes/estados";
import {
  cambiarEstadoOrden,
  catalogosOrden,
  contarPorEstado,
  crearOrden,
  cuentaDe,
  darTurno,
  editarOrden,
  eliminarCobro,
  guardarFacturacion,
  LIMITE_LISTADO,
  listarOrdenes,
  obtenerOrden,
  OrdenError,
  registrarCobro,
  resumenCobranzas,
  type FiltrosOrden,
} from "@/modules/ordenes/orden.service";
import type { OrdenInput } from "@/modules/ordenes/schemas";
import { enlaceWhatsapp } from "@/modules/pagos/transferencia";
import { numeroWhatsappCliente } from "@/modules/turnos/aviso-cliente";
import { listarServicios, obtenerDisponibilidad, TurnoNoDisponibleError } from "@/modules/turnos/servicio.service";
import { avisar } from "@/web/avisos";
import { param, paramFecha, url } from "@/web/parametros";
import { ESTADOS_ORDEN as ESTADOS_UI } from "@/web/ui";
import { mostrar } from "@/web/vistas";

export const rutasOrdenes = Router();

// La plata (importes, factura y cobros) y la pantalla de cobranzas son solo para el Admin.
rutasOrdenes.use(["/cobranzas", "/:id/facturacion", "/:id/cobros"], requerirRol("ADMIN"));

const esAdmin = (res: Response) => usuarioDe(res).rol === "ADMIN";
const fichaDe = (id: string, ancla?: string) => url(`/ordenes/${id}`, {}, ancla);
const enLista = <T extends string>(valores: readonly T[], v: string | undefined): T | undefined =>
  v !== undefined && (valores as readonly string[]).includes(v) ? (v as T) : undefined;

// --- Listado ------------------------------------------------------------------------------

rutasOrdenes.get("/", async (req, res) => {
  const pedido = param(req, "estado");
  const f: FiltrosOrden = {
    estado: pedido === "todas" ? "todas" : (enLista(ESTADOS_ORDEN, pedido) ?? "abiertas"),
    tipo: enLista(Object.values(TipoOrden), param(req, "tipo")),
    aseguradoraId: param(req, "aseguradoraId"),
    texto: param(req, "texto")?.trim() || undefined,
  };
  const admin = esAdmin(res);
  const [ordenes, conteo, catalogos, cobranzas] = await Promise.all([
    listarOrdenes(f),
    contarPorEstado(),
    catalogosOrden(),
    admin ? resumenCobranzas(hoy()) : null,
  ]);

  await mostrar(res, "ordenes/listado", {
    titulo: "Órdenes de trabajo",
    f,
    ordenes: ordenes.map((o) => ({ ...o, cuenta: cuentaDe(o) })),
    conteo,
    abiertas: ESTADOS_ABIERTOS.reduce((total, e) => total + (conteo.get(e) ?? 0), 0),
    ESTADOS_ABIERTOS,
    aseguradoras: catalogos.aseguradoras,
    hayFiltros: f.estado !== "abiertas" || !!f.tipo || !!f.aseguradoraId || !!f.texto,
    limite: LIMITE_LISTADO,
    admin,
    porCobrar: cobranzas ? cobranzas.grupos.reduce((total, g) => total + g.saldo, 0) : null,
    situacionCobro,
  });
});

// --- Alta y edición ---------------------------------------------------------------------

const CAMPOS = [
  "tipo",
  "recibidaEl",
  "nombre",
  "telefono",
  "vehiculo",
  "patente",
  "aseguradoraId",
  "siniestro",
  "codigoCristal",
  "cristalId",
  "proveedorId",
  "observaciones",
] as const;

type Valores = Record<(typeof CAMPOS)[number], string>;

interface EstadoFormulario {
  valores?: Valores;
  errores?: Errores;
  mensaje?: string | null;
}

function leerOrden(cuerpo: Cuerpo): OrdenInput {
  return {
    tipo: (texto(cuerpo, "tipo") ?? "") as TipoOrden,
    recibidaEl: texto(cuerpo, "recibidaEl") ?? "",
    cliente: { nombre: texto(cuerpo, "nombre") ?? "", telefono: texto(cuerpo, "telefono") },
    vehiculo: texto(cuerpo, "vehiculo"),
    patente: texto(cuerpo, "patente"),
    aseguradoraId: texto(cuerpo, "aseguradoraId"),
    siniestro: texto(cuerpo, "siniestro"),
    codigoCristal: texto(cuerpo, "codigoCristal"),
    cristalId: texto(cuerpo, "cristalId"),
    proveedorId: texto(cuerpo, "proveedorId"),
    observaciones: texto(cuerpo, "observaciones"),
  };
}

async function paginaFormulario(req: Request, res: Response, id: string | null, formulario: EstadoFormulario = {}, estado = 200) {
  const orden = id ? await obtenerOrden(id) : null;
  if (id && !orden) return mostrar(res, "errores/404", { titulo: "No encontrado" }, 404);
  const catalogos = await catalogosOrden({ aseguradoraId: orden?.aseguradoraId, proveedorId: orden?.proveedorId, cristalId: orden?.cristalId });

  const guardados: Valores = orden
    ? {
        tipo: orden.tipo,
        recibidaEl: diaAFecha(orden.recibidaEl),
        nombre: orden.cliente.nombre,
        telefono: orden.cliente.telefono,
        vehiculo: orden.vehiculo ?? "",
        patente: orden.patente ?? "",
        aseguradoraId: orden.aseguradoraId ?? "",
        siniestro: orden.siniestro ?? "",
        codigoCristal: orden.codigoCristal ?? "",
        cristalId: orden.cristalId ?? "",
        proveedorId: orden.proveedorId ?? "",
        observaciones: orden.observaciones ?? "",
      }
    : {
        ...(Object.fromEntries(CAMPOS.map((c) => [c, ""])) as Valores),
        tipo: param(req, "tipo") === "PARTICULAR" ? "PARTICULAR" : "SEGURO",
        recibidaEl: hoy(),
      };

  await mostrar(
    res,
    "ordenes/formulario",
    {
      titulo: orden ? `Editar orden #${orden.numero}` : "Nueva orden",
      orden,
      catalogos,
      valores: formulario.valores ?? guardados,
      errores: formulario.errores ?? {},
      mensaje: formulario.mensaje ?? null,
    },
    estado,
  );
}

const valoresEnviados = (cuerpo: Cuerpo) => Object.fromEntries(CAMPOS.map((c) => [c, texto(cuerpo, c) ?? ""])) as Valores;

rutasOrdenes.get("/nueva", (req, res) => paginaFormulario(req, res, null));

rutasOrdenes.post("/nueva", async (req, res) => {
  let destino: string;
  try {
    const orden = await crearOrden(leerOrden(req.body));
    avisar(res, `Orden #${orden.numero} creada.`);
    destino = fichaDe(orden.id);
  } catch (e) {
    if (!(e instanceof ZodError)) throw e;
    return paginaFormulario(req, res, null, { valores: valoresEnviados(req.body), errores: erroresDeZod(e), mensaje: "Revisá los datos marcados" }, 422);
  }
  res.redirect(303, destino);
});

// --- Cobranzas (solo Admin) ---------------------------------------------------------------

rutasOrdenes.get("/cobranzas", async (_req, res) => {
  const { grupos, sinImporte } = await resumenCobranzas(hoy());
  await mostrar(res, "ordenes/cobranzas", {
    titulo: "Cobranzas",
    grupos,
    sinImporte,
    total: grupos.reduce((t, g) => t + g.saldo, 0),
    diasAlerta: DIAS_ALERTA_COBRO,
  });
});

// --- Ficha ---------------------------------------------------------------------------------

interface EstadoFicha {
  facturacion?: { valores: Record<string, string>; errores: Errores; mensaje: string | null };
  cobro?: { valores: Record<string, string>; errores: Errores; mensaje: string | null };
}

const aTexto = (v: unknown) => (v === null || v === undefined ? "" : String(v));

async function paginaFicha(req: Request, res: Response, ficha: EstadoFicha = {}, estado = 200) {
  const orden = await obtenerOrden(req.params.id as string);
  if (!orden) return mostrar(res, "errores/404", { titulo: "No encontrado" }, 404);

  const cuenta = cuentaDe(orden);
  const telefono = numeroWhatsappCliente(orden.cliente.telefono);
  await mostrar(
    res,
    "ordenes/ficha",
    {
      titulo: `Orden #${orden.numero}`,
      orden,
      admin: esAdmin(res),
      cuenta,
      situacion: situacionCobro(cuenta.total, cuenta.cobrado),
      // A mano se puede ir a cualquier estado salvo Cobrada; una orden Cobrada no cambia a mano.
      estadosPosibles: ESTADOS_MANUALES.filter((e) => e !== orden.estado && !motivoCambioNoPermitido(orden.estado, e)),
      darTurno: puedeDarTurno(orden.estado, orden.turno?.estado ?? null),
      siniestroEsLink: !!orden.siniestro && /^https?:\/\//i.test(orden.siniestro),
      whatsapp: telefono ? enlaceWhatsapp(telefono, `Hola ${orden.cliente.nombre}, te escribimos de Parabrisas Catamarca.`) : null,
      facturacion: ficha.facturacion ?? {
        valores: {
          importeTotal: aTexto(cuenta.total),
          facturaNumero: aTexto(orden.facturaNumero),
          facturaFecha: orden.facturaFecha ? diaAFecha(orden.facturaFecha) : "",
          facturaImporte: aTexto(orden.facturaImporte),
        },
        errores: {},
        mensaje: null,
      },
      cobro: ficha.cobro ?? {
        valores: {
          fecha: hoy(),
          monto: cuenta.saldo && cuenta.saldo > 0 ? String(cuenta.saldo) : "",
          pagador: orden.tipo === "SEGURO" ? "ASEGURADORA" : "CLIENTE",
          medio: "TRANSFERENCIA",
          nota: "",
        },
        errores: {},
        mensaje: null,
      },
      PAGADORES: Object.values(PagadorCobro),
      MEDIOS: Object.values(MedioCobro),
    },
    estado,
  );
}

rutasOrdenes.get("/:id", (req, res) => paginaFicha(req, res));

rutasOrdenes.get("/:id/editar", (req, res) => paginaFormulario(req, res, req.params.id));

rutasOrdenes.post("/:id/editar", async (req, res, next) => {
  if (!(await obtenerOrden(req.params.id))) return next();
  try {
    await editarOrden(req.params.id, leerOrden(req.body));
  } catch (e) {
    if (!(e instanceof ZodError)) throw e;
    return paginaFormulario(req, res, req.params.id, { valores: valoresEnviados(req.body), errores: erroresDeZod(e), mensaje: "Revisá los datos marcados" }, 422);
  }
  avisar(res, "Cambios guardados.");
  res.redirect(303, fichaDe(req.params.id));
});

rutasOrdenes.post("/:id/estado", async (req, res, next) => {
  if (!(await obtenerOrden(req.params.id))) return next();
  const nuevo = enLista(Object.values(EstadoOrden), texto(req.body, "estado"));
  if (!nuevo) {
    avisar(res, "Estado inválido.", { tono: "peligro", ancla: "estado" });
    return res.redirect(303, fichaDe(req.params.id, "estado"));
  }
  try {
    const orden = await cambiarEstadoOrden(req.params.id, nuevo);
    avisar(res, `La orden quedó en «${ESTADOS_UI[orden.estado].etiqueta}».`, { ancla: "estado" });
  } catch (e) {
    if (!(e instanceof OrdenError)) throw e;
    avisar(res, e.message, { tono: "peligro", ancla: "estado" });
  }
  res.redirect(303, fichaDe(req.params.id, "estado"));
});

// --- Dar turno -----------------------------------------------------------------------------

/** Cuántos días por delante se muestran para elegir. */
const DIAS_TURNO = 14;

rutasOrdenes.get("/:id/turno", async (req, res) => {
  const orden = await obtenerOrden(req.params.id);
  if (!orden) return mostrar(res, "errores/404", { titulo: "No encontrado" }, 404);
  if (!puedeDarTurno(orden.estado, orden.turno?.estado ?? null)) {
    avisar(res, "Esta orden ya tiene un turno vigente o ya se instaló.", { tono: "alerta", ancla: "turno" });
    return res.redirect(303, fichaDe(orden.id, "turno"));
  }

  const servicios = (await listarServicios()).filter((s) => s.activo);
  if (servicios.length === 0) {
    avisar(res, "No hay servicios activos para dar turno. Creá uno en Servicios.", { tono: "alerta", ancla: "turno" });
    return res.redirect(303, fichaDe(orden.id, "turno"));
  }
  // Por defecto, el servicio de colocación (el que lleva cristal).
  const servicio = servicios.find((s) => s.id === param(req, "servicio")) ?? servicios.find((s) => s.requiereCristal) ?? servicios[0];

  // Los próximos días con cuántos horarios libres tiene cada uno; sin día elegido, el primero con lugar.
  const dias = Array.from({ length: DIAS_TURNO }, (_, i) => sumarDias(hoy(), i));
  const libresPorDia = new Map<string, number>();
  for (const dia of dias) {
    const atiende = servicio.horarios.some((h) => h.diaSemana === diaSemana(dia));
    libresPorDia.set(dia, atiende ? (await obtenerDisponibilidad(servicio.id, dia)).length : 0);
  }
  const fecha = paramFecha(req) ?? dias.find((d) => (libresPorDia.get(d) ?? 0) > 0) ?? hoy();
  const libres = await obtenerDisponibilidad(servicio.id, fecha);
  const pedido = param(req, "inicio");
  const elegido = pedido ? libres.find((t) => t.inicio.toISOString() === pedido) : undefined;

  await mostrar(res, "ordenes/turno", {
    titulo: `Dar turno · Orden #${orden.numero}`,
    orden,
    servicios,
    servicio,
    dias,
    libresPorDia,
    fecha,
    libres,
    elegido,
    inicioPedido: pedido,
    urlDia: (dia: string) => url(`/ordenes/${orden.id}/turno`, { servicio: servicio.id, fecha: dia }),
    urlHorario: (iso: string) => url(`/ordenes/${orden.id}/turno`, { servicio: servicio.id, fecha, inicio: iso }),
  });
});

rutasOrdenes.post("/:id/turno", async (req, res, next) => {
  const orden = await obtenerOrden(req.params.id);
  if (!orden) return next();
  const servicioId = texto(req.body, "servicioId") ?? "";
  try {
    const turno = await darTurno(orden.id, { servicioId, inicio: texto(req.body, "inicio") ?? "" });
    avisar(res, `Turno dado para el ${formatearFecha(fechaLocal(turno.inicio))} a las ${formatearHora(turno.inicio)} hs.`, { ancla: "turno" });
  } catch (e) {
    if (e instanceof TurnoNoDisponibleError || e instanceof ZodError) {
      avisar(res, "Ese horario ya no está disponible. Elegí otro.", { tono: "peligro" });
      return res.redirect(303, url(`/ordenes/${orden.id}/turno`, { servicio: servicioId }));
    }
    if (!(e instanceof OrdenError)) throw e;
    avisar(res, e.message, { tono: "peligro", ancla: "turno" });
  }
  res.redirect(303, fichaDe(orden.id, "turno"));
});

// --- Plata (solo Admin) -----------------------------------------------------------------------

const CAMPOS_FACTURACION = ["importeTotal", "facturaNumero", "facturaFecha", "facturaImporte"] as const;

rutasOrdenes.post("/:id/facturacion", async (req, res, next) => {
  if (!(await obtenerOrden(req.params.id))) return next();
  const valores = Object.fromEntries(CAMPOS_FACTURACION.map((c) => [c, texto(req.body, c) ?? ""]));
  const fallo = (errores: Errores, mensaje: string | null) => paginaFicha(req, res, { facturacion: { valores, errores, mensaje } }, 422);
  try {
    await guardarFacturacion(req.params.id, {
      importeTotal: numero(req.body, "importeTotal"),
      facturaNumero: texto(req.body, "facturaNumero"),
      facturaFecha: texto(req.body, "facturaFecha"),
      facturaImporte: numero(req.body, "facturaImporte"),
    });
  } catch (e) {
    if (e instanceof ZodError) return fallo(erroresDeZod(e), "Revisá los datos marcados");
    if (e instanceof OrdenError) return fallo({}, e.message);
    throw e;
  }
  avisar(res, "Importe y factura guardados.", { ancla: "plata" });
  res.redirect(303, fichaDe(req.params.id, "plata"));
});

const CAMPOS_COBRO = ["fecha", "monto", "pagador", "medio", "nota"] as const;

rutasOrdenes.post("/:id/cobros", async (req, res, next) => {
  if (!(await obtenerOrden(req.params.id))) return next();
  const valores = Object.fromEntries(CAMPOS_COBRO.map((c) => [c, texto(req.body, c) ?? ""]));
  const fallo = (errores: Errores, mensaje: string | null) => paginaFicha(req, res, { cobro: { valores, errores, mensaje } }, 422);
  try {
    const orden = await registrarCobro(req.params.id, {
      fecha: texto(req.body, "fecha") ?? "",
      monto: numero(req.body, "monto") as number,
      pagador: (texto(req.body, "pagador") ?? "") as PagadorCobro,
      medio: (texto(req.body, "medio") ?? "") as MedioCobro,
      nota: texto(req.body, "nota"),
    });
    const monto = pesos(numero(req.body, "monto"));
    avisar(res, orden.estado === "COBRADA" ? `Cobro de ${monto} registrado. La orden quedó cobrada.` : `Cobro de ${monto} registrado.`, { ancla: "plata" });
  } catch (e) {
    if (e instanceof ZodError) return fallo(erroresDeZod(e), "Revisá los datos del cobro");
    if (e instanceof OrdenError) return fallo({}, e.message);
    throw e;
  }
  res.redirect(303, fichaDe(req.params.id, "plata"));
});

rutasOrdenes.post("/:id/cobros/:cobroId/eliminar", async (req, res, next) => {
  if (!(await obtenerOrden(req.params.id))) return next();
  await eliminarCobro(req.params.id, req.params.cobroId);
  avisar(res, "Cobro borrado.", { ancla: "plata" });
  res.redirect(303, fichaDe(req.params.id, "plata"));
});
