# Administración de campos — Diseño (paso 1: base + Stock)

Fecha: 2026-09-30

## Objetivo

Un módulo **Administración** (solo Admin) para manejar los campos de los datos sin tocar código: ver de qué tipo es cada campo, renombrarlo, ocultarlo, reordenarlo, administrar las opciones de las listas (por ejemplo las marcas) y sumar campos propios.

Alcance total pedido: Stock, Servicios y Turnos y clientes (todos menos Usuarios). Se construye en tres pasos, cada uno con su spec, plan e implementación:

1. **Base + Stock** (este documento): el motor de campos, la pantalla de Administración con sus cards y su aplicación a Stock, incluida la administración de listas.
2. **Servicios**: mismo motor, campos de `servicios`.
3. **Turnos y clientes**: mismo motor, campos de `turnos` y `clientes`, incluido el formulario público `/reservar` (necesita decidir qué campos propios se muestran al público; se define en su propio spec).

## Decisiones ya tomadas con el usuario

| Tema | Decisión |
|---|---|
| Módulos | Stock, Servicios, Turnos y clientes. Usuarios queda fuera (rol y contraseña se dejan fijos por seguridad). |
| Campos que el sistema necesita | **Protegidos**: no se borran ni cambian de tipo. Se les puede cambiar etiqueta y ayuda; los que no son esenciales se ocultan y reordenan. |
| Campos propios | Se crean, renombran, cambian de tipo y borran libremente. |
| Valores de campos propios | Columna JSON `extras` en cada tabla de datos + tabla de definiciones. Sin migrar la base al cambiar campos. |
| Entrada a Administración | Pantalla con **cards** por módulo (Stock, Servicios, Turnos y clientes). |
| Orden | Primero Stock; Servicios y Turnos y clientes aparecen como cards deshabilitadas ("Próximamente") hasta sus pasos. |

## Datos (una migración)

Nuevo enum `EntidadCampo { CRISTAL, SERVICIO, TURNO, CLIENTE }` (los cuatro valores desde ya, para no migrar el enum en los pasos 2 y 3) y nuevo enum `TipoCampo { TEXTO, TEXTO_LARGO, NUMERO, SI_NO, LISTA, FECHA }`.

**`campos_personalizados`** (campos propios):
- `id`, `entidad`, `clave` (nombre interno), `etiqueta`, `ayuda?`, `tipo`, `requerido`, `unidad?` (solo NUMERO), `opciones` Json (solo LISTA: `[{ id, etiqueta, activo }]`), `orden`, `visible`, `archivadoEn?`, `creadoEn`.
- `clave` se genera al crear a partir de la etiqueta (minúsculas, sin tildes, guiones bajos), es única por entidad, **no cambia nunca** aunque se renombre la etiqueta (es la llave con la que se guardan los valores).
- Único: `(entidad, clave)`.

**`configuracion_campos`** (cambios sobre campos del sistema): clave primaria `(entidad, clave)`; `etiqueta?`, `ayuda?`, `oculto` (por defecto `false`), `orden?`. Un campo del sistema sin fila usa sus valores de fábrica.

**Valores propios:** `cristales.extras Json @default("{}")`: `{ [clave]: valor }` con `TEXTO`/`TEXTO_LARGO` → string, `NUMERO` → number, `SI_NO` → boolean, `LISTA` → id de la opción, `FECHA` → `"YYYY-MM-DD"`.

**Listas del sistema:** siguen siendo tablas reales (integridad referencial con `cristales`). La migración agrega `activo Boolean @default(true)` a `tipos_cristal`, `ubicaciones_vehiculo`, `marcas_vehiculo` y `modelos_vehiculo` (`marcas_cristal` ya lo tiene), para poder desactivar opciones de cualquier lista de la misma manera.

**Migración de `Caracteristica`:** cada fila pasa a `campos_personalizados` (entidad `CRISTAL`): `BOOLEANO` → `SI_NO`, `TEXTO` → `TEXTO`, `NUMERO` → `NUMERO` (con su `unidad`), `OPCION` → `LISTA` (cada texto de `opciones` pasa a `{ id, etiqueta, activo: true }`). Los valores de `cristal_caracteristicas` se copian a `cristales.extras` convirtiéndolos al formato nuevo (`"true"` → `true`; un valor de lista que no está entre las opciones se agrega como opción inactiva para no perder el dato). Después se eliminan `caracteristicas` y `cristal_caracteristicas`. La migración es de una vía: se recomienda respaldar la base antes de aplicarla en producción.

## Motor de campos

**Registro del sistema** (código, `src/modules/campos/registro.ts`): por entidad, la lista de campos de fábrica con `clave`, etiqueta, ayuda, tipo, sección, si es protegido y si se puede ocultar.

Stock (`CRISTAL`):

| Campo | Tipo | Protegido | Se puede ocultar |
|---|---|---|---|
| `codigo` — Código interno | texto | sí | no |
| `codigoFabricante` — Código de fabricante | texto | no | sí |
| `descripcion` — Descripción | texto | sí | no |
| `marcaId` — Marca | lista (marcas de cristal) | sí | no |
| `tipoId` — Tipo de cristal | lista (tipos) | sí | no |
| `ubicacionId` — Ubicación en el vehículo | lista (ubicaciones) | sí | no |
| `lado` — Lado | lista fija | no | sí |
| `anchoMm`, `altoMm`, `espesorMm` | número (mm) | no | sí |
| `stockMinimo` — Stock mínimo | número | sí | no |
| `cantidad` — Cantidad | número, solo lectura (cambia con movimientos) | sí | no |
| `ubicacionDeposito` — Ubicación en depósito | texto | no | sí |
| `costo`, `precioVenta` | número (moneda) | no | sí |
| `compatibilidades` — Vehículos compatibles | sección especial | no | sí (solo etiqueta y visibilidad) |

