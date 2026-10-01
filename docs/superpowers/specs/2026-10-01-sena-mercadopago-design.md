# Seña por Mercado Pago para confirmar turnos

Fecha: 2026-10-01

## Contexto y objetivo

Hoy `/reservar` es público y crea el turno sin ningún freno. El usuario evaluó primero un límite anti-spam y lo descartó a favor de una **seña**: el flujo de reserva queda igual, pero al final se paga una seña por Mercado Pago, y el turno se confirma solo si la seña se abonó. La seña filtra las reservas falsas y los abandonos sin sumar captcha ni límites.

Éxito = (1) un turno de un servicio con precio solo queda confirmado si su seña está aprobada; (2) un horario no queda tomado más de 8 minutos por alguien que no pagó; (3) un pago nunca se aplica dos veces ni confirma un turno con un monto equivocado; (4) el local ve en el panel qué turnos tienen seña y qué pagos hay que devolver.

## Decisiones tomadas con el usuario

| Tema | Decisión |
|---|---|
| Monto | **50 % del `precioBase` del servicio**, redondeado a pesos enteros (mitades hacia arriba). |
| Servicio sin `precioBase` | Se reserva **sin seña**, como hoy (el turno nace `PENDIENTE`). `/servicios` avisa que ese servicio no cobra seña. |
| Retención del horario | **8 minutos** desde que se crea el turno. |
| Medios de pago | Solo inmediatos (tarjeta, dinero en cuenta de Mercado Pago, transferencia en la app). Quedan afuera los pagos en efectivo (Rapipago, Pago Fácil) y cajeros: no entran en 8 minutos. |
| Cancelación | **La seña no se devuelve nunca.** La reserva lo dice con un texto visible junto al monto y una casilla obligatoria. Única excepción: pago cobrado que quedó sin turno (ver "Pago tardío"). |
| Integración | **Checkout Pro** (redirección a Mercado Pago), con webhook más verificación contra la API al volver. Sin SDK: `fetch`. |

Consecuencia aceptada: los servicios sin `precioBase` siguen sin ningún freno contra reservas falsas.

## Datos

### `EstadoTurno`: valor nuevo `ESPERANDO_PAGO`

Distinto de `PENDIENTE` ("reservado, falta que el local confirme"). Un turno con seña nace `ESPERANDO_PAGO` y pasa a `CONFIRMADO` al aprobarse el pago. Sin seña nace `PENDIENTE`, como hoy. El flujo posterior (`En curso → Completado`, `Cancelado`, `Ausente`) no cambia.

### `Turno.venceEn` (`vence_en`, `DateTime?`)

Solo se completa en `ESPERANDO_PAGO`: `creado + 8 min`. Se vacía al confirmar.

### Tabla `pagos`

| Columna | Detalle |
|---|---|
| `id` | cuid. Es el `external_reference` que viaja a Mercado Pago. |
| `turno_id` | Turno al que corresponde. Índice. |
| `monto` | Decimal(12,2): la seña calculada al reservar. No se recalcula. |
| `estado` | Enum `EstadoPago`: `PENDIENTE`, `APROBADO`, `RECHAZADO`, `VENCIDO`. |
| `mp_preferencia_id` | Id de la preferencia creada en Mercado Pago. |
| `mp_pago_id` | Id del pago real. **Único** (permite varios nulos): un mismo pago nunca se aplica dos veces. |
| `acepto_condiciones_en` | Cuándo el cliente marcó "entiendo que la seña no se devuelve". |
| `requiere_devolucion` | `Boolean`, por defecto `false`. |
| `devuelto_en` | `DateTime?`. Lo completa el local al marcar el pago como devuelto. |
| `creado_en`, `actualizado_en` | Auditoría. |

La seña pagada de un turno se ve porque tiene un pago `APROBADO`.

### Cálculo de la seña

Función pura `calcularSena(precioBase)` en `src/modules/pagos/sena.ts`: devuelve `null` si no hay precio, o el 50 % redondeado a pesos enteros. Es el único lugar donde vive la regla (constante `PORCENTAJE_SENA`).

## Flujo de la reserva

1. El cliente elige servicio y horario, carga sus datos y marca la casilla de condiciones (obligatoria si el servicio tiene seña).
2. `reservarTurno` crea, dentro de la transacción con lock por servicio que ya existe:
   - el turno en `ESPERANDO_PAGO` con `venceEn = ahora + 8 min`, y
   - un pago `PENDIENTE` con el monto y `acepto_condiciones_en`.
   Si el servicio no tiene seña, crea solo el turno `PENDIENTE` y redirige a la confirmación como hoy.
3. Fuera de la transacción se crea la preferencia en Mercado Pago (monto de la seña, `external_reference` = id del pago, vencimiento a los 8 minutos, `ticket` y `atm` excluidos, `back_urls` a `/reservar/confirmado?turno=<id>`, `notification_url` al webhook). Se guarda `mp_preferencia_id` y se redirige al `init_point`.
4. Mercado Pago devuelve al cliente a `/reservar/confirmado`. La página **ignora lo que diga la URL sobre el pago** y consulta a Mercado Pago:
   - pago aprobado → confirma el turno y lo muestra confirmado;
   - pago pendiente → "estamos esperando la confirmación";
   - rechazado o vencido → ofrece reintentar mientras el turno siga vigente, o volver a elegir horario.
