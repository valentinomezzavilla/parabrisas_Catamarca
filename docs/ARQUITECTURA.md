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
    (panel)/administracion/  ← Administración de campos y listas (solo Admin)
  components/layout/     ← barra lateral, shell
  lib/db.ts              ← cliente Prisma
  lib/tiempo.ts          ← zona horaria (UTC-3), conversión HH:MM ↔ minutos
  lib/sesion.ts          ← cookie de sesión y guardias (verificarSesion, requerirRol)
  lib/token.ts           ← JWT de sesión (jose)
  lib/password.ts        ← hash de contraseñas (scrypt)
  proxy.ts               ← redirige a /login cuando no hay sesión
  modules/
    inventario/          ← schemas.ts (Zod) + cristal.service.ts
    campos/              ← campos configurables: registro del sistema, combinación, valores propios, servicios
    turnos/              ← schemas.ts + servicio.service.ts + disponibilidad.ts (pura, con tests)
```

Cada módulo expone funciones de servicio (`crearCristal`, `registrarMovimiento`, `reservarTurno`...). Las pantallas y Server Actions llaman a esas funciones y nunca usan Prisma directamente: así la lógica de negocio queda en un solo lugar.

## Modelo de datos

### Inventario

```
MarcaCristal ─┐
TipoCristal ──┼─< Cristal  (campos propios en la columna extras)
UbicacionVeh ─┘      │
                     ├─< CompatibilidadVehiculo >── ModeloVehiculo >── MarcaVehiculo
                     └─< MovimientoStock
