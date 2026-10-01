import { describe, expect, it } from "vitest";
import { decidirPago, type ContextoDecision, type PagoMp } from "./decision";

const mp = (o: Partial<PagoMp> = {}): PagoMp => ({ id: "100", estado: "approved", monto: 7500, moneda: "ARS", referencia: "pago1", ...o });
const ctx = (o: Partial<ContextoDecision> = {}): ContextoDecision => ({
  montoEsperado: 7500,
  pagoEstado: "PENDIENTE",
  yaAplicado: false,
  turnoEstado: "ESPERANDO_PAGO",
  venceEnPasado: false,
  horarioLibre: false,
  ...o,
});

describe("decidirPago: pago aprobado", () => {
  it("a tiempo confirma el turno", () => {
    expect(decidirPago(mp(), ctx())).toEqual({ accion: "confirmar" });
  });

  it("un pago ya aplicado se ignora (el aviso llegó repetido)", () => {
    expect(decidirPago(mp(), ctx({ yaAplicado: true, pagoEstado: "APROBADO", turnoEstado: "CONFIRMADO" }))).toEqual({ accion: "ignorar" });
  });

  it("vencido pero con el horario todavía libre, confirma", () => {
    expect(decidirPago(mp(), ctx({ venceEnPasado: true, horarioLibre: true }))).toEqual({ accion: "confirmar" });
  });

  it("vencido y con el horario tomado por otro, hay que devolver", () => {
    expect(decidirPago(mp(), ctx({ venceEnPasado: true, horarioLibre: false }))).toEqual({ accion: "devolver", motivo: "horario_tomado" });
  });

  it("el barrido ya canceló el turno (pago VENCIDO) y el horario sigue libre, confirma", () => {
    expect(decidirPago(mp(), ctx({ turnoEstado: "CANCELADO", pagoEstado: "VENCIDO", venceEnPasado: true, horarioLibre: true }))).toEqual({ accion: "confirmar" });
  });

  it("el barrido ya canceló el turno y el horario lo tomó otro, hay que devolver", () => {
    expect(decidirPago(mp(), ctx({ turnoEstado: "CANCELADO", pagoEstado: "VENCIDO", venceEnPasado: true, horarioLibre: false }))).toEqual({ accion: "devolver", motivo: "horario_tomado" });
  });

  it("el local canceló el turno a mano (el pago seguía pendiente), hay que devolver", () => {
    expect(decidirPago(mp(), ctx({ turnoEstado: "CANCELADO", pagoEstado: "PENDIENTE", horarioLibre: true }))).toEqual({ accion: "devolver", motivo: "turno_cancelado" });
  });

  it("un monto distinto al de la seña nunca confirma", () => {
    expect(decidirPago(mp({ monto: 100 }), ctx())).toEqual({ accion: "devolver", motivo: "monto_distinto" });
  });

  it("una moneda distinta a ARS nunca confirma", () => {
    expect(decidirPago(mp({ moneda: "USD" }), ctx())).toEqual({ accion: "devolver", motivo: "monto_distinto" });
  });

  it("un segundo pago aprobado para la misma seña es un duplicado a devolver", () => {
    expect(decidirPago(mp({ id: "200" }), ctx({ pagoEstado: "APROBADO", turnoEstado: "CONFIRMADO" }))).toEqual({ accion: "devolver", motivo: "pago_duplicado" });
  });

  it("tras un rechazo, un reintento aprobado confirma", () => {
    expect(decidirPago(mp(), ctx({ pagoEstado: "RECHAZADO" }))).toEqual({ accion: "confirmar" });
  });

  it("tolera diferencias de centavos por redondeo", () => {
    expect(decidirPago(mp({ monto: 7500.001 }), ctx())).toEqual({ accion: "confirmar" });
  });
});

describe("decidirPago: otros estados de Mercado Pago", () => {
  it("rechazado con el pago pendiente lo marca rechazado", () => {
    expect(decidirPago(mp({ estado: "rejected" }), ctx())).toEqual({ accion: "rechazar" });
    expect(decidirPago(mp({ estado: "cancelled" }), ctx())).toEqual({ accion: "rechazar" });
  });

  it("rechazado cuando el pago ya estaba aprobado no cambia nada", () => {
    expect(decidirPago(mp({ id: "300", estado: "rejected" }), ctx({ pagoEstado: "APROBADO", turnoEstado: "CONFIRMADO" }))).toEqual({ accion: "ignorar" });
  });

  it("pendiente, en proceso o reintegrado se ignoran", () => {
    for (const estado of ["pending", "in_process", "refunded", "charged_back", "algo_nuevo"]) {
      expect(decidirPago(mp({ estado }), ctx())).toEqual({ accion: "ignorar" });
    }
  });
});
