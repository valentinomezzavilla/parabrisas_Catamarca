import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { listarCamposPropios } from "@/modules/campos/campo.service";
import { procesarExtras } from "@/modules/campos/extras";
import type { Extras } from "@/modules/campos/tipos";
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
  compatibilidades: { include: { modelo: { include: { marca: true } } } },
} satisfies Prisma.CristalInclude;

/** Alta de un cristal con sus campos propios, compatibilidades y stock inicial. */
export async function crearCristal(input: CrearCristalInput) {
  const { cantidadInicial, extrasEntrada, extrasDibujados, compatibilidades, ...datos } = crearCristalSchema.parse(input);
  const extras = procesarExtras(await listarCamposPropios("CRISTAL"), extrasEntrada, {}, extrasDibujados);

  return db.cristal.create({
    data: {
      ...datos,
      extras,
      cantidad: cantidadInicial,
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

/**
 * Edita datos del artículo. Solo cambia lo que se envía: un campo ausente (por ejemplo, oculto
 * desde Administración) conserva su valor. Si se envían compatibilidades, reemplazan a las actuales.
 */
export async function actualizarCristal(id: string, input: ActualizarCristalInput) {
  const { extrasEntrada, extrasDibujados, compatibilidades, ...datos } = actualizarCristalSchema.parse(input);

  let extras: Extras | undefined;
  if (extrasEntrada) {
    const actual = await db.cristal.findUniqueOrThrow({ where: { id }, select: { extras: true } });
    extras = procesarExtras(await listarCamposPropios("CRISTAL"), extrasEntrada, actual.extras as Extras, extrasDibujados);
  }

  return db.cristal.update({
    where: { id },
    data: {
      ...datos,
      ...(extras && { extras }),
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
    activo: f.incluirInactivos ? undefined : true,
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

/** Ficha completa con el historial de movimientos más reciente. */
export function obtenerCristal(id: string) {
  return db.cristal.findUnique({
    where: { id },
    include: {
      ...incluirDetalle,
      movimientos: { orderBy: { creadoEn: "desc" }, take: 50, include: { turno: { select: { id: true, inicio: true } } } },
    },
  });
}

/** Dar de baja oculta el cristal de búsquedas y reservas sin borrar su historial. */
export function cambiarEstadoCristal(id: string, activo: boolean) {
  return db.cristal.update({ where: { id }, data: { activo } });
}

export interface OpcionesCatalogos {
  /** Incluye los elementos desactivados (filtros y fichas). Los formularios solo ofrecen los activos. */
  incluirInactivos?: boolean;
  /** Ids que se conservan aunque estén desactivados: lo que ya tiene guardado el registro que se edita. */
  conservar?: string[];
}

/** Todo lo que necesitan los formularios y filtros de stock. */
export async function obtenerCatalogos({ incluirInactivos = false, conservar = [] }: OpcionesCatalogos = {}) {
  const visibles = incluirInactivos ? undefined : { OR: [{ activo: true }, { id: { in: conservar } }] };
  const [marcas, tipos, ubicaciones, marcasVehiculo] = await Promise.all([
    db.marcaCristal.findMany({ where: visibles, orderBy: { nombre: "asc" } }),
    db.tipoCristal.findMany({ where: visibles, orderBy: { nombre: "asc" } }),
    db.ubicacionVehiculo.findMany({ where: visibles, orderBy: { orden: "asc" } }),
    db.marcaVehiculo.findMany({
      where: visibles,
      orderBy: { nombre: "asc" },
      include: { modelos: { where: visibles, orderBy: { nombre: "asc" } } },
    }),
  ]);
  return { marcas, tipos, ubicaciones, marcasVehiculo };
}

export type Catalogos = Awaited<ReturnType<typeof obtenerCatalogos>>;
