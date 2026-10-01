import type { EstadoTurno } from "@/generated/prisma/client";

// Puro. Reglas para editar un turno desde el panel.

/** No se editan los completados, cancelados ni ausentes (rompería el stock y el historial) ni los que esperan el pago. */
export const ESTADOS_EDITABLES: EstadoTurno[] = ["PENDIENTE", "CONFIRMADO", "EN_CURSO"];

export const puedeEditar = (estado: EstadoTurno): boolean => ESTADOS_EDITABLES.includes(estado);

/** Hay que revalidar la disponibilidad solo si cambia el servicio o el horario. */
export function cambiaAgenda(
  actual: { servicioId: string; inicio: Date },
  nuevo: { servicioId: string; inicio: Date },
): boolean {
  return actual.servicioId !== nuevo.servicioId || actual.inicio.getTime() !== nuevo.inicio.getTime();
}
