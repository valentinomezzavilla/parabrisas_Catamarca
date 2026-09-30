import { z } from "zod";

const anio = z.number().int().min(1950).max(2100);

export const compatibilidadSchema = z
  .object({
    modeloId: z.string().min(1),
    anioDesde: anio.optional(),
    anioHasta: anio.optional(), // sin valor = sigue vigente
    carroceria: z.string().trim().max(60).optional(),
    notas: z.string().trim().max(200).optional(),
  })
  .refine((c) => !c.anioDesde || !c.anioHasta || c.anioDesde <= c.anioHasta, {
    message: "El año desde no puede ser mayor que el año hasta",
    path: ["anioHasta"],
  });

export const valorCaracteristicaSchema = z.object({
  caracteristicaId: z.string().min(1),
  valor: z.string().trim().min(1),
});

export const crearCristalSchema = z.object({
  codigo: z.string().trim().min(1).max(40).toUpperCase(),
  codigoFabricante: z.string().trim().max(40).optional(),
  descripcion: z.string().trim().min(3).max(200),
  marcaId: z.string().min(1),
  tipoId: z.string().min(1),
  ubicacionId: z.string().min(1),
  lado: z.enum(["NO_APLICA", "IZQUIERDO", "DERECHO"]).default("NO_APLICA"),
  anchoMm: z.number().int().positive().optional(),
  altoMm: z.number().int().positive().optional(),
  espesorMm: z.number().positive().max(99).optional(),
  cantidadInicial: z.number().int().min(0).default(0),
  stockMinimo: z.number().int().min(0).default(0),
  ubicacionDeposito: z.string().trim().max(40).optional(),
  costo: z.number().min(0).optional(),
  precioVenta: z.number().min(0).optional(),
  caracteristicas: z.array(valorCaracteristicaSchema).default([]),
  compatibilidades: z.array(compatibilidadSchema).default([]),
});

export const actualizarCristalSchema = crearCristalSchema
  .omit({ cantidadInicial: true }) // el stock solo cambia con movimientos
  .partial();

export const movimientoStockSchema = z
  .object({
    cristalId: z.string().min(1),
    tipo: z.enum(["INGRESO", "EGRESO", "AJUSTE"]),
    // INGRESO/EGRESO: cantidad positiva. AJUSTE: diferencia con signo (-2 = faltan dos).
    cantidad: z.number().int().refine((n) => n !== 0, "La cantidad no puede ser 0"),
    motivo: z.string().trim().max(200).optional(),
    turnoId: z.string().optional(),
  })
  .refine((m) => m.tipo === "AJUSTE" || m.cantidad > 0, {
    message: "Para ingresos y egresos la cantidad debe ser positiva",
    path: ["cantidad"],
  });

export const busquedaCristalSchema = z.object({
  texto: z.string().trim().optional(),
  modeloId: z.string().optional(),
  anio: anio.optional(),
  ubicacionId: z.string().optional(),
  tipoId: z.string().optional(),
  soloConStock: z.boolean().default(false),
});

export type CrearCristalInput = z.input<typeof crearCristalSchema>;
export type ActualizarCristalInput = z.input<typeof actualizarCristalSchema>;
export type MovimientoStockInput = z.input<typeof movimientoStockSchema>;
export type BusquedaCristalInput = z.input<typeof busquedaCristalSchema>;
