-- CreateEnum
CREATE TYPE "OrigenTurno" AS ENUM ('PANEL', 'WEB');

-- AlterTable
ALTER TABLE "turnos" ADD COLUMN     "origen" "OrigenTurno" NOT NULL DEFAULT 'PANEL';

-- Datos existentes: solo las reservas del cliente tienen seña, así que los turnos con pagos vinieron de la web.
UPDATE "turnos" SET "origen" = 'WEB' WHERE "id" IN (SELECT DISTINCT "turno_id" FROM "pagos");