5. En paralelo, el **webhook** (`POST /api/mercadopago/webhook`) ejecuta la misma lógica de confirmación. Cubre el caso de que el cliente cierre la pestaña antes de volver.

Si la creación de la preferencia falla, el turno recién creado se cancela y el cliente ve "No pudimos iniciar el pago, probá de nuevo".

## Confirmación de un pago

Una sola función, `aplicarPago(mpPagoId)`, usada por el webhook y por la página de retorno:

1. Consulta el pago a Mercado Pago (`GET /v1/payments/{id}`); nada de lo que traiga el aviso o la URL se toma como cierto.
2. Busca el pago propio por `external_reference`; descarta si no existe.
3. Valida que el monto cobrado coincida con `pagos.monto`. Si no coincide no confirma y deja el pago marcado para revisión (`requiere_devolucion`).
4. Dentro de una transacción con el lock del servicio y según el estado del pago de Mercado Pago:
   - **aprobado** y turno vigente → pago `APROBADO` (guardando `mp_pago_id`), turno `CONFIRMADO`, `venceEn` vacío;
   - **aprobado** y el turno ya venció → ver "Pago tardío";
   - **rechazado** → pago `RECHAZADO`; el turno sigue hasta que venza;
   - **pendiente** → sin cambios.
5. Es idempotente: si `mp_pago_id` ya está aplicado, no hace nada.

## Vencimiento sin tareas programadas

- `disponibilidadDelDia` deja de contar como ocupados los turnos `ESPERANDO_PAGO` con `venceEn <= ahora`. El horario se libera solo a los 8 minutos, sin cron.
- Un barrido, que se ejecuta al cargar la agenda del panel y al calcular disponibilidad pública, pasa a `CANCELADO` los turnos vencidos y a `VENCIDO` sus pagos `PENDIENTE`, para que no se acumulen.

## Pago tardío

Si un pago se aprueba cuando el turno ya venció, dentro del lock se recalcula la disponibilidad ignorando ese turno:
- si el horario sigue libre → se confirma;
- si ya lo tomó otro → el pago queda `APROBADO` con `requiere_devolucion = true`, el turno queda `CANCELADO`, y el local lo ve en el panel para devolverlo a mano desde Mercado Pago.

También se marca `requiere_devolucion` cuando el monto cobrado no coincide.

## Panel

- **Agenda (`/turnos`):** insignia "Seña pagada $X" en los turnos con pago aprobado. Los `ESPERANDO_PAGO` se muestran en otro tono, con cuenta regresiva hasta `venceEn`, y se pueden cancelar.
- **Inicio (`/`):** aviso "Pagos para devolver" con cliente, monto y número de pago de Mercado Pago de cada pago con `requiere_devolucion` y sin `devuelto_en`. Un botón (solo Admin) lo marca como devuelto.
- **Servicios (`/servicios`):** junto al precio base, "Seña: $X"; si no hay precio, "Sin precio: se reserva sin seña".

## Configuración y seguridad

- Variables nuevas en `.env` y `.env.example`: `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `APP_URL`. El token nunca llega al navegador.
- El webhook valida la firma `x-signature` (HMAC-SHA256 con `MP_WEBHOOK_SECRET`) con comparación en tiempo constante; el formato exacto del mensaje firmado se toma de la documentación vigente de Mercado Pago al implementar.
- `/api/mercadopago/webhook` es la única ruta nueva sin sesión: se excluye en `src/proxy.ts`.
- Sin SDK: tres llamadas con `fetch` (crear preferencia, consultar pago, y la firma). Si Mercado Pago no responde, se falla de forma segura (ver "Errores").

## Errores

| Situación | Resultado |
|---|---|
| Falla la creación de la preferencia | Se cancela el turno; el cliente ve "No pudimos iniciar el pago, probá de nuevo". |
| Falla la consulta de un pago al volver | La página dice "estamos esperando la confirmación"; el webhook lo resuelve después. |
| Aviso duplicado o simultáneo | Sin efecto: `mp_pago_id` único y el lock del servicio lo evitan. |
| Firma del webhook inválida | Responde 401 y no procesa. |
| Pago rechazado | El turno sigue vigente hasta que venza y se ofrece reintentar. |

## Pruebas

- Unitarias (Vitest): `calcularSena` (50 %, redondeo, sin precio); la decisión de `aplicarPago` como función pura (aprobado a tiempo, aprobado tarde con horario libre, aprobado tarde con horario tomado, monto distinto, repetido, rechazado, pendiente); la validación de la firma del webhook.
- A mano, en el entorno de pruebas de Mercado Pago con usuarios y tarjetas de prueba: reserva con pago aprobado, rechazado, abandonado (vence a los 8 min), y pago tardío. Requiere una URL pública para el webhook.

## Fuera de alcance

Devolución automática; cancelación o reprogramación online por el cliente; cobro del saldo; pagos en efectivo; otros medios de cobro; recordatorios por WhatsApp; cuentas de clientes.

## Pendientes antes de salir a producción

1. Cuenta de Mercado Pago del local y credenciales (primero las de prueba).
2. URL pública de la aplicación para `APP_URL` y el webhook.
3. Consultar con quien lleve la parte legal o contable si aplica el derecho de arrepentimiento en las ventas online (Res. 424/2020), dado que la seña no se devuelve.
4. Decidir si los servicios sin precio base deben tener algún freno contra reservas falsas.
