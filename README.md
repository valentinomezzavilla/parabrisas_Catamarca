# Parabrisas Catamarca — Sistema de gestión

Stock de cristales y turnero del local. Arquitectura y modelo de datos: [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

## Puesta en marcha

Requisitos: Node 20+ y PostgreSQL.

```bash
npm install
cp .env.example .env          # completar DATABASE_URL, SESSION_SECRET, ADMIN_USUARIO y ADMIN_PASSWORD
npx prisma migrate deploy     # crea las tablas
npm run db:seed               # catálogos, servicios y el primer administrador
npm run dev                   # http://localhost:3000
```

Si no tenés un Postgres a mano, `npx prisma dev --name local --detach` levanta uno local y muestra la URL de conexión. Agregale `&connection_limit=1` en `.env`: esa base embebida admite una sola conexión a la vez.

- Panel: http://localhost:3000 (pide iniciar sesión)
- Página pública de turnos: http://localhost:3000/reservar

## Acceso al panel

El seed crea un administrador con `ADMIN_USUARIO` y `ADMIN_PASSWORD` del `.env` (solo si todavía no hay usuarios). Después del primer seed podés borrar `ADMIN_PASSWORD` del `.env` y crear el resto de los usuarios desde **Usuarios** en el panel. Cambiá la contraseña inicial antes de publicar el panel.

| Rol | Puede |
|---|---|
| Administrador | Todo: turnos, stock, servicios y usuarios. |
| Empleado | Turnos y stock. |

`SESSION_SECRET` firma la cookie de sesión (mínimo 32 caracteres). En producción usá una propia y distinta de la de desarrollo.

> `npx prisma migrate dev` no funciona con la base embebida de `prisma dev` (su base de sombra hereda las tablas). Para una migración nueva usá `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` y aplicala con `npx prisma migrate deploy`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Tests de la lógica de agenda |
| `npm run typecheck` | Chequeo de tipos |
| `npm run db:migrate` | Crea una migración nueva tras editar `prisma/schema.prisma` |
| `npm run db:studio` | Explorador visual de la base |
