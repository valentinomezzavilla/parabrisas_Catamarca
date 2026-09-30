# Login del panel — Diseño

Fecha: 2026-09-30

## Objetivo

Que nadie pueda ver ni modificar el panel (stock, servicios, turnos) sin iniciar sesión. `/reservar` sigue siendo pública. Cierra los tres `TODO(auth)` de `src/app/(panel)/{stock,servicios,turnos}/acciones.ts`.

## Decisiones

| Tema | Decisión |
|---|---|
| Usuarios | Tabla `usuarios` en la base, una cuenta por persona. |
| Roles | `ADMIN` y `EMPLEADO`. |
| Sesión | Cookie firmada (JWT con `jose`) + revalidación del usuario en la base en cada request. |
| Contraseñas | `scrypt` de `node:crypto`, con sal aleatoria. Sin dependencias nativas. |
| Dependencia nueva | Solo `jose`. |

Descartados: sesiones en tabla (más piezas de las que un local necesita) y JWT sin consulta a la base (un usuario dado de baja seguiría adentro hasta que venza la cookie).

## Datos

Nuevo modelo Prisma `Usuario`, tabla `usuarios`:

- `id`, `email` (único, en minúsculas), `nombre`
- `passwordHash` (formato `scrypt$<sal>$<hash>` en base64)
- `rol`: enum `RolUsuario { ADMIN, EMPLEADO }`
- `activo` (por defecto `true`), `ultimoAcceso` (nulo hasta el primer ingreso), `creadoEn`

Una sola migración. No se toca ninguna tabla existente.

## Sesión (`src/lib/sesion.ts`, solo servidor)

- Cookie `sesion`: `httpOnly`, `sameSite=lax`, `secure` en producción, `path=/`, vence en 8 h.
- El JWT (HS256, clave `SESSION_SECRET`) contiene solo `sub` (id del usuario) y `exp`. No contiene el rol: el rol siempre se lee de la base.
- `iniciarSesion(usuarioId)` y `cerrarSesion()` escriben y borran la cookie.
- `verificarSesion()` (memoizada con `cache` de React): valida la firma y el vencimiento, busca al usuario y exige `activo`. Si falla, borra la cookie y redirige a `/login`. Devuelve `{ id, nombre, email, rol }`.
- `requerirRol("ADMIN")`: llama a `verificarSesion()` y, si el rol no alcanza, redirige a `/` (páginas) o lanza `AccesoDenegadoError` (acciones).
- `SESSION_SECRET` es obligatoria, mínimo 32 caracteres. Si falta o es corta, la app falla al arrancar con un mensaje claro. Se documenta en `.env.example`.

La lógica pura (firmar y verificar token, hashear y verificar contraseña, reglas de rol) va en módulos sin acceso a `cookies()` ni Prisma para poder testearla.

## Capas de protección

1. **`src/proxy.ts`** (Next 16 reemplaza `middleware.ts`): chequeo optimista. Sin cookie o con firma inválida redirige a `/login`. Deja pasar `/login`, `/reservar`, `/_next`, `/brand` y archivos estáticos. Es solo comodidad: no es la defensa real.
2. **Layout del panel:** llama a `verificarSesion()`.
3. **Cada Server Action** llama a `verificarSesion()` al inicio (las Server Actions pueden invocarse por POST directo, el proxy no alcanza). Las de `servicios/` y `usuarios/` exigen `ADMIN`. Los tres `TODO(auth)` se reemplazan por esa llamada.

## Pantallas

- **`/login`** (grupo de rutas `(auth)`, sin barra lateral): email y contraseña. Error genérico ("Email o contraseña incorrectos") tanto si el email no existe como si la clave es errónea o el usuario está inactivo. Para no filtrar si el email existe, se verifica un hash ficticio cuando el usuario no existe. Si ya hay sesión válida, redirige a `/`. Tras iniciar sesión actualiza `ultimoAcceso`.
- **Barra lateral:** muestra nombre y rol del usuario y un botón "Cerrar sesión". Oculta "Servicios" y "Usuarios" al `EMPLEADO`.
- **`/usuarios`** (solo `ADMIN`): lista, alta, cambio de rol, activar/desactivar y reseteo de contraseña. Reglas:
  - Nadie puede desactivarse ni cambiarse el rol a sí mismo.
  - No se puede dejar al sistema sin al menos un `ADMIN` activo.
  - Contraseña mínima de 10 caracteres.
- **`EMPLEADO`:** accede a Panel, Turnos y Stock. `/servicios/*` y `/usuarios/*` lo redirigen a `/`.

## Primer administrador

El seed (`prisma/seed.ts`) crea un `ADMIN` desde `ADMIN_EMAIL`, `ADMIN_PASSWORD` y opcionalmente `ADMIN_NOMBRE`, solo si no existe ningún usuario. Si faltan las variables y no hay usuarios, avisa por consola y no crea nada.

## Código nuevo y tocado

- Nuevo: `src/lib/sesion.ts`, `src/lib/password.ts`, `src/lib/token.ts`, `src/proxy.ts`, `src/modules/usuarios/{schemas.ts,usuario.service.ts}`, `src/app/(auth)/login/*`, `src/app/(panel)/usuarios/*`.
- Tocado: `prisma/schema.prisma` (+ migración), `prisma/seed.ts`, `.env.example`, `src/app/(panel)/layout.tsx`, `src/components/layout/BarraLateral.tsx`, los tres `acciones.ts`, `README.md` y `docs/ARQUITECTURA.md` (quitar el aviso de "sin login").
- Todas las páginas y acciones de `servicios/` llaman a `requerirRol("ADMIN")`.

## Tests (Vitest)

- Contraseña: hash distinto por cada llamada, verificación correcta e incorrecta, formato inválido.
- Token: válido, firma alterada, vencido, secreto distinto.
- Reglas de usuarios: no desactivarse a sí mismo, no quitarse el rol, no dejar sin administradores.

## Fuera de alcance (pasan a "Pendiente")

- Límite de intentos de login.
- "Olvidé mi contraseña" por email (por ahora lo resetea un Admin).
- 2FA.

## Verificación

Tests, `typecheck`, y prueba manual en `localhost:3000`: acceso sin sesión redirige a `/login`, login correcto e incorrecto, `EMPLEADO` bloqueado en servicios y usuarios (incluido por POST directo a una acción), `/reservar` sigue abierta, cierre de sesión.
