import { Router, type Request, type Response } from "express";
import { ZodError } from "zod";
import { EstadoTurno } from "@/generated/prisma/enums";
import { erroresDeZod, numero, texto, type Errores } from "@/lib/formularios";
import { pesos } from "@/lib/formato";
import { diaSemana, fechaLocal, formatearFecha, formatearHora, hoy, sumarDias } from "@/lib/tiempo";
import { z } from "@/lib/zod";
import { buscarCristales, obtenerCatalogos, StockInsuficienteError } from "@/modules/inventario/cristal.service";
import { liberarVencidos } from "@/modules/pagos/pagos.service";
import { enlaceWhatsapp } from "@/modules/pagos/transferencia";
import { mensajeAvisoTurno, numeroWhatsappCliente } from "@/modules/turnos/aviso-cliente";
import { puedeEditar } from "@/modules/turnos/edicion";
import { listarServicios, obtenerDisponibilidad, TurnoNoDisponibleError } from "@/modules/turnos/servicio.service";
import {
  asignarCristal,
  cambiarEstadoTurno,
  contarTurnosPorDia,
  editarTurno,
  listarTurnosDelDia,
  obtenerTurno,
  obtenerTurnoParaEditar,
  TurnoNoEditableError,
} from "@/modules/turnos/turno.service";
import { avisar } from "@/web/avisos";
import { param, paramFecha, url } from "@/web/parametros";
import { mostrar } from "@/web/vistas";

export const rutasTurnos = Router();

type TurnoDelDia = Awaited<ReturnType<typeof listarTurnosDelDia>>[number];

/** Enlace de WhatsApp al cliente con el aviso que corresponde al estado del turno, o `null` si no hay qué avisar o el teléfono no sirve. */
function enlaceAviso(t: TurnoDelDia): string | null {
  const numero = numeroWhatsappCliente(t.cliente.telefono);
  if (!numero) return null;
  const pendiente = t.pagos.find((p) => p.estado === "PENDIENTE");
  const mensaje = mensajeAvisoTurno(t.estado, {
    nombre: t.cliente.nombre,
    servicio: t.servicio.nombre,
    dia: formatearFecha(fechaLocal(t.inicio)),
    hora: formatearHora(t.inicio),
    codigo: t.codigo,
    senaPendiente: pendiente ? pesos(pendiente.monto) : null,
  });
  return mensaje ? enlaceWhatsapp(numero, mensaje) : null;
}

const agendaDe = (inicio: Date, id?: string) => url("/turnos", { fecha: fechaLocal(inicio) }, id && `t-${id}`);

rutasTurnos.get("/", async (req, res) => {
  await liberarVencidos();
  const fecha = paramFecha(req) ?? hoy();
  const lunes = sumarDias(fecha, -((diaSemana(fecha) + 6) % 7));

  const [turnos, porDia, servicios] = await Promise.all([
    listarTurnosDelDia(fecha),
    contarTurnosPorDia(lunes, 7),
    listarServicios(),
  ]);
  const activos = servicios.filter((s) => s.activo);
  const libres = await Promise.all(activos.map((s) => obtenerDisponibilidad(s.id, fecha)));

  await mostrar(res, "turnos/agenda", {
    titulo: "Turnos",
    fecha,
    turnos,
    porDia: [...porDia],
    activos,
    libres,
    sumarDias,
    puedeEditar,
    enlaceAviso,
  });
});

const estadoSchema = z.enum(EstadoTurno);

