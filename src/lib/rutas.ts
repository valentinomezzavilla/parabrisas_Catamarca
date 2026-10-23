// Lo usa `src/web/sesion.ts` para decidir qué rutas pasan sin sesión. Sin dependencias de servidor.

const PUBLICAS = ["/login", "/reservar", "/robots.txt", "/sitemap.xml", "/api/mercadopago/webhook"];

/** `/login`, `/reservar` (con sus subrutas), `robots.txt`, `sitemap.xml` y el webhook de Mercado Pago no requieren sesión. */
export function esRutaPublica(ruta: string): boolean {
  return PUBLICAS.some((base) => ruta === base || ruta.startsWith(`${base}/`));
}
