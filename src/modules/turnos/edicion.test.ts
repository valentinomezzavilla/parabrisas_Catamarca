import { describe, expect, it } from "vitest";
import { cambiaAgenda, ESTADOS_EDITABLES, puedeEditar } from "./edicion";

describe("puedeEditar", () => {
  it("solo se editan los turnos pendientes, confirmados y en curso", () => {
    expect(ESTADOS_EDITABLES).toEqual(["PENDIENTE", "CONFIRMADO", "EN_CURSO"]);
    for (const e of ["PENDIENTE", "CONFIRMADO", "EN_CURSO"] as const) expect(puedeEditar(e), e).toBe(true);
    for (const e of ["ESPERANDO_PAGO", "COMPLETADO", "CANCELADO", "AUSENTE"] as const) expect(puedeEditar(e), e).toBe(false);
  });
});

describe("cambiaAgenda", () => {
  const actual = { servicioId: "s1", inicio: new Date("2026-10-05T13:00:00Z") };

  it("no hay cambio si el servicio y el horario son los mismos", () => {
    expect(cambiaAgenda(actual, { servicioId: "s1", inicio: new Date("2026-10-05T13:00:00Z") })).toBe(false);
  });

  it("hay cambio si cambia el servicio o el horario", () => {
    expect(cambiaAgenda(actual, { servicioId: "s2", inicio: actual.inicio })).toBe(true);
    expect(cambiaAgenda(actual, { servicioId: "s1", inicio: new Date("2026-10-05T14:00:00Z") })).toBe(true);
  });
});
