import { normalizarTexto } from "./clave";
import type { OpcionCampo } from "./tipos";

// Puro. Las operaciones devuelven una lista nueva; no modifican la recibida.

export type GeneradorId = () => string;
export const generarIdOpcion: GeneradorId = () => `o_${globalThis.crypto.randomUUID().slice(0, 8)}`;

/** Un renglón por opción; se recortan los espacios y se descartan los renglones vacíos. */
export function etiquetasDeTexto(texto: string): string[] {
  return texto
    .split(/\r?\n/)
    .map((e) => e.trim())
    .filter((e) => e !== "");
}

export function crearOpciones(etiquetas: string[], generarId: GeneradorId = generarIdOpcion): OpcionCampo[] {
  return etiquetas
    .map((e) => e.trim())
    .filter((e) => e !== "")
    .map((etiqueta) => ({ id: generarId(), etiqueta, activo: true }));
}

/** Motivo por el que la lista no es válida, o `null` si lo es. */
export function validarOpciones(opciones: OpcionCampo[]): string | null {
  if (opciones.some((o) => o.etiqueta.trim() === "")) return "Una opción no puede estar vacía.";
  const vistas = new Set<string>();
  for (const o of opciones) {
    const n = normalizarTexto(o.etiqueta);
    if (vistas.has(n)) return "Las opciones no pueden repetirse.";
    vistas.add(n);
  }
  if (!opciones.some((o) => o.activo)) return "Dejá al menos una opción activa.";
  return null;
}

export function agregarOpcion(
  opciones: OpcionCampo[],
  etiqueta: string,
  generarId: GeneradorId = generarIdOpcion,
): OpcionCampo[] {
  return [...opciones, { id: generarId(), etiqueta: etiqueta.trim(), activo: true }];
}

export const renombrarOpcion = (opciones: OpcionCampo[], id: string, etiqueta: string): OpcionCampo[] =>
  opciones.map((o) => (o.id === id ? { ...o, etiqueta: etiqueta.trim() } : o));

export const alternarOpcion = (opciones: OpcionCampo[], id: string, activo: boolean): OpcionCampo[] =>
  opciones.map((o) => (o.id === id ? { ...o, activo } : o));

export const quitarOpcion = (opciones: OpcionCampo[], id: string): OpcionCampo[] =>
  opciones.filter((o) => o.id !== id);
