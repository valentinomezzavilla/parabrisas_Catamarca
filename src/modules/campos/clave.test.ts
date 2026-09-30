import { describe, expect, it } from "vitest";
import { claveUnica, generarClave, normalizarTexto } from "./clave";

describe("generarClave", () => {
  it("pasa a minúsculas, sin tildes y con guiones bajos", () => {
    expect(generarClave("Sensor de lluvia")).toBe("sensor_de_lluvia");
    expect(generarClave("Año de fabricación")).toBe("ano_de_fabricacion");
    expect(generarClave("  Ñandú / Test!! ")).toBe("nandu_test");
  });

  it("usa 'campo' si no queda ningún carácter válido", () => {
    expect(generarClave("!!!")).toBe("campo");
    expect(generarClave("")).toBe("campo");
  });

  it("se corta a 40 caracteres sin dejar un guion bajo al final", () => {
    const clave = generarClave("a".repeat(39) + " bbb");
    expect(clave.length).toBeLessThanOrEqual(40);
    expect(clave.endsWith("_")).toBe(false);
  });
});

describe("claveUnica", () => {
  it("devuelve la clave base si está libre", () => {
    expect(claveUnica("Color", ["costo"])).toBe("color");
  });

  it("agrega un sufijo numérico si ya existe", () => {
    expect(claveUnica("Color", ["color"])).toBe("color_2");
    expect(claveUnica("Color", ["color", "color_2"])).toBe("color_3");
  });

  it("no choca con las claves reservadas que se le pasen", () => {
    expect(claveUnica("Costo", ["costo", "codigo"])).toBe("costo_2");
  });
});

describe("normalizarTexto", () => {
  it("ignora mayúsculas, tildes y espacios de los bordes y repetidos", () => {
    expect(normalizarTexto("  Sensor  de LLUVIA ")).toBe(normalizarTexto("sensor de lluvia"));
    expect(normalizarTexto("Año")).toBe(normalizarTexto("ano"));
  });
});
