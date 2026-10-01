import { createHmac, timingSafeEqual } from "node:crypto";

interface Entrada {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  secreto: string;
}

/** Valida la cabecera `x-signature` de un aviso de Mercado Pago. Nunca lanza: ante la duda, devuelve false. */
export function firmaValida({ xSignature, xRequestId, dataId, secreto }: Entrada): boolean {
  if (!xSignature || !secreto) return false;

  let ts: string | undefined;
  let v1: string | undefined;
  for (const parte of xSignature.split(",")) {
    const [clave, valor] = parte.split("=").map((s) => s.trim());
    if (clave === "ts") ts = valor;
    if (clave === "v1") v1 = valor;
  }
  if (!ts || !v1 || !/^[0-9a-f]+$/i.test(v1)) return false;

  const mensaje =
    (dataId ? `id:${dataId.toLowerCase()};` : "") + (xRequestId ? `request-id:${xRequestId};` : "") + `ts:${ts};`;
  const esperada = createHmac("sha256", secreto).update(mensaje).digest();
  const recibida = Buffer.from(v1, "hex");
  return recibida.length === esperada.length && timingSafeEqual(recibida, esperada);
}
