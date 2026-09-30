type Numerico = number | { toString(): string } | null | undefined;

const aNumero = (v: Numerico) => (v === null || v === undefined ? null : Number(v));

/** $25.000 — o "—" si no hay precio. */
export function pesos(valor: Numerico): string {
  const n = aNumero(valor);
  return n === null ? "—" : n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

/** "1480 × 920 mm · 4.8 mm" */
export function medidas(ancho: number | null, alto: number | null, espesor: Numerico): string {
  const partes = [];
  if (ancho && alto) partes.push(`${ancho} × ${alto} mm`);
  const e = aNumero(espesor);
  if (e) partes.push(`${e} mm esp.`);
  return partes.join(" · ") || "—";
}

export const NOMBRE_LADO = { NO_APLICA: "", IZQUIERDO: "izquierdo", DERECHO: "derecho" } as const;
