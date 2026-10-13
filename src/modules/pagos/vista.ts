import type { EstadoPago, EstadoTurno } from "@/generated/prisma/client";

// Qué le mostramos al cliente en /reservar/confirmado. Pura: se prueba sola.

export interface EntradaVista {
  turnoEstado: EstadoTurno;
  venceEn: Date | null;
  pago: { estado: EstadoPago; requiereDevolucion: boolean; devuelto: boolean } | null;
  ahora: Date;
}

export type Vista =
  | { tipo: "esperando"; pagoDeMas: false }
  | { tipo: "esperando_transferencia" }
  | { tipo: "confirmado"; pagoDeMas: boolean }
  | { tipo: "reservado" }
  | { tipo: "rechazado" }
  | { tipo: "no_completado" }
  | { tipo: "sin_turno"; devuelto: boolean };

const CONFIRMADOS: EstadoTurno[] = ["CONFIRMADO", "EN_CURSO", "COMPLETADO"];

export function vistaConfirmacion({ turnoEstado, venceEn, pago, ahora }: EntradaVista): Vista {
  if (turnoEstado === "ESPERANDO_PAGO") {
    // Por transferencia no hay vencimiento: el horario queda tomado hasta que el local revise la seña.
    if (!venceEn) return { tipo: "esperando_transferencia" };
    // Mercado Pago, vencido y todavía sin barrer: el cliente no tiene turno, aunque la base aún diga "esperando".
    return venceEn > ahora ? { tipo: "esperando", pagoDeMas: false } : { tipo: "no_completado" };
  }
  // Un turno confirmado gana: un pago duplicado a devolver no le quita el turno al cliente.
  if (CONFIRMADOS.includes(turnoEstado)) return { tipo: "confirmado", pagoDeMas: !!pago?.requiereDevolucion };
  if (turnoEstado === "CANCELADO") {
    if (pago?.requiereDevolucion) return { tipo: "sin_turno", devuelto: pago.devuelto };
    // El local revisó la seña y rechazó la reserva.
    return pago?.estado === "RECHAZADO" ? { tipo: "rechazado" } : { tipo: "no_completado" };
  }
  return { tipo: "reservado" };
}
