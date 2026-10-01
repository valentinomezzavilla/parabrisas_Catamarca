import type { EstadoTurno } from "@/generated/prisma/client";

// Qué le mostramos al cliente en /reservar/confirmado. Pura: se prueba sola.

export interface EntradaVista {
  turnoEstado: EstadoTurno;
  venceEn: Date | null;
  pago: { requiereDevolucion: boolean; devuelto: boolean } | null;
  ahora: Date;
}

export type Vista =
  | { tipo: "esperando"; pagoDeMas: false }
  | { tipo: "confirmado"; pagoDeMas: boolean }
  | { tipo: "reservado" }
  | { tipo: "no_completado" }
  | { tipo: "sin_turno"; devuelto: boolean };

const CONFIRMADOS: EstadoTurno[] = ["CONFIRMADO", "EN_CURSO", "COMPLETADO"];

export function vistaConfirmacion({ turnoEstado, venceEn, pago, ahora }: EntradaVista): Vista {
  if (turnoEstado === "ESPERANDO_PAGO") {
    // Vencido y todavía sin barrer: el cliente no tiene turno, aunque la base aún diga "esperando".
    return venceEn && venceEn > ahora ? { tipo: "esperando", pagoDeMas: false } : { tipo: "no_completado" };
  }
  // Un turno confirmado gana: un pago duplicado a devolver no le quita el turno al cliente.
  if (CONFIRMADOS.includes(turnoEstado)) return { tipo: "confirmado", pagoDeMas: !!pago?.requiereDevolucion };
  if (turnoEstado === "CANCELADO") {
    return pago?.requiereDevolucion ? { tipo: "sin_turno", devuelto: pago.devuelto } : { tipo: "no_completado" };
  }
  return { tipo: "reservado" };
}
