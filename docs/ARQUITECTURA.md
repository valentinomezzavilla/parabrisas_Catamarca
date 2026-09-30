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

## Próximos pasos sugeridos
1. Autenticación del panel (Auth.js) con roles admin / mostrador.
2. Pantallas: ABM de stock, ABM de servicios, agenda semanal y turnero público (`/reservar`).
3. Al completar un turno de colocación, generar el `EGRESO` del cristal asociado.
4. Recordatorios de turno por WhatsApp.
5. Si en el futuro dos servicios comparten el mismo box, agregar una tabla `recursos` y medir la capacidad por recurso en lugar de por servicio.
