import { describe, expect, it } from "vitest";
import { ALFABETO_CODIGO, esCodigoValido, generarCodigo, LARGO_CODIGO, normalizarCodigo } from "./codigo";

describe("generarCodigo", () => {
  it("genera 6 caracteres del alfabeto sin 0, O, 1 ni I", () => {
    for (let i = 0; i < 200; i++) {
      const c = generarCodigo();
      expect(c).toHaveLength(LARGO_CODIGO);
      for (const ch of c) expect(ALFABETO_CODIGO.includes(ch)).toBe(true);
    }
    expect(ALFABETO_CODIGO).not.toMatch(/[01OI]/);
  });

  it("usa el generador de azar que se le inyecta", () => {
    expect(generarCodigo(() => 0)).toBe("AAAAAA");
    expect(generarCodigo((max) => max - 1)).toBe(ALFABETO_CODIGO.at(-1)!.repeat(6));
  });
});

describe("normalizarCodigo y esCodigoValido", () => {
  it("ignora espacios y mayúsculas", () => {
    expect(normalizarCodigo("  k7q2 xa ")).toBe("K7Q2XA");
  });

  it("acepta los de 6 letras o números, también los hexadecimales de los turnos que ya existían", () => {
    expect(esCodigoValido("K7Q2XA")).toBe(true);
    expect(esCodigoValido("1A2B3C")).toBe(true);
  });

  it("rechaza largos distintos y caracteres raros", () => {
    for (const c of ["", "K7Q2X", "K7Q2XAB", "K7Q-XA", "k7q2xa", "ÑK7Q2X"]) expect(esCodigoValido(c), c).toBe(false);
  });
});
