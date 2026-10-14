import { describe, expect, it } from "vitest";
import { ImportacionError, leerCsv, prepararImportacion, separarCodigoCristal } from "./notion";

// Filas inventadas con el formato de la exportación de "Órdenes de Trabajo" de Notion (teléfonos de fantasía).
const ENCABEZADO =
  "Fecha de recepción,Patente,Cliente,Teléfono,Observaciones,Aseguradora,Estado,Siniestro,Facturas,Pedido al Proveedor,Tipo,Vehículo,Cliente Seguro";
const enlace = (id: string, titulo = "Sin título") => `${titulo} (https://app.notion.com/p/${id}?pvs=21)`;
const A1 = "aaaa0000000000000000000000000001";
const A2 = "aaaa0000000000000000000000000002";
const P1 = "bbbb0000000000000000000000000001";

function csv(...filas: string[]) {
  return [ENCABEZADO, ...filas].join("\r\n");
}

describe("leerCsv", () => {
  it("respeta comillas, comillas dobles y saltos de línea dentro de un campo", () => {
    expect(leerCsv('a,"b, c","d ""e"""\r\n1,"dos\n\nlíneas",3')).toEqual([
      ["a", "b, c", 'd "e"'],
      ["1", "dos\n\nlíneas", "3"],
    ]);
  });

  it("ignora la marca BOM y las líneas vacías del final", () => {
    expect(leerCsv("﻿x,y\n1,2\n\n")).toEqual([
      ["x", "y"],
      ["1", "2"],
    ]);
  });
});

describe("separarCodigoCristal", () => {
  it.each([
    ["10092-5", "10092-5", false],
    ["10709-5 ENVIADA A CBA ", "10709-5", true],
    ["10813 -5", "10813-5", false],
    ["10411- (SE LE TAPA EL SENSOR)", "10411", true],
    ["10314-31948-31949", "10314", true],
    ["31812—favicur", "31812", true],
    ["habia en local ya se cambio", null, true],
    ["", null, false],
  ])("%s", (texto, codigo, conNota) => {
    const r = separarCodigoCristal(texto);
    expect(r.codigo).toBe(codigo);
    expect(r.nota !== null).toBe(conNota);
  });
});

