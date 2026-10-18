import { diasEntre } from "@/modules/ordenes/estados";

// Puro. Cuándo cae el cumpleaños de un cliente y quiénes cumplen en los próximos días. Las fechas son "YYYY-MM-DD".

const esBisiesto = (anio: number) => (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;

/** El día en que se festeja el cumpleaños de `nacimiento` durante `anio`: el 29/02 se festeja el 28/02 si no es bisiesto. */
export function fechaDeCumple(nacimiento: string, anio: number): string {
  const [, mes, dia] = nacimiento.split("-");
  const festejo = mes === "02" && dia === "29" && !esBisiesto(anio) ? "28" : dia;
  return `${String(anio).padStart(4, "0")}-${mes}-${festejo}`;
}

export interface Cumple {
  /** Día en que se festeja (hoy o dentro de `diasFaltan` días). */
  fecha: string;
  diasFaltan: number;
  /** Los años que cumple. */
  edad: number;
}

/** El próximo cumpleaños desde `hoy` (inclusive), o `null` si ya pasó el plazo de `dias` días. */
export function cumpleEnVentana(nacimiento: string, hoy: string, dias = 7): Cumple | null {
  const anioHoy = Number(hoy.slice(0, 4));
  // También se mira el año siguiente: el 28 de diciembre ya hay que avisar de un cumpleaños del 2 de enero.
  for (const anio of [anioHoy, anioHoy + 1]) {
    const fecha = fechaDeCumple(nacimiento, anio);
    const diasFaltan = diasEntre(hoy, fecha);
    if (diasFaltan >= 0 && diasFaltan <= dias) {
      const edad = anio - Number(nacimiento.slice(0, 4));
      return edad >= 1 ? { fecha, diasFaltan, edad } : null;
    }
  }
  return null;
}

/** Quiénes cumplen hoy o en los próximos `dias` días, los más cercanos primero y, a igual fecha, por nombre. */
export function cumpleanosProximos<T extends { nombre: string; fechaNacimiento: string }>(
  clientes: T[],
  hoy: string,
  dias = 7,
): (T & Cumple)[] {
  return clientes
    .flatMap((c) => {
      const cumple = cumpleEnVentana(c.fechaNacimiento, hoy, dias);
      return cumple ? [{ ...c, ...cumple }] : [];
    })
    .sort((a, b) => a.diasFaltan - b.diasFaltan || a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));
}

/** Los años de una persona nacida en `nacimiento` a la fecha `hoy`. */
export function edadEn(nacimiento: string, hoy: string): number {
  const cumpleEsteAnio = fechaDeCumple(nacimiento, Number(hoy.slice(0, 4)));
  return Number(hoy.slice(0, 4)) - Number(nacimiento.slice(0, 4)) - (hoy < cumpleEsteAnio ? 1 : 0);
}
