import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

/**
 * Devuelve la URL de un archivo de `public/` con su huella (`/css/app.css?v=3f2a91c0b4`). La huella cambia cuando
 * cambia el contenido: después de publicar, el navegador baja el archivo nuevo en lugar de seguir usando la copia
 * de su caché (los estáticos se cachean un día en producción).
 *
 * Con `recordar`, cada huella se calcula una sola vez (en producción los archivos no cambian mientras corre);
 * sin él se recalcula en cada página, porque en desarrollo Tailwind regenera el CSS sin reiniciar el servidor.
 */
export function crearUrlRecurso(carpetaPublica: string, recordar: boolean) {
  const huellas = new Map<string, string>();
  return (ruta: string): string => {
    let huella = recordar ? huellas.get(ruta) : undefined;
    if (huella === undefined) {
      try {
        huella = createHash("sha256").update(readFileSync(`${carpetaPublica}${ruta}`)).digest("hex").slice(0, 10);
      } catch {
        huella = "";
      }
      if (recordar) huellas.set(ruta, huella);
    }
    return huella ? `${ruta}?v=${huella}` : ruta;
  };
}
