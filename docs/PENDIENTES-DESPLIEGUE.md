# Pendientes para desplegar Parabrisas Catamarca

Última revisión: 2026-10-01. Marcá cada casilla a medida que lo vayas resolviendo.

**Estado hoy:** el código está terminado y probado en local (typecheck limpio, 260 tests, revisión independiente hecha y corregida). Lo que falta es infraestructura, configuración de Mercado Pago, datos reales y la prueba del cobro real.

---

## 1. Bloqueantes (sin esto no se puede desplegar)

### 1.1 Decidir dónde se aloja
- [ ] Elegir el hosting. El repo **no tiene** `Dockerfile`, configuración de hosting ni CI.
- Necesita Node.js (la misma versión mayor que usás en local) para correr `next start`, o un servicio que lo haga por vos.
- Opciones típicas para un negocio chico: un VPS propio, o una plataforma que ejecute Node (Railway, Render, Fly.io, etc.). Vercel también sirve para la app, pero la base de datos va aparte.

### 1.2 Base de datos PostgreSQL real
- [ ] Crear una base PostgreSQL de producción (la base embebida de `prisma dev` es **solo para desarrollo**).
- [ ] Anotar su `DATABASE_URL`. **No** copiar el `connection_limit=1` de tu `.env` local: es propio de la base embebida.
- [ ] Activar copias de seguridad automáticas y comprobar que se pueden restaurar.

### 1.3 Dominio con HTTPS
- [ ] Comprar o asignar un dominio y activar HTTPS.
- Es obligatorio por dos motivos: la cookie de sesión se marca como segura en producción, y Mercado Pago solo avisa por webhook a una dirección pública con HTTPS.

### 1.4 Variables de entorno de producción
Cargarlas en el hosting (nunca en el repositorio). Hay un modelo en `.env.example`.

| Variable | Qué poner |
|---|---|
| `DATABASE_URL` | La URL del Postgres de producción (sin `connection_limit=1`). |
| `SESSION_SECRET` | Una clave propia, **distinta** de la de desarrollo, de al menos 32 caracteres. Generarla con `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`. |
| `ADMIN_USUARIO`, `ADMIN_PASSWORD`, `ADMIN_NOMBRE` | El primer administrador. Solo los usa el seed y solo si todavía no hay usuarios. Después se pueden borrar. |
| `APP_URL` | La dirección pública completa, **sin barra final** (por ejemplo `https://turnos.tudominio.com`). |
| `MP_ACCESS_TOKEN` | El token de **producción** de Mercado Pago (hoy tenés uno de un usuario de prueba). |
| `MP_WEBHOOK_SECRET` | La clave secreta del webhook (ver el punto 1.6). |

### 1.5 Pasos de despliegue
Orden en el servidor:

```bash
npm ci
npx prisma generate        # ver la nota de abajo
npx prisma migrate deploy  # crea/actualiza las tablas
npm run db:seed            # crea el administrador (solo si no hay usuarios) y los datos base
npm run build
npm start
```

- [ ] **Agregar `prisma generate` al build.** El cliente de Prisma generado está ignorado por Git y el proyecto no lo genera solo: en un servidor nuevo, `npm run build` falla si no se corre `npx prisma generate` antes. Conviene agregar `"postinstall": "prisma generate"` en `package.json` (cambio de una línea; se puede pedir).
- [ ] Una base **nueva** no necesita `npm run db:migrar-caracteristicas`; ese script es solo para bases viejas que tenían las tablas de características.
- [ ] Después de desplegar, cambiar la contraseña del administrador inicial.

### 1.6 Configurar Mercado Pago en producción
- [ ] Obtener las credenciales de **producción** de la aplicación de Mercado Pago.
- [ ] En el panel de la aplicación → **Webhooks** → *Configurar notificaciones*: poner `https://<tu dominio>/api/mercadopago/webhook`, marcar el evento **Pagos** y guardar.
- [ ] Copiar la **clave secreta** que aparece al guardar y cargarla en `MP_WEBHOOK_SECRET`.
- [ ] Reiniciar la app después de cargar las variables.

---

## 2. Probar antes de abrir al público

### 2.1 El cobro real de punta a punta (nunca se probó)
Hasta hoy se probó hasta la pantalla de pago de Mercado Pago, pero **nunca se completó un pago**.
- [ ] Crear un usuario **comprador de prueba** en el panel de desarrolladores (Cuentas de prueba).
- [ ] Hacer la prueba en una ventana de **incógnito** (si entrás con tu cuenta real o con la sesión del panel, el resultado no sirve).
- [ ] Pagar con tarjeta de prueba y verificar cada caso:
  - [ ] Pago **aprobado** → el turno pasa a *Confirmado* y la agenda muestra "Seña pagada".
  - [ ] Pago **rechazado** → el turno sigue esperando y se puede reintentar.
  - [ ] **Abandonar sin pagar** → a los 8 minutos el horario se libera.
  - [ ] Pago con **cuotas con interés** → no debe marcarse como "monto distinto" (se compara el precio del ítem, no el total con interés).
