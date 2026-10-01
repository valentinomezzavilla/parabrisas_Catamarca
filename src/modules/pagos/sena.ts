// Reglas puras de la seña. Sin base de datos: se prueban solas.

/** Parte del precio base que se cobra como seña. */
export const PORCENTAJE_SENA = 0.5;
/** Minutos que se retiene el horario mientras el cliente paga. */
export const MINUTOS_RETENCION = 8;

/** Seña en pesos enteros, o `null` si el servicio no tiene un precio con el que calcularla. */
export function calcularSena(precioBase: { toString(): string } | number | null | undefined): number | null {
  if (precioBase === null || precioBase === undefined) return null;
  const precio = Number(precioBase.toString());
  if (!Number.isFinite(precio) || precio <= 0) return null;
  const sena = Math.round(precio * PORCENTAJE_SENA);
  return sena > 0 ? sena : null;
}
