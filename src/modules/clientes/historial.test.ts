import { describe, expect, it } from "vitest";
import { armarHistorial, type OrdenDeHistorial, type TurnoDeHistorial } from "./historial";

const turno = (id: string, inicio: string, ordenId: string | null = null): TurnoDeHistorial => ({
  id,
  inicio: new Date(inicio),
  estado: "COMPLETADO",
  servicio: "Lavados",
  codigo: "ABC234",
  vehiculo: null,
  patente: null,
  ordenId,
});

const orden = (id: string, recibidaEl: string): OrdenDeHistorial => ({
  id,
  numero: 1,
  tipo: "PARTICULAR",
  estado: "INSTALADA",
  recibidaEl: new Date(`${recibidaEl}T00:00:00Z`),
  vehiculo: null,
  patente: null,
  aseguradora: null,
  cuenta: { total: null, cobrado: 0, saldo: null },
  turno: null,
});

describe("armarHistorial", () => {
  it("junta turnos y órdenes, lo más reciente primero", () => {
    const r = armarHistorial([turno("t1", "2026-08-10T13:00:00Z"), turno("t2", "2026-10-01T13:00:00Z")], [orden("o1", "2026-09-05")]);
    expect(r.map((i) => (i.tipo === "TURNO" ? i.turno.id : i.orden.id))).toEqual(["t2", "o1", "t1"]);
  });

  it("un turno que se dio desde una orden no se repite", () => {
    const r = armarHistorial([turno("t1", "2026-09-20T13:00:00Z", "o1"), turno("t2", "2026-08-01T13:00:00Z")], [orden("o1", "2026-09-05")]);
    expect(r.map((i) => i.tipo)).toEqual(["ORDEN", "TURNO"]);
  });

  it("sin nada, el historial está vacío", () => {
    expect(armarHistorial([], [])).toEqual([]);
  });
});
