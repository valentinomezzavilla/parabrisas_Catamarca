import { Prisma } from "@/generated/prisma/client";
import type { z } from "zod";

/** Cuerpo de un formulario HTML ya parseado (`express.urlencoded`): un valor o, si el campo se repite, una lista. */
export type Cuerpo = Record<string, unknown>;

/** Errores de validación por campo, indexados por su ruta ("horarios.2.hasta"). */
export type Errores = Record<string, string>;

/** Primer error de cada campo, indexado por su ruta. */
export function erroresDeZod(error: z.ZodError): Errores {
  const errores: Errores = {};
  for (const issue of error.issues) {
    const clave = issue.path.join(".") || "_";
    errores[clave] ??= issue.message;
  }
  return errores;
}

/** Violación de un índice único (ej. código de cristal repetido). */
export function esDuplicado(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

// --- Lectura del cuerpo ------------------------------------------------------

/** Valor tal cual llegó (sin recortar), o undefined. Si el campo vino repetido, el primero. */
export function crudo(cuerpo: Cuerpo, campo: string): string | undefined {
  const v = cuerpo[campo];
  const primero = Array.isArray(v) ? v[0] : v;
  return typeof primero === "string" ? primero : undefined;
}

export function texto(cuerpo: Cuerpo, campo: string): string | undefined {
  const v = crudo(cuerpo, campo);
  return v !== undefined && v.trim() !== "" ? v.trim() : undefined;
}

/** Número o undefined si el campo está vacío. Un valor no numérico llega como NaN y lo rechaza Zod. */
export function numero(cuerpo: Cuerpo, campo: string): number | undefined {
  const v = texto(cuerpo, campo);
  return v === undefined ? undefined : Number(v.replace(",", "."));
}

/** Una casilla tildada envía "on"; sin tildar no viaja. */
export function casilla(cuerpo: Cuerpo, campo: string): boolean {
  return crudo(cuerpo, campo) === "on";
}

/** Todos los valores de un campo que se repite (filas de una lista), en el orden del formulario. */
export function lista(cuerpo: Cuerpo, campo: string): string[] {
  const v = cuerpo[campo];
  const valores = Array.isArray(v) ? v : v === undefined ? [] : [v];
  return valores.filter((x): x is string => typeof x === "string");
}

/** Campos propios: cada control `extra_<clave>` del formulario. Las casillas sin tildar no llegan. */
export function leerExtras(cuerpo: Cuerpo): Record<string, unknown> {
  const extras: Record<string, unknown> = {};
  for (const clave of Object.keys(cuerpo)) {
    const valor = crudo(cuerpo, clave);
    if (clave.startsWith("extra_") && valor !== undefined) extras[clave] = valor;
  }
  return extras;
}
