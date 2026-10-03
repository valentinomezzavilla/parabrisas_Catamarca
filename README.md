# Parabrisas Catamarca — Sistema de gestión

Stock de cristales y turnero del local. Es una app **Node.js** (Express + vistas EJS, en TypeScript) con PostgreSQL. Arquitectura y modelo de datos: [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

## Puesta en marcha

Requisitos: Node 20+ y PostgreSQL.

```bash
npm install
cp .env.example .env          # completar DATABASE_URL, SESSION_SECRET, ADMIN_USUARIO y ADMIN_PASSWORD
npx prisma migrate deploy     # crea las tablas
npm run db:seed               # catálogos, servicios, campos propios por defecto y el primer administrador
npm run dev                   # http://localhost:3000 (recompila los estilos y reinicia el servidor al guardar)
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

## Producción

```bash
npm ci
npm run build                 # genera el cliente de Prisma, public/css/app.css y dist/server.js
npx prisma migrate deploy
npm start                     # node dist/server.js (puerto: variable PORT, por defecto 3000)
```

Corre en cualquier servidor con Node 20+ (un VPS con PM2 o systemd, Railway, Render…). Si va detrás de un proxy (Nginx, Caddy), tiene que reenviar el encabezado `Host` (o `X-Forwarded-Host`): los formularios se rechazan si el `Origin` no coincide con el sitio. En producción la cookie de sesión es `Secure`, así que hace falta HTTPS.

## Mercado Pago (seña de los turnos)

Los servicios con precio base cobran una seña del 50 % al reservar. Para activarlo:

1. En el [panel de desarrolladores de Mercado Pago](https://www.mercadopago.com.ar/developers/panel) creá una aplicación y copiá las credenciales (primero las de **prueba**).
2. Completá en `.env`: `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` y `APP_URL` (la URL pública de la app, sin barra final).
3. Configurá el webhook (evento **Pagos**) apuntando a `<APP_URL>/api/mercadopago/webhook`; la clave secreta que te muestra es `MP_WEBHOOK_SECRET`.
4. Aplicá la migración en cada base: `npx prisma migrate deploy` (crea la tabla `pagos`).

En desarrollo local (`APP_URL=http://localhost:3000`) Mercado Pago no puede avisar a tu computadora: para probar el webhook hace falta un túnel https (ngrok o cloudflared) y poner esa URL en `APP_URL`. Sin túnel, el turno igual se confirma cuando el cliente vuelve a la página de confirmación. Los pagos que hay que devolver aparecen en el inicio del panel.

## Administración de campos

Con el rol Administrador, el menú **Administración** permite ver el tipo de cada campo de Stock, renombrarlo, ocultarlo, reordenarlo, sumar campos propios y administrar las listas (marcas, tipos, ubicaciones, vehículos). Los campos que el sistema necesita para funcionar (código, marca, cantidad…) se pueden renombrar pero no ocultar ni borrar.

### Si actualizás una base que ya tenía características

La versión anterior guardaba atributos extra en las tablas `caracteristicas` y `cristal_caracteristicas`; ahora son campos propios. Para no perder datos, en este orden:

1. `npx prisma migrate deploy`: aplica la migración de campos. La migración que **elimina** las tablas viejas frena con el mensaje "Corré primero: npm run db:migrar-caracteristicas".
2. `npm run db:migrar-caracteristicas`: copia las características y sus valores. Se puede correr las veces que haga falta y en cualquier orden respecto de `npm run db:seed` (reutiliza los campos que ya existan y no pisa valores).
3. Si el paso 1 frenó: `npx prisma migrate resolve --rolled-back 20260930140000_eliminar_caracteristicas` y de nuevo `npx prisma migrate deploy`.

En una base nueva no hace falta nada de esto.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (Express con recarga + Tailwind en modo watch) |
| `npm run build` | Compila estilos y servidor para producción |
| `npm start` | Arranca la versión compilada (`dist/server.js`) |
| `npm test` | Tests (lógica de agenda, pagos, campos y protección de rutas) |
| `npm run typecheck` | Chequeo de tipos |
| `npm run db:migrate` | Crea una migración nueva tras editar `prisma/schema.prisma` |
| `npm run db:studio` | Explorador visual de la base |
