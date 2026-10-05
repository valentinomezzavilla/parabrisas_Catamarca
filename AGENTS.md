# Parabrisas Catamarca — notas para agentes

App Node.js: **Express 5 + vistas EJS + TypeScript**, con Prisma 7 sobre PostgreSQL. No usa Next.js ni React.
Arquitectura y convenciones: [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

- La lógica de negocio vive en `src/modules` (sin Express). Las rutas (`src/rutas`) solo leen el formulario, llaman al módulo y renderizan o redirigen.
- Plantillas en `views/`; piezas de HTML reutilizables en `src/web/componentes.ts`. En EJS, `<%= %>` escapa y `<%- %>` no: usar `<%- %>` solo con HTML armado por esos helpers.
- La sesión y el rol se exigen en `src/app.ts` antes de montar las rutas; una ruta nueva queda protegida por defecto. `src/guardia-rutas.test.ts` lo verifica.
- Antes de terminar: `npm run typecheck` y `npm test`.
