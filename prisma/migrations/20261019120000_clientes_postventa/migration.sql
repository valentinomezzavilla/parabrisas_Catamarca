-- CreateEnum
CREATE TYPE "TipoBeneficio" AS ENUM ('PORCENTAJE', 'MONTO', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoBeneficio" AS ENUM ('VIGENTE', 'USADO', 'ANULADO');

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "fecha_nacimiento" DATE;

-- CreateTable
CREATE TABLE "beneficios_cliente" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" "TipoBeneficio" NOT NULL,
    "valor" DECIMAL(12,2),
    "descripcion" TEXT,
    "vigente_hasta" DATE,
    "estado" "EstadoBeneficio" NOT NULL DEFAULT 'VIGENTE',
    "usado_el" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beneficios_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saludos_cumple" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "oferta" TEXT,
    "saludado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saludos_cumple_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "beneficios_cliente_cliente_id_idx" ON "beneficios_cliente"("cliente_id");

-- CreateIndex
CREATE UNIQUE INDEX "saludos_cumple_cliente_id_anio_key" ON "saludos_cumple"("cliente_id", "anio");

-- AddForeignKey
ALTER TABLE "beneficios_cliente" ADD CONSTRAINT "beneficios_cliente_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saludos_cumple" ADD CONSTRAINT "saludos_cumple_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

