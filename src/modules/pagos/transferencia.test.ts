import { describe, expect, it } from "vitest";
import { enlaceWhatsapp, leerDatosTransferencia, mensajeSena } from "./transferencia";

describe("leerDatosTransferencia", () => {
  it("toma los datos de la cuenta y deja solo los dígitos del WhatsApp", () => {
    expect(
      leerDatosTransferencia({
        TRANSFERENCIA_ALIAS: " parabrisas.cat ",
        TRANSFERENCIA_CBU: "0000003100000000000001",
        TRANSFERENCIA_TITULAR: "Parabrisas Catamarca",
        WHATSAPP_LOCAL: "+54 9 383 412-3456",
      }),
    ).toEqual({ alias: "parabrisas.cat", cbu: "0000003100000000000001", titular: "Parabrisas Catamarca", whatsapp: "5493834123456" });
  });

  it("lo que no está cargado (o está vacío) queda en null", () => {
    expect(leerDatosTransferencia({ TRANSFERENCIA_ALIAS: "  ", WHATSAPP_LOCAL: "" })).toEqual({ alias: null, cbu: null, titular: null, whatsapp: null });
  });
});

describe("mensajeSena", () => {
  it("incluye el turno, el código y la seña", () => {
    const m = mensajeSena({ nombre: "Ana", servicio: "Colocación", dia: "lunes 5 de octubre", hora: "09:30", codigo: "ABC123", sena: "$ 2.000" });
    expect(m).toContain("Soy Ana");
    expect(m).toContain("Colocación para el lunes 5 de octubre a las 09:30 hs");
    expect(m).toContain("Código de reserva: ABC123");
    expect(m).toContain("seña de $ 2.000");
  });
});

describe("enlaceWhatsapp", () => {
  it("arma el enlace wa.me con el mensaje codificado", () => {
    expect(enlaceWhatsapp("+54 9 383 4123456", "Hola & chau\nsí")).toBe("https://wa.me/5493834123456?text=Hola%20%26%20chau%0As%C3%AD");
  });
});
