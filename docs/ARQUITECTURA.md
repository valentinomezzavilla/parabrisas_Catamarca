# Parabrisas Catamarca — Arquitectura

## Stack

| Capa | Elección | Por qué |
|---|---|---|
| App web (panel + turnero público) | **Next.js 16** (App Router, React 19, TypeScript) | Un solo proyecto para frontend y backend (Server Components / Server Actions). Fácil de desplegar. |
| Base de datos | **PostgreSQL** | Relacional (el stock y la agenda son datos muy relacionados), transacciones y locks para evitar sobreventa y turnos duplicados. |
| ORM | **Prisma 7** + `@prisma/adapter-pg` | Esquema declarativo, migraciones versionadas, tipos generados. |
| Validación | **Zod 4** | Las mismas reglas sirven para formularios y servidor. |
| Estilos | **Tailwind CSS 4** con tokens de marca (`src/app/globals.css`) | La paleta vive en un solo lugar. |
| Tests | **Vitest** | Lógica de agenda como función pura, testeada sin base. |
| Sesión | **jose** (JWT firmado en cookie `httpOnly`) + `scrypt` de `node:crypto` | Login propio sin dependencias nativas. Ver "Acceso y sesión". |

Despliegue sugerido: Vercel o un VPS con Node + PostgreSQL gestionado (Neon, Supabase, Railway). Para un solo local alcanza el plan inicial de cualquiera de ellos.

## Estructura

```
prisma/
  schema.prisma          ← modelo de datos completo
  migrations/            ← historial SQL versionado
  seed.ts                ← catálogos + servicios por defecto
src/
  app/                   ← rutas Next.js (UI)
  components/layout/     ← barra lateral, shell
  lib/db.ts              ← cliente Prisma
  lib/tiempo.ts          ← zona horaria (UTC-3), conversión HH:MM ↔ minutos
  lib/sesion.ts          ← cookie de sesión y guardias (verificarSesion, requerirRol)
  lib/token.ts           ← JWT de sesión (jose)
  lib/password.ts        ← hash de contraseñas (scrypt)
  proxy.ts               ← redirige a /login cuando no hay sesión
  modules/
    inventario/          ← schemas.ts (Zod) + cristal.service.ts
    turnos/              ← schemas.ts + servicio.service.ts + disponibilidad.ts (pura, con tests)
```

Cada módulo expone funciones de servicio (`crearCristal`, `registrarMovimiento`, `reservarTurno`...). Las pantallas y Server Actions llaman a esas funciones y nunca usan Prisma directamente: así la lógica de negocio queda en un solo lugar.

## Modelo de datos

### Inventario

```
MarcaCristal ─┐
TipoCristal ──┼─< Cristal >── CristalCaracteristica >── Caracteristica
UbicacionVeh ─┘      │
                     ├─< CompatibilidadVehiculo >── ModeloVehiculo >── MarcaVehiculo
                     └─< MovimientoStock
```

| Tabla | Campos clave | Notas |
|---|---|---|
| `marcas_cristal` | nombre | Pilkington, Fuyao, Vitro, AGC… |
| `tipos_cristal` | nombre, descripcion | Laminado, templado, laminado acústico. Es un catálogo, no un enum: se amplía desde el panel. |
| `ubicaciones_vehiculo` | nombre, tiene_lado, orden | Parabrisas, luneta, puertas, ventilete… |
| `cristales` | codigo (SKU), codigo_fabricante, descripcion, marca/tipo/ubicacion, lado, ancho_mm, alto_mm, espesor_mm, **cantidad**, stock_minimo, ubicacion_deposito, costo, precio_venta, activo | `cantidad` solo cambia junto con un movimiento. |
| `caracteristicas` | nombre, tipo_dato (BOOLEANO/TEXTO/NUMERO/OPCION), opciones[], unidad | Atributos extra definibles sin migrar: sensor de lluvia, antena, calefaccionado, tonalidad… |
| `cristal_caracteristicas` | cristal_id, caracteristica_id, valor | Valor de cada atributo por cristal. |
| `marcas_vehiculo` / `modelos_vehiculo` | nombre | Toyota → Hilux. |
| `compatibilidades_vehiculo` | cristal_id, modelo_id, anio_desde, anio_hasta, carroceria | Un cristal sirve para N modelos y rangos de años. `anio_hasta` nulo = sigue vigente. |
| `movimientos_stock` | cristal_id, tipo (INGRESO/EGRESO/AJUSTE), cantidad (con signo), saldo, motivo, turno_id | Historial auditable. Un egreso puede vincularse al turno de colocación. |

