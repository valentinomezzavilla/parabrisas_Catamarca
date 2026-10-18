import { db } from "@/lib/db";
import { pesos } from "@/lib/formato";
import { diaAFecha, fechaADia, fechaLocal } from "@/lib/tiempo";
import { z } from "@/lib/zod";
import type { EstadoOrden, Prisma, TipoOrden } from "@/generated/prisma/client";
import { codigoLibre, disponibilidadDelDia, TurnoNoDisponibleError } from "@/modules/turnos/servicio.service";
import {
  agruparCobranzas,
  cobradoDe,
  diasEntre,
  ESTADOS_A_COBRAR,
  ESTADOS_ABIERTOS,
  estadoAlDarTurno,
  estadoSegunCobros,
  estadoSegunFactura,
  motivoCambioNoPermitido,
  puedeDarTurno,
  saldo,
} from "./estados";
import { ImportacionError, prepararImportacion } from "./notion";
import {
  cobroSchema,
  facturacionSchema,
  normalizarPatente,
  ordenSchema,
  type CobroInput,
  type FacturacionInput,
  type OrdenInput,
} from "./schemas";

type Tx = Prisma.TransactionClient;

/** Una operación que las reglas de la orden no permiten. El mensaje es para el usuario. */
export class OrdenError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "OrdenError";
  }
}

const aNumero = (v: { toString(): string } | null) => (v === null ? null : Number(v));

