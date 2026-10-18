-- AlterTable
ALTER TABLE "ordenes_trabajo" ADD COLUMN     "sena_abonada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sena_monto" DECIMAL(12,2);

