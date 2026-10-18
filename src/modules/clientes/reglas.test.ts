import { describe, expect, it } from "vitest";
import { agruparAlfabetico, coincideNombre, compararNombres, esSinNombre, inicialDe, primerNombre } from "./reglas";

describe("inicialDe", () => {
  it.each([
    ["Ana", "A"],
    ["álvaro", "A"],
    ["  beto", "B"],
    ["Ñandú", "Ñ"],
    ["3M Argentina", "#"],
    ["", "#"],
  ])("%s → %s", (nombre, letra) => expect(inicialDe(nombre)).toBe(letra));
});

describe("esSinNombre", () => {
  it("reconoce el nombre que deja la importación", () => {
    expect(esSinNombre("Sin nombre")).toBe(true);
    expect(esSinNombre("  sin NOMBRE ")).toBe(true);
    expect(esSinNombre("")).toBe(true);
    expect(esSinNombre("Sin Nombre Pérez")).toBe(false);
  });
});

describe("orden alfabético", () => {
  it("ignora mayúsculas y tildes, y la Ñ va después de la N", () => {
    const nombres = ["beto", "Ñandú", "Zoe", "álvaro", "Nora", "Carla", "Ana"];
    expect([...nombres].sort(compararNombres)).toEqual(["álvaro", "Ana", "beto", "Carla", "Nora", "Ñandú", "Zoe"]);
  });
});

describe("agruparAlfabetico", () => {
  const c = (nombre: string) => ({ nombre });

  it("agrupa por inicial, de la A a la Z", () => {
    const r = agruparAlfabetico([c("Zoe"), c("Ana"), c("álvaro"), c("Beto"), c("Alberto")]);
    expect(r.map((g) => [g.letra, g.clientes.map((x) => x.nombre)])).toEqual([
      ["A", ["Alberto", "álvaro", "Ana"]],
      ["B", ["Beto"]],
      ["Z", ["Zoe"]],
    ]);
  });

  it("los 'Sin nombre' van al final y los que no empiezan con letra, justo antes", () => {
    const r = agruparAlfabetico([c("Sin nombre"), c("Zoe"), c("3M"), c("Ana"), c("Sin nombre")]);
    expect(r.map((g) => g.letra)).toEqual(["A", "Z", "#", "Sin nombre"]);
    expect(r.at(-1)?.clientes).toHaveLength(2);
  });

  it("no modifica la lista original", () => {
    const original = [c("Zoe"), c("Ana")];
    agruparAlfabetico(original);
    expect(original.map((x) => x.nombre)).toEqual(["Zoe", "Ana"]);
  });

  it("una lista vacía no tiene grupos", () => {
    expect(agruparAlfabetico([])).toEqual([]);
  });
});

describe("coincideNombre", () => {
  it("busca sin distinguir mayúsculas ni tildes, en cualquier parte del nombre", () => {
    expect(coincideNombre("Álvaro Acosta", "alvaro")).toBe(true);
    expect(coincideNombre("Álvaro Acosta", "ACOSTA")).toBe(true);
    expect(coincideNombre("María José", "jose")).toBe(true);
    expect(coincideNombre("Álvaro Acosta", "benitez")).toBe(false);
  });
});

describe("primerNombre", () => {
  it("toma la primera palabra", () => {
    expect(primerNombre("María José Pérez")).toBe("María");
    expect(primerNombre("  Juan ")).toBe("Juan");
    expect(primerNombre("")).toBe("");
  });
});
