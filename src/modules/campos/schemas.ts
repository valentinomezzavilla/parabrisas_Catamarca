import { z } from "@/lib/zod";
import { etiquetasDeTexto } from "./opciones";
import { TIPOS_CAMPO } from "./tipos";

export const tipoCampoSchema = z.enum(TIPOS_CAMPO);

const etiqueta = z.string().trim().min(1).max(60);
const ayuda = z.string().trim().max(120).optional();
const unidad = z.string().trim().max(12).optional();

export const crearCampoSchema = z
  .object({
    etiqueta,
    ayuda,
    tipo: tipoCampoSchema,
    requerido: z.boolean().default(false),
    unidad,
    /** Un renglón por opción (solo para LISTA). */
    opcionesTexto: z.string().default(""),
  })
  .superRefine((c, ctx) => {
    if (c.tipo === "LISTA" && etiquetasDeTexto(c.opcionesTexto).length === 0) {
      ctx.addIssue({ code: "custom", path: ["opcionesTexto"], message: "Cargá al menos una opción" });
    }
  });

export const editarCampoPropioSchema = z.object({
  etiqueta,
  ayuda,
  requerido: z.boolean(),
  unidad,
  visible: z.boolean(),
});

export const editarCampoSistemaSchema = z.object({
  etiqueta: z.string().trim().max(60).optional(),
  ayuda,
  oculto: z.boolean().default(false),
});

export type CrearCampoInput = z.input<typeof crearCampoSchema>;
export type EditarCampoPropioInput = z.input<typeof editarCampoPropioSchema>;
export type EditarCampoSistemaInput = z.input<typeof editarCampoSistemaSchema>;