/** Serializa las operaciones de plata y de estado de una misma orden. */
const bloquearOrden = (tx: Tx, id: string) => tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`orden:${id}`}))`;

// --- Consultas ---------------------------------------------------------------------------

export interface FiltrosOrden {
  /** Un estado, o "abiertas" (por defecto) / "todas". */
  estado?: EstadoOrden | "abiertas" | "todas";
  tipo?: TipoOrden;
  aseguradoraId?: string;
  texto?: string;
}

/** Tope del listado: alcanza para las abiertas; con "todas" se muestran las más recientes. */
export const LIMITE_LISTADO = 300;

function filtroTexto(texto: string): Prisma.OrdenTrabajoWhereInput {
  const parecido = { contains: texto, mode: "insensitive" as const };
  const patente = normalizarPatente(texto);
  return {
    OR: [
      ...(patente ? [{ patente: { contains: patente } }] : []),
      ...(/^\d{1,9}$/.test(texto) ? [{ numero: Number(texto) }] : []),
      { siniestro: parecido },
      { vehiculo: parecido },
      { codigoCristal: parecido },
      { observaciones: parecido },
      { cliente: { nombre: parecido } },
      { cliente: { telefono: { contains: texto } } },
    ],
  };
}

export function listarOrdenes(f: FiltrosOrden = {}) {
  const estado = f.estado === "todas" ? undefined : !f.estado || f.estado === "abiertas" ? { in: ESTADOS_ABIERTOS } : f.estado;
  return db.ordenTrabajo.findMany({
    where: {
      estado,
      tipo: f.tipo,
      aseguradoraId: f.aseguradoraId,
      ...(f.texto && filtroTexto(f.texto)),
    },
    include: {
      cliente: { select: { nombre: true, telefono: true } },
      aseguradora: { select: { nombre: true } },
      turno: { select: { inicio: true, estado: true } },
      cobros: { select: { monto: true } },
    },
    orderBy: [{ recibidaEl: "desc" }, { numero: "desc" }],
    take: LIMITE_LISTADO,
  });
}

export async function hayOrdenes(): Promise<boolean> {
  return (await db.ordenTrabajo.count()) > 0;
}

/** Cantidad de órdenes por estado, para los contadores del listado. */
export async function contarPorEstado(): Promise<Map<EstadoOrden, number>> {
  const grupos = await db.ordenTrabajo.groupBy({ by: ["estado"], _count: { _all: true } });
  return new Map(grupos.map((g) => [g.estado, g._count._all]));
}

export function obtenerOrden(id: string) {
  return db.ordenTrabajo.findUnique({
    where: { id },
    include: {
      cliente: true,
      aseguradora: true,
      proveedor: true,
      cristal: { select: { id: true, codigo: true, descripcion: true, cantidad: true } },
      turno: { select: { id: true, codigo: true, inicio: true, estado: true, servicio: { select: { nombre: true } } } },
      cobros: { orderBy: [{ fecha: "asc" }, { creadoEn: "asc" }] },
    },
  });
}

/** Total, cobrado (cobros más seña abonada) y saldo de una orden. */
export function cuentaDe(orden: {
  importeTotal: { toString(): string } | null;
  senaMonto: { toString(): string } | null;
  senaAbonada: boolean;
  cobros: { monto: { toString(): string } }[];
}) {
  const total = aNumero(orden.importeTotal);
  const cobrado = cobradoDe(orden);
  return { total, cobrado, saldo: saldo(total, cobrado) };
}

/** Opciones de los formularios. Lo que la orden ya tiene se ofrece aunque esté desactivado. */
export async function catalogosOrden(conservar: { aseguradoraId?: string | null; proveedorId?: string | null; cristalId?: string | null } = {}) {
  const activoO = (id?: string | null) => ({ OR: [{ activo: true }, ...(id ? [{ id }] : [])] });
  const [aseguradoras, proveedores, cristales] = await Promise.all([
    db.aseguradora.findMany({ where: activoO(conservar.aseguradoraId), orderBy: { nombre: "asc" } }),
    db.proveedor.findMany({ where: activoO(conservar.proveedorId), orderBy: { nombre: "asc" } }),
    db.cristal.findMany({
      where: activoO(conservar.cristalId),
      select: { id: true, codigo: true, descripcion: true, cantidad: true },
      orderBy: { codigo: "asc" },
    }),
  ]);
  return { aseguradoras, proveedores, cristales };
}

// --- Alta y edición --------------------------------------------------------------------

/** Un teléfono que identifica a alguien: con al menos 6 dígitos. */
const telefonoUtil = (t?: string) => (t?.match(/\d/g)?.length ?? 0) >= 6;

/** El cliente de ese teléfono si ya existe (sin pisarle el nombre) o uno nuevo. Sin teléfono, siempre uno nuevo. */
async function clienteDe(tx: Tx, datos: { nombre: string; telefono?: string }) {
  if (telefonoUtil(datos.telefono)) {
    const existente = await tx.cliente.findFirst({ where: { telefono: datos.telefono } });
    if (existente) return existente;
  }
  return tx.cliente.create({ data: { nombre: datos.nombre, telefono: datos.telefono ?? "" } });
}

function datosDeOrden(r: z.output<typeof ordenSchema>) {
  // La seña no se arma acá: según quién edita, su monto y su "abonada" tienen reglas propias.
  return {
    tipo: r.tipo,
    recibidaEl: fechaADia(r.recibidaEl),
    vehiculo: r.vehiculo ?? null,
    patente: r.patente || null,
    aseguradoraId: r.aseguradoraId ?? null,
    siniestro: r.siniestro ?? null,
    codigoCristal: r.codigoCristal ?? null,
    cristalId: r.cristalId ?? null,
    proveedorId: r.proveedorId ?? null,
    observaciones: r.observaciones ?? null,
  };
}

/** Quién hace el cambio: solo el Admin puede dar por abonada una seña. */
export interface Actor {
  admin: boolean;
}

export async function crearOrden(input: OrdenInput, { admin }: Actor = { admin: false }) {
  const r = ordenSchema.parse(input);
  return db.$transaction(async (tx) => {
    const cliente = await clienteDe(tx, r.cliente);
    return tx.ordenTrabajo.create({
      data: { ...datosDeOrden(r), clienteId: cliente.id, senaMonto: r.senaMonto ?? null, senaAbonada: admin && !!r.senaAbonada },
    });
  });
}

/**
 * Edita los datos de la orden (no la plata ni el estado). Si cambia el teléfono, la orden pasa al cliente de ese
 * teléfono (o a uno nuevo); si no, se corrige el nombre en la ficha actual. Si la orden tiene un turno por delante,
 * se le pasan cliente, vehículo, patente y cristal: así la agenda descuenta del stock el cristal correcto.
 *
 * La seña: cualquiera carga o corrige el monto mientras está pendiente; una vez abonada, el monto y la casilla solo los
 * cambia el Admin (los demás no pueden alterar plata ya confirmada). No se pasa a Seguro una orden con seña abonada.
 */
export async function editarOrden(id: string, input: OrdenInput, { admin }: Actor = { admin: false }) {
  const r = ordenSchema.parse(input);
  return db.$transaction(async (tx) => {
    await bloquearOrden(tx, id);
    const actual = await tx.ordenTrabajo.findUniqueOrThrow({
      where: { id },
      include: { cliente: true, cobros: { select: { monto: true } }, turno: { select: { id: true, estado: true } } },
    });

    if (r.tipo === "SEGURO" && actual.senaAbonada) {
      throw new OrdenError("La seña ya está abonada: marcala como pendiente antes de pasar la orden a Seguro.");
    }
    const bloqueada = actual.senaAbonada && !admin;
    const senaMonto = bloqueada ? actual.senaMonto : (r.senaMonto ?? null);
    const senaAbonada = bloqueada ? true : admin && !!r.senaAbonada;
    const total = aNumero(actual.importeTotal);
    if (total !== null && senaMonto !== null && Number(senaMonto) > total) {
      throw new OrdenError(`La seña no puede superar el importe total de la orden (${pesos(total)}).`);
    }
    const cobrado = cobradoDe({ cobros: actual.cobros, senaMonto, senaAbonada });
    if (total !== null && cobrado > total + 0.005) {
      throw new OrdenError(`Con esta seña, lo cobrado superaría el importe total (${pesos(total)}).`);
    }

    let clienteId = actual.clienteId;
    if ((r.cliente.telefono ?? "") !== actual.cliente.telefono) clienteId = (await clienteDe(tx, r.cliente)).id;
    else await tx.cliente.update({ where: { id: actual.clienteId }, data: { nombre: r.cliente.nombre } });

    const estado = estadoSegunCobros({ estado: actual.estado, total, cobrado, facturada: !!actual.facturaNumero });
    const orden = await tx.ordenTrabajo.update({ where: { id }, data: { ...datosDeOrden(r), clienteId, senaMonto, senaAbonada, estado } });
    if (actual.turno && ["PENDIENTE", "CONFIRMADO", "EN_CURSO", "ESPERANDO_PAGO"].includes(actual.turno.estado)) {
      await tx.turno.update({
        where: { id: actual.turno.id },
        data: { clienteId, vehiculo: orden.vehiculo, patente: orden.patente, cristalId: orden.cristalId },
      });
    }
    return orden;
  });
}

// --- Estado ----------------------------------------------------------------------------

export async function cambiarEstadoOrden(id: string, nuevo: EstadoOrden) {
  return db.$transaction(async (tx) => {
    await bloquearOrden(tx, id);
    const actual = await tx.ordenTrabajo.findUniqueOrThrow({ where: { id }, include: { cobros: { select: { monto: true } } } });
    const motivo = motivoCambioNoPermitido(actual.estado, nuevo);
    if (motivo) throw new OrdenError(motivo);
    const { total, cobrado } = cuentaDe(actual);
    const estado = estadoSegunCobros({ estado: nuevo, total, cobrado, facturada: !!actual.facturaNumero });
    return tx.ordenTrabajo.update({ where: { id }, data: { estado } });
  });
}

// --- Plata (solo Admin) ------------------------------------------------------------------

/** Importe total y datos de la factura. El total no puede quedar por debajo de lo cobrado ni de la seña. */
export async function guardarFacturacion(id: string, input: FacturacionInput) {
  const r = facturacionSchema.parse(input);
  return db.$transaction(async (tx) => {
    await bloquearOrden(tx, id);
    const actual = await tx.ordenTrabajo.findUniqueOrThrow({ where: { id }, include: { cobros: { select: { monto: true } } } });
    const cobrado = cobradoDe(actual);
    const total = r.importeTotal ?? null;
    if (total !== null && actual.senaMonto !== null && Number(actual.senaMonto) > total) {
      throw new OrdenError(`El importe total no puede ser menor a la seña (${pesos(actual.senaMonto)}).`);
    }
    if (total === null && cobrado > 0) throw new OrdenError("La orden tiene cobros registrados: el importe total no puede quedar vacío.");
    if (total !== null && total < cobrado) throw new OrdenError(`El importe total no puede ser menor a lo ya cobrado (${pesos(cobrado)}).`);

    const facturada = !!r.facturaNumero;
    const estado = estadoSegunCobros({ estado: estadoSegunFactura(actual.estado, facturada), total, cobrado, facturada });
    return tx.ordenTrabajo.update({
      where: { id },
      data: {
        importeTotal: total,
        facturaNumero: r.facturaNumero ?? null,
        facturaFecha: r.facturaFecha ? fechaADia(r.facturaFecha) : null,
        facturaImporte: r.facturaImporte ?? null,
        estado,
      },
    });
  });
}

/** Registra un pago. Hace falta el importe total y el cobro no puede superar el saldo. Con el último, la orden queda Cobrada. */
export async function registrarCobro(id: string, input: CobroInput) {
  const r = cobroSchema.parse(input);
  return db.$transaction(async (tx) => {
    await bloquearOrden(tx, id);
    const actual = await tx.ordenTrabajo.findUniqueOrThrow({ where: { id }, include: { cobros: { select: { monto: true } } } });
    if (actual.estado === "CANCELADA") throw new OrdenError("La orden está cancelada: reabrila antes de registrar cobros.");
    const { total, cobrado, saldo: resta } = cuentaDe(actual);
    if (total === null || resta === null) throw new OrdenError("Cargá el importe total de la orden antes de registrar cobros.");
    if (r.monto > resta + 0.005) throw new OrdenError(`El cobro supera el saldo pendiente (${pesos(resta)}).`);

    await tx.cobroOrden.create({
      data: { ordenId: id, fecha: fechaADia(r.fecha), monto: r.monto, pagador: r.pagador, medio: r.medio, nota: r.nota ?? null },
    });
    const estado = estadoSegunCobros({ estado: actual.estado, total, cobrado: cobrado + r.monto, facturada: !!actual.facturaNumero });
    return tx.ordenTrabajo.update({ where: { id }, data: { estado } });
  });
}

/** Borra un cobro cargado por error. Si la orden estaba Cobrada y le vuelve a faltar plata, vuelve atrás. */
export async function eliminarCobro(ordenId: string, cobroId: string) {
  return db.$transaction(async (tx) => {
    await bloquearOrden(tx, ordenId);
    const { count } = await tx.cobroOrden.deleteMany({ where: { id: cobroId, ordenId } });
    if (count === 0) return;
    const actual = await tx.ordenTrabajo.findUniqueOrThrow({ where: { id: ordenId }, include: { cobros: { select: { monto: true } } } });
    const { total, cobrado } = cuentaDe(actual);
    const estado = estadoSegunCobros({ estado: actual.estado, total, cobrado, facturada: !!actual.facturaNumero });
    if (estado !== actual.estado) await tx.ordenTrabajo.update({ where: { id: ordenId }, data: { estado } });
  });
}

/**
 * Da por abonada la seña de un particular (solo Admin, desde Cobranzas o la ficha). Desde ese momento cuenta como
 * cobrado: baja el saldo y, si completa el total de un trabajo instalado, la orden queda Cobrada.
 */
export async function confirmarSena(id: string) {
  return db.$transaction(async (tx) => {
    await bloquearOrden(tx, id);
    const actual = await tx.ordenTrabajo.findUniqueOrThrow({ where: { id }, include: { cobros: { select: { monto: true } } } });
    if (actual.tipo !== "PARTICULAR" || actual.senaMonto === null) throw new OrdenError("Esta orden no tiene una seña cargada.");
    if (actual.estado === "CANCELADA") throw new OrdenError("La orden está cancelada: reabrila antes de confirmar la seña.");
    if (actual.senaAbonada) return actual;

    const total = aNumero(actual.importeTotal);
    const cobrado = cobradoDe({ ...actual, senaAbonada: true });
    if (total !== null && cobrado > total + 0.005) {
      throw new OrdenError(`Con esta seña, lo cobrado superaría el importe total (${pesos(total)}). Revisá el importe de la orden.`);
    }
    const estado = estadoSegunCobros({ estado: actual.estado, total, cobrado, facturada: !!actual.facturaNumero });
    return tx.ordenTrabajo.update({ where: { id }, data: { senaAbonada: true, estado } });
  });
}

/** Deshace la confirmación de una seña (se confirmó por error). Si la orden estaba Cobrada, vuelve atrás. */
export async function marcarSenaPendiente(id: string) {
  return db.$transaction(async (tx) => {
    await bloquearOrden(tx, id);
    const actual = await tx.ordenTrabajo.findUniqueOrThrow({ where: { id }, include: { cobros: { select: { monto: true } } } });
    if (!actual.senaAbonada) return actual;
    const cobrado = cobradoDe({ ...actual, senaAbonada: false });
    const estado = estadoSegunCobros({ estado: actual.estado, total: aNumero(actual.importeTotal), cobrado, facturada: !!actual.facturaNumero });
    return tx.ordenTrabajo.update({ where: { id }, data: { senaAbonada: false, estado } });
  });
}

// --- Turno -----------------------------------------------------------------------------

const darTurnoSchema = z.object({ servicioId: z.string().min(1), inicio: z.coerce.date() });

/**
 * Da un turno en la agenda con los datos de la orden (cliente, vehículo, patente y cristal). Toma el mismo bloqueo
 * por servicio que las reservas y recalcula la disponibilidad adentro: el horario tiene que seguir libre.
 */
export async function darTurno(ordenId: string, input: { servicioId: string; inicio: string }) {
  const r = darTurnoSchema.parse(input);
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${r.servicioId}))`;
    await bloquearOrden(tx, ordenId);

    const orden = await tx.ordenTrabajo.findUniqueOrThrow({ where: { id: ordenId }, include: { turno: { select: { estado: true } } } });
    if (!puedeDarTurno(orden.estado, orden.turno?.estado ?? null)) {
      throw new OrdenError("Esta orden ya tiene un turno vigente o ya se instaló.");
    }

    const libres = await disponibilidadDelDia(tx, r.servicioId, fechaLocal(r.inicio));
    const elegido = libres.find((t) => t.inicio.getTime() === r.inicio.getTime());
    if (!elegido) throw new TurnoNoDisponibleError();

    const turno = await tx.turno.create({
      data: {
        codigo: await codigoLibre(tx),
        servicioId: r.servicioId,
        clienteId: orden.clienteId,
        inicio: elegido.inicio,
        fin: elegido.fin,
        estado: "PENDIENTE",
        origen: "PANEL",
        vehiculo: orden.vehiculo,
        patente: orden.patente,
        cristalId: orden.cristalId,
      },
    });
    await tx.ordenTrabajo.update({ where: { id: ordenId }, data: { turnoId: turno.id, estado: estadoAlDarTurno(orden.estado) } });
    return turno;
  });
}

