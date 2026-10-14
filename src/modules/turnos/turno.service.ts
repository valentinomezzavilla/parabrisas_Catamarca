import { db } from "@/lib/db";
import { fechaLocal, instanteLocal, sumarDias, sumarMinutos } from "@/lib/tiempo";
import type { EstadoTurno } from "@/generated/prisma/client";
import { registrarMovimiento } from "@/modules/inventario/cristal.service";
import { sincronizarOrdenConTurno } from "@/modules/ordenes/sincronizar";
import { cambiaAgenda, puedeEditar } from "./edicion";
import { editarTurnoSchema, type EditarTurnoInput } from "./schemas";
import { disponibilidadDelDia, TurnoNoDisponibleError } from "./servicio.service";

/** Rango UTC [desde, hasta) que cubre los días locales indicados. */
function rangoDias(fecha: string, dias = 1) {
  const desde = instanteLocal(fecha, 0);
  return { gte: desde, lt: sumarMinutos(desde, dias * 24 * 60) };
}

export function listarTurnosDelDia(fecha: string) {
  return db.turno.findMany({
    where: { inicio: rangoDias(fecha) },
    include: {
      servicio: { select: { nombre: true, color: true, requiereCristal: true } },
      cliente: true,
      cristal: { select: { id: true, codigo: true, descripcion: true, cantidad: true } },
      orden: { select: { id: true, numero: true } },
      // La seña cobrada, o la que el cliente todavía tiene que transferir.
      pagos: { where: { estado: { in: ["APROBADO", "PENDIENTE"] } }, select: { monto: true, estado: true } },
    },
    orderBy: [{ inicio: "asc" }, { creadoEn: "asc" }],
  });
}

/** Cantidad de turnos activos por día local, para la tira semanal de la agenda. */
export async function contarTurnosPorDia(desde: string, dias: number) {
  const turnos = await db.turno.findMany({
    where: {
      inicio: rangoDias(desde, dias),
      estado: { notIn: ["CANCELADO", "AUSENTE"] },
      NOT: { estado: "ESPERANDO_PAGO", venceEn: { lte: new Date() } },
    },
    select: { inicio: true },
  });
  const conteo = new Map<string, number>();
  for (let i = 0; i < dias; i++) conteo.set(sumarDias(desde, i), 0);
  for (const t of turnos) {
    const dia = fechaLocal(t.inicio);
    conteo.set(dia, (conteo.get(dia) ?? 0) + 1);
  }
  return conteo;
}

export function obtenerTurno(id: string) {
  return db.turno.findUnique({
    where: { id },
    include: { servicio: true, cliente: true, pagos: { orderBy: { creadoEn: "desc" }, take: 1 } },
  });
}

/**
 * Cambia el estado de un turno. Al completar un turno con cristal asignado se
 * registra el egreso de stock (una sola vez por turno). Si no hay stock, el
 * turno no se marca como completado y se propaga StockInsuficienteError.
 *
 * Un turno que espera la seña sale de ese estado cuando el personal la revisa: al confirmarlo la seña
 * pendiente queda aprobada, y al cancelarlo (rechazar la reserva) queda rechazada.
 *
 * Si el turno se dio desde una orden de trabajo, la orden se ajusta en la misma transacción.
 */
