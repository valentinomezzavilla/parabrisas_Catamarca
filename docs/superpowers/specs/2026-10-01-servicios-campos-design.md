# Campos propios de Servicios (Administración)

Fecha: 2026-10-01

## Contexto y objetivo

Administración (solo Admin) tiene hoy el módulo **Stock** con el motor de campos propios (`src/modules/campos`). Las cards **Servicios** y **Turnos y clientes** aparecen deshabilitadas ("Próximamente"). Este documento cubre el paso 2 del diseño de `2026-09-30-administracion-campos-design.md`: **Servicios**. Turnos y clientes (paso 3) tendrá su propia especificación.

Pedido del usuario: poder **sumar datos propios al servicio** (por ejemplo garantía, tipo de vehículo, notas internas) que **vea solo el personal en el panel**. Éxito = el Admin crea un campo propio en Administración > Servicios, lo completa al crear o editar un servicio, y lo ve después en el panel.

## Decisiones tomadas con el usuario

| Tema | Decisión |
|---|---|
| Alcance | Solo **campos propios**. Los campos del sistema del servicio se muestran como referencia y quedan **fijos**: no se renombran, no se ocultan, no se reordenan. |
| Visibilidad | Solo en el panel. **No** se muestran al cliente en `/reservar` (queda fuera de alcance). |
| Tipos | Los mismos que en Stock: texto, texto largo, número, sí/no, lista de opciones y fecha. |
| Implementación | Se **reutiliza el motor y las pantallas de Stock**, parametrizadas por entidad y ruta base. El formulario de servicios existente no se reconstruye. |

Fuera de alcance: mostrar los campos al cliente, renombrar/ocultar/reordenar los campos del sistema, Turnos y clientes, y cualquier cambio en horarios, seña o disponibilidad.

## Datos

- Columna nueva `servicios.extras Json @default("{}")` (migración aditiva). Los valores se guardan por clave del campo, con el mismo formato que en cristales: `TEXTO`/`TEXTO_LARGO` → string, `NUMERO` → number, `SI_NO` → boolean, `LISTA` → id de la opción, `FECHA` → `"YYYY-MM-DD"`.
- La tabla `campos_personalizados` ya admite la entidad `SERVICIO`. No hay cambios en ella.
- En `src/modules/campos/campo.service.ts`, el mapa `TABLAS` pasa a `{ CRISTAL: "cristales", SERVICIO: "servicios" }`, así el conteo de valores y el borrado de valores (eliminar un campo o cambiarle el tipo) funcionan también para servicios. El nombre de la tabla sigue saliendo de ese mapa, nunca de la entrada.

### Campos del sistema de Servicios (`REGISTRO.SERVICIO`)

Solo de referencia, todos `fijo` (ver abajo). Secciones nuevas: `servicio` ("Datos del servicio"), `agenda` ("Agenda y capacidad"), `precio` ("Precio"); se mantiene `adicionales` para los propios.

| Clave | Etiqueta | Tipo | Sección |
|---|---|---|---|
| `nombre` | Nombre | TEXTO | servicio |
| `descripcion` | Descripción | TEXTO_LARGO | servicio |
| `color` | Color en la agenda | TEXTO | servicio |
| `activo` | Activo | SI_NO | servicio |
| `duracionMinutos` | Duración (min) | NUMERO | agenda |
| `intervaloMinutos` | Intervalo entre turnos (min) | NUMERO | agenda |
| `margenMinutos` | Margen entre turnos (min) | NUMERO | agenda |
| `capacidad` | Trabajos a la vez | NUMERO | agenda |
| `anticipacionMinutos` | Anticipación mínima (min) | NUMERO | agenda |
| `requiereCristal` | Requiere cristal | SI_NO | agenda |
| `horarios` | Franjas horarias | LISTA (especial) | agenda |
| `precioBase` | Precio base | NUMERO | precio |

### Cambios en el registro y el combinador

