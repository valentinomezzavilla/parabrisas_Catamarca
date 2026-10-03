import type { Request } from "express";

/** Parámetro de la query string como texto (el primero si viene repetido), o undefined. */
export function param(req: Request, nombre: string): string | undefined {
  const v = req.query[nombre];
  const primero = Array.isArray(v) ? v[0] : v;
  return typeof primero === "string" && primero !== "" ? primero : undefined;
}

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

/** Fecha "YYYY-MM-DD" de la query string, o undefined si falta o tiene otro formato. */
export function paramFecha(req: Request, nombre = "fecha"): string | undefined {
  const v = param(req, nombre);
  return v && FECHA.test(v) ? v : undefined;
}

/** Arma una URL con su query string, omitiendo los valores vacíos. */
export function url(ruta: string, query: Record<string, string | number | undefined | null> = {}, ancla?: string): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  const texto = qs.toString();
  return `${ruta}${texto ? `?${texto}` : ""}${ancla ? `#${ancla}` : ""}`;
}