export async function cambiarEstadoTurno(id: string, estado: EstadoTurno) {
  const turno = await db.turno.findUniqueOrThrow({
    where: { id },
    include: { movimientos: { select: { id: true } } },
  });

  if (estado === "COMPLETADO" && turno.cristalId && turno.movimientos.length === 0) {
    await registrarMovimiento({
      cristalId: turno.cristalId,
      tipo: "EGRESO",
      cantidad: 1,
      motivo: "Colocación (turno completado)",
      turnoId: turno.id,
    });
  }

  const senaRevisada = turno.estado === "ESPERANDO_PAGO" && (estado === "CONFIRMADO" || estado === "CANCELADO");
  return db.$transaction(async (tx) => {
    if (senaRevisada) {
      await tx.pago.updateMany({
        where: { turnoId: id, estado: "PENDIENTE" },
        data: { estado: estado === "CONFIRMADO" ? "APROBADO" : "RECHAZADO" },
      });
    }
    const actualizado = await tx.turno.update({ where: { id }, data: { estado, ...(senaRevisada && { venceEn: null }) } });
    // Si el turno se dio desde una orden de trabajo, la orden acompaña: completado → instalada, cancelado → pedido.
    await sincronizarOrdenConTurno(tx, id, estado);
    return actualizado;
  });
}

/** Asigna (o quita, con null) el cristal a colocar en un turno. */
export function asignarCristal(turnoId: string, cristalId: string | null) {
  return db.turno.update({ where: { id: turnoId }, data: { cristalId } });
}

/** Cristales activos con stock, para elegir en los turnos de colocación. */
export function cristalesDisponibles() {
  return db.cristal.findMany({
    where: { activo: true, cantidad: { gt: 0 } },
    select: { id: true, codigo: true, descripcion: true, cantidad: true },
    orderBy: { descripcion: "asc" },
  });
}

export class TurnoNoEditableError extends Error {
  constructor() {
    super("Este turno ya no se puede editar");
    this.name = "TurnoNoEditableError";
  }
}

/** Turno con todo lo que necesita la pantalla de edición. */
export function obtenerTurnoParaEditar(id: string) {
  return db.turno.findUnique({
    where: { id },
    include: {
      servicio: true,
      cliente: true,
      cristal: { select: { id: true, codigo: true, descripcion: true } },
      pagos: { where: { estado: "APROBADO" }, select: { monto: true } },
    },
  });
}

/**
 * Edita un turno vigente. Si cambia el servicio o el horario, toma el bloqueo del servicio de destino (el mismo que
 * usan las reservas), recalcula la disponibilidad ignorando este turno y exige que el horario esté libre.
 * Nunca toca los pagos. Si cambia el teléfono, el turno pasa al cliente de ese teléfono (o a uno nuevo); si no,
 * nombre y mail se corrigen en la ficha del cliente actual.
 */
export async function editarTurno(id: string, input: EditarTurnoInput) {
  const r = editarTurnoSchema.parse(input);

  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${r.servicioId}))`;

    const actual = await tx.turno.findUniqueOrThrow({ where: { id }, include: { cliente: true } });
    if (!puedeEditar(actual.estado)) throw new TurnoNoEditableError();

    let { inicio, fin } = actual;
    if (cambiaAgenda(actual, r)) {
      const libres = await disponibilidadDelDia(tx, r.servicioId, fechaLocal(r.inicio), id);
      const elegido = libres.find((t) => t.inicio.getTime() === r.inicio.getTime());
      if (!elegido) throw new TurnoNoDisponibleError();
      ({ inicio, fin } = elegido);
    }

    let clienteId = actual.clienteId;
    if (r.cliente.telefono !== actual.cliente.telefono) {
      const existente = await tx.cliente.findFirst({ where: { telefono: r.cliente.telefono } });
      // Si el teléfono ya es de otra persona, se la deja como está: no se le pisa el nombre.
      clienteId = (existente ?? (await tx.cliente.create({ data: r.cliente }))).id;
    } else {
      await tx.cliente.update({ where: { id: actual.clienteId }, data: { nombre: r.cliente.nombre, email: r.cliente.email ?? null } });
    }

    return tx.turno.update({
      where: { id },
      data: {
        servicioId: r.servicioId,
        clienteId,
        inicio,
        fin,
        vehiculo: r.vehiculo ?? null,
        patente: r.patente ?? null,
        cristalId: r.cristalId ?? null,
        precio: r.precio ?? null,
        notas: r.notas ?? null,
      },
    });
  });
}
