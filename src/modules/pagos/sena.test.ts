import { describe, expect, it } from "vitest";
import { calcularSena, MINUTOS_RETENCION, PORCENTAJE_SENA } from "./sena";

describe("calcularSena", () => {
  it("es el 50 % del precio base", () => {
    expect(PORCENTAJE_SENA).toBe(0.5);
    expect(calcularSena(20000)).toBe(10000);
  });

  it("acepta el Decimal de Prisma (algo con toString)", () => {
    expect(calcularSena({ toString: () => "15000.00" })).toBe(7500);
  });

  it("redondea a pesos enteros, las mitades hacia arriba", () => {
    expect(calcularSena(10001)).toBe(5001);
    expect(calcularSena(10003)).toBe(5002);
  });

  it("sin precio no hay seña", () => {
    expect(calcularSena(null)).toBeNull();
    expect(calcularSena(undefined)).toBeNull();
  });

  it("un precio en cero, negativo o inválido tampoco cobra seña", () => {
    expect(calcularSena(0)).toBeNull();
    expect(calcularSena(-500)).toBeNull();
    expect(calcularSena({ toString: () => "abc" })).toBeNull();
  });

  it("un precio tan bajo que la seña redondea a cero no cobra seña", () => {
    expect(calcularSena(0.4)).toBeNull();
  });
});

describe("MINUTOS_RETENCION", () => {
  it("el horario se retiene 8 minutos", () => {
    expect(MINUTOS_RETENCION).toBe(8);
  });
});
