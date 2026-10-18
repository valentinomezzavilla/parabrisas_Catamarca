import { TipoBeneficio } from "@/generated/prisma/enums";
import { hoy } from "@/lib/tiempo";
import { z } from "@/lib/zod";
import { fechaSchema } from "@/modules/ordenes/schemas";

const textoOpcional = (max: number) => z.string().trim().max(max).optional();

export const clienteSchema = z.object({
  nombre: z.string().trim().min(2).max(100),
  telefono: textoOpcional(30),
  email: z.email().optional(),
  // Nacimiento: una fecha real, de este siglo o el anterior y que ya pasó.
  fechaNacimiento: fechaSchema
    .refine((f) => f >= "1900-01-01", "Fecha inválida")
    .refine((f) => f <= hoy(), "La fecha de nacimiento no puede ser futura")
    .optional(),
  notas: textoOpcional(2000),
});

export const beneficioSchema = z
  .object({
    titulo: z.string().trim().min(2).max(80),
    tipo: z.enum(TipoBeneficio),
    valor: z.number().positive().max(1_000_000_000).optional(),
    descripcion: textoOpcional(300),
    vigenteHasta: fechaSchema.optional(),
  })
  .superRefine((b, ctx) => {
    if (b.tipo !== "OTRO" && b.valor === undefined) {
      ctx.addIssue({ code: "custom", path: ["valor"], message: b.tipo === "PORCENTAJE" ? "Cargá el porcentaje de descuento" : "Cargá el monto del descuento" });
    }
    if (b.tipo === "PORCENTAJE" && b.valor !== undefined && b.valor > 100) {
      ctx.addIssue({ code: "custom", path: ["valor"], message: "El porcentaje no puede superar 100" });
    }
  })
  // Un beneficio "Otro" es solo texto: no lleva valor.
  .transform((b) => (b.tipo === "OTRO" ? { ...b, valor: undefined } : b));

export type ClienteInput = z.input<typeof clienteSchema>;
export type BeneficioInput = z.input<typeof beneficioSchema>;
