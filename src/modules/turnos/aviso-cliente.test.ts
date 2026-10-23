import { describe, expect, it } from "vitest";
import { mensajeAvisoTurno, numeroWhatsappCliente } from "./aviso-cliente";

describe("numeroWhatsappCliente", () => {
  it.each([
    ["3834923578", "5493834923578"],
    ["383 492-3578", "5493834923578"],
    ["+54 9 383 492 3578", "5493834923578"],
    ["54 383 4923578", "5493834923578"],
    ["0383 4923578", "5493834923578"],
    ["0383 15 4923578", "5493834923578"],
    ["383 15-4923578", "5493834923578"],
    ["4923578", "5493834923578"],
    ["15 4923578", "5493834923578"],
    ["011 15 2345-6789", "5491123456789"],
    ["(11) 2345-6789", "5491123456789"],
    ["+52 1 55 2525 9763", "5215525259763"],
    ["+1 202 555 0143", "12025550143"],
  ])("%s → %s", (entrada, esperado) => {
    expect(numeroWhatsappCliente(entrada)).toBe(esperado);
  });

  it("devuelve null si no parece un teléfono argentino", () => {
    expect(numeroWhatsappCliente("123456")).toBeNull();
    expect(numeroWhatsappCliente("sin teléfono")).toBeNull();
    expect(numeroWhatsappCliente("+12")).toBeNull();
  });
});

describe("mensajeAvisoTurno", () => {
  const datos = { nombre: "Ana Pérez", servicio: "Colocación", dia: "lunes 5 de octubre", hora: "09:30", codigo: "ABC123", senaPendiente: "$ 2.000", alias: "parabrisas.cat", titular: "Juan Gómez" };

  it("avisa que el turno quedó confirmado", () => {
    const m = mensajeAvisoTurno("CONFIRMADO", datos)!;
    expect(m).toContain("Hola Ana!");
    expect(m).toContain("quedó confirmado para el lunes 5 de octubre a las 09:30 hs");
  });

  it("si espera la transferencia, pide la seña y el comprobante", () => {
    const m = mensajeAvisoTurno("ESPERANDO_PAGO", datos)!;
    expect(m).toContain("código ABC123");
    expect(m).toContain("seña de $ 2.000");
    expect(m).toContain("comprobante");
  });

  it("si espera la transferencia, pasa el alias y el nombre de la cuenta", () => {
    const m = mensajeAvisoTurno("ESPERANDO_PAGO", datos)!;
    expect(m).toContain("Alias: parabrisas.cat");
    expect(m).toContain("A nombre de: Juan Gómez");
  });

  it("sin datos de la cuenta cargados, no deja renglones vacíos", () => {
    const m = mensajeAvisoTurno("ESPERANDO_PAGO", { ...datos, alias: null, titular: null })!;
    expect(m).not.toContain("Alias");
    expect(m).not.toContain("A nombre de");
  });

  it("los turnos que no esperan la seña no llevan los datos de la cuenta", () => {
    for (const estado of ["CONFIRMADO", "PENDIENTE"]) expect(mensajeAvisoTurno(estado, datos)).not.toContain("parabrisas.cat");
  });

  it("si la seña no está cargada, igual pide la seña", () => {
    expect(mensajeAvisoTurno("ESPERANDO_PAGO", { ...datos, senaPendiente: null })).toContain("necesitamos la seña.");
  });

  it("si está pendiente, pide que confirme asistencia", () => {
    expect(mensajeAvisoTurno("PENDIENTE", datos)).toContain("Nos confirmás que vas a venir?");
  });

  it("no hay aviso para los estados cerrados o en curso", () => {
    for (const estado of ["EN_CURSO", "COMPLETADO", "CANCELADO", "AUSENTE"]) expect(mensajeAvisoTurno(estado, datos)).toBeNull();
  });
});
