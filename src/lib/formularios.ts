import { Prisma } from "@/generated/prisma/client";
import type { z } from "zod";

/** Resultado que devuelven las Server Actions a los formularios (useActionState). */
export interface EstadoFormulario {
  ok: boolean;
  mensaje?: string;
  errores?: Record<string, string>; // clave = ruta del campo ("horarios.2.hasta")
}

/** Resultado de una acción que puede pedir confirmación: `afectados` = registros cuyos datos se borrarían. */
export interface EstadoConConteo extends EstadoFormulario {
  afectados?: number;
}

export const ESTADO_INICIAL: EstadoFormulario = { ok: false };

/** Primer error de cada campo, indexado por su ruta. */
export function erroresDeZod(error: z.ZodError): Record<string, string> {
  const errores: Record<string, string> = {};
  for (const issue of error.issues) {
    const clave = issue.path.join(".") || "_";
    errores[clave] ??= issue.message;
  }
  return errores;
}

export function fallo(errores: Record<string, string>, mensaje = "Revisá los datos marcados"): EstadoFormulario {
  return { ok: false, mensaje, errores };
}

/** Violación de un índice único (ej. código de cristal repetido). */
export function esDuplicado(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

// --- Lectura de FormData -----------------------------------------------------

export function texto(fd: FormData, campo: string): string | undefined {
  const v = fd.get(campo);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

/** Número o undefined si el campo está vacío. Un valor no numérico llega como NaN y lo rechaza Zod. */
export function numero(fd: FormData, campo: string): number | undefined {
  const v = texto(fd, campo);
  return v === undefined ? undefined : Number(v.replace(",", "."));
}

export function casilla(fd: FormData, campo: string): boolean {
  return fd.get(campo) === "on";
}

export function json<T>(fd: FormData, campo: string, porDefecto: T): T {
  const v = fd.get(campo);
  if (typeof v !== "string" || v === "") return porDefecto;
  return JSON.parse(v) as T;
}
