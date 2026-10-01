import { describe, expect, it } from "vitest";
import { alcanzoTope, claveBusqueda, TOPE_BUSQUEDAS_FALLIDAS_POR_MINUTO } from "./tope";

describe("claveBusqueda", () => {
  it("es la misma durante todo un minuto y cambia al siguiente", () => {
    const a = claveBusqueda(new Date("2026-10-01T15:00:01Z"));
    expect(claveBusqueda(new Date("2026-10-01T15:00:59Z"))).toBe(a);
    expect(claveBusqueda(new Date("2026-10-01T15:01:00Z"))).not.toBe(a);
    expect(a).toBe("busqueda:2026-10-01T15:00");
  });
});

describe("alcanzoTope", () => {
  it("corta al llegar al tope de búsquedas sin resultado por minuto", () => {
    expect(TOPE_BUSQUEDAS_FALLIDAS_POR_MINUTO).toBe(30);
    expect(alcanzoTope(0)).toBe(false);
    expect(alcanzoTope(29)).toBe(false);
    expect(alcanzoTope(30)).toBe(true);
    expect(alcanzoTope(31)).toBe(true);
  });
});
