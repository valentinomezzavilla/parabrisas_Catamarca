import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// En desarrollo, Next.js recarga módulos en caliente: se reutiliza una única
// instancia para no abrir conexiones nuevas en cada recarga.
const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

function crearCliente() {
  const connectionString = process.env.DATABASE_URL;
  // El driver `pg` ignora `connection_limit` de la URL; se traduce al tamaño del pool.
  // Hace falta con `prisma dev`, cuyo Postgres embebido admite una sola conexión.
  const limite = connectionString && new URL(connectionString).searchParams.get("connection_limit");
  const adapter = new PrismaPg({ connectionString, ...(limite && { max: Number(limite) }) });
  return new PrismaClient({ adapter });
}

export const db = globalParaPrisma.prisma ?? crearCliente();

if (process.env.NODE_ENV !== "production") globalParaPrisma.prisma = db;
