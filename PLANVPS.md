# Plan de despliegue en un VPS de Hostinger

Instructivo paso a paso para poner **Parabrisas Catamarca** en producción en un VPS de Hostinger.
Complementa a [docs/PENDIENTES-DESPLIEGUE.md](docs/PENDIENTES-DESPLIEGUE.md) (qué falta del lado de negocio y Mercado Pago); acá está el **cómo** del servidor.

**Arquitectura final**

```
Internet ──HTTPS──► Nginx (443, certificado Let's Encrypt)
                      │  proxy a 127.0.0.1:3000
                      ▼
                    Node.js (servicio systemd "parabrisas": node dist/server.js)
                      │
                      ▼
                    PostgreSQL 16 (local, solo escucha en localhost)
```

Todo en un mismo VPS: alcanza y sobra para el volumen de un local. En los comandos, reemplazá:

| Marcador | Qué es | Ejemplo |
|---|---|---|
| `IP_DEL_VPS` | IP pública que te da Hostinger | `82.25.10.20` |
| `TU_DOMINIO` | Dominio o subdominio de la app | `turnos.parabrisascatamarca.com.ar` |
| `CLAVE_DB` | Contraseña del usuario de Postgres (solo letras y números, así no hay que codificarla en la URL) | `Xk29...` |

Tiempo estimado: 1 a 2 horas la primera vez.

---

## 0. Antes de empezar (en tu computadora)

- [ ] Hacer `git push origin main` con todo lo pendiente: el servidor va a bajar el código de GitHub.
- [ ] Correr `npm run typecheck` y `npm test` y que pasen.
- [ ] Tener a mano: el dominio, las credenciales **de producción** de Mercado Pago, el usuario y contraseña del primer administrador.
- [ ] Si no tenés clave SSH, crearla (PowerShell):
  ```powershell
  ssh-keygen -t ed25519 -C "mezza12354@gmail.com"
  Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub   # esta es la clave pública que vas a pegar en Hostinger
  ```

---

## 1. Contratar y preparar el VPS en Hostinger

1. **Plan**: un **KVM 1** (1 vCPU, 4 GB RAM) alcanza. El KVM 2 da margen si después sumás otras cosas.
2. **Sistema operativo**: en hPanel → *VPS* → *Sistema operativo* → elegí **Ubuntu 24.04 LTS** "limpio" (sin panel de control, sin plantilla de aplicación).
3. **Ubicación**: la más cercana disponible (São Paulo / Brasil si aparece; si no, Estados Unidos).
4. **Clave SSH**: en hPanel → *VPS* → *Configuración* → *Claves SSH* → pegá la clave pública del paso 0.
5. Anotá la **IP** del VPS (aparece en el resumen del VPS).
6. **Firewall de Hostinger** (hPanel → *VPS* → *Seguridad* → *Firewall*): crear una regla que permita solo entrada a los puertos **22, 80 y 443** (TCP). Más abajo se configura además el firewall dentro del servidor (doble capa).

---

## 2. Primer ingreso y endurecimiento básico

Desde tu computadora:

```bash
ssh root@IP_DEL_VPS
```

### 2.1 Actualizar el sistema y fijar la zona horaria

```bash
apt update && apt upgrade -y
timedatectl set-timezone America/Argentina/Catamarca
apt install -y git curl ufw fail2ban unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades   # responder "Sí": parches de seguridad automáticos
```

> La app ya calcula los horarios en hora de Catamarca por su cuenta; la zona del servidor es para que los registros y las copias de seguridad tengan la hora local.

### 2.2 Crear el usuario de la app

Nunca correr la app como `root`. Para administrar el servidor usá tu usuario `vezza` (que ya existe y tiene `sudo`); no hace falta crear otro.

```bash
adduser --disabled-password --gecos "" parabrisas
```

Probá en **otra terminal** que entrás con `ssh vezza@IP_DEL_VPS` y que `sudo -v` funciona. Recién entonces:

### 2.3 Cerrar el acceso por contraseña y de root

