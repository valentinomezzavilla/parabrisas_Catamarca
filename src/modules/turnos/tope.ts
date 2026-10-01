// Puro. Tope de búsquedas del portal: se cuentan por minuto en todo el sitio, y solo las que NO encuentran
// una reserva. Así quien busca bien no gasta el tope y el que prueba datos al azar (casi todo "ninguna") sí.

export const TOPE_BUSQUEDAS_FALLIDAS_POR_MINUTO = 30;

/** Clave del contador del minuto de `ahora` (en UTC, "busqueda:2026-10-01T15:00"). */
export const claveBusqueda = (ahora: Date): string => `busqueda:${ahora.toISOString().slice(0, 16)}`;

export const alcanzoTope = (conteo: number): boolean => conteo >= TOPE_BUSQUEDAS_FALLIDAS_POR_MINUTO;
