import { describe, expect, it } from "vitest";
import { vistaConfirmacion, type EntradaVista } from "./vista";

const ahora = new Date("2026-10-01T15:00:00Z");
const en = (min: number) => new Date(ahora.getTime() + min * 60_000);
const vista = (o: Partial<EntradaVista> = {}) =>
  vistaConfirmacion({ turnoEstado: "CONFIRMADO", venceEn: null, pago: null, ahora, ...o });

describe("vistaConfirmacion", () => {
  it("esperando el pago mientras el turno no venció", () => {
    expect(vista({ turnoEstado: "ESPERANDO_PAGO", venceEn: en(5), pago: { requiereDevolucion: false, devuelto: false } })).toEqual({ tipo: "esperando", pagoDeMas: false });
  });

  it("un turno que esperaba el pago y ya venció NO se muestra como reservado", () => {
    expect(vista({ turnoEstado: "ESPERANDO_PAGO", venceEn: en(-1), pago: { requiereDevolucion: false, devuelto: false } }).tipo).toBe("no_completado");
  });

  it("vencido justo ahora (venceEn == ahora) ya no espera", () => {
    expect(vista({ turnoEstado: "ESPERANDO_PAGO", venceEn: ahora }).tipo).toBe("no_completado");
  });

  it("cancelado sin pago para devolver es un pago no completado", () => {
    expect(vista({ turnoEstado: "CANCELADO", pago: { requiereDevolucion: false, devuelto: false } }).tipo).toBe("no_completado");
  });

  it("cancelado con el pago a devolver es 'pagó pero sin turno'", () => {
    expect(vista({ turnoEstado: "CANCELADO", pago: { requiereDevolucion: true, devuelto: false } })).toEqual({ tipo: "sin_turno", devuelto: false });
  });

  it("si el local ya devolvió la seña, se informa", () => {
    expect(vista({ turnoEstado: "CANCELADO", pago: { requiereDevolucion: true, devuelto: true } })).toEqual({ tipo: "sin_turno", devuelto: true });
  });

  it("un turno confirmado sigue confirmado aunque haya un pago duplicado para devolver", () => {
    expect(vista({ turnoEstado: "CONFIRMADO", pago: { requiereDevolucion: true, devuelto: false } })).toEqual({ tipo: "confirmado", pagoDeMas: true });
  });

  it("un turno confirmado normal no tiene pago de más", () => {
    expect(vista({ turnoEstado: "CONFIRMADO", pago: { requiereDevolucion: false, devuelto: false } })).toEqual({ tipo: "confirmado", pagoDeMas: false });
    expect(vista({ turnoEstado: "COMPLETADO" }).tipo).toBe("confirmado");
  });

  it("un turno reservado sin seña (pendiente de confirmar por el local) es 'reservado'", () => {
    expect(vista({ turnoEstado: "PENDIENTE" }).tipo).toBe("reservado");
  });
});
