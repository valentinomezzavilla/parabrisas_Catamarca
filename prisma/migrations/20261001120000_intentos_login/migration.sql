-- CreateTable
CREATE TABLE "intentos_login" (
    "usuario" TEXT NOT NULL,
    "fallos" INTEGER NOT NULL DEFAULT 0,
    "ultimo_fallo" TIMESTAMP(3),
    "bloqueado_hasta" TIMESTAMP(3),

    CONSTRAINT "intentos_login_pkey" PRIMARY KEY ("usuario")
);

