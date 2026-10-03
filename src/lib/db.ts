import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function crearCliente() {
  const connectionString = process.env.DATABASE_URL;
  // El driver `pg` ignora `connection_limit` de la URL; se traduce al tamaño del pool.
  // Hace falta con `prisma dev`, cuyo Postgres embebido admite una sola conexión.
  const limite = connectionString && new URL(connectionString).searchParams.get("connection_limit");
  const adapter = new PrismaPg({ connectionString, ...(limite && { max: Number(limite) }) });
  return new PrismaClient({ adapter });
}

/** Una sola instancia para todo el proceso: el pool de conexiones se comparte entre requests. */
export const db = crearCliente();
