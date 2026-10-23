// Lo que ven los buscadores: robots.txt, sitemap.xml y los datos del negocio (JSON-LD).
// Solo la página pública de reservas se indexa; el panel y el login llevan `noindex` (ver `views/parciales/head.ejs`).

type Entorno = Record<string, string | undefined>;

/** Rutas privadas o sin valor para un buscador. `/reservar/` son los pasos internos (buscar, confirmación…). */
const RUTAS_PRIVADAS = ["/login", "/turnos", "/stock", "/ordenes", "/clientes", "/servicios", "/usuarios", "/administracion", "/api/", "/reservar/"];

/** URL pública de la app sin barra final (`APP_URL`), o "" si no está configurada. */
export function urlBase(env: Entorno = process.env): string {
  return (env.APP_URL ?? "").trim().replace(/\/+$/, "");
}

export function robotsTxt(base: string): string {
  const lineas = ["User-agent: *", ...RUTAS_PRIVADAS.map((ruta) => `Disallow: ${ruta}`)];
  if (base) lineas.push("", `Sitemap: ${base}/sitemap.xml`);
  return `${lineas.join("\n")}\n`;
}

export function sitemapXml(base: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/reservar</loc></url>
</urlset>
`;
}

/**
 * Datos estructurados del negocio para Google. La dirección y el teléfono salen de `NEGOCIO_DIRECCION`,
 * `NEGOCIO_LOCALIDAD` y `WHATSAPP_LOCAL`; los que no estén cargados se omiten.
 * Se devuelve como texto listo para `<script type="application/ld+json">`.
 */
export function jsonLdNegocio(env: Entorno = process.env): string {
  const base = urlBase(env);
  const telefono = env.WHATSAPP_LOCAL?.replace(/\D/g, "");
  const direccion = env.NEGOCIO_DIRECCION?.trim();

  const datos = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: "Parabrisas Catamarca",
    description: "Colocación de parabrisas y cristales para vehículos, polarizados y lavados, con turno online.",
    url: `${base}/reservar`,
    image: `${base}/brand/logo-amarillo.png`,
    areaServed: "Catamarca, Argentina",
    ...(telefono ? { telephone: `+${telefono}` } : {}),
    ...(direccion
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: direccion,
            addressLocality: env.NEGOCIO_LOCALIDAD?.trim() || "Catamarca",
            addressRegion: "Catamarca",
            addressCountry: "AR",
          },
        }
      : {}),
  };
  // `<` escapado: ningún valor puede cerrar el <script> en el que se imprime.
  return JSON.stringify(datos).replace(/</g, "\\u003c");
}