```bash
sudo nano /etc/ssh/sshd_config.d/99-seguro.conf
```

Contenido:

```
PermitRootLogin no
PasswordAuthentication no
```

```bash
sudo systemctl restart ssh
```

### 2.4 Firewall del servidor

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'   # si da error porque Nginx no está instalado todavía: sudo ufw allow 80,443/tcp
sudo ufw enable
sudo ufw status
```

`fail2ban` ya queda protegiendo SSH con su configuración por defecto.

---

## 3. Instalar Node.js, PostgreSQL y Nginx

### 3.1 Node.js 24 (la misma versión mayor que usás en local)

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
node -v    # v24.x
```

### 3.2 PostgreSQL

```bash
sudo apt install -y postgresql
sudo systemctl enable --now postgresql
```

Crear el usuario y la base:

```bash
sudo -u postgres psql
```

```sql
CREATE USER parabrisas WITH PASSWORD 'CLAVE_DB';
CREATE DATABASE parabrisas_catamarca OWNER parabrisas;
\q
```

Generá `CLAVE_DB` con `openssl rand -hex 24`. Por defecto Postgres en Ubuntu **solo escucha en localhost**: no abras el puerto 5432 en el firewall. Para administrarlo desde tu PC usá un túnel SSH (ver sección 11).

### 3.3 Nginx y Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

---

## 4. Apuntar el dominio al VPS

En el panel DNS de tu dominio (si el dominio está en Hostinger: hPanel → *Dominios* → *DNS / Nameservers*):

| Tipo | Nombre | Valor | TTL |
|---|---|---|---|
| A | `@` (o el subdominio, por ejemplo `turnos`) | `IP_DEL_VPS` | 3600 |
| A | `www` (solo si usás el dominio raíz) | `IP_DEL_VPS` | 3600 |

Borrá cualquier otro registro A/AAAA viejo para ese nombre. Comprobá que ya propagó antes de pedir el certificado:

```bash
dig +short TU_DOMINIO   # tiene que devolver IP_DEL_VPS
```

---

## 5. Bajar el código

El repositorio está en GitHub. Si es **privado**, el servidor necesita una *deploy key* de solo lectura:

```bash
sudo -iu parabrisas
ssh-keygen -t ed25519 -C "deploy parabrisas" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

En GitHub → repositorio → *Settings* → *Deploy keys* → *Add deploy key* → pegar la clave, **sin** marcar "Allow write access".

```bash
git clone git@github.com:valentinomezzavilla/parabrisas_Catamarca.git ~/app
# (si el repo es público: git clone https://github.com/valentinomezzavilla/parabrisas_Catamarca.git ~/app)
cd ~/app
```

---

## 6. Variables de entorno de producción

Seguís como usuario `parabrisas`, en `~/app`:

```bash
cp .env.example .env
chmod 600 .env
nano .env
```

```dotenv
DATABASE_URL="postgresql://parabrisas:CLAVE_DB@localhost:5432/parabrisas_catamarca?schema=public"

# Nueva, distinta de la de desarrollo. Generar con:
# node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
SESSION_SECRET="..."

ADMIN_USUARIO="..."
ADMIN_PASSWORD="..."
ADMIN_NOMBRE="Administrador"

MP_ACCESS_TOKEN="APP_USR-..."      # token de PRODUCCIÓN (o el de prueba mientras probás)
MP_WEBHOOK_SECRET="..."            # se completa en el paso 10
APP_URL="https://TU_DOMINIO"       # sin barra final

