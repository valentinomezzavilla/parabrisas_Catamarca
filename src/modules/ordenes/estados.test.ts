import { describe, expect, it } from "vitest";
import {
  agruparCobranzas,
  cobradoDe,
  diasEntre,
  estadoAlDarTurno,
  estadoSegunCobros,
  estadoSegunFactura,
  estadoTrasTurno,
  motivoCambioNoPermitido,
  puedeDarTurno,
  saldo,
  senaCobrada,
  situacionCobro,
  type OrdenACobrar,
} from "./estados";

describe("saldo y situación de cobro", () => {
  it("sin importe total no hay saldo", () => {
    expect(saldo(null, 0)).toBeNull();
    expect(situacionCobro(null, 5000)).toBe("SIN_IMPORTE");
  });

  it("resta lo cobrado y redondea a centavos", () => {
    expect(saldo(1000.3, 0.1)).toBe(1000.2);
    expect(saldo(125300, 65000)).toBe(60300);
  });

  it("pendiente, parcial y cobrada", () => {
    expect(situacionCobro(100000, 0)).toBe("PENDIENTE");
    expect(situacionCobro(100000, 40000)).toBe("PARCIAL");
    expect(situacionCobro(100000, 100000)).toBe("COBRADA");
    expect(situacionCobro(0, 0)).toBe("COBRADA");
  });
});

describe("seña de un particular", () => {
  it("pendiente no cuenta, abonada sí", () => {
    expect(senaCobrada(50000, false)).toBe(0);
    expect(senaCobrada(50000, true)).toBe(50000);
    expect(senaCobrada(null, true)).toBe(0);
    expect(senaCobrada("65000.50", true)).toBe(65000.5);
  });

  it("lo cobrado suma los cobros y la seña abonada", () => {
    const cobros = [{ monto: "20000" }, { monto: 10000.25 }];
    expect(cobradoDe({ cobros, senaMonto: 50000, senaAbonada: false })).toBe(30000.25);
    expect(cobradoDe({ cobros, senaMonto: 50000, senaAbonada: true })).toBe(80000.25);
    expect(cobradoDe({ cobros: [], senaMonto: null, senaAbonada: false })).toBe(0);
  });

  it("con la seña abonada, el saldo baja y al completar el total la orden queda Cobrada", () => {
    const cobrado = cobradoDe({ cobros: [{ monto: 60000 }], senaMonto: 40000, senaAbonada: true });
    expect(saldo(100000, cobrado)).toBe(0);
    expect(estadoSegunCobros({ estado: "INSTALADA", total: 100000, cobrado, facturada: false })).toBe("COBRADA");
  });

  it("si la seña vuelve a pendiente, una orden Cobrada vuelve atrás", () => {
    const cobrado = cobradoDe({ cobros: [{ monto: 60000 }], senaMonto: 40000, senaAbonada: false });
    expect(estadoSegunCobros({ estado: "COBRADA", total: 100000, cobrado, facturada: true })).toBe("FACTURADA");
  });
});

describe("estadoSegunCobros", () => {
  const base = { total: 100000, cobrado: 0, facturada: false };

  it("con el trabajo hecho y todo cobrado, pasa a Cobrada", () => {
    expect(estadoSegunCobros({ ...base, estado: "INSTALADA", cobrado: 100000 })).toBe("COBRADA");
    expect(estadoSegunCobros({ ...base, estado: "FACTURADA", cobrado: 100000, facturada: true })).toBe("COBRADA");
  });

  it("antes de instalar no se cierra aunque esté todo pagado", () => {
    expect(estadoSegunCobros({ ...base, estado: "PEDIDO", cobrado: 100000 })).toBe("PEDIDO");
    expect(estadoSegunCobros({ ...base, estado: "TURNO_ASIGNADO", cobrado: 100000 })).toBe("TURNO_ASIGNADO");
  });

  it("una Cobrada a la que le falta plata vuelve a Facturada o a Instalada", () => {
    expect(estadoSegunCobros({ ...base, estado: "COBRADA", cobrado: 50000, facturada: true })).toBe("FACTURADA");
    expect(estadoSegunCobros({ ...base, estado: "COBRADA", cobrado: 50000 })).toBe("INSTALADA");
  });

  it("sin importe total no decide nada", () => {
    expect(estadoSegunCobros({ estado: "INSTALADA", total: null, cobrado: 30000, facturada: false })).toBe("INSTALADA");
  });

  it("una Cancelada sigue cancelada", () => {
    expect(estadoSegunCobros({ ...base, estado: "CANCELADA", cobrado: 100000 })).toBe("CANCELADA");
  });
});

describe("estadoSegunFactura", () => {
  it("con número de factura, una Instalada pasa a Facturada", () => {
    expect(estadoSegunFactura("INSTALADA", true)).toBe("FACTURADA");
  });

  it("si se borra el número, una Facturada vuelve a Instalada", () => {
    expect(estadoSegunFactura("FACTURADA", false)).toBe("INSTALADA");
  });

  it("no toca los demás estados", () => {
    expect(estadoSegunFactura("PEDIDO", true)).toBe("PEDIDO");
    expect(estadoSegunFactura("COBRADA", true)).toBe("COBRADA");
  });
});

