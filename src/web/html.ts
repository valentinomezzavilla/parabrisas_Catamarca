// Armado seguro de HTML para los helpers de las vistas. Todo valor que viene de datos se escapa.

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function esc(valor: unknown): string {
  return String(valor ?? "").replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

export type ValorAtributo = string | number | boolean | null | undefined;

/** `{ id: "x", disabled: true, min: 0, placeholder: undefined }` → ` id="x" disabled min="0"`. */
export function attrs(atributos: Record<string, ValorAtributo>): string {
  let salida = "";
  for (const [nombre, valor] of Object.entries(atributos)) {
    if (valor === undefined || valor === null || valor === false) continue;
    if (!/^[a-zA-Z_:][-a-zA-Z0-9_:.]*$/.test(nombre)) throw new Error(`Atributo inválido: ${nombre}`);
    salida += valor === true ? ` ${nombre}` : ` ${nombre}="${esc(valor)}"`;
  }
  return salida;
}
