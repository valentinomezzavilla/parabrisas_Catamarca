import { describe, expect, it } from "vitest";
import { motivoDeRechazo, rolAlcanza, type UsuarioBasico } from "./reglas";

const admin = (id: string, activo = true): UsuarioBasico => ({ id, rol: "ADMIN", activo });
const empleado = (id: string, activo = true): UsuarioBasico => ({ id, rol: "EMPLEADO", activo });

describe("rolAlcanza", () => {
  it("el Admin alcanza cualquier rol y el Empleado solo el suyo", () => {
    expect(rolAlcanza("ADMIN", "ADMIN")).toBe(true);
    expect(rolAlcanza("ADMIN", "EMPLEADO")).toBe(true);
    expect(rolAlcanza("EMPLEADO", "EMPLEADO")).toBe(true);
    expect(rolAlcanza("EMPLEADO", "ADMIN")).toBe(false);
  });
});

describe("motivoDeRechazo", () => {
  it("no deja que alguien cambie su propio rol", () => {
    const yo = admin("a");
    expect(motivoDeRechazo(yo, yo, { tipo: "rol", rol: "EMPLEADO" }, 2)).toMatch(/propio rol/);
  });

  it("no deja que alguien desactive su propia cuenta", () => {
    const yo = admin("a");
    expect(motivoDeRechazo(yo, yo, { tipo: "activo", activo: false }, 2)).toMatch(/propia cuenta/);
  });

  it("no deja sin administradores activos: ni por degradación ni por desactivación", () => {
    const actor = admin("a");
    const ultimo = admin("b");
    expect(motivoDeRechazo(actor, ultimo, { tipo: "rol", rol: "EMPLEADO" }, 1)).toMatch(/al menos un administrador/);
    expect(motivoDeRechazo(actor, ultimo, { tipo: "activo", activo: false }, 1)).toMatch(/al menos un administrador/);
  });

  it("permite degradar o desactivar a un Admin si queda otro activo", () => {
    const actor = admin("a");
    expect(motivoDeRechazo(actor, admin("b"), { tipo: "rol", rol: "EMPLEADO" }, 2)).toBeNull();
    expect(motivoDeRechazo(actor, admin("b"), { tipo: "activo", activo: false }, 2)).toBeNull();
  });

  it("permite desactivar o ascender a un Empleado aunque haya un solo Admin", () => {
    const actor = admin("a");
    expect(motivoDeRechazo(actor, empleado("e"), { tipo: "activo", activo: false }, 1)).toBeNull();
    expect(motivoDeRechazo(actor, empleado("e"), { tipo: "rol", rol: "ADMIN" }, 1)).toBeNull();
  });

  it("un Admin ya inactivo no cuenta como administrador activo", () => {
    const actor = admin("a");
    const inactivo = admin("b", false);
    expect(motivoDeRechazo(actor, inactivo, { tipo: "rol", rol: "EMPLEADO" }, 1)).toBeNull();
  });

  it("un cambio que no cambia nada es válido (ni siquiera sobre uno mismo)", () => {
    const yo = admin("a");
    expect(motivoDeRechazo(yo, yo, { tipo: "rol", rol: "ADMIN" }, 1)).toBeNull();
    expect(motivoDeRechazo(yo, yo, { tipo: "activo", activo: true }, 1)).toBeNull();
  });

  it("reactivar a un usuario siempre se permite", () => {
    expect(motivoDeRechazo(admin("a"), empleado("e", false), { tipo: "activo", activo: true }, 1)).toBeNull();
  });
});
