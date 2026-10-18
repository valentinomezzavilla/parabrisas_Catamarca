import type { EstadoOrden, EstadoTurno, TipoOrden } from "@/generated/prisma/client";

// Puro. Une los turnos y las órdenes de un cliente en una sola línea de tiempo.

export interface TurnoDeHistorial {
  id: string;
  inicio: Date;
  estado: EstadoTurno;
  servicio: string;
  codigo: string;
  vehiculo: string | null;
  patente: string | null;
  /** Si el turno se dio desde una orden de trabajo, esa orden ya lo cuenta: el turno no se repite. */
  ordenId: string | null;
}

export interface OrdenDeHistorial {
  id: string;
  numero: number;
  tipo: TipoOrden;
  estado: EstadoOrden;
  recibidaEl: Date;
  vehiculo: string | null;
  patente: string | null;
  aseguradora: string | null;
  /** Total, cobrado (con la seña abonada) y saldo; solo el Admin lo ve. */
  cuenta: { total: number | null; cobrado: number; saldo: number | null };
  turno: { inicio: Date; estado: EstadoTurno } | null;
}

export type ItemHistorial =
  | { tipo: "TURNO"; fecha: Date; turno: TurnoDeHistorial }
  | { tipo: "ORDEN"; fecha: Date; orden: OrdenDeHistorial };

/** Lo más reciente primero. Los turnos que pertenecen a una orden no se listan aparte. */
export function armarHistorial(turnos: TurnoDeHistorial[], ordenes: OrdenDeHistorial[]): ItemHistorial[] {
  const items: ItemHistorial[] = [
    ...turnos.filter((t) => t.ordenId === null).map((turno) => ({ tipo: "TURNO" as const, fecha: turno.inicio, turno })),
    ...ordenes.map((orden) => ({ tipo: "ORDEN" as const, fecha: orden.recibidaEl, orden })),
  ];
  return items.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}
