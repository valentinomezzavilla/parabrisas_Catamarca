import type { EstadoPago, EstadoTurno } from "@/generated/prisma/client";

// Regla pura que decide qué hacer con un pago que informa Mercado Pago. Sin base de datos: se prueba sola.

/** Lo que importa de un pago de Mercado Pago (ya consultado a su API, nunca tomado del aviso). */
export interface PagoMp {
  id: string;
  estado: string; // "approved" | "pending" | "in_process" | "rejected" | "cancelled" | "refunded" | ...
  monto: number;
  moneda: string;
  referencia: string | null; // external_reference = id de nuestro Pago
}

export interface ContextoDecision {
  montoEsperado: number;
  pagoEstado: EstadoPago;
  /** Este mismo pago de Mercado Pago ya se registró antes (aviso repetido). */
  yaAplicado: boolean;
  turnoEstado: EstadoTurno;
  venceEnPasado: boolean;
  /** El horario del turno sigue libre si se ignora este mismo turno. */
  horarioLibre: boolean;
}

export type MotivoDevolucion = "monto_distinto" | "horario_tomado" | "turno_cancelado" | "pago_duplicado";

export type Decision =
  | { accion: "ignorar" }
  | { accion: "confirmar" }
  | { accion: "rechazar" }
  | { accion: "devolver"; motivo: MotivoDevolucion };

const IGNORAR: Decision = { accion: "ignorar" };
const devolver = (motivo: MotivoDevolucion): Decision => ({ accion: "devolver", motivo });

export function decidirPago(mp: PagoMp, ctx: ContextoDecision): Decision {
  if (ctx.yaAplicado) return IGNORAR;

  if (mp.estado === "rejected" || mp.estado === "cancelled") {
    return ctx.pagoEstado === "PENDIENTE" ? { accion: "rechazar" } : IGNORAR;
  }
  if (mp.estado !== "approved") return IGNORAR;

  // Desde acá el pago está aprobado.
  if (ctx.pagoEstado === "APROBADO") return devolver("pago_duplicado");
  if (mp.moneda !== "ARS" || Math.abs(mp.monto - ctx.montoEsperado) > 0.005) return devolver("monto_distinto");

  if (ctx.turnoEstado === "ESPERANDO_PAGO" && !ctx.venceEnPasado) return { accion: "confirmar" };

  // Venció (aún figura esperando, o el barrido ya lo canceló y marcó el pago VENCIDO): confirma solo si el horario sigue libre.
  const vencido =
    (ctx.turnoEstado === "ESPERANDO_PAGO" && ctx.venceEnPasado) ||
    (ctx.turnoEstado === "CANCELADO" && ctx.pagoEstado === "VENCIDO");
  if (vencido) return ctx.horarioLibre ? { accion: "confirmar" } : devolver("horario_tomado");

  return devolver("turno_cancelado");
}
