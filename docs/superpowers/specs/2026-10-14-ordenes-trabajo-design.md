# Órdenes de trabajo (seguros y particulares) — diseño

## Objetivo

Reemplazar la base "Órdenes de Trabajo" de Notion. Cada fila es un trabajo de colocación que llega por una
aseguradora o de un particular. El trabajo se cobra mucho después de instalarlo (las aseguradoras pagan a un mes,
aproximadamente), así que cada orden queda **pendiente de cobro** hasta que se registra el último pago.

Éxito: dejar Notion y ver en el sistema qué falta pedir, qué está instalado sin facturar, qué está facturado sin
cobrar y cuánto debe cada aseguradora.

## Decisiones

| Tema | Decisión |
|---|---|
| Alcance | Un solo módulo para **Seguro** y **Particular**, como la planilla. |
| Plata | Importe total por orden + **cobros parciales** (fecha, monto, quién pagó, medio). El saldo se calcula. |
| Agenda y stock | Conectado: desde la orden se da un turno real en la agenda, con el cliente, el vehículo y el cristal ya cargados. Al completar el turno se descuenta el stock (como hoy) y la orden pasa sola a *Instalada*. |
| Factura | Número, fecha e importe facturado. Sin adjuntos. |
| Permisos | Todos cargan órdenes, cambian estados y dan turnos. **Solo Admin** ve y carga importes, factura, cobros y la pantalla de cobranzas. |
| Datos de Notion | Se importan todos. Cada aseguradora y proveedor distinto queda como "Aseguradora 1, 2…" para renombrarlo una vez; los clientes, con su teléfono y nombre a completar. |

## Datos

```
Cliente ─< OrdenTrabajo >── Aseguradora (opcional)
             │  ├── Proveedor (opcional)
             │  ├── Cristal (opcional, del stock)
             │  └── Turno (opcional, 1 a 1)
             └─< CobroOrden
```

| Tabla | Campos clave | Notas |
|---|---|---|
| `aseguradoras` / `proveedores` | nombre (único), activo | Listas de Administración → Órdenes de trabajo. Se desactivan; solo se borran si no están en uso. |
| `ordenes_trabajo` | numero (correlativo), tipo (`SEGURO`/`PARTICULAR`), estado, recibida_el (fecha), cliente_id, vehiculo, patente, aseguradora_id, siniestro, codigo_cristal, cristal_id, proveedor_id, turno_id (único), importe_total, factura_numero, factura_fecha, factura_importe, observaciones | `codigo_cristal` es texto libre (`10314-5`): el cristal puede no estar en stock. `cristal_id` vincula con el stock cuando está. |
| `cobros_orden` | orden_id, fecha, monto, pagador (`ASEGURADORA`/`CLIENTE`), medio (`TRANSFERENCIA`, `EFECTIVO`, `TARJETA`, `CHEQUE`, `QR`, `OTRO`), nota | Se borran con la orden. |

### Mapeo desde la planilla de Notion

| Columna | Destino |
|---|---|
| Fecha de recepción | `recibida_el` |
| Patente | `patente` (mayúsculas) |
| Cliente | un cliente por página de Notion; nombre "Sin nombre" (o el texto de la columna Teléfono si no tiene dígitos, ej. "RODRI") |
| Teléfono | teléfono del cliente |
| Observaciones | el código del principio (`10314-5`) va a `codigo_cristal`; si hay algo más, el texto completo va a `observaciones` |
| Aseguradora | "Aseguradora N" por página distinta |
| Estado | mismo estado; vacío = *Falta pedir* |
| Siniestro | en seguros, si es un número o un link va a `siniestro`; si no (notas de plata como "SEÑA 70.000 SALDO 70.000"), a `observaciones` |
| Pedido al Proveedor | "Proveedor N" por página distinta |
| Tipo | tipo; vacío = Seguro si tiene aseguradora, si no Particular |
| Vehículo | `vehiculo` |
| Facturas, Cliente Seguro | vienen vacías; si traen algo, se agrega a `observaciones` |

Los importes no están en la planilla: las notas de plata quedan en observaciones y el Admin carga el total.
La importación solo corre con la tabla de órdenes vacía y todo en una transacción.

## Estados

*Falta pedir → Pedido → Turno asignado → Instalada → Facturada → Cobrada*, más *Cancelada*.

- Se eligen a mano todos menos **Cobrada**, que la pone el sistema.
- **Dar turno** pasa la orden a *Turno asignado*.
- Turno **completado** → *Instalada* (si la orden no había llegado). Turno **cancelado o ausente** → la orden vuelve
  de *Turno asignado* a *Pedido*, y se le puede dar otro turno.
- Guardar un **número de factura** en una orden *Instalada* la pasa a *Facturada*.
- Cuando lo cobrado alcanza el total, la orden pasa a **Cobrada**. Si después se borra un cobro o sube el total,
  vuelve a *Facturada* (o *Instalada* si no tiene factura).
- Una orden *Cobrada* no cambia de estado a mano. Una *Cancelada* se puede reabrir.

Reglas de plata: no se registra un cobro sin importe total cargado, ni uno que supere el saldo; el total no puede
quedar por debajo de lo cobrado.

## Pantallas

| Ruta | Quién | Qué hace |
|---|---|---|
| `/ordenes` | Todos | Listado con contadores por estado y filtros (estado, tipo, aseguradora, texto). Por defecto, las abiertas. El Admin ve el saldo. |
| `/ordenes/nueva`, `/ordenes/:id/editar` | Todos | Datos de la orden (sin plata). |
| `/ordenes/:id` | Todos | Ficha: datos, estado, turno. El Admin ve además facturación, cobros y saldo. |
| `/ordenes/:id/turno` | Todos | Elegir servicio, día y horario libre; crea el turno en la agenda. |
| `/ordenes/cobranzas` | Admin | Lo que falta cobrar de trabajos instalados o facturados, agrupado por aseguradora (y "Particulares"), con días desde la factura. Aparte: instaladas sin importe. |
| `/administracion/ordenes` | Admin | Listas de aseguradoras y proveedores, e importar desde Notion (pegar o elegir el CSV). |

En la agenda, el turno que vino de una orden muestra un enlace "Orden #N".

## Código

- `src/modules/ordenes/estados.ts`: reglas puras (saldo, situación de cobro, estado tras cobros, estado tras el turno), con tests.
- `src/modules/ordenes/schemas.ts`: Zod de orden, facturación y cobro, con tests.
- `src/modules/ordenes/notion.ts`: lectura del CSV y mapeo de filas, puro, con tests.
- `src/modules/ordenes/orden.service.ts`: consultas y operaciones; `sincronizar.ts`: el ajuste de la orden cuando cambia su turno (lo llama `cambiarEstadoTurno` dentro de su transacción).
- `src/rutas/ordenes.ts` y `views/ordenes/`. Guardia de Admin para `/ordenes/cobranzas`, `/ordenes/:id/facturacion` y `/ordenes/:id/cobros`.
