import { describe, expect, it } from "vitest";
import { cobroSchema, facturacionSchema, normalizarPatente, ordenSchema } from "./schemas";

const valida = {
  tipo: "SEGURO",
  recibidaEl: "2026-10-14",
  cliente: { nombre: "Juana Pérez", telefono: "3834-643926" },
  aseguradoraId: "a1",
};

describe("ordenSchema", () => {
  it("acepta una orden de seguro con aseguradora", () => {
    expect(ordenSchema.parse(valida)).toMatchObject({ tipo: "SEGURO", aseguradoraId: "a1" });
  });

  it("un seguro exige la aseguradora", () => {
    const r = ordenSchema.safeParse({ ...valida, aseguradoraId: undefined });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["aseguradoraId"]);
  });

  it("un particular no lleva aseguradora ni siniestro aunque vengan", () => {
    const r = ordenSchema.parse({ ...valida, tipo: "PARTICULAR", siniestro: "123" });
    expect(r.aseguradoraId).toBeUndefined();
    expect(r.siniestro).toBeUndefined();
  });

  it("el teléfono es opcional", () => {
    expect(ordenSchema.parse({ ...valida, cliente: { nombre: "Rodri" } }).cliente.telefono).toBeUndefined();
  });

  it("normaliza la patente", () => {
    expect(ordenSchema.parse({ ...valida, patente: "af 722-ki" }).patente).toBe("AF722KI");
  });

  it("rechaza una fecha que no existe", () => {
    expect(ordenSchema.safeParse({ ...valida, recibidaEl: "2026-02-30" }).success).toBe(false);
  });
});

describe("seña en ordenSchema", () => {
  const particular = { ...valida, tipo: "PARTICULAR", aseguradoraId: undefined };

  it("un particular puede llevar seña, abonada o pendiente", () => {
    expect(ordenSchema.parse({ ...particular, senaMonto: 50000 })).toMatchObject({ senaMonto: 50000 });
    expect(ordenSchema.parse({ ...particular, senaMonto: 50000, senaAbonada: true })).toMatchObject({ senaAbonada: true });
  });

  it("abonada exige el monto", () => {
    const r = ordenSchema.safeParse({ ...particular, senaAbonada: true });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["senaMonto"]);
  });

  it("el monto tiene que ser mayor a cero", () => {
    expect(ordenSchema.safeParse({ ...particular, senaMonto: 0 }).success).toBe(false);
    expect(ordenSchema.safeParse({ ...particular, senaMonto: Number.NaN }).success).toBe(false);
  });

  it("un seguro no lleva seña aunque el formulario la mande", () => {
    const r = ordenSchema.parse({ ...valida, senaMonto: 50000, senaAbonada: true });
    expect(r.senaMonto).toBeUndefined();
    expect(r.senaAbonada).toBe(false);
  });
});

describe("normalizarPatente", () => {
  it("deja solo letras y números en mayúsculas", () => {
    expect(normalizarPatente(" lwu-719 ")).toBe("LWU719");
    expect(normalizarPatente("AH 791 FV")).toBe("AH791FV");
  });
});

describe("facturacionSchema", () => {
  it("todo es opcional", () => {
    expect(facturacionSchema.parse({})).toEqual({});
  });

  it("rechaza importes negativos o que no son números", () => {
    expect(facturacionSchema.safeParse({ importeTotal: -1 }).success).toBe(false);
    expect(facturacionSchema.safeParse({ importeTotal: Number.NaN }).success).toBe(false);
  });
});

describe("cobroSchema", () => {
  const cobro = { fecha: "2026-10-14", monto: 50000, pagador: "ASEGURADORA", medio: "TRANSFERENCIA" };

  it("acepta un cobro completo", () => {
    expect(cobroSchema.parse(cobro)).toMatchObject({ monto: 50000 });
  });

  it("el monto tiene que ser mayor a cero", () => {
    expect(cobroSchema.safeParse({ ...cobro, monto: 0 }).success).toBe(false);
  });

  it("el medio tiene que ser uno de la lista", () => {
    expect(cobroSchema.safeParse({ ...cobro, medio: "BITCOIN" }).success).toBe(false);
  });
});
