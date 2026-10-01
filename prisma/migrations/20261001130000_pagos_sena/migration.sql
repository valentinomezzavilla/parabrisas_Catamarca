-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'VENCIDO');

-- AlterEnum
ALTER TYPE "EstadoTurno" ADD VALUE 'ESPERANDO_PAGO';

-- AlterTable
ALTER TABLE "turnos" ADD COLUMN     "vence_en" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "turno_id" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "mp_preferencia_id" TEXT,
    "mp_init_point" TEXT,
    "mp_pago_id" TEXT,
    "acepto_condiciones_en" TIMESTAMP(3) NOT NULL,
    "requiere_devolucion" BOOLEAN NOT NULL DEFAULT false,
    "motivo_devolucion" TEXT,
    "devuelto_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pagos_mp_pago_id_key" ON "pagos"("mp_pago_id");

-- CreateIndex
CREATE INDEX "pagos_turno_id_idx" ON "pagos"("turno_id");

-- CreateIndex
CREATE INDEX "pagos_requiere_devolucion_devuelto_en_idx" ON "pagos"("requiere_devolucion", "devuelto_en");

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

