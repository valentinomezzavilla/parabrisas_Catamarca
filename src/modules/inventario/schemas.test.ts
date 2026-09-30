import { describe, expect, it } from "vitest";
import { actualizarCristalSchema, crearCristalSchema } from "./schemas";

const minimo = { codigo: "a", descripcion: "abc", marcaId: "m", tipoId: "t", ubicacionId: "u" };

describe("actualizarCristalSchema", () => {
  it("no inyecta valores por defecto: una edición que omite campos no pisa lo guardado", () => {
    expect(actualizarCristalSchema.parse({})).toEqual({});
  });

  it("devuelve solo lo enviado y normaliza el código", () => {
    expect(actualizarCristalSchema.parse({ codigo: "x1" })).toEqual({ codigo: "X1" });
  });

  it("ignora la cantidad: el stock solo cambia con movimientos", () => {
    expect(actualizarCristalSchema.parse({ cantidadInicial: 5 })).toEqual({});
  });
});

describe("crearCristalSchema", () => {
  it("aplica los valores por defecto al crear", () => {
    expect(crearCristalSchema.parse(minimo)).toMatchObject({
      codigo: "A",
      lado: "NO_APLICA",
      cantidadInicial: 0,
      stockMinimo: 0,
      compatibilidades: [],
      extrasEntrada: {},
    });
  });

  it("ya no tiene `caracteristicas`: los campos propios viajan en extrasEntrada", () => {
    expect(crearCristalSchema.parse({ ...minimo, caracteristicas: [{ caracteristicaId: "x", valor: "y" }] })).not.toHaveProperty("caracteristicas");
    expect(crearCristalSchema.parse({ ...minimo, extrasEntrada: { extra_nota: "hola" } }).extrasEntrada).toEqual({ extra_nota: "hola" });
  });
});