Los campos fijos cubren lo que se busca y filtra siempre (marca, tipo, ubicación, tamaño, stock). Lo variable según el modelo del vehículo va en `caracteristicas`, así se suman atributos sin tocar el esquema.

### Turnos

```
Servicio ─< HorarioServicio
   │ └───< BloqueoAgenda   (servicio_id nulo = cierra todo el local)
   └─< Turno >── Cliente
         └── Cristal (opcional, para colocaciones)
```

| Tabla | Campos clave | Notas |
|---|---|---|
| `servicios` | nombre, slug, duracion_minutos, intervalo_minutos, margen_minutos, capacidad, anticipacion_minutos, precio_base, color, requiere_cristal, activo, archivado_en | Cada servicio se configura por separado. |
| `horarios_servicio` | servicio_id, dia_semana (0–6), hora_inicio, hora_fin (minutos desde 00:00) | Admite varias franjas por día (horario cortado). |
| `bloqueos_agenda` | servicio_id?, inicio, fin, motivo | Feriados, vacaciones, cierres puntuales. |
| `clientes` | nombre, telefono, email | Se reutiliza por teléfono. |
| `turnos` | servicio_id, cliente_id, inicio, fin, estado, vehiculo, patente, cristal_id, precio | `fin` y `precio` se copian al reservar: si después cambia el servicio, los turnos ya dados no se alteran. |

**Parámetros por servicio:**
- `duracionMinutos`: cuánto dura el trabajo.
- `intervaloMinutos`: cada cuánto se ofrece un horario de inicio (un lavado de 60' ofrecido cada 30').
- `margenMinutos`: preparación o limpieza después de cada trabajo.
- `capacidad`: vehículos atendidos a la vez (boxes u operarios).
- `anticipacionMinutos`: antelación mínima para reservar.

**Cálculo de disponibilidad** (`modules/turnos/disponibilidad.ts`): recorre cada franja del día en pasos de `intervalo`, descarta los inicios cuyo trabajo no termina antes del cierre, los que caen dentro de un bloqueo y los que no respetan la anticipación. Para cada inicio calcula la **máxima simultaneidad real** de los turnos existentes (no la cantidad de turnos superpuestos). Así, con capacidad 2, dos turnos consecutivos que nunca coinciden entre sí ocupan un solo cupo.

**Reservas concurrentes:** `reservarTurno` toma un `pg_advisory_xact_lock` por servicio y recalcula la disponibilidad dentro de la transacción. Si dos personas eligen el último cupo a la vez, una recibe `TurnoNoDisponibleError`.

**Baja de servicios:** si nunca tuvo turnos se borra. Si tiene historial se **archiva** (`activo = false`, `archivado_en`): deja de ofrecerse y los turnos pasados siguen consultables.

### Zona horaria
Las fechas se guardan en UTC. Las franjas se guardan como minutos locales. Catamarca es UTC-3 fijo (Argentina no usa horario de verano). Toda la conversión está en `src/lib/tiempo.ts`.

## Acceso y sesión

Tabla `usuarios`: `usuario` (único; nombre de usuario en minúsculas, un email también sirve), `nombre`, `password_hash` (`scrypt$sal$clave`), `rol` (`ADMIN` | `EMPLEADO`), `activo`, `ultimo_acceso`.

La cookie `sesion` (httpOnly, sameSite=lax, 8 h) guarda un JWT firmado con `SESSION_SECRET` que solo contiene el id del usuario. En **cada request** se vuelve a leer al usuario en la base: desactivarlo o cambiarle el rol surte efecto de inmediato.

Tres capas de protección:
1. `src/proxy.ts`: chequeo optimista de la cookie; redirige a `/login`. No consulta la base.
2. Layout y **cada página** del panel llaman a `verificarSesion()` (el layout no se vuelve a renderizar al navegar).
3. **Cada Server Action** empieza con `verificarSesion()` o `requerirRol("ADMIN")`. Un test estático (`src/guardia-acciones.test.ts`) falla si una acción nueva del panel no lo hace.