```

| Tabla | Campos clave | Notas |
|---|---|---|
| `marcas_cristal` | nombre | Pilkington, Fuyao, Vitro, AGC… |
| `tipos_cristal` | nombre, descripcion | Laminado, templado, laminado acústico. Es un catálogo, no un enum: se amplía desde el panel. |
| `ubicaciones_vehiculo` | nombre, tiene_lado, orden | Parabrisas, luneta, puertas, ventilete… |
| `cristales` | codigo (SKU), codigo_fabricante, descripcion, marca/tipo/ubicacion, lado, ancho_mm, alto_mm, espesor_mm, **cantidad**, stock_minimo, ubicacion_deposito, costo, precio_venta, activo, extras | `cantidad` solo cambia junto con un movimiento. |
| `campos_personalizados` | entidad, clave, etiqueta, ayuda, tipo (TEXTO/TEXTO_LARGO/NUMERO/SI_NO/LISTA/FECHA), requerido, unidad, opciones (JSON), orden, visible, archivado_en | Campos propios definidos desde Administración. Sus valores viven en `cristales.extras`, indexados por `clave` (que no cambia nunca). |
| `configuracion_campos` | entidad, clave, etiqueta, ayuda, oculto, orden | Ajustes del Admin sobre los campos del sistema. Sin fila, rige la configuración de fábrica (`src/modules/campos/registro.ts`). |
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

## Administración de campos

Solo Admin. `/administracion` muestra una card por módulo (hoy están habilitados **Stock** y **Servicios**; Turnos y clientes viene después).

Las pantallas de campos están **parametrizadas por módulo**: `MODULOS` (`src/modules/campos/modulos.ts`) fija la entidad y las rutas de cada uno, y los componentes y las Server Actions compartidos viven en `src/app/(panel)/administracion/_campos`. Una Server Action recibe el módulo desde el cliente y lo valida con `esModulo`: nunca se confía en él.

**Servicios.** Solo campos propios: valores en `servicios.extras`, se completan en la sección "Datos adicionales" al crear o editar un servicio y se ven en la lista de `/servicios`. Los campos del sistema del servicio (nombre, duración, precio, franjas…) se muestran como **fijos**: no se renombran, ocultan ni mueven, y el servidor lo rechaza aunque el pedido se arme a mano (`CampoSistema.fijo`). No se muestran al cliente en `/reservar`. Un campo propio obligatorio no invalida a los servicios existentes: el valor se pide la próxima vez que se edite el servicio.

- **Campos del sistema** (`src/modules/campos/registro.ts`): los trae el código. Los **protegidos** (código, descripción, marca, tipo, ubicación, stock mínimo, cantidad) no se ocultan ni cambian de tipo; a todos se les puede cambiar etiqueta, ayuda y orden, y a los demás ocultarlos. Esos ajustes se guardan en `configuracion_campos`.
- **Campos propios**: seis tipos (texto, texto largo, número, sí/no, lista, fecha). Definición en `campos_personalizados`, valores en `cristales.extras`. Se pueden archivar (conservan sus valores) o eliminar (borran sus valores, con confirmación que muestra cuántos registros se afectan). Cambiar el tipo también borra los valores.
- **Listas**: marcas, tipos, ubicaciones y marcas y modelos de vehículo siguen siendo tablas reales (integridad referencial). Se administran en `/administracion/stock/listas`: lo desactivado deja de ofrecerse pero se sigue viendo donde ya está cargado; solo se borra lo que no está en uso.
- **Formularios y ficha** de cristal se arman desde `combinarCampos()`. Editar un cristal solo cambia lo que el formulario envía: un campo oculto conserva su valor (por eso `actualizarCristalSchema` no tiene valores por defecto).
- Una opción de lista propia se guarda por **id**: renombrarla no toca los datos.

## Acceso y sesión

Tabla `usuarios`: `usuario` (único; nombre de usuario en minúsculas, un email también sirve), `nombre`, `password_hash` (`scrypt$sal$clave`), `rol` (`ADMIN` | `EMPLEADO`), `activo`, `ultimo_acceso`.

La cookie `sesion` (httpOnly, sameSite=lax, 8 h) guarda un JWT firmado con `SESSION_SECRET` que solo contiene el id del usuario. En **cada request** se vuelve a leer al usuario en la base: desactivarlo o cambiarle el rol surte efecto de inmediato.

Tres capas de protección:
1. `src/proxy.ts`: chequeo optimista de la cookie; redirige a `/login`. No consulta la base.
2. Layout y **cada página** del panel llaman a `verificarSesion()` (el layout no se vuelve a renderizar al navegar).
3. **Cada Server Action** empieza con `verificarSesion()` o `requerirRol("ADMIN")`. Un test estático (`src/guardia-acciones.test.ts`) falla si una acción nueva del panel no lo hace.

El Empleado solo accede a Panel, Turnos y Stock. Reglas: nadie puede desactivarse ni cambiarse el rol a sí mismo, y siempre queda al menos un Admin activo.

**Límite de intentos de login.** Tras 5 fallos seguidos, ese nombre de usuario queda bloqueado 15 minutos y se destraba solo (constantes `MAX_FALLOS` y `BLOQUEO_MINUTOS` en `src/modules/usuarios/limite.ts`). Con el bloqueo vigente ni se mira la contraseña: aunque sea correcta hay que esperar. Los fallos se cuentan en la tabla `intentos_login` por nombre de usuario, **exista o no**, así el bloqueo no revela qué cuentas existen. Sin fallos durante 15 minutos el contador vuelve a cero, y un login correcto lo borra. El conteo corre dentro de una transacción con `pg_advisory_xact_lock` por usuario, para que intentos en paralelo no se salten el límite. Cada fallo borra además las filas con más de un día. Límite aceptado: quien conozca un nombre de usuario puede bloquearlo 15 minutos a propósito; no se limita por IP.

## Seña con Mercado Pago

Un turno de un servicio con `precio_base` pide una **seña del 50 %** (en pesos enteros, `calcularSena` en `src/modules/pagos/sena.ts`). Sin precio no hay seña y el turno nace `PENDIENTE` como siempre. La seña no se devuelve nunca; la reserva lo dice y exige una casilla de aceptación (queda registrada en `pagos.acepto_condiciones_en`). Única excepción: un pago cobrado que quedó sin turno.

- **Estado y vencimiento.** El turno nace `ESPERANDO_PAGO` con `vence_en = ahora + 8 min` y un `Pago` `PENDIENTE`. La disponibilidad ignora los `ESPERANDO_PAGO` vencidos, así el horario se libera solo; `liberarVencidos()` (se llama al cargar `/reservar`, la agenda y el inicio) pasa esos turnos a `CANCELADO` y sus pagos a `VENCIDO`.
- **Tabla `pagos`.** `monto`, `estado` (`PENDIENTE`, `APROBADO`, `RECHAZADO`, `VENCIDO`), ids de Mercado Pago (`mp_preferencia_id`, `mp_init_point`, y `mp_pago_id`, **único**), `requiere_devolucion` / `motivo_devolucion` / `devuelto_en`. El id del pago viaja a Mercado Pago como `external_reference`.
- **Flujo.** `reservarTurno` crea turno y pago dentro del lock por servicio → `iniciarCobro` crea la preferencia (Checkout Pro, 8 minutos, sin efectivo ni cajero) y redirige → Mercado Pago devuelve a `/reservar/confirmado`, que **consulta a Mercado Pago** (nunca confía en la URL) → en paralelo llega el webhook `POST /api/mercadopago/webhook` (público, con firma `x-signature` validada). Ambos llaman a `aplicarPagoMp`, que es idempotente y corre dentro del lock del servicio.
- **Decisión sobre un pago** (`decidirPago`, función pura con tests): aprobado a tiempo confirma; aprobado tarde confirma si el horario sigue libre y, si no, queda **para devolver**; también van a devolver el monto distinto, el turno cancelado a mano y el pago duplicado. Los pagos para devolver se ven en el inicio del panel y se marcan con "Ya lo devolví" (la devolución se hace a mano desde Mercado Pago).
- **Turnos cargados por el local.** Quien reserva con una sesión del panel iniciada (botón "Nuevo turno") no paga seña: el turno nace `PENDIENTE`.
- **Configuración.** `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` y `APP_URL` en `.env`. El cliente de Mercado Pago (`src/lib/mercadopago.ts`) usa `fetch`, sin SDK.

## Editar y cancelar reservas

- **Código de reserva.** Cada turno tiene `turnos.codigo` (6 caracteres del alfabeto `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, sin 0, O, 1 ni I; único). Se muestra en la página de confirmación ("Guardalo para buscar o cancelar tu reserva") y en la agenda del panel. A los turnos anteriores a esta función la migración les completó un código hexadecimal único.
- **Editar en el panel** (`/turnos/[id]/editar`, cualquier usuario con sesión). Se editan servicio, día y hora, nombre, teléfono, mail, vehículo, patente, cristal, precio y notas de los turnos `Pendiente`, `Confirmado` y `En curso` (no los completados, cancelados, ausentes ni los que esperan el pago). Si cambia el servicio o el horario, `editarTurno` toma el bloqueo por servicio de destino, recalcula la disponibilidad **ignorando el propio turno** y no guarda si el horario no está libre; la hora de fin se recalcula con la duración del servicio. Nunca toca los pagos: la seña pagada no se recalcula. Si cambia el teléfono, el turno pasa al cliente que tenga ese teléfono (o se crea uno) sin pisarle el nombre; si no, nombre y mail se corrigen en la ficha actual.
- **Cancelar en el panel.** La confirmación del botón "Cancelar" avisa cuando el turno tiene una seña cobrada ("no se devuelve automáticamente"). Cancelar libera el horario.
- **"Buscar tu reserva" en `/reservar`.** Un modal con ocho campos opcionales (código, nombre, teléfono, mail, patente, vehículo, servicio y día) que se combinan con "y". Hace falta al menos un dato que identifique: **el servicio y el día solos no alcanzan**. Comparación: código y mail exactos, teléfono por dígitos (uno termina con el otro, mínimo 6), patente sin espacios ni guiones, nombre y vehículo por coincidencia parcial sin tildes (mínimo 3 letras). Se consideran los turnos `Pendiente`, `Confirmado` y `Esperando pago` que empiezan en el futuro. Resultado: ninguna coincidencia, varias (no se muestra nada) o una exacta, con servicio, día, hora, estado y seña pagada, y nombre y patente **tapados**; nunca se muestran mail, precio, cristal ni notas, y **ni un dígito del teléfono** (con unos pocos dígitos se podría adivinar el resto y cancelar el turno de otra persona). Va por Server Action (POST), sin datos personales en la dirección.
- **Cancelar desde el portal.** Pide escribir el teléfono **completo** (con código de área; los últimos dígitos solos no alcanzan) o el mail completo de la reserva. Si hay seña pagada, avisa que no se devuelve. El turno queda `Cancelado` con la nota "Cancelado por el cliente el dd/mm hh:mm". Su pago pendiente **no** se marca vencido a propósito: si Mercado Pago lo aprueba después, `decidirPago` lo trata como "turno cancelado" y lo deja para devolver, en vez de reconfirmar el turno. La cancelación toma el mismo bloqueo por servicio que `aplicarPagoMp`, y un turno que espera el pago y ya venció no se puede cancelar.
- **Protecciones.** Tras 5 intentos fallidos de verificación para un mismo turno, 15 minutos de bloqueo (mismas reglas que el login, clave `cancelar:<id>` en `intentos_login`); tope de 30 búsquedas **sin resultado** por minuto en todo el sitio (clave `busqueda:<minuto>`): las búsquedas que sí encuentran una reserva no gastan el tope. Sin una identidad por visitante no se puede evitar que alguien lo agote a propósito: en ese caso el buscador deja de responder por un minuto, pero reservar y el resto del sitio siguen andando. Límite aceptado: quien conozca un dato único de otra persona (por ejemplo su patente) puede ver que tiene un turno vigente y sus datos tapados; para cancelarlo necesita su teléfono o mail.

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

