import { describe, expect, it } from "vitest";
import { servicioSchema, type ServicioInput } from "./schemas";

const base: ServicioInput = {
  nombre: "Colocación de vidrios",
  duracionMinutos: 120,
  horarios: [{ diaSemana: 1, desde: "08:30", hasta: "12:30" }],
};

describe("servicioSchema con horarios fijos", () => {
  it("guarda cada hora fija como un horario de inicio y fin iguales", () => {
    const r = servicioSchema.parse({
      ...base,
      horariosFijos: true,
      horarios: undefined,
      horasFijas: [
        { diaSemana: 1, hora: "09:00" },
        { diaSemana: 1, hora: "14:00" },
      ],
    });
    expect(r.horariosFijos).toBe(true);
    expect(r.horarios).toEqual([
      { diaSemana: 1, horaInicio: 540, horaFin: 540 },
      { diaSemana: 1, horaInicio: 840, horaFin: 840 },
    ]);
    expect(r).not.toHaveProperty("horasFijas");
  });

  it("exige al menos una hora y no admite horas repetidas en el mismo día", () => {
    const sinHoras = servicioSchema.safeParse({ ...base, horariosFijos: true, horarios: undefined, horasFijas: [] });
    expect(sinHoras.success).toBe(false);
    expect(sinHoras.error?.issues[0].path).toEqual(["horasFijas"]);

    const repetidas = servicioSchema.safeParse({
      ...base,
      horariosFijos: true,
      horarios: undefined,
      horasFijas: [
        { diaSemana: 1, hora: "09:00" },
        { diaSemana: 1, hora: "09:00" },
      ],
    });
    expect(repetidas.success).toBe(false);
  });

  it("no compara la duración con las franjas: una hora fija no tiene cierre", () => {
    const r = servicioSchema.safeParse({ ...base, duracionMinutos: 480, horariosFijos: true, horarios: undefined, horasFijas: [{ diaSemana: 1, hora: "09:00" }] });
    expect(r.success).toBe(true);
  });

  it("con franjas sigue exigiendo al menos una franja", () => {
    expect(servicioSchema.safeParse({ ...base, horarios: [] }).success).toBe(false);
    expect(servicioSchema.parse(base).horariosFijos).toBe(false);
  });
});

describe("servicioSchema: vehículos a la vez", () => {
  it("acepta un número o null (sin límite)", () => {
    expect(servicioSchema.parse({ ...base, capacidad: 5 }).capacidad).toBe(5);
    expect(servicioSchema.parse({ ...base, capacidad: null }).capacidad).toBeNull();
    expect(servicioSchema.parse(base).capacidad).toBe(1);
    expect(servicioSchema.safeParse({ ...base, capacidad: 0 }).success).toBe(false);
  });
});
