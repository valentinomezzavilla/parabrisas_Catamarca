# Editar y cancelar reservas, y "Buscar tu reserva" en el portal

Fecha: 2026-10-01

## Contexto y objetivo

Hoy un turno solo cambia de estado desde el panel (no se pueden corregir sus datos) y el cliente no puede ver ni cancelar su reserva. Este diseño agrega tres cosas:

1. **Editar** reservas en el panel, con todos sus campos.
2. **Cancelar** en el panel con un aviso cuando hay una seña cobrada.
3. En el portal de clientes, **"Buscar tu reserva"**: el cliente encuentra su turno con cualquiera de varios datos (alcanza con uno) y puede cancelarlo.

Éxito = (1) el personal corrige cualquier dato de un turno vigente sin romper la agenda; (2) un turno cancelado libera su horario y el panel avisa cuando había una seña pagada; (3) un cliente encuentra su reserva escribiendo solo un dato que la identifique, sin que el portal regale datos de otras personas ni permita cancelar turnos ajenos.

## Decisiones tomadas con el usuario

| Tema | Decisión |
|---|---|
| Privacidad de la búsqueda | **Coincidencia única + datos tapados + verificación para cancelar.** Varias coincidencias → no se muestra nada. Una coincidencia → modal con datos parciales. Cancelar exige escribir el teléfono o el mail completos. |
| Cancelar en el panel | Directo, sin seña ni devolución en los turnos que cargó el local. Si el turno tiene seña pagada, la confirmación avisa que no se devuelve automáticamente. |
| Disponibilidad al editar | **Bloquear y avisar.** Si el nuevo servicio o horario no tiene lugar, no se guarda. |
| Seña al cambiar de servicio | La seña pagada no se recalcula: queda como estaba y el panel lo avisa. |
| Teléfono al editar | El turno pasa al cliente que tenga ese teléfono (o se crea uno nuevo). Nombre y mail se corrigen en la ficha de esa persona. |

Fuera de alcance: que el cliente reprograme, avisos por mail o WhatsApp, devolución automática de la seña, límites horarios para cancelar y editar turnos ya completados, cancelados o ausentes.

## Parte 1: editar reservas en el panel

- Cada turno de la agenda (`/turnos`) suma un botón **Editar** que abre `/turnos/[id]/editar`. Cualquier usuario con sesión del panel puede editar (`verificarSesion`).
- **Estados editables:** `PENDIENTE`, `CONFIRMADO` y `EN_CURSO`. No se editan `COMPLETADO`, `CANCELADO` y `AUSENTE` (tocarlos rompería el stock y el historial) ni `ESPERANDO_PAGO` (el cliente está pagando).
- **Campos editables:** servicio, día y hora, nombre, teléfono, mail, vehículo, patente, cristal, precio y notas. El estado se sigue cambiando con los botones existentes.
- **Día y hora:** se eligen con el mismo patrón de pasos de `/reservar` (parámetros en la dirección): servicio → día → horarios libres. Los horarios libres incluyen el del propio turno.
- **Disponibilidad:** si cambia el servicio o el horario, `editarTurno` toma el bloqueo por servicio de destino, recalcula la disponibilidad **ignorando el propio turno** y exige que el horario elegido esté libre; si no, lanza `TurnoNoDisponibleError` y no guarda. Si no cambia ni el servicio ni el horario, no se valida. El fin se recalcula con la duración del servicio.
- **Cliente:** si cambia el teléfono, se busca (o crea) el cliente con ese teléfono y el turno pasa a él. Si solo cambian nombre o mail, se actualiza la ficha del cliente actual.
- **Cristal:** se puede cambiar o quitar; el stock no se mueve al editar (sigue moviéndose al completar el turno).
- **Seña:** editar nunca toca los pagos. Si el turno tiene una seña aprobada y se cambia el servicio, el formulario avisa: "La seña de $X se mantiene".
- Un turno cancelado o completado entre que se abrió la pantalla y se guardó se rechaza ("Este turno ya no se puede editar").

## Parte 2: cancelar en el panel

- Se mantiene el botón **Cancelar** con confirmación. Si el turno tiene una seña aprobada, la confirmación dice: "Tiene una seña de $X cobrada por Mercado Pago. No se devuelve automáticamente".
- Cancelar libera el horario (los cancelados ya no ocupan disponibilidad). Un turno cargado por el local se cancela sin más trámite.
- La agenda muestra el **código de reserva** de cada turno.

## Parte 3: "Buscar tu reserva" en el portal