PORT=3000
```

Notas:

- **No** copiar `connection_limit=1` del `.env` local: es solo para la base embebida de `prisma dev`.
- `NODE_ENV` **no** va en el `.env`: lo fija el servicio de systemd (y el build ya lo pone en `production` por defecto). Si estuviera en `production` al correr `npm ci`, no se instalarían las herramientas de compilación (Tailwind, esbuild, Prisma CLI, tsx) y el build fallaría.

---

## 7. Instalar, compilar y preparar la base

```bash
cd ~/app
npm ci                      # incluye devDependencies: hacen falta para compilar, migrar y el seed
npm run build               # prisma generate + CSS + dist/server.js
npx prisma migrate deploy   # crea las tablas (aplica las migraciones de prisma/migrations)
npm run db:seed             # catálogos, servicios base y el primer administrador (solo si no hay usuarios)
```

Prueba rápida a mano:

```bash
NODE_ENV=production npm start
# en otra terminal del VPS:
curl -I http://127.0.0.1:3000/reservar    # tiene que responder 200
```

Cortalo con `Ctrl+C`. Después del seed podés borrar `ADMIN_PASSWORD` del `.env`.

> Una base nueva **no** necesita `npm run db:migrar-caracteristicas` (es solo para bases viejas).

Volvé a tu usuario con `exit`.

---

## 8. Servicio systemd (arranque automático y reinicio ante fallas)

```bash
sudo nano /etc/systemd/system/parabrisas.service
```

```ini
[Unit]
Description=Parabrisas Catamarca (Express)
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=parabrisas
Group=parabrisas
WorkingDirectory=/home/parabrisas/app
Environment=NODE_ENV=production
ExecStart=/usr/bin/node --enable-source-maps dist/server.js
Restart=on-failure
RestartSec=5
# La app cierra el servidor y la conexión a la base al recibir SIGTERM
KillSignal=SIGTERM
TimeoutStopSec=20

# Endurecimiento
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=/home/parabrisas/app

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now parabrisas
sudo systemctl status parabrisas
journalctl -u parabrisas -n 50 --no-pager   # tiene que decir "escuchando en http://localhost:3000"
```

El `.env` lo lee la propia app (`dotenv`) desde `WorkingDirectory`.

---

## 9. Nginx como proxy inverso + HTTPS

```bash
sudo nano /etc/nginx/sites-available/parabrisas
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name TU_DOMINIO;

    client_max_body_size 1m;   # la app acepta formularios de hasta 100 kB

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # Imprescindible: la app compara el Origin de cada POST con este Host (protección CSRF).
        # Sin esto, todos los formularios responden "Origen no permitido".
        proxy_set_header Host              $host;
        proxy_set_header X-Forwarded-Host  $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 60s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/parabrisas /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Certificado (con el DNS ya propagado):

```bash
sudo certbot --nginx -d TU_DOMINIO --redirect -m mezza12354@gmail.com --agree-tos --no-eff-email
sudo certbot renew --dry-run    # comprueba la renovación automática
```

`--redirect` fuerza HTTPS: todo lo que entra por HTTP se redirige. HTTPS es obligatorio porque la cookie de sesión es `Secure` en producción (sin HTTPS, no se puede iniciar sesión) y porque Mercado Pago solo avisa a direcciones HTTPS.

Entrá a `https://TU_DOMINIO`: tiene que aparecer el login, y `https://TU_DOMINIO/reservar` la página pública.

---

## 10. Mercado Pago