rutasTurnos.post("/:id/estado", async (req, res, next) => {
  const turno = await obtenerTurno(req.params.id);
  if (!turno) return next();
  const estado = estadoSchema.safeParse(texto(req.body, "estado"));
  if (!estado.success) {
    avisar(res, "Estado inválido.", { tono: "peligro", ancla: `t-${turno.id}` });
    return res.redirect(303, agendaDe(turno.inicio, turno.id));
  }
  try {
    await cambiarEstadoTurno(turno.id, estado.data);
  } catch (e) {
    if (!(e instanceof StockInsuficienteError)) throw e;
    avisar(res, "No hay stock del cristal asignado: registrá el ingreso o asigná otro antes de completar.", {
      tono: "peligro",
      ancla: `t-${turno.id}`,
    });
  }
  res.redirect(303, agendaDe(turno.inicio, turno.id));
});

// --- Elegir el cristal a colocar -------------------------------------------------

/** Cuántos cristales se listan como máximo: si hay más, se pide afinar los filtros. */
const MAXIMO_CRISTALES = 50;

/** Desde dónde se llegó al buscador, para volver al mismo lugar: la agenda (por defecto) o la edición del turno. */
const desdeEditar = (req: Request) => (req.method === "GET" ? param(req, "desde") : texto(req.body, "desde")) === "editar";

rutasTurnos.get("/:id/cristal", async (req, res, next) => {
  const turno = await obtenerTurno(req.params.id);
  if (!turno) return next();
  const volverAEditar = desdeEditar(req);
  if (["COMPLETADO", "CANCELADO", "AUSENTE"].includes(turno.estado)) {
    return res.redirect(303, agendaDe(turno.inicio, turno.id));
  }

  const f = {
    texto: param(req, "texto"),
    modeloId: param(req, "modeloId"),
    anio: param(req, "anio"),
    ubicacionId: param(req, "ubicacionId"),
    lado: param(req, "lado"),
    tipoId: param(req, "tipoId"),
    marcaId: param(req, "marcaId"),
  };
  const lado = f.lado === "IZQUIERDO" || f.lado === "DERECHO" ? f.lado : undefined;
  const anio = f.anio && /^\d{4}$/.test(f.anio) ? Number(f.anio) : undefined;
  const [catalogos, encontrados] = await Promise.all([
    obtenerCatalogos(),
    buscarCristales({
      texto: f.texto,
      modeloId: f.modeloId,
      anio,
      ubicacionId: f.ubicacionId,
      lado,
      tipoId: f.tipoId,
      marcaId: f.marcaId,
      soloConStock: true,
    }),
  ]);
  const filtrosAvanzados = [f.modeloId, f.anio, f.ubicacionId, f.lado, f.tipoId, f.marcaId].filter(Boolean).length;

  await mostrar(res, "turnos/cristal", {
    titulo: "Elegir cristal",
    turno,
    f,
    catalogos,
    cristales: encontrados.slice(0, MAXIMO_CRISTALES),
    total: encontrados.length,
    maximo: MAXIMO_CRISTALES,
    hayFiltros: Object.values(f).some(Boolean),
    filtrosAvanzados,
    desde: volverAEditar ? "editar" : "",
    urlVolver: volverAEditar ? `/turnos/${turno.id}/editar` : agendaDe(turno.inicio, turno.id),
  });
});

rutasTurnos.post("/:id/cristal", async (req, res, next) => {
  const turno = await obtenerTurno(req.params.id);
  if (!turno) return next();
  await asignarCristal(turno.id, texto(req.body, "cristalId") ?? null);
  res.redirect(303, desdeEditar(req) ? `/turnos/${turno.id}/editar` : agendaDe(turno.inicio, turno.id));
});

// --- Editar un turno ------------------------------------------------------------

interface EstadoFormulario {
  valores?: Record<string, string>;
  errores?: Errores;
  mensaje?: string | null;
}

const CAMPOS = ["nombre", "telefono", "email", "vehiculo", "patente", "notas", "precio", "cristalId"] as const;

