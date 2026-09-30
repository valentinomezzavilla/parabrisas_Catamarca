import { describe, expect, it } from "vitest";
import { convertirCaracteristicas, type CaracteristicaAntigua, type ValorAntiguo } from "./migracion";

const ids = () => {
  let n = 0;
  return () => `o${++n}`;
};

const car = (id: string, nombre: string, tipoDato: CaracteristicaAntigua["tipoDato"], extra: Partial<CaracteristicaAntigua> = {}): CaracteristicaAntigua => ({
  id,
  nombre,
  tipoDato,
  opciones: [],
  unidad: null,
  ...extra,
});
const val = (cristalId: string, caracteristicaId: string, valor: string): ValorAntiguo => ({ cristalId, caracteristicaId, valor });

describe("convertirCaracteristicas: definiciones", () => {
  it("mapea los tipos y ordena por nombre con orden 10, 20, 30…", () => {
    const { campos } = convertirCaracteristicas(
      [car("1", "Tonalidad", "OPCION", { opciones: ["Verde", "Gris"] }), car("2", "Antena", "BOOLEANO"), car("3", "Espesor extra", "NUMERO", { unidad: "mm" }), car("4", "Nota", "TEXTO")],
      [],
      [],
      ids(),
    );
    expect(campos.map((c) => [c.etiqueta, c.tipo, c.orden])).toEqual([
      ["Antena", "SI_NO", 10],
      ["Espesor extra", "NUMERO", 20],
      ["Nota", "TEXTO", 30],
      ["Tonalidad", "LISTA", 40],
    ]);
    expect(campos.find((c) => c.etiqueta === "Espesor extra")?.unidad).toBe("mm");
    expect(campos.find((c) => c.etiqueta === "Tonalidad")?.opciones).toEqual([
      { id: "o1", etiqueta: "Verde", activo: true },
      { id: "o2", etiqueta: "Gris", activo: true },
    ]);
  });

  it("genera claves únicas que no chocan con las reservadas ni entre sí", () => {
    const { campos } = convertirCaracteristicas([car("1", "Costo", "TEXTO"), car("2", "Color", "TEXTO"), car("3", "color", "TEXTO")], [], ["costo"], ids());
    expect(campos.map((c) => c.clave).sort()).toEqual(["color", "color_2", "costo_2"]);
  });

  it("sin datos devuelve listas vacías", () => {
    expect(convertirCaracteristicas([], [], [], ids())).toEqual({ campos: [], extrasPorCristal: {} });
  });
});

describe("convertirCaracteristicas: valores", () => {
  it("convierte cada tipo al formato nuevo y agrupa por cristal", () => {
    const cs = [car("b", "Antena", "BOOLEANO"), car("n", "Grosor", "NUMERO", { unidad: "mm" }), car("t", "Nota", "TEXTO"), car("o", "Tono", "OPCION", { opciones: ["Verde", "Gris"] })];
    const { campos, extrasPorCristal } = convertirCaracteristicas(
      cs,
      [val("c1", "b", "true"), val("c1", "n", "4,8"), val("c1", "t", "  hola "), val("c1", "o", "Gris"), val("c2", "b", "true")],
      [],
      ids(),
    );
    const clave = (etiqueta: string) => campos.find((c) => c.etiqueta === etiqueta)!.clave;
    const gris = campos.find((c) => c.etiqueta === "Tono")!.opciones.find((o) => o.etiqueta === "Gris")!.id;
    expect(extrasPorCristal.c1).toEqual({ [clave("Antena")]: true, [clave("Grosor")]: 4.8, [clave("Nota")]: "hola", [clave("Tono")]: gris });
    expect(extrasPorCristal.c2).toEqual({ [clave("Antena")]: true });
  });

  it("un Sí/No 'false' no guarda nada (ausente equivale a no)", () => {
    const { extrasPorCristal } = convertirCaracteristicas([car("b", "Antena", "BOOLEANO")], [val("c1", "b", "false")], [], ids());
    expect(extrasPorCristal).toEqual({});
  });

  it("un número que no es número se descarta", () => {
    const { extrasPorCristal } = convertirCaracteristicas([car("n", "Grosor", "NUMERO")], [val("c1", "n", "abc"), val("c2", "n", "")], [], ids());
    expect(extrasPorCristal).toEqual({});
  });

  it("un valor de lista fuera de las opciones agrega una opción inactiva y no se pierde el dato", () => {
    const { campos, extrasPorCristal } = convertirCaracteristicas(
      [car("o", "Tono", "OPCION", { opciones: ["Verde"] })],
      [val("c1", "o", "Bronce"), val("c2", "o", "Bronce")],
      [],
      ids(),
    );
    const tono = campos[0];
    const bronce = tono.opciones.find((o) => o.etiqueta === "Bronce");
    expect(bronce).toMatchObject({ activo: false });
    expect(tono.opciones).toHaveLength(2); // se agrega una sola vez
    expect(extrasPorCristal.c1).toEqual({ tono: bronce!.id });
    expect(extrasPorCristal.c2).toEqual({ tono: bronce!.id });
  });

  it("ignora valores de características que no existen", () => {
    expect(convertirCaracteristicas([], [val("c1", "fantasma", "x")], [], ids()).extrasPorCristal).toEqual({});
  });
});
