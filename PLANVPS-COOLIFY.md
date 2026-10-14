# Despliegue de Parabrisas Catamarca con Coolify — paso a paso

Esta guía te lleva de un VPS Ubuntu vacío a la app funcionando con HTTPS. Cada paso dice **dónde** lo hacés, **qué** hacés, **para qué** y **cómo sabés que salió bien**.

Con Coolify no hace falta instalar Node, PostgreSQL, Nginx ni Certbot a mano: Coolify corre todo en contenedores Docker y se encarga del HTTPS.

## Dónde se hace cada cosa

Cada paso lleva una etiqueta que indica dónde hacerlo:

| Etiqueta | Dónde |
|---|---|
| 🖥️ **TU PC** | PowerShell o el explorador de archivos de tu computadora |
| 🔐 **VPS** | Una terminal conectada al servidor por SSH |
| 🌐 **COOLIFY** | El panel de Coolify en el navegador |
| 🧾 **DNS** | El panel donde administrás el dominio |

## Datos que vas a necesitar (anotalos antes de empezar)

| Dato | Para qué | Dónde se consigue |
|---|---|---|
| `IP_DEL_VPS` | Conectarte al servidor | Panel de Hostinger → VPS → resumen |
| `TU_DOMINIO` | La dirección pública de la app, por ejemplo `turnos.tudominio.com` | Tu proveedor de dominio |
| Alias/CBU y titular de la cuenta | Que el cliente transfiera la seña | Tu banco o billetera virtual |
| Número de WhatsApp del local | Que el cliente mande el comprobante | Con código de país, ej. `5493834123456` |
| Usuario y contraseña del primer administrador de la app | Entrar al sistema por primera vez | Los inventás vos |

Cada vez que veas `IP_DEL_VPS` o `TU_DOMINIO` en esta guía, reemplazalo por tu dato real.

---

## PARTE 1 — Preparar el servidor

### Paso 1. Conectarte al VPS

🖥️ **TU PC** → abrí PowerShell y escribí:

```powershell
ssh root@IP_DEL_VPS
```

- **Qué hace:** abre una sesión remota en el servidor como `root`.
- **Si es la primera vez:** te pregunta `Are you sure you want to continue connecting?`. Escribí `yes` y Enter.
- **Cómo sabés que salió bien:** el prompt cambia a algo como `root@srv123:~#`. A partir de ahora estás dentro del servidor.
- **Por qué `root`:** Coolify necesita `root` (o un usuario con `sudo` sin contraseña) para instalar Docker y administrar el servidor.

### Paso 2. Actualizar el sistema

🔐 **VPS**

```bash
apt update && apt upgrade -y
```

- **Qué hace:** descarga e instala las actualizaciones de seguridad de Ubuntu.
- **Tarda:** 1 a 5 minutos. Si aparece una pantalla rosa/violeta preguntando qué servicios reiniciar, dejá lo que viene marcado y apretá Enter.

Después, la zona horaria, para que los registros tengan la hora de Catamarca:

```bash
timedatectl set-timezone America/Argentina/Catamarca
```

Y las herramientas básicas:

```bash
apt install -y curl git fail2ban
```

- **`curl`:** lo usa el instalador de Coolify.
- **`fail2ban`:** bloquea automáticamente las IPs que intentan adivinar tu contraseña por SSH.

### Paso 3. Firewall del proveedor (Hostinger)

🌐 **hPanel de Hostinger** → VPS → tu servidor → *Seguridad* → *Firewall*.

Creá una regla que permita **solo entrada TCP** en estos puertos:

| Puerto | Para qué |
|---|---|
| 22 | SSH (tu acceso al servidor) |
| 80 | HTTP (Let's Encrypt lo usa para emitir el certificado) |
| 443 | HTTPS (los visitantes de la app) |
| 8000 | Panel de Coolify (podés cerrarlo más adelante, ver Paso 8) |

- **Cómo sabés que salió bien:** la regla queda activa y aplicada a tu VPS.
- **No uses el firewall `ufw` del servidor.** Con Docker se pisa con las reglas de Docker y da problemas. Con el firewall de Hostinger alcanza.

> **No cierres el acceso de `root` por SSH** (`PermitRootLogin no`): Coolify lo necesita para administrar el servidor.

### Paso 4. (Opcional) Reforzar el acceso SSH

Hacelo solo si ya entrás con **clave SSH** y no con contraseña. Para comprobarlo, abrí **otra** terminal en tu PC y probá `ssh root@IP_DEL_VPS`: si entra sin pedirte contraseña, usás clave.

🔐 **VPS**

```bash
nano /etc/ssh/sshd_config.d/99-seguro.conf
```

Escribí esta única línea:

```
PasswordAuthentication no
```

Guardá con `Ctrl+O`, Enter, y salí con `Ctrl+X`. Después:

```bash
systemctl restart ssh
```

- **Qué hace:** prohíbe entrar con contraseña; solo se puede con clave.
- **Cómo sabés que salió bien:** en la otra terminal, `ssh root@IP_DEL_VPS` sigue entrando.
- **Si te quedás afuera:** usá la consola web del VPS en hPanel (*Terminal del navegador*), borrá el archivo `99-seguro.conf` y reiniciá `ssh`.

---

## PARTE 2 — Instalar Coolify

### Paso 5. Ejecutar el instalador

🔐 **VPS**

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

- **Qué hace:** instala Docker y Coolify. Coolify queda corriendo en el puerto 8000.
- **Tarda:** 3 a 10 minutos. Tené paciencia, imprime muchas líneas.
- **Cómo sabés que salió bien:** al final dice algo como `Your instance is ready to use!` e imprime una URL del estilo `http://IP_DEL_VPS:8000`.
- **Si falla:** copiá las últimas 20 líneas de la salida y pasámelas.

### Paso 6. Crear la cuenta de administrador de Coolify

🌐 **COOLIFY** → en el navegador abrí:

```
http://IP_DEL_VPS:8000
```

1. Te muestra un formulario de registro. Cargá tu email y una contraseña **larga y única**.
2. Hacelo **enseguida** después de instalar: el primero que se registra queda como administrador.
3. Seguí el asistente. Cuando te pregunte por el servidor, elegí **Localhost** (es el mismo VPS donde está instalado Coolify).

- **Cómo sabés que salió bien:** ves el panel de Coolify con tu servidor `localhost` en estado verde (*Reachable*).

---

## PARTE 3 — Apuntar el dominio al servidor

### Paso 7. Crear el registro DNS

🧾 **DNS** → en el panel de tu dominio creá este registro:

| Tipo | Nombre | Valor |
|---|---|---|
| A | el subdominio (`turnos`) o `@` si usás el dominio raíz | `IP_DEL_VPS` |

- Borrá cualquier otro registro `A` o `AAAA` viejo con ese mismo nombre.
- **Cómo comprobar que propagó** (puede tardar de minutos a horas). Desde 🖥️ **TU PC** en PowerShell:

  ```powershell
  nslookup TU_DOMINIO
  ```

  Tiene que devolver `IP_DEL_VPS`. **No sigas hasta que lo haga:** sin esto Coolify no puede emitir el certificado HTTPS.

### Paso 8. (Recomendado) Poner dominio al panel de Coolify

Es opcional, pero deja de exponer el panel por `http://IP:8000`.

1. 🧾 **DNS** → creá otro registro `A`, por ejemplo `coolify.tudominio.com` → `IP_DEL_VPS`.
2. 🌐 **COOLIFY** → *Settings* → campo **Instance's Domain** → escribí `https://coolify.tudominio.com` → *Save*.
3. Entrá por esa dirección. Cuando funcione con candado, podés cerrar el puerto 8000 en el firewall de Hostinger (Paso 3).

---

## PARTE 4 — Crear la base de datos

### Paso 9. Crear un proyecto

🌐 **COOLIFY** → *Projects* → *Add* (o *+ New*) → nombre: `Parabrisas Catamarca` → *Continue*.

Se crea un entorno llamado `production`. Entrá a él.

### Paso 10. Crear PostgreSQL

🌐 **COOLIFY** → dentro del entorno `production` → *+ New* → *Database* → **PostgreSQL**.

1. Elegí una versión estable (16 o 17).
2. Servidor: `localhost`.
3. En **Name** podés dejar el que viene.
4. En *Postgres Default Database* poné `parabrisas_catamarca`.
5. No expongas el puerto al público (dejá desmarcado *Make it publicly available*). La app se conecta por la red interna de Docker.
6. Tocá **Start**.

**Cómo sabés que salió bien:** el estado de la base pasa a **Running** (verde).

Ahora, en esa misma pantalla de la base, copiá el valor de **Postgres URL (internal)**. Tiene esta forma:

```
postgres://postgres:CLAVE@abc123xyz:5432/parabrisas_catamarca
```

Guardalo en un bloc de notas: es tu `DATABASE_URL`. Dos detalles:

- Cambiá `postgres://` por `postgresql://`.
- Agregá `?schema=public` al final. Queda así:

  ```
  postgresql://postgres:CLAVE@abc123xyz:5432/parabrisas_catamarca?schema=public
  ```

  (No agregues `connection_limit=1`: es solo para tu base de desarrollo local.)

---

## PARTE 5 — Crear la aplicación

### Paso 11. Agregar el repositorio

Antes, asegurate de que GitHub tenga la última versión del código: Coolify despliega lo que está en `main`, no lo que tenés en tu PC. 🖥️ **TU PC**, en la carpeta del proyecto:

```powershell
npm run typecheck
npm test
git status
```

Si `git status` muestra archivos modificados, commiteálos y subilos con `git push origin main`.

🌐 **COOLIFY** → mismo entorno `production` → *+ New* → *Application*.

- **Si el repo de GitHub es público:** elegí *Public Repository* y pegá `https://github.com/valentinomezzavilla/parabrisas_Catamarca`.
- **Si es privado:** elegí *Private Repository (with GitHub App)* y seguí el asistente para instalar la app de GitHub en tu cuenta, dándole acceso solo a este repositorio. También podés usar *Private Repository (with Deploy Key)*.

Después completá:

| Campo | Valor |
|---|---|
| Branch | `main` |
| **Build Pack** | **Dockerfile** (no Nixpacks) |
| Base Directory | `/` |
| Dockerfile Location | `/Dockerfile` |
| **Ports Exposes** | `3000` |

Tocá *Continue*. **No hagas Deploy todavía:** faltan las variables.

### Paso 12. Cargar las variables de entorno

🌐 **COOLIFY** → la aplicación → pestaña **Environment Variables** → *+ Add*, una por una.

Antes, generá la clave de sesión. 🖥️ **TU PC**, en PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Copiá el texto largo que imprime: es tu `SESSION_SECRET`.

Ahora cargá estas variables:

| Variable | Valor | Notas |
|---|---|---|
| `DATABASE_URL` | La URL del Paso 10 | Con `postgresql://` y `?schema=public` |
| `SESSION_SECRET` | El texto que generaste recién | Mínimo 32 caracteres. Distinto del de tu `.env` local |
| `APP_URL` | `https://TU_DOMINIO` | **Sin barra final** |
| `ADMIN_USUARIO` | El usuario que quieras para el primer administrador | |
| `ADMIN_PASSWORD` | Una contraseña larga | La usa solo el seed (Paso 15) |
| `ADMIN_NOMBRE` | `Administrador` | |
| `TRANSFERENCIA_ALIAS` | Alias de la cuenta del local | |
| `TRANSFERENCIA_CBU` | CBU o CVU | Opcional |
| `TRANSFERENCIA_TITULAR` | Nombre del titular | Opcional |
| `WHATSAPP_LOCAL` | `5493834123456` | Con código de país (`54`), el `9` de celular, característica sin `0` y número sin `15` |

Mercado Pago está desactivado: no hace falta cargar `MERCADOPAGO_ACTIVO` ni las variables `MP_*`.

> Los datos de transferencia y el WhatsApp los ve cualquier cliente que reserve. Si alguno queda vacío, simplemente no se muestra. Si después cambiás el alias o el número, editá la variable y tocá **Restart**.

**No cargues** `NODE_ENV` ni `PORT`: el Dockerfile ya los define.

Para cada variable, dejá marcado **Available at Runtime**. **Desmarcá "Available at Buildtime"** en todas, para que el build no las use.

### Paso 13. Configurar el dominio

🌐 **COOLIFY** → la aplicación → pestaña **Configuration** → campo **Domains**:

```
https://TU_DOMINIO
```

- Importante: escribilo con `https://`. Eso le indica a Coolify que pida el certificado a Let's Encrypt.
- Tocá **Save**.

### Paso 14. Desplegar

🌐 **COOLIFY** → botón **Deploy** (arriba a la derecha). Abrí la pestaña **Logs** del deploy y mirá el avance.

El build hace, en orden: `npm ci`, `npm run build` (compila CSS y servidor) y arma la imagen. Al arrancar el contenedor se aplican las migraciones de la base (`prisma migrate deploy`) y se inicia el servidor.

- **Tarda:** 3 a 8 minutos la primera vez.
- **Cómo sabés que salió bien:**
  - El deploy termina en **Success**, y la aplicación queda **Running**.
  - En *Logs* de la aplicación aparece `Parabrisas Catamarca escuchando en http://localhost:3000`.
  - Abrís `https://TU_DOMINIO` y ves la pantalla de login con candado.
- **Si el certificado no sale al instante:** esperá 2 o 3 minutos y recargá. Si sigue sin salir, revisá que el DNS (Paso 7) apunte bien y que los puertos 80 y 443 estén abiertos (Paso 3).

---

## PARTE 6 — Datos iniciales

### Paso 15. Cargar los datos base (seed)

Una base nueva está vacía. El seed crea el administrador, los catálogos y los servicios base. Se hace **una sola vez**.

🌐 **COOLIFY** → la aplicación → pestaña **Terminal** → elegí el contenedor de la app → *Connect*. Escribí:

```bash
npm run db:seed
```

- **Cómo sabés que salió bien:** imprime mensajes de creación sin errores.
- Después, en *Environment Variables*, podés borrar `ADMIN_PASSWORD` y reiniciar la app.
- No lo ejecutes de nuevo por las dudas: el seed solo crea el administrador si todavía no hay usuarios.

### Paso 16. Primer ingreso

Abrí `https://TU_DOMINIO/login` e iniciá sesión con `ADMIN_USUARIO` y `ADMIN_PASSWORD`.

- **Cambiá la contraseña del administrador enseguida** (menú Usuarios).
- Probá que `https://TU_DOMINIO/reservar` abre la página pública de reservas.
- Probá crear un turno desde el panel. Si al enviar un formulario aparece "Origen no permitido", avisame: significa que algo del proxy no está pasando el host.

### Importar las órdenes de trabajo de Notion (una sola vez)

1. En Notion, abrí la base "Órdenes de Trabajo" → **··· → Exportar** → formato *Markdown y CSV*. Descomprimí el archivo.
2. En la app, como administrador: **Administración → Órdenes de trabajo → Importar desde Notion**. Elegí el `.csv` y tocá **Importar órdenes**.
3. **Cómo sabés que salió bien:** aparece "Se importaron N órdenes…" y en **Órdenes** se ven todas, con sus estados.
4. Renombrá las aseguradoras ("Aseguradora 1, 2…") y el proveedor en esa misma pantalla: en Notion las páginas no tenían título.
5. Cargá el importe total de las órdenes instaladas o facturadas (ficha de la orden → *Facturación y cobro*) para que aparezcan en **Cobranzas**.

- Solo funciona con el módulo vacío: si ya cargaste órdenes a mano, no deja importar.
- Los nombres de los clientes no vienen en la exportación: quedan como "Sin nombre" con su teléfono, y se corrigen al editar cada orden.

---

## PARTE 7 — Seña por transferencia

### Cómo funciona

- El cliente reserva desde `/reservar`. Si el servicio tiene **precio base**, la seña es el **10 %** de ese precio. Sin precio no hay seña y el turno queda *Pendiente*.
- Al reservar, el horario queda tomado **sin vencimiento**. El cliente ve los datos para transferir y un botón **Confirmar turno** que abre WhatsApp con el local y un mensaje armado: su nombre, el servicio, el día y la hora, el código de reserva y el monto.
- En la agenda del panel, las reservas del cliente llevan la etiqueta *Reserva web* y un color:
  - **Gris:** esperando la seña o pendiente de revisar.
  - **Verde:** confirmada.
  - **Rojo:** rechazada o cancelada.
- Cuando llega el comprobante, el personal toca **Confirmar** (la seña queda cobrada) o **Rechazar** (el turno se cancela y el horario se libera).
- Cada turno de la agenda tiene un botón de WhatsApp (**Escribir por WhatsApp** / **Avisar por WhatsApp**) que abre el chat con el teléfono que dejó el cliente y un mensaje según el estado: pedir la seña, pedir que confirme asistencia o avisar que el turno quedó confirmado.
- Como no vencen solas, conviene revisar las tarjetas grises todos los días.

### Paso 17. Cargar precios y probar una reserva

1. En la app (`https://TU_DOMINIO`, logueado como administrador) → *Servicios* → revisá que cada servicio que cobra seña tenga **precio base**.
2. En una ventana de incógnito, reservá un turno desde `https://TU_DOMINIO/reservar` en un servicio con precio.
3. **Cómo sabés que salió bien:** la página final muestra el alias, el monto y el botón **Confirmar turno**. Al tocarlo, se abre el chat del local con el mensaje armado. Probalo desde el celular.
4. En el panel, el turno aparece **gris** con *Esperando seña* y *Seña a transferir*. Tocá **Confirmar** y fijate que se ponga **verde**. Después tocá **Avisar por WhatsApp** y verificá que se abra el chat con el teléfono del cliente.
5. Hacé otra reserva de prueba y tocá **Rechazar**: tiene que ponerse **roja**, y ese horario tiene que volver a estar libre en `/reservar`.
6. Cancelá o rechazá las reservas de prueba que queden.

### (Opcional, más adelante) Activar Mercado Pago

Solo si querés volver a cobrar la seña en línea. Cargá `MERCADOPAGO_ACTIVO=true`, `MP_ACCESS_TOKEN` y `MP_WEBHOOK_SECRET`, y configurá el webhook:

1. Abrí https://www.mercadopago.com.ar/developers/panel → tu aplicación → **Webhooks** → *Configurar notificaciones*.
2. En URL de producción poné: `https://TU_DOMINIO/api/mercadopago/webhook`
3. Marcá el evento **Pagos** y guardá.
4. Copiá la **clave secreta** que muestra.
5. 🌐 **COOLIFY** → *Environment Variables* → editá `MP_WEBHOOK_SECRET` y pegá la clave. Si querés pasar a producción, cambiá también `MP_ACCESS_TOKEN` por el token de **producción**.
6. Tocá **Restart** (o *Redeploy*) para que la app tome los valores nuevos.

**Cómo sabés que salió bien:** hacés un pago de prueba con un usuario comprador de prueba (en ventana de incógnito) y el turno pasa a *Confirmado*. Los casos de prueba completos están en `docs/PENDIENTES-DESPLIEGUE.md`, sección 2.1.

---

## PARTE 8 — Copias de seguridad

### Paso 18. Backups automáticos de la base

🌐 **COOLIFY** → la base de datos → pestaña **Backups** → *+ New Scheduled Backup*:

| Campo | Valor |
|---|---|
| Frequency | `0 3 * * *` (todos los días a las 3:00) |
| Retention | Guardar los últimos 14 días |

- **Muy recomendado:** configurá un destino **S3** (Backblaze B2, Cloudflare R2, etc.) en *Storages*, y asignalo a este backup. Una copia que vive solo en el mismo VPS se pierde junto con el VPS.
- **Además:** en hPanel de Hostinger activá las copias semanales del VPS, y sacá una instantánea manual antes de cada actualización grande.
- Probá restaurar un backup al menos una vez, en una base de prueba.

---

## PARTE 9 — Actualizar la app más adelante

### Paso 19. Publicar cambios

1. 🖥️ **TU PC** → `npm run typecheck` y `npm test`; después `git push origin main`.
2. 🌐 **COOLIFY** → la aplicación → **Deploy** (o **Redeploy**).

Para que se despliegue solo con cada `git push`: en la aplicación → *Webhooks* → copiá la URL del webhook de GitHub y agregala en tu repo de GitHub (*Settings → Webhooks*). Si usaste la GitHub App, el auto-deploy ya viene activado y se controla en *Configuration → Advanced*.

- Cada deploy aplica las migraciones nuevas al arrancar (por ejemplo, `turnos_origen`, que agrega el origen web/panel de cada turno).
- Si la actualización tiene una migración riesgosa, hacé antes un backup manual desde la pestaña *Backups* de la base.
- Para volver atrás: en la aplicación → *Deployments* → elegí un deploy anterior → **Redeploy**. Ojo: volver atrás el código **no** deshace una migración ya aplicada.

---

## Comprobación final

- [ ] `https://TU_DOMINIO` muestra el login con candado válido.
- [ ] `http://TU_DOMINIO` redirige solo a HTTPS.
- [ ] Iniciaste sesión con el administrador y cambiaste su contraseña.
- [ ] Creaste, editaste y cancelaste un turno desde el panel.
- [ ] `https://TU_DOMINIO/reservar` permite reservar como cliente.
- [ ] Una reserva con seña muestra los datos de transferencia y abre WhatsApp con el mensaje.
- [ ] Confirmar y rechazar una reserva web desde el panel cambia el color de la tarjeta.
- [ ] Hay un backup programado, con destino fuera del VPS.
- [ ] Reiniciaste el VPS (`reboot`) y la app volvió sola.

---

## Si algo sale mal

| Síntoma | Qué mirar | Qué hacer |
|---|---|---|
| El build falla con `tailwindcss` o `esbuild` "not found" | Las variables de la app | Desmarcá **Available at Buildtime** en todas, sobre todo si hay alguna con `NODE_ENV=production` |
| El deploy termina bien pero la app se reinicia sin parar | *Logs* de la aplicación | Casi siempre falta una variable (`SESSION_SECRET`, `DATABASE_URL`) o está mal escrita |
| Error de conexión a la base (`P1001`, `ECONNREFUSED`) | `DATABASE_URL` | Revisá el host interno de la base, y que la base y la app estén en el mismo entorno y servidor |
| `502 Bad Gateway` o `no available server` | Puerto de la app | En Coolify, *Ports Exposes* debe ser `3000` |
| El certificado no se emite | DNS y puertos | `nslookup TU_DOMINIO` debe dar la IP del VPS; puertos 80 y 443 abiertos |
| Se inicia sesión pero vuelve al login | `APP_URL` y el dominio | Tienen que usar `https://`; la cookie de sesión solo viaja por HTTPS |
| "Origen no permitido" al enviar un formulario | Cómo se entra a la app | Entrá por el dominio con HTTPS, no por la IP; avisame si persiste |
| No aparece el botón de WhatsApp | `WHATSAPP_LOCAL` | Cargá el número y tocá **Restart** |
| WhatsApp abre otro número o dice que no existe | Formato de `WHATSAPP_LOCAL` | Tiene que ser `549` + característica sin `0` + número sin `15`, por ejemplo `5493834123456` |
| El cliente ve "Pedile al local los datos para transferir" | `TRANSFERENCIA_ALIAS` y `TRANSFERENCIA_CBU` | Cargá al menos uno y tocá **Restart** |
| La reserva no pide seña | El servicio | Al servicio le falta el precio base (*Servicios → editar*) |
| Las tarjetas no cambian de color | Origen del turno | Solo se colorean las reservas hechas por el cliente en `/reservar`; las que carga el personal se ven normales |
| (Solo con Mercado Pago activo) El webhook da 401 | `MP_WEBHOOK_SECRET` | Copialo de nuevo desde el panel de Mercado Pago y reiniciá la app |
| Coolify perdió acceso al servidor | Config SSH | No pongas `PermitRootLogin no`; revisá *Servers → localhost → Validate* |
