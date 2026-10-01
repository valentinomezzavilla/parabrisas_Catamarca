// Puro. Tope de búsquedas del portal: se cuentan por minuto en todo el sitio.

export const TOPE_BUSQUEDAS_POR_MINUTO = 20;

/** Clave del contador del minuto de `ahora` (en UTC, "busqueda:2026-10-01T15:00"). */
export const claveBusqueda = (ahora: Date): string => `busqueda:${ahora.toISOString().slice(0, 16)}`;

export const superaTope = (conteo: number): boolean => conteo > TOPE_BUSQUEDAS_POR_MINUTO;