describe("prepararImportacion", () => {
  const sinExistentes = { aseguradoras: [], proveedores: [] };

  it("mapea una orden de seguro", () => {
    const r = prepararImportacion(
      csv(`20 de agosto de 2026,AH 791 FV,${enlace("c1")},3834-000001,10314-5,${enlace(A1)},Facturada,4623249,,${enlace(P1)},Seguro,"Toyota Hilux ",`),
      sinExistentes,
    );
    expect(r.ordenes).toEqual([
      {
        fila: 2,
        recibidaEl: "2026-08-20",
        tipo: "SEGURO",
        estado: "FACTURADA",
        patente: "AH791FV",
        vehiculo: "Toyota Hilux",
        cliente: { nombre: "Sin nombre", telefono: "3834-000001" },
        aseguradora: A1,
        proveedor: P1,
        siniestro: "4623249",
        codigoCristal: "10314-5",
        observaciones: null,
      },
    ]);
  });

  it("numera las aseguradoras y proveedores sin nombre, y usa el nombre cuando Notion lo trae", () => {
    const r = prepararImportacion(
      csv(
        `1 de septiembre de 2026,AA1,${enlace("c1")},,1,${enlace(A2)},Pedido,,,${enlace(P1)},Seguro,,`,
        `2 de septiembre de 2026,AA2,${enlace("c2")},,1,${enlace(A1)},Pedido,,,${enlace(P1)},Seguro,,`,
        `3 de septiembre de 2026,AA3,${enlace("c3")},,1,${enlace("cccc", "Sancor")},Pedido,,,,Seguro,,`,
      ),
      { aseguradoras: ["Aseguradora 1"], proveedores: [] },
    );
    expect(r.aseguradoras).toEqual([
      { clave: A2, nombre: "Aseguradora 2" },
      { clave: A1, nombre: "Aseguradora 3" },
      { clave: "cccc", nombre: "Sancor" },
    ]);
    expect(r.proveedores).toEqual([{ clave: P1, nombre: "Proveedor 1" }]);
  });

  it("en un particular, la columna Siniestro son notas de pago y van a observaciones", () => {
    const r = prepararImportacion(
      csv(`27 de agosto de 2026,,${enlace("c1")},3834-000002,50642-1,,Instalada,SEÑA 70.000 SALDO 70.000,,${enlace(P1)},Particular,PARTNER,`),
      sinExistentes,
    );
    expect(r.ordenes[0]).toMatchObject({ tipo: "PARTICULAR", siniestro: null, aseguradora: null, observaciones: "Pago: SEÑA 70.000 SALDO 70.000" });
  });

  it("en un seguro, un siniestro que no es número ni link va como nota", () => {
    const r = prepararImportacion(
      csv(
        `3 de septiembre de 2026,AG1,${enlace("c1")},3834-000003,10314,${enlace(A1)},Falta pedir,SEMANA DEL 7/9,,,Seguro,,`,
        `29 de septiembre de 2026,NHO 531,${enlace("c2")},3834-000004,10982-5,${enlace(A1)},Turno asignado,52401243077  SINIESTRO,,,,,`,
        `20 de agosto de 2026,AF 1,${enlace("c3")},,10092-5,${enlace(A1)},,https://agrisa.pilkington.com/Claim/Read/1/Main,,,Seguro,,`,
      ),
      sinExistentes,
    );
    expect(r.ordenes.map((o) => [o.siniestro, o.observaciones])).toEqual([
      [null, "Nota: SEMANA DEL 7/9"],
      ["52401243077", null],
      ["https://agrisa.pilkington.com/Claim/Read/1/Main", null],
    ]);
  });

  it("sin tipo, decide por la aseguradora; sin estado, Falta pedir", () => {
    const r = prepararImportacion(
      csv(`29 de septiembre de 2026,X1,${enlace("c1")},,1,${enlace(A1)},,,,,,,`, `25 de septiembre de 2026,X2,${enlace("c2")},,1,,Falta pedir,,,,,,`),
      sinExistentes,
    );
    expect(r.ordenes.map((o) => [o.tipo, o.estado])).toEqual([
      ["SEGURO", "FALTA_PEDIR"],
      ["PARTICULAR", "FALTA_PEDIR"],
    ]);
  });

  it("un teléfono sin dígitos es el nombre del cliente", () => {
    const r = prepararImportacion(csv(`22 de septiembre de 2026,AG2,${enlace("c1")},"RODRI ",10314-5,,Instalada,,,,,,`), sinExistentes);
    expect(r.ordenes[0].cliente).toEqual({ nombre: "RODRI", telefono: "" });
  });

  it("guarda el texto completo de Observaciones cuando trae algo más que el código", () => {
    const r = prepararImportacion(csv(`24 de agosto de 2026,LOI 949,${enlace("c1")},,"10709-5 ENVIADA A CBA ",,Instalada,,,,Particular,,`), sinExistentes);
    expect(r.ordenes[0]).toMatchObject({ codigoCristal: "10709-5", observaciones: "10709-5 ENVIADA A CBA" });
  });

  it("encuentra las columnas por nombre, en cualquier orden", () => {
    const otroOrden = [
      "Tipo,Patente,Fecha de recepción,Estado,Cliente,Teléfono,Observaciones,Aseguradora,Siniestro,Pedido al Proveedor,Vehículo",
      `Particular,AB1,5 de octubre de 2026,Pedido,${enlace("c1")},3834-000005,31078,,,,suzuki fun`,
    ].join("\n");
    expect(prepararImportacion(otroOrden, sinExistentes).ordenes[0]).toMatchObject({ patente: "AB1", recibidaEl: "2026-10-05", estado: "PEDIDO" });
  });

  it("rechaza un archivo sin las columnas de la planilla", () => {
    expect(() => prepararImportacion("nombre,precio\nx,1", sinExistentes)).toThrow(ImportacionError);
  });

  it("informa la fila con una fecha que no se entiende", () => {
    expect(() => prepararImportacion(csv(`ayer,AB1,${enlace("c1")},,,,,,,,,,`), sinExistentes)).toThrow(/fila 2/);
  });

  it("rechaza un archivo sin órdenes", () => {
    expect(() => prepararImportacion(ENCABEZADO, sinExistentes)).toThrow(ImportacionError);
  });
});
