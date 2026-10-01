// Lo usa `src/proxy.ts`: sin dependencias de servidor.

const PUBLICAS = ["/login", "/reservar", "/api/mercadopago/webhook"];

/** Las Server Actions llegan como POST con el encabezado `next-action`. */
export function esServerAction(metodo: string, tieneEncabezadoAccion: boolean): boolean {
  return metodo === "POST" && tieneEncabezadoAccion;
}

/** `/login`, `/reservar` (con sus subrutas) y el webhook de Mercado Pago no requieren sesión. */
export function esRutaPublica(ruta: string): boolean {
  return PUBLICAS.some((base) => ruta === base || ruta.startsWith(`${base}/`));
}