### Componentes y adaptación a celular y tablet

Los componentes compartidos están en `src/components/ui/index.tsx`: `boton`, `input`, `tarjeta`, `EncabezadoPagina` (barra amarilla junto al título), `Estadistica` (tarjeta de resumen con franja de color e icono), `ChipIcono`, `Insignia`, `Aviso` y `Vacio`. Las sombras y el resplandor amarillo del fondo oscuro son tokens en `src/app/globals.css`.

| Ancho | Navegación | Listas |
|---|---|---|
| Celular (< 768 px) | Barra superior compacta + **barra inferior fija** (Panel, Turnos, Stock y "Más", que abre una hoja con el resto, la página pública y Salir). | Tarjetas, sin scroll horizontal. Los filtros de Stock se pliegan detrás de un botón. |
| Tablet (768–1023 px) | **Riel de iconos** (4 rem) con el nombre en `title` y `aria-label`. | Tarjetas (la tabla necesita más ancho). |
| Escritorio (≥ 1024 px) | Barra lateral completa, con grupos "Operación" y "Gestión". | Tablas. |

El menú se define una sola vez en `src/components/layout/navegacion.ts` y lo usan `BarraLateral`, `BarraInferior` y `BarraSuperiorMovil`. Botones y campos miden 44 px de alto en celular y llevan texto de 16 px para evitar el zoom automático de iOS. Regla para grillas nuevas: en celular usar siempre `grid-cols-1` (o `minmax(0, 1fr)`); sin columnas definidas, la grilla se ensancha con su contenido y aparece scroll horizontal.

