import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El cliente de Prisma usa el driver `pg`; se deja fuera del bundle del servidor.
  serverExternalPackages: ["@prisma/adapter-pg", "pg"],
};

export default nextConfig;
