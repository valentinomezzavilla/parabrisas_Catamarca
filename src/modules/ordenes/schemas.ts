import { MedioCobro, PagadorCobro, TipoOrden } from "@/generated/prisma/enums";
import { z } from "@/lib/zod";

/** "AF 722-ki" → "AF722KI": la planilla mezcla espacios y guiones; así se busca igual de cualquier forma. */
export const normalizarPatente = (texto: string) => texto.toUpperCase().replace(/[^A-Z0-9]/g, "");

/** Fecha "YYYY-MM-DD" que existe en el calendario. */
export const fechaSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
  .refine((f) => new Date(`${f}T00:00:00Z`).toISOString().startsWith(f), "Fecha inválida");

const textoOpcional = (max: number) => z.string().trim().max(max).optional();

export const ordenSchema = z
  .object({
    tipo: z.enum(TipoOrden),
    recibidaEl: fechaSchema,
    cliente: z.object({
      nombre: z.string().trim().min(2).max(100),
      telefono: textoOpcional(30),
    }),
    vehiculo: textoOpcional(100),
    patente: z.string().trim().max(15).transform(normalizarPatente).optional(),
    aseguradoraId: z.string().optional(),
    siniestro: textoOpcional(300),
    codigoCristal: textoOpcional(60),
    cristalId: z.string().optional(),
    proveedorId: z.string().optional(),
    observaciones: textoOpcional(2000),
  })
  .superRefine((o, ctx) => {
    if (o.tipo === "SEGURO" && !o.aseguradoraId) {
      ctx.addIssue({ code: "custom", path: ["aseguradoraId"], message: "Elegí la aseguradora" });
    }
  })
  // Aseguradora y siniestro son cosa de los seguros: en un particular no se guardan aunque el formulario los mande.
  .transform((o) => (o.tipo === "PARTICULAR" ? { ...o, aseguradoraId: undefined, siniestro: undefined } : o));

const importe = z.number().min(0).max(1_000_000_000);

export const facturacionSchema = z.object({
  importeTotal: importe.optional(),
  facturaNumero: textoOpcional(40),
  facturaFecha: fechaSchema.optional(),
  facturaImporte: importe.optional(),
});

export const cobroSchema = z.object({
  fecha: fechaSchema,
  monto: z.number().positive().max(1_000_000_000),
  pagador: z.enum(PagadorCobro),
  medio: z.enum(MedioCobro),
  nota: textoOpcional(200),
});

export type OrdenInput = z.input<typeof ordenSchema>;
export type FacturacionInput = z.input<typeof facturacionSchema>;
export type CobroInput = z.input<typeof cobroSchema>;
