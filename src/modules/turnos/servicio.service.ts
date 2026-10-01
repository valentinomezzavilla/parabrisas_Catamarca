import { db } from "@/lib/db";
import { fechaLocal, instanteLocal, sumarMinutos } from "@/lib/tiempo";
import type { Prisma } from "@/generated/prisma/client";
import { calcularSena, MINUTOS_RETENCION } from "@/modules/pagos/sena";
import { calcularDisponibilidad } from "./disponibilidad";
import { reservaSchema, servicioSchema, type ReservaInput, type ServicioInput } from "./schemas";

type Cliente = Prisma.TransactionClient;

export class TurnoNoDisponibleError extends Error {
  constructor() {
    super("El horario elegido ya no está disponible");
  }
}

export class CondicionesNoAceptadasError extends Error {
  constructor() {
    super("Hay que aceptar las condiciones de la seña");
  }
}

// ---------------------------------------------------------------------------
//  Administración de servicios
// ---------------------------------------------------------------------------

export function listarServicios({ incluirArchivados = false } = {}) {
  return db.servicio.findMany({
    where: incluirArchivados ? undefined : { archivadoEn: null },
    include: { horarios: { orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }] } },
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
  });
}

export function obtenerServicio(id: string) {
  return db.servicio.findUnique({
    where: { id },
    include: { horarios: { orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }] } },
  });
}

/** Servicio reservable desde la web (activo y no archivado). */
export function obtenerServicioReservable(slug: string) {
  return db.servicio.findFirst({ where: { slug, activo: true, archivadoEn: null }, include: { horarios: true } });
}

/** Pausar un servicio lo saca del turnero público sin perder su configuración. */
export function cambiarEstadoServicio(id: string, activo: boolean) {
  return db.servicio.update({ where: { id }, data: { activo } });
}

export async function crearServicio(input: ServicioInput) {
  const { horarios, ...datos } = servicioSchema.parse(input);
  // Si no se indica un orden, el servicio nuevo va al final del listado.
  const { _max } = await db.servicio.aggregate({ _max: { orden: true } });
  return db.servicio.create({
    data: { ...datos, orden: input.orden ?? (_max.orden ?? 0) + 1, horarios: { create: horarios } },
    include: { horarios: true },
  });
}

/** Reemplaza la configuración completa del servicio (datos + franjas horarias). */
export async function actualizarServicio(id: string, input: ServicioInput) {
  const { horarios, ...datos } = servicioSchema.parse(input);
  return db.servicio.update({
    where: { id },
    data: { ...datos, horarios: { deleteMany: {}, create: horarios } },
    include: { horarios: true },
  });
}

/**
 * Si el servicio nunca tuvo turnos se elimina; si tiene historial se archiva
 * (deja de ofrecerse pero los turnos pasados siguen consultables).
 */
export async function eliminarServicio(id: string) {
  const turnos = await db.turno.count({ where: { servicioId: id } });
  if (turnos === 0) {
    await db.servicio.delete({ where: { id } });
    return { resultado: "eliminado" as const };
  }
  await db.servicio.update({ where: { id }, data: { activo: false, archivadoEn: new Date() } });
  return { resultado: "archivado" as const };
}

// ---------------------------------------------------------------------------
//  Agenda
// ---------------------------------------------------------------------------

export async function disponibilidadDelDia(cliente: Cliente, servicioId: string, fecha: string) {
  const servicio = await cliente.servicio.findUnique({
    where: { id: servicioId },
    include: { horarios: true },
  });
  if (!servicio || !servicio.activo) return [];

  const desde = instanteLocal(fecha, 0);
  const hasta = sumarMinutos(desde, 24 * 60);
  const enElDia = { inicio: { lt: hasta }, fin: { gt: desde } };

  // Consultas en secuencia: dentro de una transacción comparten una sola conexión.
  const turnos = await cliente.turno.findMany({
    where: {
      servicioId,
      estado: { notIn: ["CANCELADO", "AUSENTE"] },
      // Un turno esperando el pago que ya venció no ocupa el horario, aunque el barrido todavía no lo haya cancelado.
      NOT: { estado: "ESPERANDO_PAGO", venceEn: { lte: new Date() } },
      ...enElDia,
    },
    select: { inicio: true, fin: true },
  });
  const bloqueos = await cliente.bloqueoAgenda.findMany({
    where: { OR: [{ servicioId }, { servicioId: null }], ...enElDia },
    select: { inicio: true, fin: true },
  });

  return calcularDisponibilidad({ fecha, servicio, turnos, bloqueos });
}

/** Turnos libres de un servicio para un día local "YYYY-MM-DD". */
export function obtenerDisponibilidad(servicioId: string, fecha: string) {
  return disponibilidadDelDia(db, servicioId, fecha);
}

/**
 * Reserva un turno. Un lock de Postgres por servicio serializa las reservas
 * concurrentes, y la disponibilidad se recalcula dentro de la transacción: dos
 * clientes que eligen el mismo horario a la vez no pueden superar la capacidad.
 *
 * Si el servicio tiene precio, el turno nace `ESPERANDO_PAGO` (se retiene `MINUTOS_RETENCION` minutos)
 * con un `Pago` pendiente por la seña. Con `omitirSena` (carga hecha por el personal) o sin precio,
 * nace `PENDIENTE` como siempre.
 */
export async function reservarTurno(
  input: ReservaInput,
  { omitirSena = false, aceptoCondiciones = false }: { omitirSena?: boolean; aceptoCondiciones?: boolean } = {},
) {
  const r = reservaSchema.parse(input);

  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${r.servicioId}))`;

    const libres = await disponibilidadDelDia(tx, r.servicioId, fechaLocal(r.inicio));
    const elegido = libres.find((t) => t.inicio.getTime() === r.inicio.getTime());
    if (!elegido) throw new TurnoNoDisponibleError();

    const servicio = await tx.servicio.findUniqueOrThrow({ where: { id: r.servicioId } });
    const sena = omitirSena ? null : calcularSena(servicio.precioBase);
    if (sena !== null && !aceptoCondiciones) throw new CondicionesNoAceptadasError();

    const cliente =
      (await tx.cliente.findFirst({ where: { telefono: r.cliente.telefono } })) ??
      (await tx.cliente.create({ data: r.cliente }));

    const ahora = new Date();
    const turno = await tx.turno.create({
      data: {
        servicioId: r.servicioId,
        clienteId: cliente.id,
        inicio: elegido.inicio,
        fin: elegido.fin,
        estado: sena === null ? "PENDIENTE" : "ESPERANDO_PAGO",
        venceEn: sena === null ? null : sumarMinutos(ahora, MINUTOS_RETENCION),
        precio: servicio.precioBase,
        vehiculo: r.vehiculo,
        patente: r.patente,
        cristalId: r.cristalId,
        notas: r.notas,
        pagos: sena === null ? undefined : { create: { monto: sena, aceptoCondicionesEn: ahora } },
      },
      include: { servicio: true, cliente: true, pagos: { select: { id: true } } },
    });
    return { turno, pagoId: turno.pagos[0]?.id ?? null };
  });
}