### Código de reserva
- Columna nueva `turnos.codigo` (`String`, único): 6 caracteres del alfabeto `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` para los turnos nuevos (con reintento si choca). Los turnos existentes se completan en la migración con un valor único y determinista derivado de su orden de creación.
- Se muestra en la página de confirmación de la reserva ("Guardá este código para buscar o cancelar tu reserva") y en la agenda del panel.

### Búsqueda
- `/reservar` muestra un botón **"Buscar tu reserva"** que abre un modal con estos campos opcionales: código de reserva, nombre, teléfono, mail, patente, vehículo, servicio y día. **Hay que completar al menos uno** y se buscan solo los completados, todos a la vez (Y).
- **Comparación:** código exacto (sin importar mayúsculas); teléfono por dígitos (sin espacios ni guiones); mail exacto en minúsculas; patente exacta sin espacios ni mayúsculas; nombre y vehículo por coincidencia parcial sin importar tildes ni mayúsculas; servicio exacto; día exacto (hora de Catamarca).
- **Qué turnos se consideran:** estados `PENDIENTE`, `CONFIRMADO` y `ESPERANDO_PAGO` cuyo inicio es posterior a ahora. La lógica de coincidencia es una función pura (`coincideConCriterios`) que se aplica en memoria sobre esos turnos vigentes.
- **Resultado:** ninguno → "No encontramos tu reserva". Varios → "Encontramos más de una: agregá más datos" y **no se muestra ningún dato**. Uno exacto → modal con servicio, día, hora, estado, si tiene seña pagada, y datos tapados: nombre abreviado ("Valentino M."), teléfono con solo los últimos 4 dígitos y patente con solo la primera y la última letra. Nunca se muestran mail, precio, cristal ni notas.
- La búsqueda es una Server Action pública (método POST): ningún dato personal viaja en la dirección.

### Cancelar
- El modal ofrece **"Cancelar mi reserva"**. Pide escribir el **teléfono o el mail completos** registrados en la reserva; si coinciden, se cancela.
- Si hay una seña aprobada, antes de confirmar se avisa: "La seña no se devuelve". Si el turno esperaba el pago, se cancela y su pago pendiente pasa a vencido.
- El turno queda `CANCELADO` y se agrega a sus notas "Cancelado por el cliente el dd/mm hh:mm", que el panel ya muestra.

### Protecciones
- **Verificación para cancelar:** tras 5 intentos fallidos para un mismo turno se bloquea 15 minutos (mismas reglas puras que el login: `registrarFallo` y `minutosDeBloqueo`, con la clave `cancelar:<id del turno>` en `intentos_login`).
- **Tope de búsquedas:** como máximo 20 por minuto en todo el sitio (contador por minuto en `intentos_login`, clave `busqueda:<minuto>`); al pasarse, "Hay muchas búsquedas, probá en un minuto".
- **Límite aceptado:** quien conozca un dato único de otra persona (por ejemplo su patente) puede ver que tiene un turno vigente y sus datos tapados; para cancelarlo necesita el teléfono o el mail.

## Datos

- Migración aditiva: `turnos.codigo` (nulo al agregarla, se completa y luego pasa a `NOT NULL UNIQUE`). El valor de los turnos existentes sale de `lpad(to_hex((row_number * 2654435761) % 16777216), 6, '0')` en mayúsculas (multiplicador impar módulo 2^24: valores distintos para menos de 16 millones de turnos).
- Sin tablas nuevas: los contadores reutilizan `intentos_login`.

## Pruebas

- **Unitarias (Vitest):** normalizadores y `coincideConCriterios` (un solo campo, varios campos, tildes, teléfono con espacios, ningún criterio → error); enmascarado de nombre, teléfono y patente; generación y formato del código; resolución del resultado (ninguno, varios, uno); reglas de edición (estados editables; si hace falta validar disponibilidad); contador de búsquedas por minuto.
- **Contra la base (script):** editar sin cambiar horario; cambiar a un horario libre y a uno ocupado (rechazo); cambiar el teléfono mueve el turno al otro cliente; cancelar libera el horario; cancelar un turno con seña no devuelve ni marca devolución; verificación fallida cinco veces bloquea.
- **Seguridad:** el test `guardia-acciones` debe seguir en verde; las acciones del panel exigen sesión y las del portal validan todo del lado del servidor.
- **Revisión manual en el navegador:** modal en escritorio y celular; búsqueda con un solo campo; varias coincidencias; cancelación con teléfono correcto y erróneo.