- `CampoSistema` suma `fijo?: boolean`: el campo se muestra pero no se puede ajustar desde Administración. Todos los de `SERVICIO` lo son; los de `CRISTAL` no. `CampoFinal` lo expone.
- `SECCIONES` pasa a incluir las secciones nuevas (el listado de Stock solo dibuja las secciones que tienen campos, así que no cambia nada ahí).
- Los campos propios siguen yendo a la sección `adicionales`, ordenados por `orden`. Subir/bajar solo actúa sobre los propios.
- Servidor: `actualizarCampoSistema` y `moverCampoAdmin` rechazan (con `CampoInvalidoError`) un campo `fijo`, aunque alguien arme el pedido a mano.

## Pantallas de Administración

- **Card habilitada** en `/administracion` (Servicios deja de decir "Próximamente").
- `/administracion/servicios`: tabla (escritorio) y tarjetas (celular) con los campos del sistema —sin acciones— y los propios, con **Nuevo campo**. En cada propio: editar, subir/bajar, archivar y eliminar. Sin pestaña "Listas" (Servicios no tiene listas del sistema; las opciones de un campo propio de tipo lista se editan dentro del campo).
- `/administracion/servicios/campos/nuevo` y `/administracion/servicios/campos/[clave]`.
- Las pantallas y los componentes de `administracion/stock` hoy tienen fija la entidad `CRISTAL` y la ruta `/administracion/stock`. Se parametrizan por **entidad** y **ruta base** (props en los componentes de cliente, y la entidad como argumento enlazado en las Server Actions) y Stock queda como una instancia más. El comportamiento de Stock no cambia.
- Todo es solo Admin: cada página y cada acción empieza con `requerirRol("ADMIN")` (el test `guardia-acciones` cubre la carpeta `administracion`).

## Uso en el panel

- `FormularioServicio` (crear y editar) suma al final una sección **"Datos adicionales"** con los campos propios visibles y no archivados, usando el mismo componente `CampoPersonalizado` que Stock. Si no hay campos propios, la sección no aparece.
- `guardarServicio` valida con `procesarExtras` (obligatorios, números, listas válidas, fechas), igual que Stock, y pasa los extras a `crearServicio` / `actualizarServicio`. Los campos ocultos o archivados conservan su valor; un valor de un campo que ya no existe se descarta al guardar.
- `/servicios` (lista) muestra, debajo de los horarios, los datos adicionales cargados (etiqueta: valor, en pequeño).
- Sin cambios: horarios, seña (`calcularSena`), disponibilidad y `/reservar`.

## Reglas y errores

- Eliminar un campo propio o cambiarle el tipo, si algún servicio tiene valor, muestra cuántos servicios se verían afectados y exige confirmar (`ConfirmacionRequeridaError`, ya existente).
- Claves de campos propios: el motor las genera y evita las reservadas. Las claves del sistema de Servicios quedan reservadas (`clavesReservadas("SERVICIO")`) y `nuevo` sigue prohibida por la ruta.
- Un campo propio obligatorio se exige al crear o editar un servicio. Los servicios ya existentes no se invalidan: el valor faltante se pide la próxima vez que se edite el servicio.

## Pruebas

- Unitarias (Vitest) de lo puro: `REGISTRO.SERVICIO` (sin claves repetidas, todos `fijo`, claves reservadas), `combinarCampos("SERVICIO", …)` (propios en `adicionales`, ordenados; fijos no ocultables) y `moverCampo` sobre los propios.
- Unitaria del rechazo de campos `fijo` en la lógica que decide si se pueden ajustar.
- El test de seguridad `guardia-acciones` debe seguir en verde con la carpeta nueva.
- Verificación contra la base con un script: crear un campo propio, guardar un valor en un servicio, archivar, eliminar con confirmación y comprobar que el conteo de afectados coincide.
- Revisión manual en el navegador: tabla y tarjetas de Administración > Servicios en escritorio y celular; crear y editar un servicio con campos adicionales.

## Pendiente fuera de este paso

Turnos y clientes (incluye qué campos propios se muestran al público en `/reservar`).
