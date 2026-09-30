import { describe, expect, it } from "vitest";
import { crearCampoSchema, editarCampoPropioSchema, editarCampoSistemaSchema } from "./schemas";

describe("crearCampoSchema", () => {
  it("acepta un campo simple y aplica los valores por defecto", () => {
    const r = crearCampoSchema.parse({ etiqueta: "  Sensor  ", tipo: "SI_NO" });
    expect(r).toMatchObject({ etiqueta: "Sensor", tipo: "SI_NO", requerido: false, opcionesTexto: "" });
  });

  it("rechaza una etiqueta vacía o de más de 60 caracteres y un tipo inexistente", () => {
    expect(crearCampoSchema.safeParse({ etiqueta: "  ", tipo: "TEXTO" }).success).toBe(false);
    expect(crearCampoSchema.safeParse({ etiqueta: "x".repeat(61), tipo: "TEXTO" }).success).toBe(false);
    expect(crearCampoSchema.safeParse({ etiqueta: "A", tipo: "COLOR" }).success).toBe(false);
  });

  it("una lista necesita al menos una opción y marca el campo opcionesTexto", () => {
    const r = crearCampoSchema.safeParse({ etiqueta: "Tono", tipo: "LISTA", opcionesTexto: " \n " });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["opcionesTexto"]);
    expect(crearCampoSchema.safeParse({ etiqueta: "Tono", tipo: "LISTA", opcionesTexto: "Verde\nGris" }).success).toBe(true);
  });
});

describe("editarCampoPropioSchema / editarCampoSistemaSchema", () => {
  it("el campo propio exige los booleanos y una etiqueta", () => {
    expect(editarCampoPropioSchema.safeParse({ etiqueta: "A", requerido: true, visible: true }).success).toBe(true);
    expect(editarCampoPropioSchema.safeParse({ etiqueta: "", requerido: true, visible: true }).success).toBe(false);
  });

  it("el campo del sistema acepta etiqueta y ayuda en blanco (vuelven a la de fábrica)", () => {
    expect(editarCampoSistemaSchema.parse({})).toEqual({ oculto: false });
    expect(editarCampoSistemaSchema.safeParse({ etiqueta: "x".repeat(61) }).success).toBe(false);
  });
});
