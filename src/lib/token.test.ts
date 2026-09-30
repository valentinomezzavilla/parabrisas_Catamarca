import { describe, expect, it } from "vitest";
import { DURACION_SESION_SEGUNDOS, firmarToken, obtenerSecreto, verificarToken } from "./token";

const SECRETO = obtenerSecreto("a".repeat(40));
const OTRO_SECRETO = obtenerSecreto("b".repeat(40));
const AHORA = Date.UTC(2026, 9, 1, 12, 0, 0);
const base64url = (texto: string) => Buffer.from(texto).toString("base64url");

describe("obtenerSecreto", () => {
  it("falla con un mensaje claro si falta o es corto", () => {
    expect(() => obtenerSecreto(undefined)).toThrow(/SESSION_SECRET/);
    expect(() => obtenerSecreto("")).toThrow(/SESSION_SECRET/);
    expect(() => obtenerSecreto("x".repeat(31))).toThrow(/32 caracteres/);
  });

  it("acepta 32 caracteres o más", () => {
    expect(obtenerSecreto("x".repeat(32))).toBeInstanceOf(Uint8Array);
  });
});

describe("firmarToken / verificarToken", () => {
  it("devuelve el id del usuario con un token válido", async () => {
    const token = await firmarToken("usuario-1", SECRETO, AHORA);
    expect(await verificarToken(token, SECRETO, AHORA + 1000)).toBe("usuario-1");
  });

  it("sigue válido justo antes de las 8 horas y vence después", async () => {
    const token = await firmarToken("usuario-1", SECRETO, AHORA);
    const limite = AHORA + DURACION_SESION_SEGUNDOS * 1000;
    expect(await verificarToken(token, SECRETO, limite - 1000)).toBe("usuario-1");
    expect(await verificarToken(token, SECRETO, limite + 1000)).toBeNull();
  });

  it("rechaza un token firmado con otra clave", async () => {
    const token = await firmarToken("usuario-1", OTRO_SECRETO, AHORA);
    expect(await verificarToken(token, SECRETO, AHORA)).toBeNull();
  });

  it("rechaza un token con el contenido alterado", async () => {
    const token = await firmarToken("usuario-1", SECRETO, AHORA);
    const [cabecera, , firma] = token.split(".");
    const falso = base64url(JSON.stringify({ sub: "admin-falso", exp: Math.floor(AHORA / 1000) + 3600 }));
    expect(await verificarToken(`${cabecera}.${falso}.${firma}`, SECRETO, AHORA)).toBeNull();
  });

  it('rechaza un token sin firma con alg "none"', async () => {
    const cabecera = base64url(JSON.stringify({ alg: "none", typ: "JWT" }));
    const cuerpo = base64url(JSON.stringify({ sub: "usuario-1", exp: Math.floor(AHORA / 1000) + 3600 }));
    expect(await verificarToken(`${cabecera}.${cuerpo}.`, SECRETO, AHORA)).toBeNull();
    expect(await verificarToken(`${cabecera}.${cuerpo}`, SECRETO, AHORA)).toBeNull();
  });

  it("devuelve null, sin lanzar, ante valores que no son un token", async () => {
    for (const valor of [undefined, "", "basura", "a.b.c", "....", " "]) {
      expect(await verificarToken(valor, SECRETO, AHORA)).toBeNull();
    }
  });
});
