// Lo usa `src/proxy.ts`: sin dependencias de servidor.

const PUBLICAS = ["/login", "/reservar"];

/** `/login` y `/reservar` (con sus subrutas) no requieren sesión. */
export function esRutaPublica(ruta: string): boolean {
  return PUBLICAS.some((base) => ruta === base || ruta.startsWith(`${base}/`));
}
