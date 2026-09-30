import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import {
  actualizarCristalSchema,
  busquedaCristalSchema,
  crearCristalSchema,
  movimientoStockSchema,
  type ActualizarCristalInput,
  type BusquedaCristalInput,
  type CrearCristalInput,
  type MovimientoStockInput,
} from "./schemas";

export class StockInsuficienteError extends Error {
  constructor(public disponible: number) {
    super(`Stock insuficiente: quedan ${disponible} unidades`);
  }
}

const incluirDetalle = {
  marca: true,
  tipo: true,
  ubicacion: true,
  caracteristicas: { include: { caracteristica: true } },
  compatibilidades: { include: { modelo: { include: { marca: true } } } },
} satisfies Prisma.CristalInclude;

/** Alta de un cristal con sus características, compatibilidades y stock inicial. */
export async function crearCristal(input: CrearCristalInput) {
  const { cantidadInicial, caracteristicas, compatibilidades, ...datos } =
    crearCristalSchema.parse(input);

  return db.cristal.create({
    data: {
      ...datos,
      cantidad: cantidadInicial,
      caracteristicas: { create: caracteristicas },
      compatibilidades: { create: compatibilidades },
      movimientos:
        cantidadInicial > 0
          ? {
              create: {
                tipo: "INGRESO",
                cantidad: cantidadInicial,
                saldo: cantidadInicial,
                motivo: "Stock inicial",
              },
            }
          : undefined,
    },
    include: incluirDetalle,
  });
}

/** Edita datos del artículo. Si se envían características o compatibilidades, reemplazan a las actuales. */
export async function actualizarCristal(id: string, input: ActualizarCristalInput) {
  const { caracteristicas, compatibilidades, ...datos } = actualizarCristalSchema.parse(input);

  return db.cristal.update({
    where: { id },
    data: {
      ...datos,
      caracteristicas: caracteristicas && { deleteMany: {}, create: caracteristicas },
      compatibilidades: compatibilidades && { deleteMany: {}, create: compatibilidades },
    },
    include: incluirDetalle,
  });
}

/**
 * Registra un movimiento y actualiza el stock en una sola transacción.
 * El decremento es condicional (`cantidad >= n`), así dos ventas simultáneas
 * nunca dejan el stock en negativo.
 */
export async function registrarMovimiento(input: MovimientoStockInput) {
  const mov = movimientoStockSchema.parse(input);
  const delta = mov.tipo === "EGRESO" ? -mov.cantidad : mov.cantidad;

  return db.$transaction(async (tx) => {
    const { count } = await tx.cristal.updateMany({
      where: { id: mov.cristalId, ...(delta < 0 && { cantidad: { gte: -delta } }) },
      data: { cantidad: { increment: delta } },
    });

    const cristal = await tx.cristal.findUniqueOrThrow({
      where: { id: mov.cristalId },
      select: { cantidad: true },
    });
    if (count === 0) throw new StockInsuficienteError(cristal.cantidad);

    return tx.movimientoStock.create({
      data: {
        cristalId: mov.cristalId,
        tipo: mov.tipo,
        cantidad: delta,
        saldo: cristal.cantidad,
        motivo: mov.motivo,
        turnoId: mov.turnoId,
      },
    });
  });
}

/** Búsqueda para mostrador: "¿qué parabrisas tengo para una Hilux 2019?" */
export async function buscarCristales(input: BusquedaCristalInput = {}) {
  const f = busquedaCristalSchema.parse(input);

  const where: Prisma.CristalWhereInput = {
    activo: true,
    ubicacionId: f.ubicacionId,
    tipoId: f.tipoId,
    ...(f.soloConStock && { cantidad: { gt: 0 } }),
    ...(f.texto && {
      OR: [
        { codigo: { contains: f.texto, mode: "insensitive" } },
        { codigoFabricante: { contains: f.texto, mode: "insensitive" } },
        { descripcion: { contains: f.texto, mode: "insensitive" } },
      ],
    }),
    ...(f.modeloId && {
      compatibilidades: {
        some: {
          modeloId: f.modeloId,
          ...(f.anio && {
            AND: [
              { OR: [{ anioDesde: null }, { anioDesde: { lte: f.anio } }] },
              { OR: [{ anioHasta: null }, { anioHasta: { gte: f.anio } }] },
            ],
          }),
        },
      },
    }),
  };

  return db.cristal.findMany({
    where,
    include: incluirDetalle,
    orderBy: [{ ubicacion: { orden: "asc" } }, { descripcion: "asc" }],
  });
}

/** Artículos en o por debajo del stock mínimo, para el tablero y las compras. */
export async function cristalesConStockBajo() {
  return db.cristal.findMany({
    where: { activo: true, cantidad: { lte: db.cristal.fields.stockMinimo } },
    include: { marca: true, ubicacion: true },
    orderBy: { cantidad: "asc" },
  });
}
