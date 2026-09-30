/**
 * Copia las `Caracteristica` de la versión anterior a campos propios de Stock y sus valores a `cristales.extras`.
 * Es idempotente: si ya hay campos propios de Stock, o ya no existen las tablas viejas, no hace nada.
 * Correrlo ANTES de la migración que elimina `caracteristicas` (esa migración lo verifica).
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { convertirCaracteristicas, type CaracteristicaAntigua, type ValorAntiguo } from "../src/modules/campos/migracion";
import { clavesReservadas } from "../src/modules/campos/registro";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  let antiguas: CaracteristicaAntigua[];
  try {
    antiguas = await db.$queryRaw<CaracteristicaAntigua[]>`
      SELECT id, nombre, tipo_dato::text AS "tipoDato", opciones, unidad FROM caracteristicas`;
  } catch {
    console.log("No existe la tabla caracteristicas: no hay nada que migrar.");
    return;
  }
  if (antiguas.length === 0) {
    console.log("No hay características cargadas: no hay nada que migrar.");
    return;
  }
  if ((await db.campoPersonalizado.count({ where: { entidad: "CRISTAL" } })) > 0) {
    console.log("Ya hay campos propios de Stock: se asume migrado, no se toca nada.");
    return;
  }

  const valores = await db.$queryRaw<ValorAntiguo[]>`
    SELECT cristal_id AS "cristalId", caracteristica_id AS "caracteristicaId", valor FROM cristal_caracteristicas`;
  const { campos, extrasPorCristal } = convertirCaracteristicas(antiguas, valores, clavesReservadas("CRISTAL"));

  await db.$transaction(async (tx) => {
    for (const c of campos) {
      await tx.campoPersonalizado.create({
        data: {
          entidad: "CRISTAL",
          clave: c.clave,
          etiqueta: c.etiqueta,
          tipo: c.tipo,
          unidad: c.unidad,
          opciones: c.opciones as unknown as Prisma.InputJsonArray,
          orden: c.orden,
        },
      });
    }
    for (const [cristalId, extras] of Object.entries(extrasPorCristal)) {
      await tx.cristal.update({ where: { id: cristalId }, data: { extras } });
    }
  });
  console.log(`Migrados ${campos.length} campos y los valores de ${Object.keys(extrasPorCristal).length} cristales.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
