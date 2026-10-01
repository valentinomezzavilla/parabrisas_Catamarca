import type { EstadoTurno } from "@/generated/prisma/client";

export const ESTADOS: Record<EstadoTurno, { etiqueta: string; tono: "neutro" | "marca" | "exito" | "alerta" | "peligro" }> = {
  ESPERANDO_PAGO: { etiqueta: "Esperando pago", tono: "alerta" },
  PENDIENTE: { etiqueta: "Pendiente", tono: "alerta" },
  CONFIRMADO: { etiqueta: "Confirmado", tono: "marca" },
  EN_CURSO: { etiqueta: "En curso", tono: "neutro" },
  COMPLETADO: { etiqueta: "Completado", tono: "exito" },
  CANCELADO: { etiqueta: "Cancelado", tono: "peligro" },
  AUSENTE: { etiqueta: "No vino", tono: "neutro" },
};
