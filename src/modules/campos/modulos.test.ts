import { describe, expect, it } from "vitest";
import { esModulo, MODULOS } from "./modulos";

describe("MODULOS", () => {
  it("Stock administra cristales y Servicios administra servicios", () => {
    expect(MODULOS.stock.entidad).toBe("CRISTAL");
    expect(MODULOS.servicios.entidad).toBe("SERVICIO");
  });

  it("cada módulo tiene su ruta base bajo /administracion", () => {
    expect(MODULOS.stock.base).toBe("/administracion/stock");
    expect(MODULOS.servicios.base).toBe("/administracion/servicios");
  });
});

describe("esModulo", () => {
  it("acepta los módulos que existen", () => {
    expect(esModulo("stock")).toBe(true);
    expect(esModulo("servicios")).toBe(true);
  });

  it("rechaza lo que no es un módulo, incluidas las propiedades heredadas de Object", () => {
    for (const valor of ["", "otro", "Stock", "__proto__", "constructor", "toString", "hasOwnProperty", undefined, null, 5, {}]) {
      expect(esModulo(valor), String(valor)).toBe(false);
    }
  });
});