// --- Cobranzas (solo Admin) ----------------------------------------------------------------

/** Lo que falta cobrar de los trabajos instalados o facturados, agrupado por quién lo debe. */
export async function resumenCobranzas(hoy: string) {
  const ordenes = await db.ordenTrabajo.findMany({
    where: { estado: { in: ESTADOS_A_COBRAR } },
    include: { aseguradora: { select: { id: true, nombre: true } }, cobros: { select: { monto: true } } },
  });
  return agruparCobranzas(
    ordenes.map((o) => ({
      id: o.id,
      numero: o.numero,
      tipo: o.tipo,
      aseguradora: o.aseguradora,
      patente: o.patente,
      siniestro: o.siniestro,
      total: aNumero(o.importeTotal),
      cobrado: cobradoDe(o),
      facturaNumero: o.facturaNumero,
      facturaFecha: o.facturaFecha && diaAFecha(o.facturaFecha),
      recibidaEl: diaAFecha(o.recibidaEl),
    })),
    hoy,
  );
}

/** Particulares con una seña cargada que todavía no se confirmó, de la más vieja a la más nueva. */
export async function senasPorConfirmar(hoy: string) {
  const ordenes = await db.ordenTrabajo.findMany({
    where: { tipo: "PARTICULAR", senaMonto: { not: null }, senaAbonada: false, estado: { notIn: ["CANCELADA", "COBRADA"] } },
    include: { cliente: { select: { nombre: true, telefono: true } } },
    orderBy: [{ recibidaEl: "asc" }, { numero: "asc" }],
  });
  return ordenes.map((o) => ({
    id: o.id,
    numero: o.numero,
    patente: o.patente,
    vehiculo: o.vehiculo,
    cliente: o.cliente,
    monto: Number(o.senaMonto),
    dias: diasEntre(diaAFecha(o.recibidaEl), hoy),
  }));
}

