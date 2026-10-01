import { describe, expect, it } from "vitest";
import { esRutaPublica, esServerAction } from "./rutas";

describe("esServerAction", () => {
  it("reconoce un POST con el encabezado next-action", () => {
    expect(esServerAction("POST", true)).toBe(true);
  });

  it("un GET, o un POST sin el encabezado, no es una Server Action", () => {
    expect(esServerAction("GET", true)).toBe(false);
    expect(esServerAction("GET", false)).toBe(false);
    expect(esServerAction("POST", false)).toBe(false);
    expect(esServerAction("PUT", true)).toBe(false);
  });
});

describe("esRutaPublica", () => {
  it("permite /login y /reservar con sus subrutas", () => {
    for (const ruta of ["/login", "/login/", "/reservar", "/reservar/", "/reservar/confirmado"]) {
      expect(esRutaPublica(ruta)).toBe(true);
    }
  });

  it("permite el webhook de Mercado Pago y nada más de /api", () => {
    expect(esRutaPublica("/api/mercadopago/webhook")).toBe(true);
    for (const ruta of ["/api", "/api/mercadopago", "/api/mercadopago/otra", "/api/mercadopago/webhook-x", "/x/api/mercadopago/webhook"]) {
      expect(esRutaPublica(ruta)).toBe(false);
    }
  });

  it("protege el panel", () => {
    for (const ruta of ["/", "/turnos", "/stock", "/stock/abc/editar", "/servicios", "/usuarios"]) {
      expect(esRutaPublica(ruta)).toBe(false);
    }
  });

  it("no se deja engañar por prefijos parecidos", () => {
    for (const ruta of ["/login-admin", "/loginx", "/reservarx", "/reservar-turnos", "/stock/login", "/x/reservar"]) {
      expect(esRutaPublica(ruta)).toBe(false);
    }
  });
});
