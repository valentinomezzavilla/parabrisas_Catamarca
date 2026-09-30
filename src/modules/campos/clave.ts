// Puro.

/** Para comparar etiquetas: sin mayúsculas, sin tildes y con espacios normalizados. */
export const normalizarTexto = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

/** "Año de fabricación" → "ano_de_fabricacion". Máximo 40 caracteres. */
export function generarClave(etiqueta: string): string {
  const base = normalizarTexto(etiqueta)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40)
    .replace(/_+$/g, "");
  return base || "campo";
}

/** Clave a partir de la etiqueta que no choque con `existentes` (se agrega `_2`, `_3`…). */
export function claveUnica(etiqueta: string, existentes: Iterable<string>): string {
  const usadas = new Set(existentes);
  const base = generarClave(etiqueta);
  if (!usadas.has(base)) return base;
  let n = 2;
  while (usadas.has(`${base}_${n}`)) n++;
  return `${base}_${n}`;
}