- [ ] Confirmar que el **webhook valida la firma** con un aviso real (si respondiera 401 con avisos legítimos, el formato de la firma en `src/modules/pagos/firma.ts` hay que contrastarlo con la documentación vigente de Mercado Pago).
- [ ] Hacer un pago real de monto mínimo con las credenciales de producción antes de abrir al público, y devolverlo desde Mercado Pago.

### 2.2 Recorrido completo en el sitio desplegado
- [ ] Reservar como cliente (sin sesión) un servicio con precio: se ve la seña y la casilla de aceptación.
- [ ] Reservar con la sesión del panel (**Nuevo turno**): no cobra seña.
- [ ] Editar un turno desde el panel (cambiar horario, datos del cliente).
- [ ] Cancelar un turno desde el panel con seña pagada: aparece el aviso.
- [ ] "Buscar tu reserva": buscar con un solo dato, ver los datos tapados y cancelar con el teléfono completo.
- [ ] Alta de usuarios, stock, servicios y Administración de campos.

---

## 3. Datos y negocio

La base de producción **empieza vacía**: la de tu computadora no se copia sola.
- [ ] Cargar los **servicios** definitivos con horarios, duración y capacidad, y sus **precios** (sin precio, un servicio se reserva sin seña). En local: Lavados $20.000, Colocación de vidrios $50.000, Polarizados $70.000.
- [ ] Cargar el **stock** (cristales, marcas, tipos, ubicaciones, vehículos compatibles).
- [ ] Crear los **usuarios** del personal (Empleado) y revisar quién es Administrador.
- [ ] Crear en Administración los **campos propios** que quieran usar (Stock y Servicios).
- [ ] En local quedan datos de prueba (por ejemplo tres turnos `Pendiente` viejos): no se llevan a producción, pero conviene limpiarlos si se migra la base.

### Aspectos legales
- [ ] **Consultar con quien lleve lo legal o contable.** La seña no se devuelve nunca y las ventas online pueden tener derecho de arrepentimiento (Res. 424/2020). Definir los términos y condiciones que ve el cliente al reservar.

---

## 4. Seguridad y operación

- [ ] Que `.env` y cualquier credencial **no** estén en Git (hoy no lo están; comprobarlo antes de cada publicación).
- [ ] Regenerar el token de Mercado Pago que se mostró en una conversación durante el desarrollo, y usar uno nuevo en producción.
- [ ] Forzar HTTPS y redirigir el tráfico HTTP.
- [ ] Definir cómo se ven los errores del servidor (registros/logs) y quién los mira.
- [ ] Definir quién devuelve las señas a mano desde Mercado Pago (el inicio del panel muestra la lista "Pagos para devolver").
- [ ] Revisar el plan de la base de datos: conexiones disponibles y espacio.

---

## 5. Limitaciones conocidas (no bloquean, pero hay que saberlas)

- No hay "Olvidé mi contraseña": la restablece un Administrador desde Usuarios.
- No hay segundo factor (2FA).
- Restablecer una contraseña **no cierra** las sesiones abiertas (duran 8 horas).
- No hay límite de intentos **por dirección IP**, solo por usuario (login) y por turno (cancelar). El buscador del portal tiene un tope general de 30 búsquedas sin resultado por minuto: alguien puede saturarlo a propósito (reservar y el resto del sitio siguen funcionando).
- Quien conozca una **patente** puede ver que existe un turno de esa persona y su nombre abreviado (para cancelarlo necesitaría el teléfono completo o el mail).
- La seña **se devuelve a mano** desde Mercado Pago; los reembolsos y contracargos no se reflejan solos en el turno.
- Los servicios **sin precio** se reservan sin seña ni freno contra reservas falsas.
- El cliente **no puede reprogramar** su turno desde el portal (solo cancelarlo) y no hay avisos por mail ni WhatsApp.
- Los códigos de reserva de los turnos anteriores a la función se pueden calcular; afecta solo a los que estén vigentes cuando se migre.
- Hay una carrera poco probable entre editar un turno y completarlo al mismo tiempo (queda anotado, sin corregir).

---

## 6. Antes de publicar el código

- [ ] Hacer `git push origin main` de los commits pendientes: las **correcciones de la revisión** (cierran el hallazgo crítico de privacidad del buscador) todavía están solo en tu computadora.

---

## 7. Lo que se puede pedir como ayuda

- Agregar `prisma generate` al build.
- Escribir una guía de despliegue paso a paso para el hosting elegido.
- Preparar un `Dockerfile` si el hosting lo usa.
- Un script de comprobación posterior al despliegue (humo): que el login, `/reservar` y el webhook respondan.
- Cargar los datos iniciales (servicios, precios, horarios) con un script a partir de una lista.
