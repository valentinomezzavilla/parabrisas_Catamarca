// Reglas puras de la seña. Sin base de datos: se prueban solas.

/** Parte del precio base que se cobra como seña. */
export const PORCENTAJE_SENA = 0.1;
/** Minutos que se retiene el horario mientras el cliente paga con Mercado Pago. */
export const MINUTOS_RETENCION = 8;

/**
 * Cómo paga el cliente la seña. Por defecto, transferencia: el turno queda reservado hasta que el personal lo
 * confirme o lo rechace. Mercado Pago (cobro en línea con vencimiento) se activa con `MERCADOPAGO_ACTIVO=true`.
 */
export type MedioSena = "transferencia" | "mercadopago";

export function medioSena(env: Record<string, string | undefined> = process.env): MedioSena {
  return env.MERCADOPAGO_ACTIVO === "true" ? "mercadopago" : "transferencia";
}

/** Seña en pesos enteros, o `null` si el servicio no tiene un precio con el que calcularla. */
export function calcularSena(precioBase: { toString(): string } | number | null | undefined): number | null {
  if (precioBase === null || precioBase === undefined) return null;
  const precio = Number(precioBase.toString());
  if (!Number.isFinite(precio) || precio <= 0) return null;
  const sena = Math.round(precio * PORCENTAJE_SENA);
  return sena > 0 ? sena : null;
}
