import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

// Mensaje de un solo uso que sobrevive a un redirect (patrón POST → redirect → GET).
// Viaja en una cookie corta; la vista lo muestra arriba de la página o, si trae `ancla`, junto al elemento con ese id.

const COOKIE = "aviso";

const avisoSchema = z.object({
  tono: z.enum(["exito", "alerta", "peligro"]),
  mensaje: z.string().max(500),
  ancla: z.string().max(80).optional(),
});

export type Aviso = z.infer<typeof avisoSchema>;

export function avisar(res: Response, mensaje: string, { tono = "exito", ancla }: { tono?: Aviso["tono"]; ancla?: string } = {}): void {
  res.cookie(COOKIE, JSON.stringify({ tono, mensaje, ancla }), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60_000 });
}

/** Middleware: pasa el aviso pendiente a la vista (`avisoPendiente`) y lo borra. */
export function leerAviso(req: Request, res: Response, next: NextFunction): void {
  const crudo = req.cookies?.[COOKIE];
  res.locals.avisoPendiente = null;
  if (typeof crudo === "string") {
    res.clearCookie(COOKIE, { path: "/" });
    try {
      const datos = avisoSchema.safeParse(JSON.parse(crudo));
      if (datos.success) res.locals.avisoPendiente = datos.data;
    } catch {
      // Cookie corrupta: se ignora.
    }
  }
  next();
}