El Empleado solo accede a Panel, Turnos y Stock. Reglas: nadie puede desactivarse ni cambiarse el rol a sí mismo, y siempre queda al menos un Admin activo.

## Identidad visual

El logo (`public/brand/logo-amarillo.png`) usa **un único color: `#FDDD3D`**, sobre fondo transparente. El resto de la paleta se deriva de ese color:

| Rol | Token | Valor | Uso |
|---|---|---|---|
| Primario | `amarillo-400` / `marca` | `#FDDD3D` | Color exacto del logo. Botones, estado activo, barras de acento. |
| Primario oscuro | `amarillo-600` | `#C49A00` | Hover, bordes. |
| Acento de texto | `amarillo-700` / `acento` | `#8A6500` | Texto o íconos "amarillos" sobre fondo claro (contraste 5.3:1). |
| Secundario | `grafito-900` | `#16171B` | Barra lateral, texto sobre amarillo (13.3:1). |
| Neutros | `grafito-50…950` | | Fondos, bordes, texto secundario. |
| Estados | `exito` / `alerta` / `peligro` | `#2F9E62` / `#D97706` / `#D64545` | Confirmado / stock bajo / cancelado. |

Regla de contraste: el amarillo del logo sobre blanco da **1.35:1**, así que nunca se usa como texto sobre fondo claro. Va como relleno con texto grafito encima, o como texto sobre grafito. Tipografía: Montserrat ExtraBold para títulos (cercana a la geométrica pesada del logo) e Inter para el cuerpo. Hay modo oscuro automático.

## Pantallas

| Ruta | Qué hace |
|---|---|
| `/` | Panel: turnos de hoy, pendientes de confirmar y stock para reponer. |
| `/turnos?fecha=` | Agenda diaria con tira semanal, horarios libres por servicio, cambio de estado y asignación de cristal. |
| `/stock` | Listado con búsqueda por código o texto, vehículo y año, ubicación y tipo. |
| `/stock/nuevo`, `/stock/[id]`, `/stock/[id]/editar` | Alta, ficha (movimientos e historial) y edición de cristales. |
| `/servicios`, `/servicios/nuevo`, `/servicios/[id]` | Servicios del turnero: tiempos, capacidad y franjas por día. Se pueden pausar o eliminar. |
| `/login` | **Pública.** Ingreso al panel. |
| `/usuarios`, `/usuarios/nuevo` | Solo Admin: alta, rol, activar/desactivar y nueva contraseña. |
| `/reservar` | **Pública.** El cliente elige servicio, día y horario, y carga sus datos. |

Las rutas del panel están en `src/app/(panel)` (con barra lateral) y las públicas en `src/app/(publico)`. Cada sección tiene su `acciones.ts` con las Server Actions, que solo leen el formulario y delegan en `src/modules`.

**Estados de un turno:** Pendiente → Confirmado → En curso → Completado (o Cancelado / No vino). Al **completar** un turno que tiene cristal asignado, se registra el egreso de stock vinculado al turno, una sola vez. Si no hay stock, el turno no se completa y se avisa.

## Pendiente

1. Protección anti-spam de `/reservar` (límite de reservas por teléfono o IP, o captcha).
2. ABM de catálogos desde el panel (marcas, tipos, modelos de vehículo, características). Por ahora se cargan con el seed o con `npm run db:studio`.
3. Bloqueos de agenda (feriados, vacaciones) desde el panel. La tabla ya existe y el cálculo de disponibilidad los respeta.
4. Recordatorios de turno por WhatsApp.
5. Si dos servicios comparten el mismo box, agregar una tabla `recursos` y medir la capacidad por recurso en lugar de por servicio.
6. Límite de intentos de login (hoy no hay freno contra fuerza bruta).
7. "Olvidé mi contraseña" por email (hoy la resetea un Admin desde Usuarios).
8. Segundo factor (2FA).
9. Resetear una contraseña no cierra las sesiones abiertas (cookie de 8 h); para cortar un acceso de inmediato hay que desactivar al usuario.
