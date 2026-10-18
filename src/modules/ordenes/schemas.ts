import { MedioCobro, PagadorCobro, TipoOrden } from "@/generated/prisma/enums";
import { z } from "@/lib/zod";

/** "AF 722-ki" → "AF722KI": la planilla mezcla espacios y guiones; así se busca igual de cualquier forma. */
export const normalizarPatente = (texto: string) => texto.toUpperCase().replace(/[^A-Z0-9]/g, "");

/** Fecha "YYYY-MM-DD" que existe en el calendario. */
export const fechaSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
  // Un mes o día que no existe ("2026-13-01") da una fecha inválida: se compara sin lanzar excepciones.
  .refine((f) => {
    const fecha = new Date(`${f}T00:00:00Z`);
    return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(f);
  }, "Fecha inválida");

const textoOpcional = (max: number) => z.string().trim().max(max).optional();

const importe = z.number().min(0).max(1_000_000_000);

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
    // Seña de un particular. Que esté abonada lo decide el Admin (el servicio ignora la casilla de cualquier otro).
    senaMonto: z.number().positive().max(1_000_000_000).optional(),
    senaAbonada: z.boolean().optional(),
  })
  .superRefine((o, ctx) => {
    if (o.tipo === "SEGURO" && !o.aseguradoraId) {
      ctx.addIssue({ code: "custom", path: ["aseguradoraId"], message: "Elegí la aseguradora" });
    }
    if (o.tipo === "PARTICULAR" && o.senaAbonada && o.senaMonto === undefined) {
      ctx.addIssue({ code: "custom", path: ["senaMonto"], message: "Cargá el monto de la seña" });
    }
  })
  // Aseguradora y siniestro son cosa de los seguros, y la seña de los particulares: lo que no corresponde al tipo
  // no se guarda aunque el formulario lo mande.
  .transform((o) =>
    o.tipo === "PARTICULAR"
      ? { ...o, aseguradoraId: undefined, siniestro: undefined, senaAbonada: o.senaAbonada ?? false }
      : { ...o, senaMonto: undefined, senaAbonada: false },
  );

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
