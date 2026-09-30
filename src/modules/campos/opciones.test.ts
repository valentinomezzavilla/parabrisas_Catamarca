import { describe, expect, it } from "vitest";
import {
  agregarOpcion,
  alternarOpcion,
  crearOpciones,
  etiquetasDeTexto,
  quitarOpcion,
  renombrarOpcion,
  validarOpciones,
} from "./opciones";

const ids = () => {
  let n = 0;
  return () => `o${++n}`;
};

describe("etiquetasDeTexto", () => {
  it("separa por renglón, recorta y descarta vacíos", () => {
    expect(etiquetasDeTexto("Verde\r\n  Gris \n\n Bronce ")).toEqual(["Verde", "Gris", "Bronce"]);
  });
});

describe("crearOpciones", () => {
  it("crea opciones activas con ids únicos y descarta etiquetas vacías", () => {
    const r = crearOpciones([" Verde ", "", "Gris"], ids());
    expect(r).toEqual([
      { id: "o1", etiqueta: "Verde", activo: true },
      { id: "o2", etiqueta: "Gris", activo: true },
    ]);
  });
});

describe("validarOpciones", () => {
  it("acepta una lista válida", () => {
    expect(validarOpciones(crearOpciones(["A", "B"], ids()))).toBeNull();
  });

  it("rechaza etiquetas repetidas sin distinguir mayúsculas ni tildes", () => {
    expect(validarOpciones(crearOpciones(["Año", "ANO"], ids()))).toMatch(/repetirse/);
  });

  it("rechaza una lista sin opciones activas", () => {
    const apagadas = crearOpciones(["A", "B"], ids()).map((o) => ({ ...o, activo: false }));
    expect(validarOpciones(apagadas)).toMatch(/al menos una opción activa/);
    expect(validarOpciones([])).toMatch(/al menos una opción activa/);
  });

  it("rechaza una etiqueta vacía", () => {
    expect(validarOpciones([{ id: "x", etiqueta: "  ", activo: true }])).toMatch(/vacía/);
  });
});

describe("operaciones sobre opciones", () => {
  const base = crearOpciones(["Verde", "Gris"], ids());

  it("agrega al final con un id nuevo", () => {
    const r = agregarOpcion(base, " Bronce ", () => "nuevo");
    expect(r.at(-1)).toEqual({ id: "nuevo", etiqueta: "Bronce", activo: true });
    expect(r).toHaveLength(3);
  });

  it("renombrar cambia la etiqueta y conserva el id (los valores guardados no se tocan)", () => {
    const r = renombrarOpcion(base, "o1", "Verde oscuro");
    expect(r[0]).toEqual({ id: "o1", etiqueta: "Verde oscuro", activo: true });
    expect(r[1]).toEqual(base[1]);
  });

  it("alternar activa o desactiva sin borrar la opción", () => {
    const r = alternarOpcion(base, "o2", false);
    expect(r[1]).toEqual({ id: "o2", etiqueta: "Gris", activo: false });
    expect(r).toHaveLength(2);
  });

  it("quitar elimina solo la opción indicada", () => {
    expect(quitarOpcion(base, "o1").map((o) => o.id)).toEqual(["o2"]);
  });

  it("no modifica la lista original", () => {
    renombrarOpcion(base, "o1", "X");
    alternarOpcion(base, "o1", false);
    quitarOpcion(base, "o1");
    expect(base.map((o) => o.etiqueta)).toEqual(["Verde", "Gris"]);
  });
});