## Pantallas

| Ruta | Qué hace |
|---|---|
| `/` | Panel: turnos de hoy, pendientes de confirmar y stock para reponer. |
| `/turnos?fecha=` | Agenda diaria con tira semanal, horarios libres por servicio, cambio de estado y asignación de cristal. |
| `/stock` | Listado con búsqueda por código o texto, vehículo y año, ubicación y tipo. |
| `/stock/nuevo`, `/stock/[id]`, `/stock/[id]/editar` | Alta, ficha (movimientos e historial) y edición de cristales. |
| `/servicios`, `/servicios/nuevo`, `/servicios/[id]` | Servicios del turnero: tiempos, capacidad y franjas por día. Se pueden pausar o eliminar. |
| `/administracion` | Solo Admin. Cards por módulo. |
| `/administracion/stock` | Solo Admin. Campos de Stock: ver tipos, renombrar, ocultar, reordenar y crear campos propios. |
| `/administracion/stock/listas` | Solo Admin. Listas de Stock: marcas, tipos, ubicaciones, marcas y modelos de vehículo. |
| `/administracion/servicios`, `/administracion/servicios/campos/nuevo`, `/administracion/servicios/campos/[clave]` | Solo Admin. Campos de Servicios: los del sistema (fijos) y los propios (crear, editar, ordenar, archivar y eliminar). |
| `/login` | **Pública.** Ingreso al panel. |
| `/usuarios`, `/usuarios/nuevo` | Solo Admin: alta, rol, activar/desactivar y nueva contraseña. |
| `/reservar` | **Pública.** El cliente elige servicio, día y horario, carga sus datos y, si el servicio tiene precio, paga la seña por Mercado Pago. Incluye "Buscar tu reserva" para ver y cancelar una reserva. |
| `/reservar/confirmado` | **Pública.** Estado del turno y del pago; consulta a Mercado Pago al cargar; muestra el código de reserva. |
| `/turnos/[id]/editar` | Edición de un turno vigente: servicio, día y hora (con la disponibilidad real), datos del cliente, vehículo, cristal, precio y notas. |
| `/api/mercadopago/webhook` | **Pública** (sin sesión): avisos de Mercado Pago, validados por firma. |

