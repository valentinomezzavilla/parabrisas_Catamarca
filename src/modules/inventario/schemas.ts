import { z } from "@/lib/zod";

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

/** Campos de un cristal SIN valores por defecto: sirve de base para alta y edición. */
const camposCristal = {
  codigo: z.string().trim().min(1).max(40).toUpperCase(),
  codigoFabricante: z.string().trim().max(40).optional(),
  descripcion: z.string().trim().min(3).max(200),
  marcaId: z.string().min(1),
  tipoId: z.string().min(1),
  ubicacionId: z.string().min(1),
  lado: z.enum(["NO_APLICA", "IZQUIERDO", "DERECHO"]),
  anchoMm: z.number().int().positive().optional(),
  altoMm: z.number().int().positive().optional(),
  espesorMm: z.number().positive().max(99).optional(),
  stockMinimo: z.number().int().min(0),
  ubicacionDeposito: z.string().trim().max(40).optional(),
  costo: z.number().min(0).optional(),
  precioVenta: z.number().min(0).optional(),
  compatibilidades: z.array(compatibilidadSchema),
  /** Valores del formulario de los campos propios (`extra_<clave>`); el servicio los valida con la definición de cada campo. */
  extrasEntrada: z.record(z.string(), z.unknown()),
  /** Claves de los campos que el formulario mostró: lo que no se mostró no se toca (ver `procesarExtras`). */
  extrasDibujados: z.array(z.string()).optional(),
};

export const crearCristalSchema = z.object({
  ...camposCristal,
  lado: camposCristal.lado.default("NO_APLICA"),
  cantidadInicial: z.number().int().min(0).default(0),
  stockMinimo: camposCristal.stockMinimo.default(0),
  compatibilidades: camposCristal.compatibilidades.default([]),
  extrasEntrada: camposCristal.extrasEntrada.default({}),
});

/**
 * Edición: todo opcional y SIN valores por defecto (Zod 4 los aplica aun dentro de `.partial()`).
 * Un campo oculto o ausente no viaja en el formulario y no debe pisar lo que ya está guardado.
 */
export const actualizarCristalSchema = z.object(camposCristal).partial();

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
  incluirInactivos: z.boolean().default(false),
});

export type CrearCristalInput = z.input<typeof crearCristalSchema>;
export type ActualizarCristalInput = z.input<typeof actualizarCristalSchema>;
export type MovimientoStockInput = z.input<typeof movimientoStockSchema>;
export type BusquedaCristalInput = z.input<typeof busquedaCristalSchema>;
