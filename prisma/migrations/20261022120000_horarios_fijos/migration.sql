-- AlterTable
ALTER TABLE "servicios" ADD COLUMN     "horarios_fijos" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "capacidad" DROP NOT NULL;
