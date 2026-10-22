import { describe, expect, it } from "vitest";
import { calcularDisponibilidad, type ConfigAgenda } from "./disponibilidad";

// 2026-10-05 es lunes. Hora local Catamarca = UTC-3.
const LUNES = "2026-10-05";
const DOMINGO = "2026-10-04";
const local = (hhmm: string, fecha = LUNES) => new Date(`${fecha}T${hhmm}:00-03:00`);
const horas = (slots: { inicio: Date }[]) =>
  slots.map((s) =>
    s.inicio.toLocaleTimeString("es-AR", {
      timeZone: "America/Argentina/Catamarca",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  );

const lavado: ConfigAgenda = {
  duracionMinutos: 60,
  intervaloMinutos: 60,
  margenMinutos: 0,
  capacidad: 1,
  anticipacionMinutos: 0,
  horarios: [
    { diaSemana: 1, horaInicio: 510, horaFin: 750 }, // 08:30–12:30
    { diaSemana: 1, horaInicio: 990, horaFin: 1200 }, // 16:30–20:00
  ],
};
const ANTES = new Date("2026-01-01T00:00:00Z");

describe("calcularDisponibilidad", () => {
  it("genera turnos dentro de un horario cortado, sin pasarse del cierre", () => {
    const slots = calcularDisponibilidad({ fecha: LUNES, servicio: lavado, ahora: ANTES });
    expect(horas(slots)).toEqual(["08:30", "09:30", "10:30", "11:30", "16:30", "17:30", "18:30"]);
    expect(slots[0].inicio.toISOString()).toBe("2026-10-05T11:30:00.000Z");
    expect(slots[0].fin.toISOString()).toBe("2026-10-05T12:30:00.000Z");
    expect(slots.every((s) => s.cuposLibres === 1)).toBe(true);
  });

  it("no ofrece turnos en días sin horario", () => {
    expect(calcularDisponibilidad({ fecha: DOMINGO, servicio: lavado, ahora: ANTES })).toEqual([]);
  });

  it("excluye los horarios ocupados y respeta el margen entre trabajos", () => {
    const slots = calcularDisponibilidad({
      fecha: LUNES,
      servicio: { ...lavado, intervaloMinutos: 30, margenMinutos: 15 },
      turnos: [{ inicio: local("09:30"), fin: local("10:30") }],
      ahora: ANTES,
    });
    // 08:30 termina 09:30 y necesita 15' de margen antes del turno de 09:30.
    // 10:30 choca con el margen del turno existente (que libera a las 10:45).
    expect(horas(slots).filter((h) => h < "12:00")).toEqual(["11:00", "11:30"]);
  });

  it("con capacidad > 1 cuenta la simultaneidad real, no la cantidad de turnos", () => {
    const slots = calcularDisponibilidad({
      fecha: LUNES,
      servicio: { ...lavado, capacidad: 2 },
      turnos: [
        { inicio: local("08:30"), fin: local("09:00") },
        { inicio: local("09:00"), fin: local("09:30") },
      ],
      ahora: ANTES,
    });
    // Ambos turnos caen en 08:30–09:30 pero nunca a la vez: queda 1 cupo.
    expect(slots[0].cuposLibres).toBe(1);
    expect(slots[1].cuposLibres).toBe(2);
  });

  it("aplica la anticipación mínima respecto de la hora actual", () => {
    const slots = calcularDisponibilidad({
      fecha: LUNES,
      servicio: { ...lavado, anticipacionMinutos: 60 },
      ahora: local("09:45"),
    });
    expect(horas(slots)[0]).toBe("11:30");
  });

  it("respeta los bloqueos de agenda (feriados, cierres)", () => {
    const slots = calcularDisponibilidad({
      fecha: LUNES,
      servicio: lavado,
      bloqueos: [{ inicio: local("00:00"), fin: local("14:00") }],
      ahora: ANTES,
    });
    expect(horas(slots)).toEqual(["16:30", "17:30", "18:30"]);
  });
});

describe("calcularDisponibilidad con horarios fijos", () => {
  // Colocación: solo se ofrecen las 09:00 y las 14:00; cada horario es una hora de inicio.
  const colocacion: ConfigAgenda = {
    ...lavado,
    duracionMinutos: 120,
    horariosFijos: true,
    horarios: [
      { diaSemana: 1, horaInicio: 840, horaFin: 840 }, // 14:00
      { diaSemana: 1, horaInicio: 540, horaFin: 540 }, // 09:00
    ],
  };

  it("ofrece solo las horas cargadas, ordenadas, con el fin según la duración", () => {
    const slots = calcularDisponibilidad({ fecha: LUNES, servicio: colocacion, ahora: ANTES });
    expect(horas(slots)).toEqual(["09:00", "14:00"]);
    expect(slots[0].fin.getTime() - slots[0].inicio.getTime()).toBe(120 * 60_000);
  });

  it("respeta la capacidad: un horario lleno deja de ofrecerse", () => {
    const slots = calcularDisponibilidad({
      fecha: LUNES,
      servicio: colocacion,
      turnos: [{ inicio: local("09:00"), fin: local("11:00") }],
      ahora: ANTES,
    });
    expect(horas(slots)).toEqual(["14:00"]);
  });

  it("aplica la anticipación y los bloqueos igual que con franjas", () => {
    const conAnticipacion = calcularDisponibilidad({ fecha: LUNES, servicio: { ...colocacion, anticipacionMinutos: 60 }, ahora: local("08:30") });
    expect(horas(conAnticipacion)).toEqual(["14:00"]);
    const bloqueado = calcularDisponibilidad({
      fecha: LUNES,
      servicio: colocacion,
      bloqueos: [{ inicio: local("13:00"), fin: local("18:00") }],
      ahora: ANTES,
    });
    expect(horas(bloqueado)).toEqual(["09:00"]);
  });
});

describe("calcularDisponibilidad sin límite de vehículos", () => {
  it("un horario sigue ofreciéndose por más turnos que tenga", () => {
    const turnos = Array.from({ length: 30 }, () => ({ inicio: local("08:30"), fin: local("09:30") }));
    const slots = calcularDisponibilidad({ fecha: LUNES, servicio: { ...lavado, capacidad: null }, turnos, ahora: ANTES });
    expect(horas(slots)[0]).toBe("08:30");
    expect(slots[0].cuposLibres).toBeNull();
  });
});