// --- Importar desde Notion (solo Admin) ---------------------------------------------------

const mismoNombre = (a: string, b: string) => a.localeCompare(b, "es", { sensitivity: "base" }) === 0;

/**
 * Carga la exportación de Notion. Corre una sola vez, con el módulo vacío, y todo en una transacción: si una fila
 * falla no queda nada a medias. Las órdenes se numeran por fecha de recepción.
 */
export async function importarDesdeNotion(texto: string) {
  if ((await db.ordenTrabajo.count()) > 0) {
    throw new ImportacionError("Ya hay órdenes cargadas: la importación desde Notion se hace una sola vez, con el módulo vacío.");
  }
  const [aseguradoras, proveedores] = await Promise.all([
    db.aseguradora.findMany({ select: { id: true, nombre: true } }),
    db.proveedor.findMany({ select: { id: true, nombre: true } }),
  ]);
  const importacion = prepararImportacion(texto, {
    aseguradoras: aseguradoras.map((a) => a.nombre),
    proveedores: proveedores.map((p) => p.nombre),
  });

  return db.$transaction(
    async (tx) => {
      if ((await tx.ordenTrabajo.count()) > 0) throw new ImportacionError("Ya hay órdenes cargadas.");

      let nuevas = 0;
      const idAseguradora = new Map<string, string>();
      for (const a of importacion.aseguradoras) {
        const existente = aseguradoras.find((x) => mismoNombre(x.nombre, a.nombre));
        if (!existente) nuevas++;
        idAseguradora.set(a.clave, existente?.id ?? (await tx.aseguradora.create({ data: { nombre: a.nombre } })).id);
      }
      const idProveedor = new Map<string, string>();
      for (const p of importacion.proveedores) {
        const existente = proveedores.find((x) => mismoNombre(x.nombre, p.nombre));
        idProveedor.set(p.clave, existente?.id ?? (await tx.proveedor.create({ data: { nombre: p.nombre } })).id);
      }

      const ordenes = [...importacion.ordenes].sort((a, b) => a.recibidaEl.localeCompare(b.recibidaEl) || a.fila - b.fila);
      for (const o of ordenes) {
        const cliente = await clienteDe(tx, { nombre: o.cliente.nombre, telefono: o.cliente.telefono || undefined });
        await tx.ordenTrabajo.create({
          data: {
            tipo: o.tipo,
            estado: o.estado,
            recibidaEl: fechaADia(o.recibidaEl),
            clienteId: cliente.id,
            vehiculo: o.vehiculo,
            patente: o.patente,
            aseguradoraId: o.aseguradora ? idAseguradora.get(o.aseguradora) : null,
            siniestro: o.siniestro,
            codigoCristal: o.codigoCristal,
            proveedorId: o.proveedor ? idProveedor.get(o.proveedor) : null,
            observaciones: o.observaciones,
          },
        });
      }
      return { ordenes: ordenes.length, aseguradoras: nuevas };
    },
    { timeout: 120_000 },
  );
}