Las rutas del panel están en `src/app/(panel)` (con barra lateral) y las públicas en `src/app/(publico)`. Cada sección tiene su `acciones.ts` con las Server Actions, que solo leen el formulario y delegan en `src/modules`.

**Estados de un turno:** Pendiente → Confirmado → En curso → Completado (o Cancelado / No vino). Al **completar** un turno que tiene cristal asignado, se registra el egreso de stock vinculado al turno, una sola vez. Si no hay stock, el turno no se completa y se avisa.

## Pendiente

0. Que el cliente pueda **reprogramar** su reserva desde el portal, avisos por mail o WhatsApp al cancelar o editar, y devolución automática de la seña (hoy es a mano desde Mercado Pago).
1. Reservas falsas en servicios **sin precio base**: no cobran seña y no tienen ningún freno (límite por teléfono o IP, o captcha). Además, devolución automática de la seña (hoy se devuelve a mano desde Mercado Pago).
2. Administración de campos para Turnos y clientes (incluye los campos del formulario público `/reservar`). El motor y las pantallas ya están hechos; falta la columna `extras` y decidir qué campos propios ve el público.
   Para renombrar, ocultar o reordenar también los campos del sistema de Servicios hay que reconstruir `FormularioServicio` sobre el motor.
   Además: limpiar un campo vacío al editar un cristal (hoy un costo vacío no borra el valor guardado).
3. Bloqueos de agenda (feriados, vacaciones) desde el panel. La tabla ya existe y el cálculo de disponibilidad los respeta.
4. Recordatorios de turno por WhatsApp.
5. Si dos servicios comparten el mismo box, agregar una tabla `recursos` y medir la capacidad por recurso en lugar de por servicio.
6. "Olvidé mi contraseña" por email (hoy la resetea un Admin desde Usuarios).
7. Segundo factor (2FA).
8. Resetear una contraseña no cierra las sesiones abiertas (cookie de 8 h); para cortar un acceso de inmediato hay que desactivar al usuario.
