import { describe, expect, it } from "vitest";
import { crearUsuarioSchema, loginSchema, passwordSchema, resetPasswordSchema, rolSchema } from "./schemas";

describe("loginSchema", () => {
  it("normaliza el usuario: sin espacios y en minúsculas", () => {
    const r = loginSchema.parse({ usuario: "  Admin.Demo ", password: "x" });
    expect(r.usuario).toBe("admin.demo");
    expect(loginSchema.parse({ usuario: "  Admin@Local.COM ", password: "x" }).usuario).toBe("admin@local.com");
  });

  it("rechaza usuario inválido o faltante y contraseña vacía", () => {
    for (const malo of ["ab", "con espacios", "ñandú", "-empieza-mal", "a".repeat(61), ""]) {
      expect(loginSchema.safeParse({ usuario: malo, password: "x" }).success).toBe(false);
    }
    expect(loginSchema.safeParse({ usuario: undefined, password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ usuario: "admin.demo", password: "" }).success).toBe(false);
  });

  it("no recorta la contraseña", () => {
    expect(loginSchema.parse({ usuario: "admin.demo", password: "  hola  " }).password).toBe("  hola  ");
  });
});

describe("passwordSchema", () => {
  it("exige entre 10 y 128 caracteres", () => {
    expect(passwordSchema.safeParse("a".repeat(9)).success).toBe(false);
    expect(passwordSchema.safeParse("a".repeat(10)).success).toBe(true);
    expect(passwordSchema.safeParse("a".repeat(128)).success).toBe(true);
    expect(passwordSchema.safeParse("a".repeat(129)).success).toBe(false);
  });

  it("conserva los espacios del borde", () => {
    expect(passwordSchema.parse("  abcdef  ")).toBe("  abcdef  ");
  });
});

describe("crearUsuarioSchema", () => {
  const valido = { nombre: "  Ana Pérez ", usuario: " Ana.Perez", password: "clave-larga-123", rol: "EMPLEADO" };

  it("acepta un usuario válido y normaliza nombre y usuario", () => {
    const r = crearUsuarioSchema.parse(valido);
    expect(r.nombre).toBe("Ana Pérez");
    expect(r.usuario).toBe("ana.perez");
  });

  it("rechaza un rol inexistente y un nombre vacío", () => {
    expect(crearUsuarioSchema.safeParse({ ...valido, rol: "SUPERADMIN" }).success).toBe(false);
    expect(crearUsuarioSchema.safeParse({ ...valido, nombre: "   " }).success).toBe(false);
  });

  it("marca el campo password cuando es corta", () => {
    const r = crearUsuarioSchema.safeParse({ ...valido, password: "corta" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["password"]);
  });
});

describe("rolSchema / resetPasswordSchema", () => {
  it("rolSchema solo admite ADMIN y EMPLEADO", () => {
    expect(rolSchema.safeParse("ADMIN").success).toBe(true);
    expect(rolSchema.safeParse("EMPLEADO").success).toBe(true);
    expect(rolSchema.safeParse("admin").success).toBe(false);
  });

  it("resetPasswordSchema aplica las mismas reglas de contraseña", () => {
    expect(resetPasswordSchema.safeParse({ password: "corta" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ password: "una-clave-larga" }).success).toBe(true);
  });
});
