import type { NextFunction, Request, Response } from "express";

const SEGUROS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Protección CSRF: un POST cuyo `Origin` no es este mismo sitio se rechaza. Los navegadores mandan `Origin`
 * en todo POST, y la cookie de sesión es `SameSite=Lax` (no viaja en un POST desde otro sitio).
 */
export function mismoOrigen(req: Request, res: Response, next: NextFunction): void {
  if (SEGUROS.has(req.method)) return next();
  const origen = req.get("origin");
  if (origen === undefined) return next();

  let host: string | null = null;
  try {
    host = new URL(origen).host;
  } catch {
    // "null" u otro valor no válido: se rechaza abajo.
  }
  const esperado = req.get("x-forwarded-host")?.split(",")[0].trim() || req.get("host");
  if (!host || host !== esperado) {
    res.status(403).type("text/plain").send("Origen no permitido");
    return;
  }
  next();
}

/** Encabezados de seguridad básicos para todas las respuestas. */
export function encabezadosSeguros(_req: Request, res: Response, next: NextFunction): void {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": "frame-ancestors 'none'; base-uri 'self'",
  });
  next();
}
