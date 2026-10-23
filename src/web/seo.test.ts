import { describe, expect, it } from "vitest";
import { jsonLdNegocio, robotsTxt, sitemapXml, urlBase } from "./seo";

describe("urlBase", () => {
  it("saca la barra final y tolera que falte", () => {
    expect(urlBase({ APP_URL: "https://turnos.ejemplo.com.ar/" })).toBe("https://turnos.ejemplo.com.ar");
    expect(urlBase({})).toBe("");
  });
});

describe("robotsTxt", () => {
  it("cierra el panel y los pasos internos, y apunta al sitemap", () => {
    const robots = robotsTxt("https://turnos.ejemplo.com.ar");
    for (const ruta of ["/login", "/turnos", "/stock", "/administracion", "/api/", "/reservar/"]) {
      expect(robots).toContain(`Disallow: ${ruta}\n`);
    }
    expect(robots).not.toMatch(/Disallow: \/reservar\n/);
    expect(robots).toContain("Sitemap: https://turnos.ejemplo.com.ar/sitemap.xml");
  });

  it("sin dominio configurado omite el sitemap", () => {
    expect(robotsTxt("")).not.toContain("Sitemap");
  });
});

describe("sitemapXml", () => {
  it("lista la página pública de reservas con URL absoluta", () => {
    expect(sitemapXml("https://turnos.ejemplo.com.ar")).toContain("<loc>https://turnos.ejemplo.com.ar/reservar</loc>");
  });
});

describe("jsonLdNegocio", () => {
  it("con todo cargado incluye teléfono y dirección", () => {
    const datos = JSON.parse(
      jsonLdNegocio({
        APP_URL: "https://turnos.ejemplo.com.ar",
        WHATSAPP_LOCAL: "5493834123456",
        NEGOCIO_DIRECCION: "Av. Belgrano 123",
        NEGOCIO_LOCALIDAD: "San Fernando del Valle de Catamarca",
      }),
    );
    expect(datos["@type"]).toBe("AutoRepair");
    expect(datos.url).toBe("https://turnos.ejemplo.com.ar/reservar");
    expect(datos.telephone).toBe("+5493834123456");
    expect(datos.address).toMatchObject({
      streetAddress: "Av. Belgrano 123",
      addressLocality: "San Fernando del Valle de Catamarca",
      addressCountry: "AR",
    });
  });

  it("omite teléfono y dirección si no están configurados", () => {
    const datos = JSON.parse(jsonLdNegocio({ APP_URL: "https://turnos.ejemplo.com.ar" }));
    expect(datos).not.toHaveProperty("telephone");
    expect(datos).not.toHaveProperty("address");
  });

  it("no deja cerrar el <script> desde un valor", () => {
    expect(jsonLdNegocio({ NEGOCIO_DIRECCION: "</script><b>" })).not.toContain("<");
  });
});
