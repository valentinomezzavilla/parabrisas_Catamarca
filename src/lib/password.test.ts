import { describe, expect, it } from "vitest";
import { hashearPassword, hashFicticio, verificarPassword } from "./password";

describe("hashearPassword / verificarPassword", () => {
  it("verifica la contraseña correcta y rechaza la incorrecta", async () => {
    const hash = await hashearPassword("clave-segura-123");
    expect(await verificarPassword("clave-segura-123", hash)).toBe(true);
    expect(await verificarPassword("clave-segura-124", hash)).toBe(false);
  });

  it("genera un hash distinto cada vez (sal aleatoria)", async () => {
    const a = await hashearPassword("misma-clave-123");
    const b = await hashearPassword("misma-clave-123");
    expect(a).not.toBe(b);
  });

  it("tiene el formato scrypt$sal$clave", async () => {
    const hash = await hashearPassword("clave-segura-123");
    expect(hash.split("$")).toHaveLength(3);
    expect(hash.startsWith("scrypt$")).toBe(true);
  });

  it("soporta $, tildes, ñ y espacios en la contraseña", async () => {
    for (const clave of ["pa$$word$$1234", "contraseña-ñandú-ü", "  con espacios  "]) {
      const hash = await hashearPassword(clave);
      expect(await verificarPassword(clave, hash)).toBe(true);
      expect(await verificarPassword(clave.trim() + "x", hash)).toBe(false);
    }
  });

  it("no acepta la contraseña vacía contra un hash válido", async () => {
    const hash = await hashearPassword("clave-segura-123");
    expect(await verificarPassword("", hash)).toBe(false);
  });

  it("devuelve false, sin lanzar, ante un hash con formato inválido", async () => {
    const valido = await hashearPassword("clave-segura-123");
    const [, sal, clave] = valido.split("$");
    const invalidos = [
      "",
      "abc",
      "scrypt$solo-una-parte",
      `bcrypt$${sal}$${clave}`,
      `scrypt$${sal}$${clave}$extra`,
      `scrypt$${sal}$${clave.slice(0, 10)}`, // clave truncada
      `scrypt$$`,
    ];
    for (const almacenado of invalidos) {
      expect(await verificarPassword("clave-segura-123", almacenado)).toBe(false);
    }
  });
});

describe("hashFicticio", () => {
  it("es un hash con formato válido y siempre el mismo dentro del proceso", async () => {
    const a = await hashFicticio();
    const b = await hashFicticio();
    expect(a).toBe(b);
    expect(a.split("$")).toHaveLength(3);
    expect(await verificarPassword("cualquier-cosa", a)).toBe(false);
  });
});
