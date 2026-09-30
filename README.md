# Parabrisas Catamarca — Sistema de gestión

Stock de cristales y turnero del local. Arquitectura y modelo de datos: [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

## Puesta en marcha

Requisitos: Node 20+ y PostgreSQL.

```bash
npm install
cp .env.example .env          # completar DATABASE_URL
npx prisma migrate deploy     # crea las tablas
npm run db:seed               # catálogos + servicios Lavados, Colocación de vidrios y Polarizados
npm run dev                   # http://localhost:3000
```

Si no tenés un Postgres a mano, `npx prisma dev` levanta uno local y muestra la URL de conexión.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Tests de la lógica de agenda |
| `npm run typecheck` | Chequeo de tipos |
| `npm run db:migrate` | Crea una migración nueva tras editar `prisma/schema.prisma` |
| `npm run db:studio` | Explorador visual de la base |
