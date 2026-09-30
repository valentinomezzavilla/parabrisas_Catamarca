// Apoyo de `guardia-acciones.test.ts`. Nada de la app importa este archivo.

/** `export async function nombre(...) {`: las únicas Server Actions que el test sabe auditar. */
export const FUNCION_EXPORTADA = /export async function (\w+)\s*\([\s\S]*?\)\s*(?::\s*[^{]+)?\{/g;

/**
 * Líneas de `export` que NO son `export async function` (arrow functions, const, default, funciones
 * síncronas, listas `export { ... }`). Un `export const accion = async () => {}` es una Server Action
 * válida que `FUNCION_EXPORTADA` no ve, así que el test no la auditaría: hay que prohibirlas.
 * Los tipos (`export type`, `export interface`) quedan afuera: no existen en tiempo de ejecución.
 */
export function exportsQueNoSonFuncionesAsync(codigo: string): string[] {
  return [...codigo.matchAll(/^export\s+(?!async function\b|type\b|interface\b).*$/gm)].map((m) => m[0].trim());
}