async function paginaEditar(req: Request, res: Response, formulario: EstadoFormulario = {}, estado = 200) {
  const turno = await obtenerTurnoParaEditar(req.params.id as string);
  if (!turno) return mostrar(res, "errores/404", { titulo: "No encontrado" }, 404);

  const diaDelTurno = fechaLocal(turno.inicio);
  const urlVolver = url("/turnos", { fecha: diaDelTurno });
  if (!puedeEditar(turno.estado)) {
    return mostrar(res, "turnos/no-editable", { titulo: "Editar turno", urlVolver });
  }

  const pedido = param(req, "servicio");
  const servicios = (await listarServicios()).filter((s) => s.activo || s.id === turno.servicioId);
  const servicioId = pedido && servicios.some((s) => s.id === pedido) ? pedido : turno.servicioId;
  const servicio = servicios.find((s) => s.id === servicioId)!;
  const fecha = paramFecha(req) ?? diaDelTurno;

  const mismaAgenda = servicioId === turno.servicioId && fecha === diaDelTurno;
  const libres = await obtenerDisponibilidad(servicioId, fecha, turno.id);
  const actualISO = turno.inicio.toISOString();
  const inicioPedido = param(req, "inicio");
  const candidato = inicioPedido ?? (mismaAgenda ? actualISO : undefined);
  // Un horario solo vale si está libre; el actual siempre vale mientras no cambie el servicio ni el día.
  const inicio =
    candidato && (libres.some((t) => t.inicio.toISOString() === candidato) || (mismaAgenda && candidato === actualISO))
      ? candidato
      : undefined;

  const guardados: Record<(typeof CAMPOS)[number], string> = {
    nombre: turno.cliente.nombre,
    telefono: turno.cliente.telefono,
    email: turno.cliente.email ?? "",
    vehiculo: turno.vehiculo ?? "",
    patente: turno.patente ?? "",
    notas: turno.notas ?? "",
    precio: turno.precio === null ? "" : String(turno.precio),
    cristalId: turno.cristalId ?? "",
  };

  await mostrar(
    res,
    "turnos/editar",
    {
      titulo: "Editar turno",
      turno,
      urlVolver,
      servicios,
      servicioId,
      servicio,
      fecha,
      libres,
      inicio,
      inicioPedido,
      mostrarCristal: servicio.requiereCristal || !!turno.cristalId,
      sena: turno.pagos[0] ? pesos(turno.pagos[0].monto) : null,
      urlHorario: (iso: string) => url(`/turnos/${turno.id}/editar`, { servicio: servicioId, fecha, inicio: iso }),
      valores: formulario.valores ?? guardados,
      errores: formulario.errores ?? {},
      mensaje: formulario.mensaje ?? null,
    },
    estado,
  );
}

rutasTurnos.get("/:id/editar", (req, res) => paginaEditar(req, res));

rutasTurnos.post("/:id/editar", async (req, res) => {
  const valores = Object.fromEntries(CAMPOS.map((c) => [c, texto(req.body, c) ?? ""]));
  const fallo = (errores: Errores, mensaje: string | null = "Revisá los datos marcados") =>
    paginaEditar(req, res, { valores, errores, mensaje }, 422);

  let destino: string;
  try {
    const turno = await editarTurno(req.params.id, {
      servicioId: texto(req.body, "servicioId") ?? "",
      inicio: texto(req.body, "inicio") ?? "",
      cliente: { nombre: valores.nombre, telefono: valores.telefono, email: texto(req.body, "email") },
      vehiculo: texto(req.body, "vehiculo"),
      patente: texto(req.body, "patente"),
      cristalId: texto(req.body, "cristalId"),
      precio: numero(req.body, "precio"),
      notas: texto(req.body, "notas"),
    });
    destino = agendaDe(turno.inicio, turno.id);
  } catch (e) {
    if (e instanceof ZodError) return fallo(erroresDeZod(e));
    if (e instanceof TurnoNoDisponibleError) return fallo({}, "Ese horario ya no está disponible. Elegí otro.");
    if (e instanceof TurnoNoEditableError) return fallo({}, e.message);
    throw e;
  }
  res.redirect(303, destino);
});