describe("turno de la orden", () => {
  it("al completar el turno la orden queda Instalada", () => {
    expect(estadoTrasTurno("TURNO_ASIGNADO", "COMPLETADO")).toBe("INSTALADA");
    expect(estadoTrasTurno("PEDIDO", "COMPLETADO")).toBe("INSTALADA");
  });

  it("si el turno se cancela o no vino, vuelve a Pedido", () => {
    expect(estadoTrasTurno("TURNO_ASIGNADO", "CANCELADO")).toBe("PEDIDO");
    expect(estadoTrasTurno("TURNO_ASIGNADO", "AUSENTE")).toBe("PEDIDO");
  });

  it("no retrocede una orden que ya avanzó por su cuenta", () => {
    expect(estadoTrasTurno("FACTURADA", "COMPLETADO")).toBe("FACTURADA");
    expect(estadoTrasTurno("FACTURADA", "CANCELADO")).toBe("FACTURADA");
    expect(estadoTrasTurno("TURNO_ASIGNADO", "CONFIRMADO")).toBe("TURNO_ASIGNADO");
  });

  it("dar turno pasa a Turno asignado", () => {
    expect(estadoAlDarTurno("FALTA_PEDIR")).toBe("TURNO_ASIGNADO");
    expect(estadoAlDarTurno("PEDIDO")).toBe("TURNO_ASIGNADO");
  });

  it("se puede dar turno antes de instalar y sin otro turno vigente", () => {
    expect(puedeDarTurno("PEDIDO", null)).toBe(true);
    expect(puedeDarTurno("TURNO_ASIGNADO", "CANCELADO")).toBe(true);
    expect(puedeDarTurno("TURNO_ASIGNADO", "CONFIRMADO")).toBe(false);
    expect(puedeDarTurno("INSTALADA", null)).toBe(false);
    expect(puedeDarTurno("CANCELADA", null)).toBe(false);
  });
});

describe("cambio de estado a mano", () => {
  it("Cobrada no se elige a mano", () => {
    expect(motivoCambioNoPermitido("FACTURADA", "COBRADA")).toMatch(/cobro/);
  });

  it("una Cobrada no cambia de estado", () => {
    expect(motivoCambioNoPermitido("COBRADA", "INSTALADA")).toMatch(/cobrada/i);
  });

  it("los demás cambios se permiten, también reabrir una Cancelada", () => {
    expect(motivoCambioNoPermitido("FALTA_PEDIR", "PEDIDO")).toBeNull();
    expect(motivoCambioNoPermitido("CANCELADA", "PEDIDO")).toBeNull();
    expect(motivoCambioNoPermitido("INSTALADA", "CANCELADA")).toBeNull();
  });
});

describe("diasEntre", () => {
  it("cuenta días corridos entre dos fechas", () => {
    expect(diasEntre("2026-09-14", "2026-10-14")).toBe(30);
    expect(diasEntre("2026-10-14", "2026-10-14")).toBe(0);
  });
});

describe("agruparCobranzas", () => {
  const orden = (o: Partial<OrdenACobrar>): OrdenACobrar => ({
    id: "o",
    numero: 1,
    tipo: "SEGURO",
    aseguradora: { id: "a1", nombre: "La Segunda" },
    patente: null,
    siniestro: null,
    total: 100000,
    cobrado: 0,
    facturaNumero: null,
    facturaFecha: null,
    recibidaEl: "2026-09-01",
    ...o,
  });

  it("agrupa por aseguradora y junta a los particulares", () => {
    const { grupos } = agruparCobranzas(
      [
        orden({ id: "1", aseguradora: { id: "a1", nombre: "La Segunda" }, total: 100000 }),
        orden({ id: "2", aseguradora: { id: "a2", nombre: "Sancor" }, total: 300000 }),
        orden({ id: "3", aseguradora: { id: "a1", nombre: "La Segunda" }, total: 50000, cobrado: 20000 }),
        orden({ id: "4", tipo: "PARTICULAR", aseguradora: null, total: 80000 }),
      ],
      "2026-10-14",
    );
    expect(grupos.map((g) => [g.nombre, g.saldo, g.ordenes.length])).toEqual([
      ["Sancor", 300000, 1],
      ["La Segunda", 130000, 2],
      ["Particulares", 80000, 1],
    ]);
  });

  it("cuenta los días desde la factura o, si no hay, desde la recepción, y ordena por antigüedad", () => {
    const { grupos } = agruparCobranzas(
      [
        orden({ id: "nueva", facturaFecha: "2026-10-04" }),
        orden({ id: "vieja", facturaFecha: "2026-09-04" }),
        orden({ id: "sin-factura", recibidaEl: "2026-09-24" }),
      ],
      "2026-10-14",
    );
    expect(grupos[0].ordenes.map((o) => [o.id, o.dias, o.desdeFactura])).toEqual([
      ["vieja", 40, true],
      ["sin-factura", 20, false],
      ["nueva", 10, true],
    ]);
    expect(grupos[0].masAntigua).toBe(40);
  });

  it("deja aparte las que no tienen importe y no muestra las saldadas", () => {
    const { grupos, sinImporte } = agruparCobranzas(
      [orden({ id: "sin", total: null }), orden({ id: "saldada", total: 1000, cobrado: 1000 })],
      "2026-10-14",
    );
    expect(grupos).toEqual([]);
    expect(sinImporte.map((o) => o.id)).toEqual(["sin"]);
  });

  it("un seguro sin aseguradora cargada va a su propio grupo", () => {
    const { grupos } = agruparCobranzas([orden({ aseguradora: null })], "2026-10-14");
    expect(grupos[0].nombre).toBe("Seguro sin aseguradora");
  });
});
