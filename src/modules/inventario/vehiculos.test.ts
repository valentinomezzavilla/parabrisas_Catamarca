import { describe, expect, it } from "vitest";
import { buscarModelo, nombreVehiculo } from "./vehiculos";

const marcas = [
  { nombre: "Toyota", modelos: [{ id: "hilux", nombre: "Hilux" }, { id: "corolla", nombre: "Corolla" }] },
  { nombre: "Citroën", modelos: [{ id: "c3", nombre: "C3" }] },
  { nombre: "RAM", modelos: [{ id: "ram-1500", nombre: "1500" }] },
  { nombre: "Chevrolet", modelos: [{ id: "chevrolet-1500", nombre: "1500" }] },
];

describe("buscarModelo", () => {
  it("encuentra la marca y el modelo escritos como en la lista", () => {
    expect(buscarModelo("Toyota Hilux", marcas)).toBe("hilux");
  });

  it("no distingue mayúsculas, tildes ni espacios de más", () => {
    expect(buscarModelo("  toyota   COROLLA ", marcas)).toBe("corolla");
    expect(buscarModelo("citroen c3", marcas)).toBe("c3");
  });

  it("acepta solo el modelo cuando no hay otro con ese nombre", () => {
    expect(buscarModelo("hilux", marcas)).toBe("hilux");
  });

  it("no adivina si el modelo solo se repite en varias marcas", () => {
    expect(buscarModelo("1500", marcas)).toBeUndefined();
    expect(buscarModelo("RAM 1500", marcas)).toBe("ram-1500");
  });

  it("no encuentra lo que no está en la lista", () => {
    expect(buscarModelo("Toyota Supra", marcas)).toBeUndefined();
    expect(buscarModelo("", marcas)).toBeUndefined();
  });
});

describe("nombreVehiculo", () => {
  it("une marca y modelo", () => {
    expect(nombreVehiculo("Peugeot", "208")).toBe("Peugeot 208");
  });
});
