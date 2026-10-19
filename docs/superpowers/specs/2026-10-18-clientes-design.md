# Clientes (postventa) — diseño

## Objetivo

Un módulo para ver a cada cliente con su historial y trabajar la postventa: darle beneficios exclusivos, guardar sus
observaciones y datos personales y, si tiene fecha de nacimiento, avisar el día del cumpleaños para saludarlo por
WhatsApp y ofrecerle un beneficio a elección del usuario.

## Decisiones

| Tema | Decisión |
|---|---|
| Beneficios | Con detalle: título, tipo (porcentaje, monto u otro), valor, detalle, vigencia opcional y estado (vigente, usado, anulado; "vencido" se calcula). **No** se aplican solos a las órdenes: el personal los aplica a mano. |
| Cumpleaños | Tarjeta en el Panel con los de hoy y los próximos 7 días. Cada uno tiene "Saludar por WhatsApp": se elige un beneficio vigente del cliente o se escribe otra oferta, queda asentado el saludo del año y se abre el chat con el mensaje armado. |
| Permisos | Todos ven y editan clientes y ven el aviso de cumpleaños. Los beneficios los da, marca como usados y anula **solo el Admin**. Los importes del historial, solo el Admin. |
| Orden | Alfabético A→Z sin distinguir mayúsculas ni tildes (la Ñ después de la N), agrupado por inicial. Los "Sin nombre" (vienen de la importación de Notion) van al final, en su propio grupo. |
| Eliminar | **Solo Admin**, y se puede borrar un cliente **con historial**: se llevan sus turnos (con las señas), sus órdenes (con los cobros) y sus beneficios, sin vuelta atrás. Protecciones: una pantalla de confirmación que muestra exactamente qué se pierde (y avisa si hay plata por cobrar) y hay que escribir ELIMINAR. Los movimientos de stock se conservan sin turno, así el stock no cambia. Una orden de otro cliente que tenía turno con él vuelve a "Pedido". |
| Atajos | Cada fila de la lista tiene Editar (todos) y Eliminar (solo Admin); la ficha también tiene Eliminar para el Admin. |
| Unión de duplicados | Fuera de alcance. |

## Datos

- `clientes.fecha_nacimiento` (DATE, opcional). El resto ya existía: nombre, teléfono, email y `notas` (las observaciones).
- `beneficios_cliente`: cliente, titulo, tipo (`PORCENTAJE` / `MONTO` / `OTRO`), valor, descripcion, vigente_hasta, estado (`VIGENTE` / `USADO` / `ANULADO`), usado_el.
- `saludos_cumple`: cliente y año (único), con la oferta que se hizo. Con una fila, el cliente figura como "Saludado" ese año.

## Reglas

- El 29 de febrero se festeja el 28 en los años que no son bisiestos.
- La ventana de aviso cruza el fin de año: el 28 de diciembre ya aparece el cumpleaños del 2 de enero, y el saludo cuenta para el año del festejo.
- Un beneficio vigente al que se le pasó la fecha se muestra como "Vencido" y no se ofrece. Uno usado o anulado no vuelve a cambiar.
- No se crean dos clientes con el mismo teléfono (con al menos 6 dígitos): se avisa y se ofrece la ficha existente.
- La búsqueda por nombre ignora mayúsculas y tildes (se compara en la aplicación porque la base de datos distingue tildes).
- Un cliente sin teléfono válido para WhatsApp aparece en los cumpleaños, pero sin el botón de saludar.

## Código

- Puro y con tests: `modules/clientes/reglas.ts` (orden y agrupado), `cumpleanos.ts`, `beneficio.ts`, `historial.ts` y `schemas.ts`.
- `modules/clientes/cliente.service.ts`: consultas y operaciones. `rutas/clientes.ts` y `views/clientes/`.
- El Panel (`rutas/inicio.ts`, `views/panel/inicio.ejs`) suma la tarjeta de cumpleaños.
