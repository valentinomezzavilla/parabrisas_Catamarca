-- CreateEnum
CREATE TYPE "EntidadCampo" AS ENUM ('CRISTAL', 'SERVICIO', 'TURNO', 'CLIENTE');

-- CreateEnum
CREATE TYPE "TipoCampo" AS ENUM ('TEXTO', 'TEXTO_LARGO', 'NUMERO', 'SI_NO', 'LISTA', 'FECHA');

-- AlterTable
ALTER TABLE "cristales" ADD COLUMN     "extras" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "marcas_vehiculo" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "modelos_vehiculo" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "tipos_cristal" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ubicaciones_vehiculo" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "campos_personalizados" (
    "id" TEXT NOT NULL,
    "entidad" "EntidadCampo" NOT NULL,
    "clave" TEXT NOT NULL,
    "etiqueta" TEXT NOT NULL,
    "ayuda" TEXT,
    "tipo" "TipoCampo" NOT NULL,
    "requerido" BOOLEAN NOT NULL DEFAULT false,
    "unidad" TEXT,
    "opciones" JSONB NOT NULL DEFAULT '[]',
    "orden" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "archivado_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campos_personalizados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_campos" (
    "entidad" "EntidadCampo" NOT NULL,
    "clave" TEXT NOT NULL,
    "etiqueta" TEXT,
    "ayuda" TEXT,
    "oculto" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER,

    CONSTRAINT "configuracion_campos_pkey" PRIMARY KEY ("entidad","clave")
);

-- CreateIndex
CREATE UNIQUE INDEX "campos_personalizados_entidad_clave_key" ON "campos_personalizados"("entidad", "clave");

