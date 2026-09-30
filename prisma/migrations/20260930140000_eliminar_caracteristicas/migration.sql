-- Seguridad: no borrar las características si todavía no se copiaron a campos propios.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "caracteristicas")
     AND NOT EXISTS (SELECT 1 FROM "campos_personalizados" WHERE "entidad" = 'CRISTAL') THEN
    RAISE EXCEPTION 'Corré primero: npm run db:migrar-caracteristicas';
  END IF;
END $$;

-- DropForeignKey
ALTER TABLE "cristal_caracteristicas" DROP CONSTRAINT "cristal_caracteristicas_caracteristica_id_fkey";

-- DropForeignKey
ALTER TABLE "cristal_caracteristicas" DROP CONSTRAINT "cristal_caracteristicas_cristal_id_fkey";

-- DropTable
DROP TABLE "caracteristicas";

-- DropTable
DROP TABLE "cristal_caracteristicas";

-- DropEnum
DROP TYPE "TipoDato";