1. En el [panel de desarrolladores](https://www.mercadopago.com.ar/developers/panel) → tu aplicación → **Webhooks** → *Configurar notificaciones*.
2. URL de producción: `https://TU_DOMINIO/api/mercadopago/webhook`, evento **Pagos**, guardar.
3. Copiar la **clave secreta** y ponerla en `MP_WEBHOOK_SECRET` del `.env` (`sudo -iu parabrisas nano ~/app/.env`).
4. Confirmar que `MP_ACCESS_TOKEN` es el de producción (y que es un token **nuevo**, no el que quedó expuesto durante el desarrollo).
5. `sudo systemctl restart parabrisas`.
6. Hacer las pruebas de cobro de la sección 2.1 de [docs/PENDIENTES-DESPLIEGUE.md](docs/PENDIENTES-DESPLIEGUE.md). Para ver si el webhook llega y valida la firma:
   ```bash
   journalctl -u parabrisas -f
   sudo tail -f /var/log/nginx/access.log | grep mercadopago   # tiene que verse 200, no 401
   ```

---

## 11. Copias de seguridad

### 11.1 Volcado diario de la base (en el VPS)

```bash
sudo -iu parabrisas
mkdir -p ~/backups
nano ~/backup-db.sh
```

```bash
#!/usr/bin/env bash
set -euo pipefail
DESTINO="$HOME/backups"
ARCHIVO="$DESTINO/parabrisas_$(date +%F_%H%M).dump"
# Lee la DATABASE_URL del .env de la app
URL=$(grep '^DATABASE_URL=' "$HOME/app/.env" | cut -d= -f2- | tr -d '"' | sed 's/?schema=public//')
pg_dump --format=custom --no-owner --dbname="$URL" --file="$ARCHIVO"
# Conservar 14 días
find "$DESTINO" -name 'parabrisas_*.dump' -mtime +14 -delete
```

```bash
chmod 700 ~/backup-db.sh
~/backup-db.sh && ls -lh ~/backups     # probarlo una vez a mano
crontab -e
```

Agregar (todos los días a las 3:30):

```
30 3 * * * /home/parabrisas/backup-db.sh >> /home/parabrisas/backups/backup.log 2>&1
```

### 11.2 Sacar las copias del servidor

Una copia que vive solo en el VPS no sirve si se pierde el VPS. Opciones:

- **Bajarlas a tu PC** de vez en cuando (PowerShell):
  ```powershell
  scp parabrisas@IP_DEL_VPS:backups/*.dump .\backups\
  ```
  (para eso, agregá tu clave pública también en `/home/parabrisas/.ssh/authorized_keys`).
- O subirlas a un almacenamiento externo (Google Drive con `rclone`, Backblaze B2, etc.) desde el mismo cron.

### 11.3 Snapshots de Hostinger

hPanel → *VPS* → *Instantáneas y copias de seguridad*: activá las copias semanales automáticas y sacá una **instantánea manual antes de cada actualización grande**.

### 11.4 Probar que se puede restaurar (hacerlo al menos una vez)

```bash
sudo -u postgres createdb -O parabrisas prueba_restore
pg_restore --no-owner --dbname="postgresql://parabrisas:CLAVE_DB@localhost:5432/prueba_restore" ~/backups/<archivo>.dump
psql "postgresql://parabrisas:CLAVE_DB@localhost:5432/prueba_restore" -c 'select count(*) from usuarios;'
sudo -u postgres dropdb prueba_restore
```

### 11.5 Ver la base desde tu PC (opcional)

Sin abrir el puerto 5432, con un túnel SSH:

```powershell
ssh -L 5433:localhost:5432 vezza@IP_DEL_VPS
```

Y conectás tu cliente (DBeaver, pgAdmin, `prisma studio` con otra `DATABASE_URL`) a `localhost:5433`.

---

## 12. Actualizar la app (cada vez que publiques cambios)

En tu PC: `npm run typecheck`, `npm test`, commit y `git push origin main`.

En el VPS, dejá este script en `/home/parabrisas/deploy.sh` (una sola vez):

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$HOME/app"
"$HOME/backup-db.sh"                 # copia de la base antes de migrar
git fetch origin
git reset --hard origin/main         # el servidor nunca tiene cambios propios
npm ci
npm run build
npx prisma migrate deploy
echo "Listo. Reiniciá con: sudo systemctl restart parabrisas"
```

```bash
chmod 700 /home/parabrisas/deploy.sh
```

Cada actualización:

```bash
ssh vezza@IP_DEL_VPS
sudo -iu parabrisas ./deploy.sh
sudo systemctl restart parabrisas
journalctl -u parabrisas -n 30 --no-pager
```

El corte dura un par de segundos (el reinicio). Si algo sale mal, volver a la versión anterior:

```bash
sudo -iu parabrisas bash -c 'cd ~/app && git reset --hard <commit_anterior> && npm ci && npm run build'
sudo systemctl restart parabrisas
```

> Ojo: volver el código atrás **no** deshace una migración ya aplicada. Si la actualización incluía una migración que rompe algo, restaurá el volcado que hizo `deploy.sh` justo antes.

---

## 13. Comprobación final (humo)

- [ ] `https://TU_DOMINIO` muestra el login con candado válido; `http://TU_DOMINIO` redirige a HTTPS.
- [ ] Se puede iniciar sesión con el administrador del seed, y **cambiar su contraseña** enseguida.
- [ ] Crear, editar y cancelar un turno desde el panel (si un formulario dice "Origen no permitido", revisar los `proxy_set_header` del paso 9).
- [ ] `https://TU_DOMINIO/reservar` permite reservar como cliente.
- [ ] Un pago de prueba llega por webhook (200 en el log de Nginx) y confirma el turno.
- [ ] `sudo reboot` → al volver, la app arranca sola (`systemctl status parabrisas`).
- [ ] Existe al menos un volcado en `~/backups` y se probó restaurarlo.
- [ ] Recorrido completo de la sección 2.2 de [docs/PENDIENTES-DESPLIEGUE.md](docs/PENDIENTES-DESPLIEGUE.md).

---

## 14. Operación diaria

| Para… | Comando |
|---|---|
| Ver si la app está viva | `systemctl status parabrisas` |
| Ver errores en vivo | `journalctl -u parabrisas -f` |
| Errores de los últimos días | `journalctl -u parabrisas --since "2 days ago" -p err` |
| Reiniciar la app | `sudo systemctl restart parabrisas` |
| Accesos / errores de Nginx | `/var/log/nginx/access.log`, `/var/log/nginx/error.log` |
| Espacio en disco | `df -h` |
| Estado del certificado | `sudo certbot certificates` |
| IPs bloqueadas por fail2ban | `sudo fail2ban-client status sshd` |

Recomendado: un monitor gratuito de disponibilidad (UptimeRobot, Better Stack) que consulte `https://TU_DOMINIO/reservar` cada 5 minutos y te avise por mail si se cae.

Para que los registros no llenen el disco, limitá el journal:

```bash
sudo mkdir -p /etc/systemd/journald.conf.d
printf '[Journal]\nSystemMaxUse=500M\n' | sudo tee /etc/systemd/journald.conf.d/limite.conf
sudo systemctl restart systemd-journald
```

---

## 15. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `502 Bad Gateway` | La app no está corriendo | `journalctl -u parabrisas -n 50`; casi siempre es una variable faltante en `.env` |
| La app no arranca y menciona `SESSION_SECRET` | Falta o tiene menos de 32 caracteres | Generar una nueva (paso 6) y reiniciar |
| "Origen no permitido" al enviar cualquier formulario | Nginx no reenvía el `Host` | Revisar `proxy_set_header Host $host;` y recargar Nginx |
| Se inicia sesión pero vuelve al login | Se entra por HTTP y la cookie es `Secure` | Usar HTTPS (certbot con `--redirect`) |
| `npm run build` falla con "tailwindcss/esbuild not found" | `npm ci` corrió con `NODE_ENV=production` | `NODE_ENV= npm ci` y volver a compilar |
| Error de conexión a la base | `DATABASE_URL` mal escrita o caracteres especiales en la clave | Usar una clave solo alfanumérica; probar con `psql "$DATABASE_URL"` |
| El webhook de Mercado Pago devuelve 401 | `MP_WEBHOOK_SECRET` incorrecto | Copiar de nuevo la clave del panel de MP y reiniciar |
| El pago se acredita pero vuelve a una URL rara | `APP_URL` con barra final o con `http://` | `APP_URL="https://TU_DOMINIO"` exacto |
| Certificado vencido | Falló la renovación | `sudo certbot renew` y revisar `/var/log/letsencrypt/` |

---

## Resumen del orden

1. Push del código → 2. VPS Ubuntu 24.04 + clave SSH → 3. usuario, SSH seguro, firewall → 4. Node 24, PostgreSQL, Nginx → 5. DNS → 6. clonar repo → 7. `.env` → 8. `npm ci`, build, migrate, seed → 9. systemd → 10. Nginx + certbot → 11. Mercado Pago → 12. backups → 13. pruebas → abrir al público.
