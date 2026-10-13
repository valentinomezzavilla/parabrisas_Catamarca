import { describe, expect, it } from "vitest";
import { calcularSena, medioSena, MINUTOS_RETENCION, PORCENTAJE_SENA } from "./sena";

describe("calcularSena", () => {
  it("es el 10 % del precio base", () => {
    expect(PORCENTAJE_SENA).toBe(0.1);
    expect(calcularSena(20000)).toBe(2000);
  });

  it("acepta el Decimal de Prisma (algo con toString)", () => {
    expect(calcularSena({ toString: () => "15000.00" })).toBe(1500);
  });

  it("redondea a pesos enteros, las mitades hacia arriba", () => {
    expect(calcularSena(10005)).toBe(1001);
    expect(calcularSena(10004)).toBe(1000);
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
    expect(calcularSena(4)).toBeNull();
  });
});

describe("medioSena", () => {
  it("por defecto la seña se paga por transferencia", () => {
    expect(medioSena({})).toBe("transferencia");
    expect(medioSena({ MERCADOPAGO_ACTIVO: "false" })).toBe("transferencia");
  });

  it("Mercado Pago se activa solo con MERCADOPAGO_ACTIVO=true", () => {
    expect(medioSena({ MERCADOPAGO_ACTIVO: "true" })).toBe("mercadopago");
  });
});

describe("MINUTOS_RETENCION", () => {
  it("con Mercado Pago el horario se retiene 8 minutos", () => {
    expect(MINUTOS_RETENCION).toBe(8);
  });
});
