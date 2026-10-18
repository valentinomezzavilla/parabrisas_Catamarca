import { describe, expect, it } from "vitest";
import { estadoVisible, estaVigente, mensajeCumple, textoOferta } from "./beneficio";

describe("estadoVisible", () => {
  it("vigente sin vencimiento o con la fecha por delante", () => {
    expect(estadoVisible({ estado: "VIGENTE", vigenteHasta: null }, "2026-10-18")).toBe("VIGENTE");
    expect(estadoVisible({ estado: "VIGENTE", vigenteHasta: "2026-10-18" }, "2026-10-18")).toBe("VIGENTE");
  });

  it("vigente con la fecha pasada es VENCIDO", () => {
    expect(estadoVisible({ estado: "VIGENTE", vigenteHasta: "2026-10-17" }, "2026-10-18")).toBe("VENCIDO");
  });

  it("usado y anulado no cambian aunque pase la fecha", () => {
    expect(estadoVisible({ estado: "USADO", vigenteHasta: "2020-01-01" }, "2026-10-18")).toBe("USADO");
    expect(estadoVisible({ estado: "ANULADO", vigenteHasta: null }, "2026-10-18")).toBe("ANULADO");
  });

  it("solo se ofrece lo vigente", () => {
    expect(estaVigente({ estado: "VIGENTE", vigenteHasta: null }, "2026-10-18")).toBe(true);
    expect(estaVigente({ estado: "VIGENTE", vigenteHasta: "2026-10-01" }, "2026-10-18")).toBe(false);
    expect(estaVigente({ estado: "USADO", vigenteHasta: null }, "2026-10-18")).toBe(false);
  });
});

describe("textoOferta", () => {
  it("porcentaje, monto y otro", () => {
    expect(textoOferta({ titulo: "Polarizado", tipo: "PORCENTAJE", valor: "10.00" })).toBe("Polarizado (10% de descuento)");
    expect(textoOferta({ titulo: "Lavado", tipo: "MONTO", valor: 5000 })).toMatch(/^Lavado \(\$\s?5\.000 de descuento\)$/);
    expect(textoOferta({ titulo: "Lavado gratis", tipo: "OTRO", valor: null })).toBe("Lavado gratis");
  });

  it("sin valor cargado queda solo el título", () => {
    expect(textoOferta({ titulo: "Descuento especial", tipo: "PORCENTAJE", valor: null })).toBe("Descuento especial");
  });
});

describe("mensajeCumple", () => {
  it("saluda por el primer nombre", () => {
    expect(mensajeCumple("María José Pérez", null)).toBe(
      "¡Feliz cumpleaños, María! 🎂 De parte de todo el equipo de Parabrisas Catamarca te deseamos un día muy especial.",
    );
  });

  it("con beneficio, lo ofrece", () => {
    const m = mensajeCumple("Juan Gómez", "Polarizado (10% de descuento)");
    expect(m).toContain("Feliz cumpleaños, Juan");
    expect(m).toContain("queremos ofrecerte: Polarizado (10% de descuento). ¡Te esperamos!");
  });

  it("sin nombre, saluda igual", () => {
    expect(mensajeCumple("", null)).toMatch(/^¡Feliz cumpleaños! /);
  });
});
