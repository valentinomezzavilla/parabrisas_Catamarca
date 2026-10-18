import { describe, expect, it } from "vitest";
import { cumpleanosProximos, cumpleEnVentana, edadEn, fechaDeCumple } from "./cumpleanos";

describe("fechaDeCumple", () => {
  it("mantiene el día y el mes en el año que se pide", () => {
    expect(fechaDeCumple("1990-10-22", 2026)).toBe("2026-10-22");
  });

  it("el 29 de febrero se festeja el 28 en los años que no son bisiestos", () => {
    expect(fechaDeCumple("2000-02-29", 2027)).toBe("2027-02-28");
    expect(fechaDeCumple("2000-02-29", 2028)).toBe("2028-02-29");
    expect(fechaDeCumple("2000-02-29", 2100)).toBe("2100-02-28");
  });
});

describe("cumpleEnVentana", () => {
  it("hoy", () => {
    expect(cumpleEnVentana("1990-10-18", "2026-10-18")).toEqual({ fecha: "2026-10-18", diasFaltan: 0, edad: 36 });
  });

  it("dentro de los próximos días", () => {
    expect(cumpleEnVentana("1985-10-22", "2026-10-18")).toEqual({ fecha: "2026-10-22", diasFaltan: 4, edad: 41 });
    expect(cumpleEnVentana("1985-10-25", "2026-10-18")?.diasFaltan).toBe(7);
  });

  it("fuera de la ventana: lo que falta más de 7 días y lo que ya pasó", () => {
    expect(cumpleEnVentana("1985-10-26", "2026-10-18")).toBeNull();
    expect(cumpleEnVentana("1985-10-17", "2026-10-18")).toBeNull();
  });

  it("cruza el fin de año: el 28 de diciembre ya se avisa del 2 de enero", () => {
    expect(cumpleEnVentana("1992-01-02", "2026-12-28")).toEqual({ fecha: "2027-01-02", diasFaltan: 5, edad: 35 });
  });

  it("el 29/02 se avisa el 28/02 en un año no bisiesto", () => {
    expect(cumpleEnVentana("2000-02-29", "2027-02-28")).toEqual({ fecha: "2027-02-28", diasFaltan: 0, edad: 27 });
    expect(cumpleEnVentana("2000-02-29", "2028-02-28")?.fecha).toBe("2028-02-29");
  });

  it("no avisa de alguien que todavía no cumplió su primer año", () => {
    expect(cumpleEnVentana("2026-10-20", "2026-10-18")).toBeNull();
  });

  it("la ventana es configurable", () => {
    expect(cumpleEnVentana("1985-10-26", "2026-10-18", 10)?.diasFaltan).toBe(8);
  });
});

describe("cumpleanosProximos", () => {
  const c = (nombre: string, fechaNacimiento: string) => ({ nombre, fechaNacimiento });

  it("ordena por cercanía y, a igual día, por nombre sin importar tildes", () => {
    const r = cumpleanosProximos(
      [c("Zoe", "1990-10-18"), c("Álvaro", "1980-10-18"), c("Beto", "1975-10-21"), c("Lejos", "1990-12-01"), c("Carla", "1999-10-19")],
      "2026-10-18",
    );
    expect(r.map((x) => [x.nombre, x.diasFaltan])).toEqual([
      ["Álvaro", 0],
      ["Zoe", 0],
      ["Carla", 1],
      ["Beto", 3],
    ]);
  });

  it("conserva el resto de los datos del cliente", () => {
    const [x] = cumpleanosProximos([{ id: "c1", nombre: "Ana", fechaNacimiento: "1990-10-18" }], "2026-10-18");
    expect(x).toMatchObject({ id: "c1", edad: 36 });
  });
});

describe("edadEn", () => {
  it("antes y después del cumpleaños", () => {
    expect(edadEn("1990-10-18", "2026-10-17")).toBe(35);
    expect(edadEn("1990-10-18", "2026-10-18")).toBe(36);
  });

  it("un 29/02 cumple el 28/02 en años comunes", () => {
    expect(edadEn("2000-02-29", "2027-02-27")).toBe(26);
    expect(edadEn("2000-02-29", "2027-02-28")).toBe(27);
  });
});
