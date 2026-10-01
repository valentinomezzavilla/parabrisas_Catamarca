-- AlterTable: la columna nace nula para poder completar los turnos que ya existen.
ALTER TABLE "turnos" ADD COLUMN     "codigo" TEXT;

-- Valor único y determinista por turno: (orden de creación × impar) módulo 2^24, en hexadecimal de 6 dígitos.
-- Un multiplicador impar módulo una potencia de 2 es una biyección: no hay repetidos para menos de 16 millones de turnos.
UPDATE "turnos" AS t
SET "codigo" = upper(lpad(to_hex(((s.n * 2654435761) % 16777216)::int), 6, '0'))
FROM (SELECT "id", row_number() OVER (ORDER BY "creado_en", "id") AS n FROM "turnos") AS s
WHERE s."id" = t."id";

ALTER TABLE "turnos" ALTER COLUMN "codigo" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "turnos_codigo_key" ON "turnos"("codigo");
