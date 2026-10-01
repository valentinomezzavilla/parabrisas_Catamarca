import { describe, expect, it } from "vitest";
import { armarPreferencia, type DatosPreferencia } from "./mercadopago";

const ahora = new Date("2026-10-01T15:00:00Z");
const base: DatosPreferencia = {
  pagoId: "pago1",
  turnoId: "turno1",
  titulo: "Seña · Colocación de vidrios",
  monto: 7500,
  nombreCliente: "Ana Pérez",
  emailCliente: "ana@example.com",
  venceEn: new Date(ahora.getTime() + 8 * 60_000),
  ahora,
  urlApp: "https://turnos.ejemplo.com",
};
type Preferencia = ReturnType<typeof armarPreferencia> & Record<string, any>;
const armar = (o: Partial<DatosPreferencia> = {}) => armarPreferencia({ ...base, ...o }) as Preferencia;

describe("armarPreferencia", () => {
  it("cobra el monto de la seña en pesos, una sola unidad", () => {
    expect(armar().items).toEqual([{ id: "turno1", title: "Seña · Colocación de vidrios", quantity: 1, unit_price: 7500, currency_id: "ARS" }]);
  });

  it("usa el id del pago como referencia externa", () => {
    expect(armar().external_reference).toBe("pago1");
  });

  it("vence a los 8 minutos, con la hora de Catamarca (-03:00)", () => {
    const p = armar();
    expect(p.expires).toBe(true);
    expect(p.expiration_date_from).toBe("2026-10-01T12:00:00.000-03:00");
    expect(p.expiration_date_to).toBe("2026-10-01T12:08:00.000-03:00");
  });

  it("excluye los pagos en efectivo y por cajero", () => {
    expect(armar().payment_methods.excluded_payment_types).toEqual([{ id: "ticket" }, { id: "atm" }]);
  });

  it("vuelve a la página de confirmación del turno", () => {
    const { back_urls } = armar();
    for (const url of [back_urls.success, back_urls.failure, back_urls.pending]) {
      expect(url).toBe("https://turnos.ejemplo.com/reservar/confirmado?turno=turno1");
    }
  });

  it("con una URL https pide el aviso por webhook y el regreso automático", () => {
    const p = armar();
    expect(p.notification_url).toBe("https://turnos.ejemplo.com/api/mercadopago/webhook");
    expect(p.auto_return).toBe("approved");
  });

  it("con una URL local no manda notification_url ni auto_return (Mercado Pago los rechaza)", () => {
    const p = armar({ urlApp: "http://localhost:3000" });
    expect(p).not.toHaveProperty("notification_url");
    expect(p).not.toHaveProperty("auto_return");
  });

  it("ignora la barra final de APP_URL", () => {
    expect(armar({ urlApp: "https://turnos.ejemplo.com/" }).back_urls.success).toBe("https://turnos.ejemplo.com/reservar/confirmado?turno=turno1");
  });

  it("sin email no manda el campo", () => {
    const p = armar({ emailCliente: undefined });
    expect(p.payer).toEqual({ name: "Ana Pérez" });
  });
});
