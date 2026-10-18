import { describe, expect, it } from "vitest";
import { hoy } from "@/lib/tiempo";
import { beneficioSchema, clienteSchema } from "./schemas";

describe("clienteSchema", () => {
  it("solo el nombre es obligatorio", () => {
    expect(clienteSchema.parse({ nombre: "Ana Pérez" })).toEqual({ nombre: "Ana Pérez" });
  });

  it("acepta teléfono, mail, nacimiento y observaciones", () => {
    const r = clienteSchema.parse({ nombre: "Ana", telefono: "3834-123456", email: "ana@mail.com", fechaNacimiento: "1990-05-17", notas: "Prefiere el turno de la mañana" });
    expect(r.fechaNacimiento).toBe("1990-05-17");
  });

  it("rechaza nombres muy cortos y mails inválidos", () => {
    expect(clienteSchema.safeParse({ nombre: "A" }).success).toBe(false);
    expect(clienteSchema.safeParse({ nombre: "Ana", email: "no-es-mail" }).success).toBe(false);
  });

  it("rechaza nacimientos que no existen, futuros o de antes de 1900", () => {
    expect(clienteSchema.safeParse({ nombre: "Ana", fechaNacimiento: "1990-02-30" }).success).toBe(false);
    expect(clienteSchema.safeParse({ nombre: "Ana", fechaNacimiento: "1850-01-01" }).success).toBe(false);
    const r = clienteSchema.safeParse({ nombre: "Ana", fechaNacimiento: "2999-01-01" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toMatch(/futura/);
  });

  it("acepta hoy como nacimiento", () => {
    expect(clienteSchema.safeParse({ nombre: "Bebé", fechaNacimiento: hoy() }).success).toBe(true);
  });
});

describe("beneficioSchema", () => {
  it("un porcentaje lleva su valor", () => {
    expect(beneficioSchema.parse({ titulo: "Polarizado", tipo: "PORCENTAJE", valor: 10 })).toMatchObject({ valor: 10 });
  });

  it("porcentaje y monto exigen el valor", () => {
    for (const tipo of ["PORCENTAJE", "MONTO"]) {
      const r = beneficioSchema.safeParse({ titulo: "Descuento", tipo });
      expect(r.success).toBe(false);
      expect(r.error?.issues[0].path).toEqual(["valor"]);
    }
  });

  it("el porcentaje no supera 100", () => {
    expect(beneficioSchema.safeParse({ titulo: "Todo gratis", tipo: "PORCENTAJE", valor: 101 }).success).toBe(false);
    expect(beneficioSchema.safeParse({ titulo: "Todo gratis", tipo: "PORCENTAJE", valor: 100 }).success).toBe(true);
  });

  it("un monto puede ser mayor a 100", () => {
    expect(beneficioSchema.safeParse({ titulo: "Descuento", tipo: "MONTO", valor: 5000 }).success).toBe(true);
  });

  it("'Otro' no lleva valor aunque el formulario lo mande", () => {
    expect(beneficioSchema.parse({ titulo: "Lavado gratis", tipo: "OTRO", valor: 5 }).valor).toBeUndefined();
  });

  it("valida la fecha de vigencia", () => {
    expect(beneficioSchema.safeParse({ titulo: "Lavado gratis", tipo: "OTRO", vigenteHasta: "2026-13-01" }).success).toBe(false);
    expect(beneficioSchema.parse({ titulo: "Lavado gratis", tipo: "OTRO", vigenteHasta: "2026-12-31" }).vigenteHasta).toBe("2026-12-31");
  });
});
