import { db } from "@/lib/db";
import { fechaLocal, instanteLocal, sumarDias, sumarMinutos } from "@/lib/tiempo";
import type { EstadoTurno } from "@/generated/prisma/client";
import { registrarMovimiento } from "@/modules/inventario/cristal.service";

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
      pagos: { where: { estado: "APROBADO" }, select: { monto: true } },
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
  return db.turno.update({ where: { id }, data: { estado } });
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
