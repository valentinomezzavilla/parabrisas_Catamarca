/**
 * Copia las `Caracteristica` de la versión anterior a campos propios de Stock y sus valores a `cristales.extras`.
 *
 * Es idempotente y se puede correr en cualquier orden respecto del seed: un campo que ya existe (misma clave
 * y tipo) se reutiliza, y los valores se mezclan en `extras` SIN pisar lo que el cristal ya tenga.
 * Si ya no existen las tablas viejas, no hace nada.
 *
 * Correrlo ANTES de aplicar la migración que elimina `caracteristicas` (esa migración frena si no hay
 * campos propios, pero no puede comprobar que los valores ya se copiaron).
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import {
  convertirCaracteristicas,
  type CampoExistente,
  type CaracteristicaAntigua,
  type ValorAntiguo,
} from "../src/modules/campos/migracion";
import { clavesProhibidas } from "../src/modules/campos/registro";
import type { Extras, OpcionCampo } from "../src/modules/campos/tipos";

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

  const filas = await db.campoPersonalizado.findMany({ where: { entidad: "CRISTAL" } });
  const existentes: CampoExistente[] = filas.map((f) => ({
    clave: f.clave,
    tipo: f.tipo,
    opciones: (f.opciones as unknown as OpcionCampo[]) ?? [],
  }));
  const valores = await db.$queryRaw<ValorAntiguo[]>`
    SELECT cristal_id AS "cristalId", caracteristica_id AS "caracteristicaId", valor FROM cristal_caracteristicas`;
  const { campos, extrasPorCristal } = convertirCaracteristicas(
    antiguas,
    valores,
    clavesProhibidas("CRISTAL"),
    undefined,
    existentes,
  );

  let creados = 0;
  let cristalesActualizados = 0;
  await db.$transaction(async (tx) => {
    for (const c of campos) {
      if (!c.existente) {
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
        creados++;
      } else if (c.opciones.length !== (existentes.find((e) => e.clave === c.clave)?.opciones.length ?? 0)) {
        // Se agregaron opciones inactivas para no perder datos que no estaban entre las del campo.
        await tx.campoPersonalizado.update({
          where: { entidad_clave: { entidad: "CRISTAL", clave: c.clave } },
          data: { opciones: c.opciones as unknown as Prisma.InputJsonArray },
        });
      }
    }
    for (const [cristalId, nuevos] of Object.entries(extrasPorCristal)) {
      const actual = await tx.cristal.findUnique({ where: { id: cristalId }, select: { extras: true } });
      if (!actual) continue;
      const extras = { ...nuevos, ...(actual.extras as Extras) }; // lo que el cristal ya tiene no se pisa
      if (JSON.stringify(extras) !== JSON.stringify(actual.extras)) {
        await tx.cristal.update({ where: { id: cristalId }, data: { extras } });
        cristalesActualizados++;
      }
    }
  });
  console.log(`Campos creados: ${creados}. Campos reutilizados: ${campos.length - creados}. Cristales actualizados: ${cristalesActualizados}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
