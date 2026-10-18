// Puro. Cómo se ordenan y agrupan los clientes en la lista.

const sinTildes = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Para buscar: "ÁLVARO" y "alvaro" son lo mismo. */
export const coincideNombre = (nombre: string, busqueda: string) => sinTildes(nombre).includes(sinTildes(busqueda));

export const GRUPO_SIN_NOMBRE = "Sin nombre";
export const GRUPO_OTROS = "#";

/** Los que vienen de la importación de Notion, a los que todavía no se les completó el nombre. */
export const esSinNombre = (nombre: string) => sinTildes(nombre) === "" || sinTildes(nombre) === "sin nombre";

/** "Álvaro" → "A", "ñandú" → "Ñ", "3M" → "#". */
export function inicialDe(nombre: string): string {
  const primera = nombre.trim().charAt(0).toLocaleUpperCase("es");
  if (primera === "Ñ") return "Ñ";
  const base = primera.normalize("NFD").charAt(0);
  return /^[A-Z]$/.test(base) ? base : GRUPO_OTROS;
}

/** Orden alfabético en español: sin distinguir mayúsculas ni tildes, y la Ñ después de la N. */
export const compararNombres = (a: string, b: string) => a.localeCompare(b, "es", { sensitivity: "base" });

export interface GrupoAlfabetico<T> {
  letra: string;
  clientes: T[];
}

/**
 * Los clientes de la A a la Z, agrupados por inicial. Los nombres que no empiezan con una letra van en "#" y los
 * "Sin nombre" al final en su propio grupo, para que no tapen al resto.
 */
export function agruparAlfabetico<T extends { nombre: string }>(clientes: T[]): GrupoAlfabetico<T>[] {
  const grupos = new Map<string, T[]>();
  const poner = (letra: string, c: T) => grupos.set(letra, [...(grupos.get(letra) ?? []), c]);
  for (const c of [...clientes].sort((a, b) => compararNombres(a.nombre, b.nombre))) {
    poner(esSinNombre(c.nombre) ? GRUPO_SIN_NOMBRE : inicialDe(c.nombre), c);
  }
  const rango = (letra: string) => (letra === GRUPO_SIN_NOMBRE ? 2 : letra === GRUPO_OTROS ? 1 : 0);
  return [...grupos]
    .sort(([a], [b]) => rango(a) - rango(b) || compararNombres(a, b))
    .map(([letra, lista]) => ({ letra, clientes: lista }));
}

/** El primer nombre, para saludar: "María José Pérez" → "María". */
export const primerNombre = (nombre: string) => nombre.trim().split(/\s+/)[0] ?? "";
