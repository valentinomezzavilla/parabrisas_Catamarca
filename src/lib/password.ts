import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const PREFIJO = "scrypt";
const LARGO_CLAVE = 64;
const LARGO_SAL = 16;

const derivar = (password: string, sal: Buffer) =>
  new Promise<Buffer>((ok, fallo) =>
    scrypt(password, sal, LARGO_CLAVE, (error, clave) => (error ? fallo(error) : ok(clave))),
  );

/** Formato guardado en la base: `scrypt$<sal en base64>$<clave en base64>`. */
export async function hashearPassword(password: string): Promise<string> {
  const sal = randomBytes(LARGO_SAL);
  const clave = await derivar(password, sal);
  return `${PREFIJO}$${sal.toString("base64")}$${clave.toString("base64")}`;
}

/** Nunca lanza: un hash con formato inesperado simplemente no coincide. */
export async function verificarPassword(password: string, almacenado: string): Promise<boolean> {
  const [prefijo, salB64, claveB64, ...resto] = almacenado.split("$");
  if (prefijo !== PREFIJO || !salB64 || !claveB64 || resto.length > 0) return false;

  const esperada = Buffer.from(claveB64, "base64");
  if (esperada.length !== LARGO_CLAVE) return false;

  const obtenida = await derivar(password, Buffer.from(salB64, "base64"));
  return timingSafeEqual(obtenida, esperada);
}

let ficticio: Promise<string> | undefined;

/**
 * Hash válido de una clave al azar. Se verifica contra él cuando el usuario no existe,
 * para que el login tarde lo mismo y no revele qué cuentas existen.
 */
export function hashFicticio(): Promise<string> {
  return (ficticio ??= hashearPassword(randomBytes(16).toString("hex")));
}
