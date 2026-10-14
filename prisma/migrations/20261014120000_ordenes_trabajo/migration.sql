-- CreateEnum
CREATE TYPE "TipoOrden" AS ENUM ('SEGURO', 'PARTICULAR');

-- CreateEnum
CREATE TYPE "EstadoOrden" AS ENUM ('FALTA_PEDIR', 'PEDIDO', 'TURNO_ASIGNADO', 'INSTALADA', 'FACTURADA', 'COBRADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "PagadorCobro" AS ENUM ('ASEGURADORA', 'CLIENTE');

-- CreateEnum
CREATE TYPE "MedioCobro" AS ENUM ('TRANSFERENCIA', 'EFECTIVO', 'TARJETA', 'CHEQUE', 'QR', 'OTRO');

-- CreateTable
CREATE TABLE "aseguradoras" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aseguradoras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_trabajo" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "tipo" "TipoOrden" NOT NULL,
    "estado" "EstadoOrden" NOT NULL DEFAULT 'FALTA_PEDIR',
    "recibida_el" DATE NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "vehiculo" TEXT,
    "patente" TEXT,
    "aseguradora_id" TEXT,
    "siniestro" TEXT,
    "codigo_cristal" TEXT,
    "cristal_id" TEXT,
    "proveedor_id" TEXT,
    "turno_id" TEXT,
    "importe_total" DECIMAL(12,2),
    "factura_numero" TEXT,
    "factura_fecha" DATE,
    "factura_importe" DECIMAL(12,2),
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordenes_trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cobros_orden" (
    "id" TEXT NOT NULL,
    "orden_id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "pagador" "PagadorCobro" NOT NULL,
    "medio" "MedioCobro" NOT NULL,
    "nota" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cobros_orden_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "aseguradoras_nombre_key" ON "aseguradoras"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_nombre_key" ON "proveedores"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_trabajo_numero_key" ON "ordenes_trabajo"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_trabajo_turno_id_key" ON "ordenes_trabajo"("turno_id");

-- CreateIndex
CREATE INDEX "ordenes_trabajo_estado_idx" ON "ordenes_trabajo"("estado");

-- CreateIndex
CREATE INDEX "ordenes_trabajo_aseguradora_id_idx" ON "ordenes_trabajo"("aseguradora_id");

-- CreateIndex
CREATE INDEX "ordenes_trabajo_patente_idx" ON "ordenes_trabajo"("patente");

-- CreateIndex
CREATE INDEX "cobros_orden_orden_id_idx" ON "cobros_orden"("orden_id");

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_aseguradora_id_fkey" FOREIGN KEY ("aseguradora_id") REFERENCES "aseguradoras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_cristal_id_fkey" FOREIGN KEY ("cristal_id") REFERENCES "cristales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobros_orden" ADD CONSTRAINT "cobros_orden_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes_trabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

