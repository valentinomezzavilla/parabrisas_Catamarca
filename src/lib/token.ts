import { jwtVerify, SignJWT } from "jose";

// Sin Prisma ni Express: solo firma y verifica el token (se prueba solo).

export const NOMBRE_COOKIE = "sesion";
export const DURACION_SESION_SEGUNDOS = 8 * 60 * 60;

const LARGO_MINIMO_SECRETO = 32;

export function obtenerSecreto(valor: string | undefined = process.env.SESSION_SECRET): Uint8Array {
  if (!valor || valor.length < LARGO_MINIMO_SECRETO) {
    throw new Error(
      `SESSION_SECRET falta o tiene menos de ${LARGO_MINIMO_SECRETO} caracteres. ` +
        `Generá una con: node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`,
    );
  }
  return new TextEncoder().encode(valor);
}

/** El token solo identifica al usuario; el rol y el estado se leen siempre de la base. */
export async function firmarToken(usuarioId: string, secreto: Uint8Array, ahoraMs = Date.now()): Promise<string> {
  const emitido = Math.floor(ahoraMs / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(usuarioId)
    .setIssuedAt(emitido)
    .setExpirationTime(emitido + DURACION_SESION_SEGUNDOS)
    .sign(secreto);
}

/** Id del usuario si el token es válido y no venció; `null` en cualquier otro caso. */
export async function verificarToken(
  token: string | undefined,
  secreto: Uint8Array,
  ahoraMs = Date.now(),
): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secreto, { algorithms: ["HS256"], currentDate: new Date(ahoraMs) });
    return typeof payload.sub === "string" && payload.sub !== "" ? payload.sub : null;
  } catch {
    return null;
  }
}