Un campo protegido no se oculta, no cambia de tipo y su obligatoriedad no es editable (la base ya exige marca, tipo y ubicación). Se le puede cambiar etiqueta, ayuda y orden.

**Combinación** (`combinarCampos(entidad, configuracion, propios)`, función pura): devuelve la lista final de campos ordenada, mezclando el registro, los cambios de `configuracion_campos` y los campos propios visibles y no archivados. Es la única fuente que usan el formulario, la ficha y la pantalla de Administración.

**Validación de campos propios** (`esquemaDeExtras(propios)`, función pura): arma un esquema Zod con un campo por definición activa: tipo, `requerido`, y para `LISTA` solo ids de opciones activas (más el valor ya guardado, para no bloquear la edición de un registro viejo). Las claves desconocidas se descartan. `requerido` se exige al crear o editar un registro; los registros existentes sin ese valor no se invalidan hasta que se editen.

**Formularios y ficha de cristal:** `FormularioCristal` y la ficha se arman desde `combinarCampos`. Los campos del sistema conservan su diseño actual (secciones Identificación, Características principales, Vehículos compatibles y Stock y precios) y respetan etiqueta, ayuda, orden dentro de su sección y visibilidad. Los campos propios aparecen en una sección "Datos adicionales". Un campo del sistema oculto no se envía y no se toca su valor guardado.

## Pantallas (solo Admin)

- **`/administracion`**: cards **Stock**, **Servicios** y **Turnos y clientes**. Las dos últimas aparecen deshabilitadas con la leyenda "Próximamente".
- **`/administracion/stock`**, con dos pestañas:
  - **Campos**: tabla con todos los campos del módulo: etiqueta, tipo, origen (Sistema o Propio), obligatorio, visible y orden. Acciones por fila: editar (etiqueta, ayuda y visibilidad; en los propios además tipo, obligatorio, unidad y opciones), subir y bajar, y, solo en propios, archivar o eliminar. Botón **Nuevo campo**. En los campos de lista, enlace "Ver opciones".
  - **Listas**: administra marcas de cristal, tipos de cristal, ubicaciones (con "tiene lado" y orden) y marcas y modelos de vehículo: agregar, renombrar, reordenar (donde aplica), desactivar y borrar solo si no están en uso.
- **Menú lateral**: nuevo ítem "Administración", visible solo para el Admin. Las rutas y acciones exigen `requerirRol("ADMIN")`.

## Borrados y cambios riesgosos

- **Archivar** un campo propio lo oculta y conserva sus valores. **Eliminar** borra sus valores de todos los cristales, con una confirmación que muestra cuántos registros se afectan.
- **Cambiar el tipo** de un campo propio con datos borra esos valores, con la misma confirmación. Sin datos, se cambia sin preguntar.
- Una **opción** de lista propia en uso solo se puede desactivar; sin uso se puede borrar. Renombrarla siempre es seguro (los valores guardan el id).
- Una opción desactivada deja de ofrecerse en los formularios pero se sigue mostrando en los registros que ya la tienen.

## Errores y casos borde

- Etiquetas duplicadas dentro de la misma entidad (campos propios, o propio contra sistema) se rechazan con un mensaje claro.
- Una `clave` generada que ya exista se desambigua con un sufijo numérico.
- Si un cristal tiene en `extras` una clave sin definición (campo eliminado), se ignora al mostrarlo y se descarta al guardar.
- Un campo propio `requerido` y oculto: no se exige mientras esté oculto.
- Las opciones de una lista propia: mínimo una activa; etiquetas únicas dentro del campo.

## Código nuevo y tocado

- Nuevo: `src/modules/campos/{registro.ts, combinar.ts, extras.ts, campo.service.ts, lista.service.ts, schemas.ts}`, `src/app/(panel)/administracion/**`, componente genérico `CampoPersonalizado`.
- Tocado: `prisma/schema.prisma` (+ migración con copia de datos), `prisma/seed.ts`, `src/modules/inventario/{schemas.ts, cristal.service.ts}` (extras en alta y edición, catálogos activos), `src/app/(panel)/stock/**` (formulario, ficha y acciones), `src/components/layout/BarraLateral.tsx`, `src/guardia-acciones.test.ts` (carpeta `administracion` como solo Admin), `README.md` y `docs/ARQUITECTURA.md`.

## Tests

Con Vitest (funciones puras): `combinarCampos` (etiquetas y visibilidad sobrescritas, orden, campos propios archivados u ocultos), `esquemaDeExtras` (cada tipo, requerido, opciones activas, claves desconocidas), generación de `clave` (tildes, espacios, colisiones), operaciones sobre opciones (renombrar, desactivar, rechazar duplicadas) y conversión de la migración de `Caracteristica`. La guardia de acciones cubre `administracion`. La parte con base de datos se verifica a mano en el navegador.

## Fuera de alcance (de este paso)

- Servicios, Turnos y clientes y el formulario público `/reservar` (pasos 2 y 3).
- Filtros o columnas de la lista de stock por campos propios.
- Importar y exportar datos, historial de cambios de la configuración.
- Campos calculados o dependientes entre sí.

## Verificación

Tests y `typecheck`, y prueba manual en `localhost`: las cards de Administración; crear un campo propio de cada tipo y verlo en alta, edición y ficha de cristal; renombrar una etiqueta del sistema; ocultar y reordenar un campo; administrar las marcas (agregar, renombrar, desactivar, intentar borrar una en uso); eliminar un campo con datos con su confirmación; un Empleado que no ve ni accede a Administración (también por POST directo a una acción); y que las características existentes quedaron migradas como campos propios con sus valores.
