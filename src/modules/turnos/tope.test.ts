import { describe, expect, it } from "vitest";
import { claveBusqueda, superaTope, TOPE_BUSQUEDAS_POR_MINUTO } from "./tope";

describe("claveBusqueda", () => {
  it("es la misma durante todo un minuto y cambia al siguiente", () => {
    const a = claveBusqueda(new Date("2026-10-01T15:00:01Z"));
    expect(claveBusqueda(new Date("2026-10-01T15:00:59Z"))).toBe(a);
    expect(claveBusqueda(new Date("2026-10-01T15:01:00Z"))).not.toBe(a);
    expect(a).toBe("busqueda:2026-10-01T15:00");
  });
});

describe("superaTope", () => {
  it("permite hasta el tope y corta al pasarse", () => {
    expect(TOPE_BUSQUEDAS_POR_MINUTO).toBe(20);
    expect(superaTope(20)).toBe(false);
    expect(superaTope(21)).toBe(true);
  });
});
