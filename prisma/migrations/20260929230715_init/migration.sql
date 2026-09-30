-- CreateEnum
CREATE TYPE "Lado" AS ENUM ('NO_APLICA', 'IZQUIERDO', 'DERECHO');

-- CreateEnum
CREATE TYPE "TipoDato" AS ENUM ('BOOLEANO', 'TEXTO', 'NUMERO', 'OPCION');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('INGRESO', 'EGRESO', 'AJUSTE');

-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO', 'AUSENTE');

-- CreateTable
CREATE TABLE "marcas_cristal" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "marcas_cristal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_cristal" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "tipos_cristal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ubicaciones_vehiculo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tiene_lado" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ubicaciones_vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cristales" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "codigo_fabricante" TEXT,
    "descripcion" TEXT NOT NULL,
    "marca_id" TEXT NOT NULL,
    "tipo_id" TEXT NOT NULL,
    "ubicacion_id" TEXT NOT NULL,
    "lado" "Lado" NOT NULL DEFAULT 'NO_APLICA',
    "ancho_mm" INTEGER,
    "alto_mm" INTEGER,
    "espesor_mm" DECIMAL(4,1),
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "stock_minimo" INTEGER NOT NULL DEFAULT 0,
    "ubicacion_deposito" TEXT,
    "costo" DECIMAL(12,2),
    "precio_venta" DECIMAL(12,2),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cristales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caracteristicas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo_dato" "TipoDato" NOT NULL DEFAULT 'BOOLEANO',
    "opciones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "unidad" TEXT,

    CONSTRAINT "caracteristicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cristal_caracteristicas" (
    "cristal_id" TEXT NOT NULL,
    "caracteristica_id" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "cristal_caracteristicas_pkey" PRIMARY KEY ("cristal_id","caracteristica_id")
);

-- CreateTable
CREATE TABLE "marcas_vehiculo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "marcas_vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modelos_vehiculo" (
    "id" TEXT NOT NULL,
    "marca_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "modelos_vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compatibilidades_vehiculo" (
    "id" TEXT NOT NULL,
    "cristal_id" TEXT NOT NULL,
    "modelo_id" TEXT NOT NULL,
    "anio_desde" INTEGER,
    "anio_hasta" INTEGER,
    "carroceria" TEXT,
    "notas" TEXT,

    CONSTRAINT "compatibilidades_vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_stock" (
    "id" TEXT NOT NULL,
    "cristal_id" TEXT NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "saldo" INTEGER NOT NULL,
    "motivo" TEXT,
    "turno_id" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "duracion_minutos" INTEGER NOT NULL,
    "intervalo_minutos" INTEGER NOT NULL DEFAULT 30,
    "margen_minutos" INTEGER NOT NULL DEFAULT 0,
    "capacidad" INTEGER NOT NULL DEFAULT 1,
    "anticipacion_minutos" INTEGER NOT NULL DEFAULT 60,
    "precio_base" DECIMAL(12,2),
    "color" TEXT NOT NULL DEFAULT '#FDDD3D',
    "requiere_cristal" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "archivado_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_servicio" (
    "id" TEXT NOT NULL,
    "servicio_id" TEXT NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_inicio" INTEGER NOT NULL,
    "hora_fin" INTEGER NOT NULL,

    CONSTRAINT "horarios_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bloqueos_agenda" (
    "id" TEXT NOT NULL,
    "servicio_id" TEXT,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,

    CONSTRAINT "bloqueos_agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "notas" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos" (
    "id" TEXT NOT NULL,
    "servicio_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoTurno" NOT NULL DEFAULT 'PENDIENTE',
    "vehiculo" TEXT,
    "patente" TEXT,
    "cristal_id" TEXT,
    "precio" DECIMAL(12,2),
    "notas" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marcas_cristal_nombre_key" ON "marcas_cristal"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_cristal_nombre_key" ON "tipos_cristal"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ubicaciones_vehiculo_nombre_key" ON "ubicaciones_vehiculo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "cristales_codigo_key" ON "cristales"("codigo");

-- CreateIndex
CREATE INDEX "cristales_ubicacion_id_idx" ON "cristales"("ubicacion_id");

-- CreateIndex
CREATE INDEX "cristales_marca_id_idx" ON "cristales"("marca_id");

-- CreateIndex
CREATE INDEX "cristales_tipo_id_idx" ON "cristales"("tipo_id");

-- CreateIndex
CREATE UNIQUE INDEX "caracteristicas_nombre_key" ON "caracteristicas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "marcas_vehiculo_nombre_key" ON "marcas_vehiculo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "modelos_vehiculo_marca_id_nombre_key" ON "modelos_vehiculo"("marca_id", "nombre");

-- CreateIndex
CREATE INDEX "compatibilidades_vehiculo_modelo_id_idx" ON "compatibilidades_vehiculo"("modelo_id");

-- CreateIndex
CREATE INDEX "compatibilidades_vehiculo_cristal_id_idx" ON "compatibilidades_vehiculo"("cristal_id");

-- CreateIndex
CREATE INDEX "movimientos_stock_cristal_id_creado_en_idx" ON "movimientos_stock"("cristal_id", "creado_en");

-- CreateIndex
CREATE UNIQUE INDEX "servicios_nombre_key" ON "servicios"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "servicios_slug_key" ON "servicios"("slug");

-- CreateIndex
CREATE INDEX "horarios_servicio_servicio_id_dia_semana_idx" ON "horarios_servicio"("servicio_id", "dia_semana");

-- CreateIndex
CREATE INDEX "bloqueos_agenda_inicio_fin_idx" ON "bloqueos_agenda"("inicio", "fin");

-- CreateIndex
CREATE INDEX "clientes_telefono_idx" ON "clientes"("telefono");

-- CreateIndex
CREATE INDEX "turnos_servicio_id_inicio_idx" ON "turnos"("servicio_id", "inicio");

-- CreateIndex
CREATE INDEX "turnos_inicio_idx" ON "turnos"("inicio");

-- AddForeignKey
ALTER TABLE "cristales" ADD CONSTRAINT "cristales_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas_cristal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cristales" ADD CONSTRAINT "cristales_tipo_id_fkey" FOREIGN KEY ("tipo_id") REFERENCES "tipos_cristal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cristales" ADD CONSTRAINT "cristales_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones_vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cristal_caracteristicas" ADD CONSTRAINT "cristal_caracteristicas_cristal_id_fkey" FOREIGN KEY ("cristal_id") REFERENCES "cristales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cristal_caracteristicas" ADD CONSTRAINT "cristal_caracteristicas_caracteristica_id_fkey" FOREIGN KEY ("caracteristica_id") REFERENCES "caracteristicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modelos_vehiculo" ADD CONSTRAINT "modelos_vehiculo_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas_vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compatibilidades_vehiculo" ADD CONSTRAINT "compatibilidades_vehiculo_cristal_id_fkey" FOREIGN KEY ("cristal_id") REFERENCES "cristales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compatibilidades_vehiculo" ADD CONSTRAINT "compatibilidades_vehiculo_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "modelos_vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_stock" ADD CONSTRAINT "movimientos_stock_cristal_id_fkey" FOREIGN KEY ("cristal_id") REFERENCES "cristales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_stock" ADD CONSTRAINT "movimientos_stock_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_servicio" ADD CONSTRAINT "horarios_servicio_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueos_agenda" ADD CONSTRAINT "bloqueos_agenda_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_cristal_id_fkey" FOREIGN KEY ("cristal_id") REFERENCES "cristales"("id") ON DELETE SET NULL ON UPDATE CASCADE;
