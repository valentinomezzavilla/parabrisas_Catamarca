# Login del panel — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Proteger el panel con login (usuarios en la base, roles Admin/Empleado) y dejar la app corriendo en `http://localhost:3000`.

**Architecture:** Cookie `sesion` con un JWT firmado (`jose`, HS256) que solo guarda el id del usuario; en cada request se vuelve a leer al usuario en la base (activo + rol). Tres capas: `src/proxy.ts` (chequeo optimista de cookie), `verificarSesion()` en layout y en cada página del panel, y `verificarSesion()`/`requerirRol()` como primera línea de **cada** Server Action. La lógica pura (hash, token, reglas, rutas públicas) vive en módulos sin Prisma ni `cookies()` para testearla con Vitest.

**Tech Stack:** Next.js 16 (App Router, `proxy.ts`), React 19, Prisma 7 + PostgreSQL, Zod 4, `jose`, `node:crypto` (scrypt), Vitest 5, Tailwind 4.

**Spec:** `docs/superpowers/specs/2026-09-30-login-design.md`

> **Antes de escribir código de Next:** `AGENTS.md` del proyecto avisa que esta versión de Next tiene cambios incompatibles. Las guías están en `node_modules/next/dist/docs/` (`01-app/02-guides/authentication.md`, `01-app/03-api-reference/03-file-conventions/proxy.md`). El plan ya las sigue, pero si algo no compila, mirá ahí primero.

## Global Constraints

- Única dependencia nueva: `jose`. Contraseñas con `scrypt` de `node:crypto` (sin bcrypt ni paquetes nativos: el entorno es Windows).
- Cookie `sesion`: `httpOnly`, `sameSite=lax`, `secure` solo en producción, `path=/`, vence en 8 h. JWT `HS256` con `sub` (id de usuario) y `exp`; **no** lleva el rol.
- `SESSION_SECRET` obligatoria, mínimo 32 caracteres; si falta o es corta, falla con mensaje claro.
- Roles: `ADMIN` y `EMPLEADO`. El Empleado ve Panel, Turnos y Stock; no accede a `/servicios/*` ni `/usuarios/*` (redirige a `/`).
- Contraseña: mínimo 5 y máximo 128 caracteres, sin reglas de composición (cambio posterior pedido por el usuario; el plan original decía 10 y su código de ejemplo no se actualizó).
- El login se identifica por **nombre de usuario** (campo `usuario`, único): en minúsculas, 3–60 caracteres, solo letras, números y `. _ @ -`, empezando por letra o número. Un email sigue siendo un usuario válido.
- Error de login genérico: "Usuario o contraseña incorrectos" (usuario inexistente, clave errónea o usuario inactivo).
- Nadie puede desactivarse ni cambiarse el rol a sí mismo; tiene que quedar siempre al menos un ADMIN activo.
- Rutas públicas: `/login`, `/reservar` (y subrutas), `/_next`, `/brand` y archivos estáticos. `/reservar` no se toca.
- Todo el texto de interfaz en español rioplatense (voseo: "Ingresá", "Revisá"), como el resto de la app.
- Convenciones del repo: identificadores en español, imports con alias `@/`, acciones en `acciones.ts`, lógica de negocio en `src/modules/*`.
- Cada commit termina con el trailer `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` (se pasa como segundo `-m`).
- Las rutas con paréntesis se citan siempre en el shell: `"src/app/(panel)/stock"`.

## Review Focus

Entradas o condiciones que el spec implica pero que ninguna tarea prueba "de casualidad"; cada una tiene su test o verificación en la tarea indicada.

1. **Usuario con mayúsculas y espacios** (`"  Admin.Demo "`) debe entrar igual que `admin.demo`; usuarios con espacios internos, tildes o demasiado cortos se rechazan → Task 4 (`schemas.test.ts`).
2. **Token alterado, vencido, firmado con otra clave o con `alg: none`** debe tratarse como "sin sesión" y nunca lanzar → Task 3 (`token.test.ts`).
3. **Contraseñas con `$`, tildes/ñ, espacios al borde o de más de 128 caracteres:** el hash y la verificación funcionan; el schema rechaza las largas y no recorta espacios → Task 2 y Task 4.
4. **Último administrador / autodesactivación / autodegradación:** no se puede dejar al sistema sin Admin ni que alguien se saque el rol → Task 5 (`reglas.test.ts`).
5. **Server Action nueva sin guardia**, o usuario desactivado/degradado con cookie todavía vigente: la acción futura sin `verificarSesion()` rompe el build de tests → Task 9 (`guardia-acciones.test.ts`); el corte inmediato por desactivación se verifica a mano en Task 11.

Limitación conocida (fuera de alcance, ya anotada en el spec): resetear una contraseña no cierra las sesiones abiertas; para cortar un acceso de inmediato hay que desactivar al usuario.

---

## Mapa de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/lib/password.ts` | Hash y verificación de contraseñas (scrypt). Puro. |
| `src/lib/token.ts` | Firmar/verificar el JWT de sesión, secreto, constantes de la cookie. Puro (solo `jose`). |
| `src/lib/rutas.ts` | `esRutaPublica(ruta)`. Puro. |
| `src/lib/sesion.ts` | Cookie + lectura del usuario: `iniciarSesion`, `cerrarSesion`, `obtenerSesion`, `verificarSesion`, `requerirRol`. Solo servidor. |
| `src/proxy.ts` | Chequeo optimista de cookie y redirección a `/login`. |
| `src/modules/usuarios/reglas.ts` | Reglas puras de roles y de cambios permitidos. |
| `src/modules/usuarios/schemas.ts` | Schemas Zod de login, alta y contraseña. |
| `src/modules/usuarios/usuario.service.ts` | Acceso a la tabla `usuarios`. |
| `src/app/(auth)/…` | Layout y pantalla `/login`, acciones `iniciarSesionAccion` y `salir`. |
| `src/app/(panel)/usuarios/…` | Pantalla de administración de usuarios (solo Admin). |
| `src/guardia-acciones.test.ts` | Test estático: toda Server Action del panel valida la sesión primero. |

---

### Task 1: Dependencia, variables de entorno y base local

**Files:**
- Modify: `package.json`, `package-lock.json` (vía `npm install`)
- Modify: `.env.example`
- Modify (local, no se commitea): `.env`

**Interfaces:**
- Produces: paquete `jose` instalado; `SESSION_SECRET`, `ADMIN_USUARIO`, `ADMIN_PASSWORD`, `ADMIN_NOMBRE` documentadas en `.env.example`; una base Postgres accesible con las migraciones existentes aplicadas.

- [ ] **Step 1: Instalar `jose`**

Run: `npm install jose`
Expected: `added 1 package` (o similar) y `jose` aparece en `dependencies` de `package.json`.

- [ ] **Step 2: Documentar las variables en `.env.example`**

Reemplazar el contenido completo de `.env.example` por:

```
# Copiar a .env y completar con los datos del PostgreSQL local o del servidor.
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/parabrisas_catamarca?schema=public"

# Clave con la que se firma la cookie de sesión. Mínimo 32 caracteres.
# Generar una con: node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
SESSION_SECRET=""

# Primer administrador. Solo los usa `npm run db:seed`, y solo si todavía no hay usuarios.
# Después del primer seed se pueden borrar de este archivo.
ADMIN_USUARIO=""
ADMIN_PASSWORD=""
ADMIN_NOMBRE="Administrador"
```

- [ ] **Step 3: Levantar la base local**

La base del `.env` actual (`prisma dev`, puerto 51222) está caída. Run: `npx prisma dev --name local --detach`
Expected: imprime la URL de conexión (`postgres://…`). Copiarla a `DATABASE_URL` en `.env` **agregando `&connection_limit=1`** al final (la base embebida admite una sola conexión; ver README). No commitear `.env`.

- [ ] **Step 4: Generar y guardar `SESSION_SECRET` y el Admin inicial en `.env` (local)**

Run:

```bash
node -e "const c=require('crypto');const fs=require('fs');const add='\nSESSION_SECRET=\"'+c.randomBytes(32).toString('base64url')+'\"\nADMIN_USUARIO=\"<usuario-admin>\"\nADMIN_PASSWORD=\"<clave-admin>\"\nADMIN_NOMBRE=\"Administrador\"\n';fs.appendFileSync('.env',add)"
```

Expected: `.env` tiene las cuatro variables nuevas. El Admin inicial lo eligió el usuario: reemplazar `<usuario-admin>` y `<clave-admin>` del comando por los valores que indique (no se guardan en el repo). Advertirle al final que una clave corta o igual al usuario es fácil de adivinar y que la cambie desde Usuarios → Nueva contraseña antes de publicar el panel.

- [ ] **Step 5: Aplicar las migraciones existentes y verificar la conexión**

Run: `npx prisma migrate deploy`
Expected: `All migrations have been successfully applied.` (o "No pending migrations"). Si dice `P1001`, la base no está levantada: repetir Step 3.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: agrega jose y documenta variables de sesion y admin inicial" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Hash de contraseñas

**Files:**
- Create: `src/lib/password.ts`
- Test: `src/lib/password.test.ts`

**Interfaces:**
- Produces:
  - `hashearPassword(password: string): Promise<string>` → `"scrypt$<salB64>$<claveB64>"`
  - `verificarPassword(password: string, almacenado: string): Promise<boolean>` (nunca lanza; formato inválido → `false`)
  - `hashFicticio(): Promise<string>` (hash válido de una clave al azar, cacheado)

- [ ] **Step 1: Write the failing test**

Crear `src/lib/password.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { hashearPassword, hashFicticio, verificarPassword } from "./password";

describe("hashearPassword / verificarPassword", () => {
  it("verifica la contraseña correcta y rechaza la incorrecta", async () => {
    const hash = await hashearPassword("clave-segura-123");
    expect(await verificarPassword("clave-segura-123", hash)).toBe(true);
    expect(await verificarPassword("clave-segura-124", hash)).toBe(false);
  });

  it("genera un hash distinto cada vez (sal aleatoria)", async () => {
    const a = await hashearPassword("misma-clave-123");
    const b = await hashearPassword("misma-clave-123");
    expect(a).not.toBe(b);
  });

  it("tiene el formato scrypt$sal$clave", async () => {
    const hash = await hashearPassword("clave-segura-123");
    expect(hash.split("$")).toHaveLength(3);
    expect(hash.startsWith("scrypt$")).toBe(true);
  });

  it("soporta $, tildes, ñ y espacios en la contraseña", async () => {
    for (const clave of ["pa$$word$$1234", "contraseña-ñandú-ü", "  con espacios  "]) {
      const hash = await hashearPassword(clave);
      expect(await verificarPassword(clave, hash)).toBe(true);
      expect(await verificarPassword(clave.trim() + "x", hash)).toBe(false);
    }
  });

  it("no acepta la contraseña vacía contra un hash válido", async () => {
    const hash = await hashearPassword("clave-segura-123");
    expect(await verificarPassword("", hash)).toBe(false);
  });

  it("devuelve false, sin lanzar, ante un hash con formato inválido", async () => {
    const valido = await hashearPassword("clave-segura-123");
    const [, sal, clave] = valido.split("$");
    const invalidos = [
      "",
      "abc",
      "scrypt$solo-una-parte",
      `bcrypt$${sal}$${clave}`,
      `scrypt$${sal}$${clave}$extra`,
      `scrypt$${sal}$${clave.slice(0, 10)}`, // clave truncada
      `scrypt$$`,
    ];
    for (const almacenado of invalidos) {
      expect(await verificarPassword("clave-segura-123", almacenado)).toBe(false);
    }
  });
});

describe("hashFicticio", () => {
  it("es un hash con formato válido y siempre el mismo dentro del proceso", async () => {
    const a = await hashFicticio();
    const b = await hashFicticio();
    expect(a).toBe(b);
    expect(a.split("$")).toHaveLength(3);
    expect(await verificarPassword("cualquier-cosa", a)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/password.test.ts`
Expected: FAIL (`Failed to resolve import "./password"`).

- [ ] **Step 3: Write minimal implementation**

Crear `src/lib/password.ts`:

```ts
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const PREFIJO = "scrypt";
const LARGO_CLAVE = 64;
const LARGO_SAL = 16;

const derivar = (password: string, sal: Buffer) =>
  new Promise<Buffer>((ok, fallo) =>
    scrypt(password, sal, LARGO_CLAVE, (error, clave) => (error ? fallo(error) : ok(clave))),
  );

/** Formato guardado en la base: `scrypt$<sal en base64>$<clave en base64>`. */
export async function hashearPassword(password: string): Promise<string> {
  const sal = randomBytes(LARGO_SAL);
  const clave = await derivar(password, sal);
  return `${PREFIJO}$${sal.toString("base64")}$${clave.toString("base64")}`;
}

/** Nunca lanza: un hash con formato inesperado simplemente no coincide. */
export async function verificarPassword(password: string, almacenado: string): Promise<boolean> {
  const [prefijo, salB64, claveB64, ...resto] = almacenado.split("$");
  if (prefijo !== PREFIJO || !salB64 || !claveB64 || resto.length > 0) return false;

  const esperada = Buffer.from(claveB64, "base64");
  if (esperada.length !== LARGO_CLAVE) return false;

  const obtenida = await derivar(password, Buffer.from(salB64, "base64"));
  return timingSafeEqual(obtenida, esperada);
}

let ficticio: Promise<string> | undefined;

/**
 * Hash válido de una clave al azar. Se verifica contra él cuando el usuario no existe,
 * para que el login tarde lo mismo y no revele qué cuentas existen.
 */
export function hashFicticio(): Promise<string> {
  return (ficticio ??= hashearPassword(randomBytes(16).toString("hex")));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/password.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/password.ts src/lib/password.test.ts
git commit -m "feat: hash y verificacion de contrasenas con scrypt" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Token de sesión

**Files:**
- Create: `src/lib/token.ts`
- Test: `src/lib/token.test.ts`

**Interfaces:**
- Produces:
  - `NOMBRE_COOKIE = "sesion"`, `DURACION_SESION_SEGUNDOS = 28800`
  - `obtenerSecreto(valor?: string): Uint8Array` (lanza `Error` si falta o tiene < 32 caracteres; por defecto lee `process.env.SESSION_SECRET`)
  - `firmarToken(usuarioId: string, secreto: Uint8Array, ahoraMs?: number): Promise<string>`
  - `verificarToken(token: string | undefined, secreto: Uint8Array, ahoraMs?: number): Promise<string | null>` (devuelve el id del usuario o `null`; nunca lanza)

- [ ] **Step 1: Write the failing test**

Crear `src/lib/token.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DURACION_SESION_SEGUNDOS, firmarToken, obtenerSecreto, verificarToken } from "./token";

const SECRETO = obtenerSecreto("a".repeat(40));
const OTRO_SECRETO = obtenerSecreto("b".repeat(40));
const AHORA = Date.UTC(2026, 9, 1, 12, 0, 0);
const base64url = (texto: string) => Buffer.from(texto).toString("base64url");

describe("obtenerSecreto", () => {
  it("falla con un mensaje claro si falta o es corto", () => {
    expect(() => obtenerSecreto(undefined)).toThrow(/SESSION_SECRET/);
    expect(() => obtenerSecreto("")).toThrow(/SESSION_SECRET/);
    expect(() => obtenerSecreto("x".repeat(31))).toThrow(/32 caracteres/);
  });

  it("acepta 32 caracteres o más", () => {
    expect(obtenerSecreto("x".repeat(32))).toBeInstanceOf(Uint8Array);
  });
});

describe("firmarToken / verificarToken", () => {
  it("devuelve el id del usuario con un token válido", async () => {
    const token = await firmarToken("usuario-1", SECRETO, AHORA);
    expect(await verificarToken(token, SECRETO, AHORA + 1000)).toBe("usuario-1");
  });

  it("sigue válido justo antes de las 8 horas y vence después", async () => {
    const token = await firmarToken("usuario-1", SECRETO, AHORA);
    const limite = AHORA + DURACION_SESION_SEGUNDOS * 1000;
    expect(await verificarToken(token, SECRETO, limite - 1000)).toBe("usuario-1");
    expect(await verificarToken(token, SECRETO, limite + 1000)).toBeNull();
  });

  it("rechaza un token firmado con otra clave", async () => {
    const token = await firmarToken("usuario-1", OTRO_SECRETO, AHORA);
    expect(await verificarToken(token, SECRETO, AHORA)).toBeNull();
  });

  it("rechaza un token con el contenido alterado", async () => {
    const token = await firmarToken("usuario-1", SECRETO, AHORA);
    const [cabecera, , firma] = token.split(".");
    const falso = base64url(JSON.stringify({ sub: "admin-falso", exp: Math.floor(AHORA / 1000) + 3600 }));
    expect(await verificarToken(`${cabecera}.${falso}.${firma}`, SECRETO, AHORA)).toBeNull();
  });

  it('rechaza un token sin firma con alg "none"', async () => {
    const cabecera = base64url(JSON.stringify({ alg: "none", typ: "JWT" }));
    const cuerpo = base64url(JSON.stringify({ sub: "usuario-1", exp: Math.floor(AHORA / 1000) + 3600 }));
    expect(await verificarToken(`${cabecera}.${cuerpo}.`, SECRETO, AHORA)).toBeNull();
    expect(await verificarToken(`${cabecera}.${cuerpo}`, SECRETO, AHORA)).toBeNull();
  });

  it("devuelve null, sin lanzar, ante valores que no son un token", async () => {
    for (const valor of [undefined, "", "basura", "a.b.c", "....", " "]) {
      expect(await verificarToken(valor, SECRETO, AHORA)).toBeNull();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/token.test.ts`
Expected: FAIL (`Failed to resolve import "./token"`).

- [ ] **Step 3: Write minimal implementation**

Crear `src/lib/token.ts`:

```ts
import { jwtVerify, SignJWT } from "jose";

// Este módulo lo importa también `src/proxy.ts`: no puede usar Prisma ni `next/headers`.

export const NOMBRE_COOKIE = "sesion";
export const DURACION_SESION_SEGUNDOS = 8 * 60 * 60;

const LARGO_MINIMO_SECRETO = 32;

export function obtenerSecreto(valor: string | undefined = process.env.SESSION_SECRET): Uint8Array {
  if (!valor || valor.length < LARGO_MINIMO_SECRETO) {
    throw new Error(
      `SESSION_SECRET falta o tiene menos de ${LARGO_MINIMO_SECRETO} caracteres. ` +
        `Generá una con: node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`,
    );
  }
  return new TextEncoder().encode(valor);
}

/** El token solo identifica al usuario; el rol y el estado se leen siempre de la base. */
export async function firmarToken(usuarioId: string, secreto: Uint8Array, ahoraMs = Date.now()): Promise<string> {
  const emitido = Math.floor(ahoraMs / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(usuarioId)
    .setIssuedAt(emitido)
    .setExpirationTime(emitido + DURACION_SESION_SEGUNDOS)
    .sign(secreto);
}

/** Id del usuario si el token es válido y no venció; `null` en cualquier otro caso. */
export async function verificarToken(
  token: string | undefined,
  secreto: Uint8Array,
  ahoraMs = Date.now(),
): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secreto, { algorithms: ["HS256"], currentDate: new Date(ahoraMs) });
    return typeof payload.sub === "string" && payload.sub !== "" ? payload.sub : null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/token.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/token.ts src/lib/token.test.ts
git commit -m "feat: token de sesion firmado con jose" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Schemas de usuarios y rutas públicas

**Files:**
- Create: `src/modules/usuarios/schemas.ts`
- Create: `src/lib/rutas.ts`
- Test: `src/modules/usuarios/schemas.test.ts`
- Test: `src/lib/rutas.test.ts`

**Interfaces:**
- Produces (`schemas.ts`):
  - `rolSchema` (`z.enum(["ADMIN", "EMPLEADO"])`)
  - `passwordSchema` (string 10–128, sin recortar)
  - `loginSchema` → `{ usuario: string (minúsculas), password: string }`
  - `crearUsuarioSchema` → `{ nombre: string, usuario: string, password: string, rol: "ADMIN" | "EMPLEADO" }`; tipo `CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>`
  - `resetPasswordSchema` → `{ password: string }`
- Produces (`rutas.ts`): `esRutaPublica(ruta: string): boolean`

- [ ] **Step 1: Write the failing tests**

Crear `src/modules/usuarios/schemas.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { crearUsuarioSchema, loginSchema, passwordSchema, resetPasswordSchema, rolSchema } from "./schemas";

describe("loginSchema", () => {
  it("normaliza el usuario: sin espacios y en minúsculas", () => {
    const r = loginSchema.parse({ usuario: "  Admin.Demo ", password: "x" });
    expect(r.usuario).toBe("admin.demo");
    expect(loginSchema.parse({ usuario: "  Admin@Local.COM ", password: "x" }).usuario).toBe("admin@local.com");
  });

  it("rechaza usuario inválido o faltante y contraseña vacía", () => {
    for (const malo of ["ab", "con espacios", "ñandú", "-empieza-mal", "a".repeat(61), ""]) {
      expect(loginSchema.safeParse({ usuario: malo, password: "x" }).success).toBe(false);
    }
    expect(loginSchema.safeParse({ usuario: undefined, password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ usuario: "admin.demo", password: "" }).success).toBe(false);
  });

  it("no recorta la contraseña", () => {
    expect(loginSchema.parse({ usuario: "admin.demo", password: "  hola  " }).password).toBe("  hola  ");
  });
});

describe("passwordSchema", () => {
  it("exige entre 10 y 128 caracteres", () => {
    expect(passwordSchema.safeParse("a".repeat(9)).success).toBe(false);
    expect(passwordSchema.safeParse("a".repeat(10)).success).toBe(true);
    expect(passwordSchema.safeParse("a".repeat(128)).success).toBe(true);
    expect(passwordSchema.safeParse("a".repeat(129)).success).toBe(false);
  });

  it("conserva los espacios del borde", () => {
    expect(passwordSchema.parse("  abcdef  ")).toBe("  abcdef  ");
  });
});

describe("crearUsuarioSchema", () => {
  const valido = { nombre: "  Ana Pérez ", usuario: " Ana.Perez", password: "clave-larga-123", rol: "EMPLEADO" };

  it("acepta un usuario válido y normaliza nombre y usuario", () => {
    const r = crearUsuarioSchema.parse(valido);
    expect(r.nombre).toBe("Ana Pérez");
    expect(r.usuario).toBe("ana.perez");
  });

  it("rechaza un rol inexistente y un nombre vacío", () => {
    expect(crearUsuarioSchema.safeParse({ ...valido, rol: "SUPERADMIN" }).success).toBe(false);
    expect(crearUsuarioSchema.safeParse({ ...valido, nombre: "   " }).success).toBe(false);
  });

  it("marca el campo password cuando es corta", () => {
    const r = crearUsuarioSchema.safeParse({ ...valido, password: "corta" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["password"]);
  });
});

describe("rolSchema / resetPasswordSchema", () => {
  it("rolSchema solo admite ADMIN y EMPLEADO", () => {
    expect(rolSchema.safeParse("ADMIN").success).toBe(true);
    expect(rolSchema.safeParse("EMPLEADO").success).toBe(true);
    expect(rolSchema.safeParse("admin").success).toBe(false);
  });

  it("resetPasswordSchema aplica las mismas reglas de contraseña", () => {
    expect(resetPasswordSchema.safeParse({ password: "corta" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ password: "una-clave-larga" }).success).toBe(true);
  });
});
```

Crear `src/lib/rutas.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { esRutaPublica } from "./rutas";

describe("esRutaPublica", () => {
  it("permite /login y /reservar con sus subrutas", () => {
    for (const ruta of ["/login", "/login/", "/reservar", "/reservar/", "/reservar/confirmado"]) {
      expect(esRutaPublica(ruta)).toBe(true);
    }
  });

  it("protege el panel", () => {
    for (const ruta of ["/", "/turnos", "/stock", "/stock/abc/editar", "/servicios", "/usuarios"]) {
      expect(esRutaPublica(ruta)).toBe(false);
    }
  });

  it("no se deja engañar por prefijos parecidos", () => {
    for (const ruta of ["/login-admin", "/loginx", "/reservarx", "/reservar-turnos", "/stock/login", "/x/reservar"]) {
      expect(esRutaPublica(ruta)).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/modules/usuarios/schemas.test.ts src/lib/rutas.test.ts`
Expected: FAIL (imports no resueltos).

- [ ] **Step 3: Write minimal implementation**

Crear `src/modules/usuarios/schemas.ts`:

```ts
import { z } from "@/lib/zod";

export const rolSchema = z.enum(["ADMIN", "EMPLEADO"]);

/** Las contraseñas no se recortan: los espacios también cuentan. */
export const passwordSchema = z.string().min(10).max(128);

/** Nombre de usuario para el login: minúsculas, 3–60 caracteres, letras, números y . _ @ - (un email también sirve). */
const usuarioSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(60)
  .regex(/^[a-z0-9][a-z0-9._@-]*$/, "Usar solo letras, números y . _ @ -, sin espacios");

export const loginSchema = z.object({
  usuario: usuarioSchema,
  password: z.string().min(1).max(128),
});

export const crearUsuarioSchema = z.object({
  nombre: z.string().trim().min(1).max(80),
  usuario: usuarioSchema,
  password: passwordSchema,
  rol: rolSchema,
});

export const resetPasswordSchema = z.object({ password: passwordSchema });

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
```

Crear `src/lib/rutas.ts`:

```ts
// Lo usa `src/proxy.ts`: sin dependencias de servidor.

const PUBLICAS = ["/login", "/reservar"];

/** `/login` y `/reservar` (con sus subrutas) no requieren sesión. */
export function esRutaPublica(ruta: string): boolean {
  return PUBLICAS.some((base) => ruta === base || ruta.startsWith(`${base}/`));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/modules/usuarios/schemas.test.ts src/lib/rutas.test.ts`
Expected: PASS (todos). Si el test de "marca el campo password" falla por el orden de los issues, revisar que `passwordSchema` sea el único que falla en ese caso.

- [ ] **Step 5: Commit**

```bash
git add src/modules/usuarios/schemas.ts src/modules/usuarios/schemas.test.ts src/lib/rutas.ts src/lib/rutas.test.ts
git commit -m "feat: schemas de usuarios y rutas publicas" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Reglas de roles y cambios permitidos

**Files:**
- Create: `src/modules/usuarios/reglas.ts`
- Test: `src/modules/usuarios/reglas.test.ts`

**Interfaces:**
- Produces:
  - `type Rol = "ADMIN" | "EMPLEADO"`
  - `interface UsuarioBasico { id: string; rol: Rol; activo: boolean }`
  - `type Cambio = { tipo: "rol"; rol: Rol } | { tipo: "activo"; activo: boolean }`
  - `rolAlcanza(rol: Rol, requerido: Rol): boolean`
  - `motivoDeRechazo(actor: { id: string }, objetivo: UsuarioBasico, cambio: Cambio, adminsActivos: number): string | null` (`null` = se puede aplicar)

- [ ] **Step 1: Write the failing test**

Crear `src/modules/usuarios/reglas.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { motivoDeRechazo, rolAlcanza, type UsuarioBasico } from "./reglas";

const admin = (id: string, activo = true): UsuarioBasico => ({ id, rol: "ADMIN", activo });
const empleado = (id: string, activo = true): UsuarioBasico => ({ id, rol: "EMPLEADO", activo });

describe("rolAlcanza", () => {
  it("el Admin alcanza cualquier rol y el Empleado solo el suyo", () => {
    expect(rolAlcanza("ADMIN", "ADMIN")).toBe(true);
    expect(rolAlcanza("ADMIN", "EMPLEADO")).toBe(true);
    expect(rolAlcanza("EMPLEADO", "EMPLEADO")).toBe(true);
    expect(rolAlcanza("EMPLEADO", "ADMIN")).toBe(false);
  });
});

describe("motivoDeRechazo", () => {
  it("no deja que alguien cambie su propio rol", () => {
    const yo = admin("a");
    expect(motivoDeRechazo(yo, yo, { tipo: "rol", rol: "EMPLEADO" }, 2)).toMatch(/propio rol/);
  });

  it("no deja que alguien desactive su propia cuenta", () => {
    const yo = admin("a");
    expect(motivoDeRechazo(yo, yo, { tipo: "activo", activo: false }, 2)).toMatch(/propia cuenta/);
  });

  it("no deja sin administradores activos: ni por degradación ni por desactivación", () => {
    const actor = admin("a");
    const ultimo = admin("b");
    expect(motivoDeRechazo(actor, ultimo, { tipo: "rol", rol: "EMPLEADO" }, 1)).toMatch(/al menos un administrador/);
    expect(motivoDeRechazo(actor, ultimo, { tipo: "activo", activo: false }, 1)).toMatch(/al menos un administrador/);
  });

  it("permite degradar o desactivar a un Admin si queda otro activo", () => {
    const actor = admin("a");
    expect(motivoDeRechazo(actor, admin("b"), { tipo: "rol", rol: "EMPLEADO" }, 2)).toBeNull();
    expect(motivoDeRechazo(actor, admin("b"), { tipo: "activo", activo: false }, 2)).toBeNull();
  });

  it("permite desactivar o ascender a un Empleado aunque haya un solo Admin", () => {
    const actor = admin("a");
    expect(motivoDeRechazo(actor, empleado("e"), { tipo: "activo", activo: false }, 1)).toBeNull();
    expect(motivoDeRechazo(actor, empleado("e"), { tipo: "rol", rol: "ADMIN" }, 1)).toBeNull();
  });

  it("un Admin ya inactivo no cuenta como administrador activo", () => {
    const actor = admin("a");
    const inactivo = admin("b", false);
    expect(motivoDeRechazo(actor, inactivo, { tipo: "rol", rol: "EMPLEADO" }, 1)).toBeNull();
  });

  it("un cambio que no cambia nada es válido (ni siquiera sobre uno mismo)", () => {
    const yo = admin("a");
    expect(motivoDeRechazo(yo, yo, { tipo: "rol", rol: "ADMIN" }, 1)).toBeNull();
    expect(motivoDeRechazo(yo, yo, { tipo: "activo", activo: true }, 1)).toBeNull();
  });

  it("reactivar a un usuario siempre se permite", () => {
    expect(motivoDeRechazo(admin("a"), empleado("e", false), { tipo: "activo", activo: true }, 1)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/modules/usuarios/reglas.test.ts`
Expected: FAIL (`Failed to resolve import "./reglas"`).

- [ ] **Step 3: Write minimal implementation**

Crear `src/modules/usuarios/reglas.ts`:

```ts
// Reglas puras: sin Prisma ni Next, para poder testearlas solas.

export type Rol = "ADMIN" | "EMPLEADO";

export interface UsuarioBasico {
  id: string;
  rol: Rol;
  activo: boolean;
}

export type Cambio = { tipo: "rol"; rol: Rol } | { tipo: "activo"; activo: boolean };

/** El Admin puede todo lo del Empleado; el Empleado no puede lo del Admin. */
export function rolAlcanza(rol: Rol, requerido: Rol): boolean {
  return requerido === "EMPLEADO" || rol === "ADMIN";
}

/**
 * Motivo por el que un cambio sobre un usuario no se permite, o `null` si se puede aplicar.
 * `adminsActivos` es la cantidad de administradores activos antes del cambio.
 */
export function motivoDeRechazo(
  actor: { id: string },
  objetivo: UsuarioBasico,
  cambio: Cambio,
  adminsActivos: number,
): string | null {
  const esUnoMismo = actor.id === objetivo.id;

  if (cambio.tipo === "rol") {
    if (cambio.rol === objetivo.rol) return null;
    if (esUnoMismo) return "No podés cambiar tu propio rol.";
  } else {
    if (cambio.activo === objetivo.activo) return null;
    if (esUnoMismo && !cambio.activo) return "No podés desactivar tu propia cuenta.";
  }

  const dejaDeSerAdminActivo =
    objetivo.rol === "ADMIN" &&
    objetivo.activo &&
    ((cambio.tipo === "rol" && cambio.rol !== "ADMIN") || (cambio.tipo === "activo" && !cambio.activo));

  if (dejaDeSerAdminActivo && adminsActivos <= 1) return "Tiene que quedar al menos un administrador activo.";
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/modules/usuarios/reglas.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/modules/usuarios/reglas.ts src/modules/usuarios/reglas.test.ts
git commit -m "feat: reglas de roles y cambios permitidos de usuarios" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Modelo `Usuario`, migración, servicio y seed del Admin

**Files:**
- Modify: `prisma/schema.prisma` (agregar al final del archivo)
- Create: `prisma/migrations/<timestamp>_usuarios/migration.sql` (lo genera Prisma)
- Create: `src/modules/usuarios/usuario.service.ts`
- Modify: `prisma/seed.ts`

**Interfaces:**
- Consumes: `hashearPassword`, `verificarPassword`, `hashFicticio` (Task 2); `motivoDeRechazo`, `Rol`, `Cambio` (Task 5); `CrearUsuarioInput` (Task 4).
- Produces (`usuario.service.ts`):
  - `interface UsuarioSesion { id: string; nombre: string; usuario: string; rol: Rol }`
  - `class CambioNoPermitidoError extends Error`
  - `autenticar(nombreUsuario: string, password: string): Promise<UsuarioSesion | null>`
  - `obtenerUsuarioActivo(id: string): Promise<UsuarioSesion | null>`
  - `listarUsuarios(): Promise<(UsuarioSesion & { activo: boolean; ultimoAcceso: Date | null; creadoEn: Date })[]>`
  - `crearUsuario(datos: CrearUsuarioInput): Promise<UsuarioSesion>` (lanza el error `P2002` de Prisma si el usuario ya existe)
  - `cambiarRol(actor: { id: string }, id: string, rol: Rol): Promise<void>` y `cambiarActivo(actor: { id: string }, id: string, activo: boolean): Promise<void>` (lanzan `CambioNoPermitidoError`)
  - `resetearPassword(id: string, password: string): Promise<void>` (lanza `CambioNoPermitidoError` si el usuario no existe)

- [ ] **Step 1: Agregar el modelo a `prisma/schema.prisma`**

Agregar al final del archivo:

```prisma
// =====================================================================
//  USUARIOS DEL PANEL
// =====================================================================

enum RolUsuario {
  ADMIN
  EMPLEADO
}

/// Persona con acceso al panel. `passwordHash` tiene el formato `scrypt$<sal>$<clave>`.
model Usuario {
  id           String     @id @default(cuid())
  usuario        String     @unique // siempre en minúsculas
  nombre       String
  passwordHash String     @map("password_hash")
  rol          RolUsuario @default(EMPLEADO)
  activo       Boolean    @default(true)
  ultimoAcceso DateTime?  @map("ultimo_acceso")
  creadoEn     DateTime   @default(now()) @map("creado_en")

  @@map("usuarios")
}
```

- [ ] **Step 2: Crear la migración y regenerar el cliente**

Run: `npx prisma migrate dev --name usuarios`
Expected: crea `prisma/migrations/<timestamp>_usuarios/migration.sql` con `CREATE TYPE "RolUsuario"` y `CREATE TABLE "usuarios"`, la aplica y regenera `src/generated/prisma`. Verificar con `git status` que solo aparece la carpeta nueva de migración y el cambio de `schema.prisma` (`src/generated` está ignorado).

- [ ] **Step 3: Crear `src/modules/usuarios/usuario.service.ts`**

```ts
import { db } from "@/lib/db";
import { hashearPassword, hashFicticio, verificarPassword } from "@/lib/password";
import { motivoDeRechazo, type Cambio, type Rol } from "./reglas";
import type { CrearUsuarioInput } from "./schemas";

export interface UsuarioSesion {
  id: string;
  nombre: string;
  usuario: string;
  rol: Rol;
}

/** Un cambio de rol o de estado que las reglas no permiten, o sobre un usuario inexistente. */
export class CambioNoPermitidoError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "CambioNoPermitidoError";
  }
}

const datosDeSesion = { id: true, nombre: true, usuario: true, rol: true } as const;

/** Devuelve el usuario si el nombre de usuario y la contraseña coinciden y la cuenta está activa. */
export async function autenticar(nombreUsuario: string, password: string): Promise<UsuarioSesion | null> {
  const usuario = await db.usuario.findUnique({ where: { usuario: nombreUsuario } });
  // Con un usuario inexistente se verifica igual contra un hash ficticio:
  // el tiempo de respuesta no revela qué cuentas existen.
  const coincide = await verificarPassword(password, usuario?.passwordHash ?? (await hashFicticio()));
  if (!usuario || !usuario.activo || !coincide) return null;

  await db.usuario.update({ where: { id: usuario.id }, data: { ultimoAcceso: new Date() } });
  return { id: usuario.id, nombre: usuario.nombre, usuario: usuario.usuario, rol: usuario.rol };
}

/** Se consulta en cada request: desactivar a alguien o cambiarle el rol surte efecto de inmediato. */
export function obtenerUsuarioActivo(id: string): Promise<UsuarioSesion | null> {
  return db.usuario.findFirst({ where: { id, activo: true }, select: datosDeSesion });
}

export function listarUsuarios() {
  return db.usuario.findMany({
    orderBy: [{ activo: "desc" }, { nombre: "asc" }],
    select: { ...datosDeSesion, activo: true, ultimoAcceso: true, creadoEn: true },
  });
}

export async function crearUsuario(datos: CrearUsuarioInput): Promise<UsuarioSesion> {
  return db.usuario.create({
    data: {
      nombre: datos.nombre,
      usuario: datos.usuario,
      rol: datos.rol,
      passwordHash: await hashearPassword(datos.password),
    },
    select: datosDeSesion,
  });
}

async function aplicarCambio(actor: { id: string }, objetivoId: string, cambio: Cambio): Promise<void> {
  await db.$transaction(async (tx) => {
    const objetivo = await tx.usuario.findUnique({
      where: { id: objetivoId },
      select: { id: true, rol: true, activo: true },
    });
    if (!objetivo) throw new CambioNoPermitidoError("El usuario no existe.");

    const adminsActivos = await tx.usuario.count({ where: { rol: "ADMIN", activo: true } });
    const motivo = motivoDeRechazo(actor, objetivo, cambio, adminsActivos);
    if (motivo) throw new CambioNoPermitidoError(motivo);

    await tx.usuario.update({
      where: { id: objetivoId },
      data: cambio.tipo === "rol" ? { rol: cambio.rol } : { activo: cambio.activo },
    });
  });
}

export const cambiarRol = (actor: { id: string }, id: string, rol: Rol) =>
  aplicarCambio(actor, id, { tipo: "rol", rol });

export const cambiarActivo = (actor: { id: string }, id: string, activo: boolean) =>
  aplicarCambio(actor, id, { tipo: "activo", activo });

export async function resetearPassword(id: string, password: string): Promise<void> {
  const { count } = await db.usuario.updateMany({
    where: { id },
    data: { passwordHash: await hashearPassword(password) },
  });
  if (count === 0) throw new CambioNoPermitidoError("El usuario no existe.");
}
```

- [ ] **Step 4: Crear el Admin inicial desde el seed**

En `prisma/seed.ts`, agregar el import junto a los existentes:

```ts
import { hashearPassword } from "../src/lib/password";
```

Agregar esta función antes de `async function main()`:

```ts
async function sembrarAdmin() {
  if ((await db.usuario.count()) > 0) return; // ya hay usuarios: no se toca nada

  const { ADMIN_USUARIO, ADMIN_PASSWORD, ADMIN_NOMBRE } = process.env;
  if (!ADMIN_USUARIO || !ADMIN_PASSWORD) {
    console.warn("No hay usuarios y faltan ADMIN_USUARIO / ADMIN_PASSWORD en .env: no se creó ningún administrador.");
    return;
  }
  if (ADMIN_PASSWORD.length < 10) throw new Error("ADMIN_PASSWORD debe tener al menos 10 caracteres.");

  await db.usuario.create({
    data: {
      usuario: ADMIN_USUARIO.trim().toLowerCase(),
      nombre: ADMIN_NOMBRE?.trim() || "Administrador",
      passwordHash: await hashearPassword(ADMIN_PASSWORD),
      rol: "ADMIN",
    },
  });
  console.log(`Administrador creado: ${ADMIN_USUARIO.trim().toLowerCase()}`);
}
```

Y dentro de `main()`, agregar la llamada después de `await sembrarServicios();`:

```ts
  await sembrarAdmin();
```

- [ ] **Step 5: Correr el seed y verificar**

Run: `npm run db:seed`
Expected: imprime `Administrador creado: admin@parabrisascatamarca.local` y `Seed completo.` Correrlo una segunda vez: no imprime "Administrador creado" (idempotente).

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: sin errores. (Si falla con "Usuario no existe en db", falta `npx prisma generate`.)

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/migrations prisma/seed.ts src/modules/usuarios/usuario.service.ts
git commit -m "feat: modelo Usuario, servicio de usuarios y admin inicial en el seed" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Sesión del servidor y `proxy.ts`

**Files:**
- Create: `src/lib/sesion.ts`
- Create: `src/proxy.ts`

**Interfaces:**
- Consumes: `NOMBRE_COOKIE`, `DURACION_SESION_SEGUNDOS`, `firmarToken`, `verificarToken`, `obtenerSecreto` (Task 3); `esRutaPublica` (Task 4); `rolAlcanza`, `Rol` (Task 5); `obtenerUsuarioActivo`, `UsuarioSesion` (Task 6).
- Produces (`sesion.ts`):
  - `iniciarSesion(usuarioId: string): Promise<void>`
  - `cerrarSesion(): Promise<void>`
  - `obtenerSesion(): Promise<UsuarioSesion | null>` (memoizada por request, no redirige)
  - `verificarSesion(): Promise<UsuarioSesion>` (redirige a `/login` si no hay sesión)
  - `requerirRol(rol: Rol): Promise<UsuarioSesion>` (redirige a `/` si el rol no alcanza)

- [ ] **Step 1: Crear `src/lib/sesion.ts`**

```ts
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { rolAlcanza, type Rol } from "@/modules/usuarios/reglas";
import { obtenerUsuarioActivo, type UsuarioSesion } from "@/modules/usuarios/usuario.service";
import { DURACION_SESION_SEGUNDOS, NOMBRE_COOKIE, firmarToken, obtenerSecreto, verificarToken } from "./token";

// Solo servidor. Las funciones que escriben la cookie (iniciarSesion / cerrarSesion)
// se llaman desde Server Actions: Next no permite modificar cookies al renderizar.

export async function iniciarSesion(usuarioId: string): Promise<void> {
  const token = await firmarToken(usuarioId, obtenerSecreto());
  (await cookies()).set(NOMBRE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION_SESION_SEGUNDOS,
  });
}

export async function cerrarSesion(): Promise<void> {
  (await cookies()).delete(NOMBRE_COOKIE);
}

/**
 * Usuario de la sesión actual o `null`. Valida la firma y vuelve a leer al usuario en la base
 * (así un usuario desactivado o con otro rol lo nota en el próximo request). No redirige.
 */
export const obtenerSesion = cache(async (): Promise<UsuarioSesion | null> => {
  const token = (await cookies()).get(NOMBRE_COOKIE)?.value;
  const id = await verificarToken(token, obtenerSecreto());
  return id ? obtenerUsuarioActivo(id) : null;
});

/** Usuario logueado, o redirige a `/login`. Va al principio de cada página y de cada Server Action del panel. */
export async function verificarSesion(): Promise<UsuarioSesion> {
  const usuario = await obtenerSesion();
  if (!usuario) redirect("/login");
  return usuario;
}

/** Como `verificarSesion`, pero si el rol no alcanza redirige a `/` sin ejecutar nada más. */
export async function requerirRol(rol: Rol): Promise<UsuarioSesion> {
  const usuario = await verificarSesion();
  if (!rolAlcanza(usuario.rol, rol)) redirect("/");
  return usuario;
}
```

- [ ] **Step 2: Crear `src/proxy.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { esRutaPublica } from "@/lib/rutas";
import { NOMBRE_COOKIE, obtenerSecreto, verificarToken } from "@/lib/token";

/**
 * Chequeo optimista: si no hay una cookie de sesión con firma válida, redirige a /login.
 * No consulta la base, así que NO es la defensa real: cada página y cada Server Action
 * vuelven a validar la sesión con `verificarSesion()`.
 */
export default async function proxy(req: NextRequest) {
  if (esRutaPublica(req.nextUrl.pathname)) return NextResponse.next();

  const usuarioId = await verificarToken(req.cookies.get(NOMBRE_COOKIE)?.value, obtenerSecreto());
  if (usuarioId) return NextResponse.next();

  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  // Se excluyen los assets internos de Next y cualquier ruta con extensión (logo, favicon, etc.).
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/lib/sesion.ts src/proxy.ts
git commit -m "feat: sesion por cookie firmada y proxy de redireccion a login" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Pantalla de login, cierre de sesión y barra lateral

**Files:**
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/login/FormularioLogin.tsx`
- Create: `src/app/(auth)/login/acciones.ts`
- Modify: `src/app/(panel)/layout.tsx`
- Modify: `src/components/layout/BarraLateral.tsx`

**Interfaces:**
- Consumes: `autenticar` (Task 6); `iniciarSesion`, `cerrarSesion`, `obtenerSesion`, `verificarSesion` (Task 7); `loginSchema` (Task 4); `useFormularioAccion`, `Campo`, `input`, `boton` (UI existente).
- Produces: `iniciarSesionAccion(previo, fd)`, `salir()` (`src/app/(auth)/login/acciones.ts`); `BarraLateral` recibe la prop `usuario: { nombre: string; rol: Rol }`.

- [ ] **Step 1: Crear las acciones `src/app/(auth)/login/acciones.ts`**

```ts
"use server";

import { redirect } from "next/navigation";
import { erroresDeZod, fallo, texto, type EstadoFormulario } from "@/lib/formularios";
import { cerrarSesion, iniciarSesion } from "@/lib/sesion";
import { loginSchema } from "@/modules/usuarios/schemas";
import { autenticar } from "@/modules/usuarios/usuario.service";

export async function iniciarSesionAccion(_previo: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const password = fd.get("password");
  const datos = loginSchema.safeParse({ usuario: texto(fd, "usuario"), password: typeof password === "string" ? password : "" });
  if (!datos.success) return fallo(erroresDeZod(datos.error));

  const usuario = await autenticar(datos.data.usuario, datos.data.password);
  // Mismo mensaje para usuario inexistente, clave incorrecta y cuenta inactiva.
  if (!usuario) return { ok: false, mensaje: "Usuario o contraseña incorrectos" };

  await iniciarSesion(usuario.id);
  redirect("/");
}

export async function salir() {
  await cerrarSesion();
  redirect("/login");
}
```

- [ ] **Step 2: Crear `src/app/(auth)/layout.tsx`**

```tsx
import Image from "next/image";

export default function LayoutAuth({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-grafito-900 px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Image src="/brand/logo-amarillo.png" alt="Parabrisas Catamarca" width={96} height={68} className="h-16 w-auto" priority />
          <p className="font-display text-lg font-extrabold tracking-wide text-marca uppercase">Panel de gestión</p>
        </div>
        <div className="rounded-tarjeta border border-borde bg-superficie p-6 text-texto">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Crear `src/app/(auth)/login/FormularioLogin.tsx`**

```tsx
"use client";

import { boton, Campo, input } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import { iniciarSesionAccion } from "./acciones";

export function FormularioLogin() {
  const { estado, enviar, pendiente, error } = useFormularioAccion(iniciarSesionAccion);

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold">Ingresar</h1>

      {estado.mensaje && (
        <p role="alert" className="rounded-lg border border-peligro/40 bg-peligro/10 px-3 py-2 text-sm text-peligro">
          {estado.mensaje}
        </p>
      )}

      <Campo etiqueta="Usuario" htmlFor="usuario" error={error("usuario")}>
        <input id="usuario" name="usuario" type="text" autoCapitalize="none" spellCheck={false} autoComplete="username" autoFocus required className={input} aria-invalid={!!error("usuario")} />
      </Campo>

      <Campo etiqueta="Contraseña" htmlFor="password" error={error("password")}>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={input} aria-invalid={!!error("password")} />
      </Campo>

      <button type="submit" disabled={pendiente} className={`${boton.primario} w-full py-3 text-base`}>
        {pendiente ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Crear `src/app/(auth)/login/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { FormularioLogin } from "./FormularioLogin";

export const metadata = { title: "Ingresar" };

export default async function PaginaLogin() {
  // Con sesión válida no tiene sentido ver el login. Se usa `obtenerSesion` (no redirige)
  // para que una cookie vencida o de un usuario desactivado muestre el formulario.
  if (await obtenerSesion()) redirect("/");
  return <FormularioLogin />;
}
```

- [ ] **Step 5: Reemplazar `src/app/(panel)/layout.tsx`**

```tsx
import { BarraLateral } from "@/components/layout/BarraLateral";
import { verificarSesion } from "@/lib/sesion";

export default async function LayoutPanel({ children }: { children: React.ReactNode }) {
  const usuario = await verificarSesion();

  return (
    <div className="min-h-dvh md:flex">
      <BarraLateral usuario={{ nombre: usuario.nombre, rol: usuario.rol }} />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-8">
        <div className="mx-auto max-w-6xl space-y-8">{children}</div>
      </main>
    </div>
  );
}
```

- [ ] **Step 6: Reemplazar `src/components/layout/BarraLateral.tsx`**

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, ExternalLink, LayoutDashboard, LogOut, Package, UserCog, Wrench } from "lucide-react";
import { salir } from "@/app/(auth)/login/acciones";
import type { Rol } from "@/modules/usuarios/reglas";

const secciones = [
  { href: "/", etiqueta: "Panel", Icono: LayoutDashboard },
  { href: "/turnos", etiqueta: "Turnos", Icono: CalendarClock },
  { href: "/stock", etiqueta: "Stock", Icono: Package },
  { href: "/servicios", etiqueta: "Servicios", Icono: Wrench, soloAdmin: true },
  { href: "/usuarios", etiqueta: "Usuarios", Icono: UserCog, soloAdmin: true },
];

export function BarraLateral({ usuario }: { usuario: { nombre: string; rol: Rol } }) {
  const ruta = usePathname();
  const activa = (href: string) => (href === "/" ? ruta === "/" : ruta.startsWith(href));
  const visibles = secciones.filter((s) => !s.soloAdmin || usuario.rol === "ADMIN");

  return (
    <aside className="border-b border-grafito-800 bg-grafito-900 text-grafito-100 md:sticky md:top-0 md:flex md:h-dvh md:w-60 md:shrink-0 md:flex-col md:border-r md:border-b-0">
      <Link href="/" className="flex items-center gap-3 px-5 py-4 md:py-6">
        <Image src="/brand/logo-amarillo.png" alt="" width={56} height={40} className="h-10 w-auto" priority />
        <span className="font-display text-sm leading-tight font-extrabold tracking-wide text-marca uppercase">
          Parabrisas
          <br />
          Catamarca
        </span>
      </Link>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:pb-0">
        {visibles.map(({ href, etiqueta, Icono }) => (
          <Link
            key={href}
            href={href}
            aria-current={activa(href) ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
              activa(href) ? "bg-marca text-sobre-marca" : "text-grafito-300 hover:bg-grafito-800 hover:text-white"
            }`}
          >
            <Icono className="size-4" aria-hidden />
            {etiqueta}
          </Link>
        ))}
      </nav>

      <Link
        href="/reservar"
        target="_blank"
        className="m-3 hidden items-center gap-2 rounded-lg border border-grafito-700 px-3 py-2 text-xs text-grafito-300 hover:border-marca hover:text-marca md:flex"
      >
        <ExternalLink className="size-3.5" aria-hidden />
        Página pública de turnos
      </Link>

      <div className="flex items-center justify-between gap-3 border-t border-grafito-800 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{usuario.nombre}</p>
          <p className="text-xs text-grafito-400">{usuario.rol === "ADMIN" ? "Administrador" : "Empleado"}</p>
        </div>
        <form action={salir}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-grafito-300 hover:bg-grafito-800 hover:text-white"
          >
            <LogOut className="size-3.5" aria-hidden />
            Salir
          </button>
        </form>
      </div>
    </aside>
  );
}
```

- [ ] **Step 7: Typecheck**

Run: `npm run typecheck`
Expected: sin errores.

- [ ] **Step 8: Commit**

```bash
git add "src/app/(auth)" "src/app/(panel)/layout.tsx" src/components/layout/BarraLateral.tsx
git commit -m "feat: pantalla de login, cierre de sesion y barra lateral con usuario" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Proteger acciones y páginas existentes (+ guardia estática)

**Files:**
- Create (test): `src/guardia-acciones.test.ts`
- Modify: `src/app/(panel)/stock/acciones.ts`, `src/app/(panel)/turnos/acciones.ts`, `src/app/(panel)/servicios/acciones.ts`
- Modify: `src/app/(panel)/page.tsx`, `src/app/(panel)/turnos/page.tsx`, `src/app/(panel)/stock/page.tsx`, `src/app/(panel)/stock/nuevo/page.tsx`, `src/app/(panel)/stock/[id]/page.tsx`, `src/app/(panel)/stock/[id]/editar/page.tsx`
- Modify: `src/app/(panel)/servicios/page.tsx`, `src/app/(panel)/servicios/nuevo/page.tsx`, `src/app/(panel)/servicios/[id]/page.tsx`

**Interfaces:**
- Consumes: `verificarSesion`, `requerirRol` (Task 7).
- Produces: todas las acciones de `stock/` y `turnos/` empiezan con `await verificarSesion()`; las de `servicios/` con `await requerirRol("ADMIN")`; los `TODO(auth)` desaparecen. (Las de `usuarios/` se crean en Task 10 ya con su guardia; este test las exige.)

- [ ] **Step 1: Write the failing test (guardia estática)**

Crear `src/guardia-acciones.test.ts`:

```ts
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Garantiza que toda Server Action del panel valide la sesión antes de hacer nada.
 * Las Server Actions se pueden invocar por POST directo, así que el proxy y el layout no alcanzan.
 * (`src/app/(publico)/reservar/acciones.ts` queda afuera a propósito: es pública.)
 */
const RAIZ = join(process.cwd(), "src", "app", "(panel)");
const SOLO_ADMIN = ["servicios", "usuarios"];
const FUNCION_EXPORTADA = /export async function (\w+)\s*\([\s\S]*?\)\s*(?::\s*[^{]+)?\{/g;

const archivos = readdirSync(RAIZ, { recursive: true, encoding: "utf8" })
  .filter((f) => f.endsWith("acciones.ts"))
  .map((f) => join(RAIZ, f));

describe("Server Actions del panel", () => {
  it("encuentra los archivos de acciones esperados", () => {
    const carpetas = archivos.map((a) => relative(RAIZ, a).split(sep)[0]).sort();
    expect(carpetas).toEqual(["servicios", "stock", "turnos", "usuarios"]);
  });

  for (const archivo of archivos) {
    const carpeta = relative(RAIZ, archivo).split(sep)[0];
    const exigeAdmin = SOLO_ADMIN.includes(carpeta);
    const codigo = readFileSync(archivo, "utf8");

    it(`${carpeta}/acciones.ts no deja TODO(auth) pendientes`, () => {
      expect(codigo).not.toMatch(/TODO\(auth\)/);
    });

    for (const m of codigo.matchAll(FUNCION_EXPORTADA)) {
      const primeraSentencia = codigo.slice(m.index + m[0].length).trimStart();
      it(`${carpeta}/${m[1]} valida la sesión antes de hacer nada`, () => {
        const patron = exigeAdmin
          ? /^(?:const \w+ = )?await requerirRol\("ADMIN"\)/
          : /^(?:const \w+ = )?await (?:verificarSesion\(\)|requerirRol\()/;
        expect(primeraSentencia).toMatch(patron);
      });
    }
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/guardia-acciones.test.ts`
Expected: FAIL. Falla el test "encuentra los archivos esperados" (todavía no existe `usuarios`) y, en `stock`, `turnos` y `servicios`, cada acción y el `TODO(auth)`.

- [ ] **Step 3: Proteger `src/app/(panel)/stock/acciones.ts`**

Agregar el import junto a los demás: `import { verificarSesion } from "@/lib/sesion";`

Borrar la línea `// TODO(auth): validar la sesión del administrador en cada acción cuando se agregue el login.` y la línea en blanco que la sigue.

Agregar `await verificarSesion();` como **primera línea del cuerpo** de las tres acciones:
- `guardarCristal` (antes de `// Los tipos se validan en el servicio…`)
- `guardarMovimiento` (antes de `const tipo = texto(fd, "tipo") …`)
- `alternarCristal` (antes de `await cambiarEstadoCristal(id, activo);`)

- [ ] **Step 4: Proteger `src/app/(panel)/turnos/acciones.ts`**

Agregar el import: `import { verificarSesion } from "@/lib/sesion";`

Borrar la línea del `TODO(auth)` y la línea en blanco que la sigue.

Agregar `await verificarSesion();` como primera línea del cuerpo de:
- `actualizarEstadoTurno` (antes de `try {`)
- `actualizarCristalTurno` (antes de `const cristalId = fd.get("cristalId");`)

- [ ] **Step 5: Proteger `src/app/(panel)/servicios/acciones.ts` (solo Admin)**

Agregar el import: `import { requerirRol } from "@/lib/sesion";`

Borrar la línea del `TODO(auth)` y la línea en blanco que la sigue.

Agregar `await requerirRol("ADMIN");` como primera línea del cuerpo de:
- `guardarServicio` (antes de `// Los tipos se validan en el servicio…`)
- `alternarServicio` (antes de `await cambiarEstadoServicio(id, activo);`)
- `borrarServicio` (antes de `const { resultado } = await eliminarServicio(id);`)

- [ ] **Step 6: Verificar sesión en cada página del panel (Empleado y Admin)**

Next no vuelve a renderizar el layout en navegaciones del lado del cliente, así que cada página valida por su cuenta. En cada archivo: agregar `import { verificarSesion } from "@/lib/sesion";` con los demás imports y `await verificarSesion();` como **primera línea del cuerpo** de la función de página:

- `src/app/(panel)/page.tsx` → `Panel`
- `src/app/(panel)/turnos/page.tsx` → `PaginaTurnos`
- `src/app/(panel)/stock/page.tsx` → `PaginaStock`
- `src/app/(panel)/stock/nuevo/page.tsx` → `PaginaNuevoCristal`
- `src/app/(panel)/stock/[id]/page.tsx` → `PaginaCristal`
- `src/app/(panel)/stock/[id]/editar/page.tsx` → `PaginaEditarCristal`

- [ ] **Step 7: Exigir Admin en las páginas de servicios**

En los tres archivos agregar `import { requerirRol } from "@/lib/sesion";` y `await requerirRol("ADMIN");` como primera línea del cuerpo:

- `src/app/(panel)/servicios/page.tsx` → `PaginaServicios`
- `src/app/(panel)/servicios/[id]/page.tsx` → `PaginaEditarServicio`
- `src/app/(panel)/servicios/nuevo/page.tsx` → `PaginaNuevoServicio`, que hoy no es `async`: reemplazar el archivo por

```tsx
import { EncabezadoPagina } from "@/components/ui";
import { requerirRol } from "@/lib/sesion";
import { FormularioServicio } from "../FormularioServicio";

export const metadata = { title: "Nuevo servicio" };

export default async function PaginaNuevoServicio() {
  await requerirRol("ADMIN");
  return (
    <>
      <EncabezadoPagina seccion="Servicios" titulo="Nuevo servicio" />
      <FormularioServicio />
    </>
  );
}
```

- [ ] **Step 8: Run tests y typecheck**

Run: `npx vitest run src/guardia-acciones.test.ts`
Expected: siguen fallando **solo** (a) "encuentra los archivos esperados" (falta `usuarios`, se crea en Task 10) y nada más. Todos los tests de `stock`, `turnos` y `servicios` en PASS.

Run: `npm run typecheck`
Expected: sin errores.

- [ ] **Step 9: Commit**

```bash
git add src/guardia-acciones.test.ts "src/app/(panel)"
git commit -m "feat: exige sesion en acciones y paginas del panel; servicios solo para Admin" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Administración de usuarios (`/usuarios`)

**Files:**
- Create: `src/app/(panel)/usuarios/acciones.ts`
- Create: `src/app/(panel)/usuarios/page.tsx`
- Create: `src/app/(panel)/usuarios/nuevo/page.tsx`
- Create: `src/app/(panel)/usuarios/FormularioUsuario.tsx`
- Create: `src/app/(panel)/usuarios/AccionesUsuario.tsx`
- Create: `src/app/(panel)/usuarios/FormularioPassword.tsx`

**Interfaces:**
- Consumes: `requerirRol` (Task 7); `crearUsuario`, `cambiarRol`, `cambiarActivo`, `resetearPassword`, `listarUsuarios`, `CambioNoPermitidoError` (Task 6); `crearUsuarioSchema`, `rolSchema`, `resetPasswordSchema` (Task 4); `Rol` (Task 5).
- Produces: `crearUsuarioAccion(previo, fd)`, `cambiarRolAccion(id, rol)`, `alternarActivoAccion(id, activo)`, `resetearPasswordAccion(id, previo, fd)`; pantallas `/usuarios` y `/usuarios/nuevo`.

- [ ] **Step 1: Crear `src/app/(panel)/usuarios/acciones.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { erroresDeZod, esDuplicado, fallo, texto, type EstadoFormulario } from "@/lib/formularios";
import { requerirRol } from "@/lib/sesion";
import { crearUsuarioSchema, resetPasswordSchema, rolSchema } from "@/modules/usuarios/schemas";
import {
  cambiarActivo,
  cambiarRol,
  CambioNoPermitidoError,
  crearUsuario,
  resetearPassword,
} from "@/modules/usuarios/usuario.service";

/** Lee un campo de contraseña sin recortarlo (los espacios cuentan). */
function clave(fd: FormData, campo: string): string | undefined {
  const v = fd.get(campo);
  return typeof v === "string" && v !== "" ? v : undefined;
}

export async function crearUsuarioAccion(_previo: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await requerirRol("ADMIN");
  const datos = crearUsuarioSchema.safeParse({
    nombre: texto(fd, "nombre"),
    usuario: texto(fd, "usuario"),
    password: clave(fd, "password"),
    rol: texto(fd, "rol"),
  });
  if (!datos.success) return fallo(erroresDeZod(datos.error));

  try {
    await crearUsuario(datos.data);
  } catch (e) {
    if (esDuplicado(e)) return fallo({ usuario: "Ese nombre de usuario ya está en uso" });
    throw e;
  }

  revalidatePath("/usuarios");
  redirect("/usuarios?aviso=creado");
}

export async function cambiarRolAccion(id: string, rol: string): Promise<EstadoFormulario> {
  const actor = await requerirRol("ADMIN");
  const rolValido = rolSchema.safeParse(rol);
  if (!rolValido.success) return { ok: false, mensaje: "Rol inválido." };

  try {
    await cambiarRol(actor, id, rolValido.data);
  } catch (e) {
    if (e instanceof CambioNoPermitidoError) return { ok: false, mensaje: e.message };
    throw e;
  }
  revalidatePath("/usuarios");
  return { ok: true };
}

export async function alternarActivoAccion(id: string, activo: boolean): Promise<EstadoFormulario> {
  const actor = await requerirRol("ADMIN");
  try {
    await cambiarActivo(actor, id, activo === true);
  } catch (e) {
    if (e instanceof CambioNoPermitidoError) return { ok: false, mensaje: e.message };
    throw e;
  }
  revalidatePath("/usuarios");
  return { ok: true };
}

export async function resetearPasswordAccion(
  id: string,
  _previo: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  await requerirRol("ADMIN");
  const datos = resetPasswordSchema.safeParse({ password: clave(fd, "password") });
  if (!datos.success) return fallo(erroresDeZod(datos.error));

  try {
    await resetearPassword(id, datos.data.password);
  } catch (e) {
    if (e instanceof CambioNoPermitidoError) return { ok: false, mensaje: e.message };
    throw e;
  }
  return { ok: true, mensaje: "Contraseña actualizada." };
}
```

- [ ] **Step 2: Crear `src/app/(panel)/usuarios/FormularioPassword.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { boton, input } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import { resetearPasswordAccion } from "./acciones";

export function FormularioPassword({ id }: { id: string }) {
  const { estado, enviar, pendiente, error } = useFormularioAccion(resetearPasswordAccion.bind(null, id));
  const formulario = useRef<HTMLFormElement>(null);

  // Tras guardar, se vacía el campo para que la clave nueva no quede en pantalla.
  useEffect(() => {
    if (estado.ok) formulario.current?.reset();
  }, [estado]);

  return (
    <form ref={formulario} onSubmit={enviar} className="flex flex-wrap items-start gap-2">
      <div>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 10 caracteres"
          aria-label="Nueva contraseña"
          aria-invalid={!!error("password")}
          className={`${input} max-w-56`}
        />
        {error("password") && <p className="mt-1 text-xs text-peligro">{error("password")}</p>}
      </div>
      <button type="submit" disabled={pendiente} className={`${boton.primario} ${boton.chico}`}>
        {pendiente ? "Guardando…" : "Guardar"}
      </button>
      {estado.ok && (
        <span role="status" className="self-center text-xs text-exito">
          {estado.mensaje}
        </span>
      )}
      {!estado.ok && estado.mensaje && !estado.errores && (
        <span role="alert" className="self-center text-xs text-peligro">
          {estado.mensaje}
        </span>
      )}
    </form>
  );
}
```

- [ ] **Step 3: Crear `src/app/(panel)/usuarios/AccionesUsuario.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import { boton } from "@/components/ui";
import type { EstadoFormulario } from "@/lib/formularios";
import type { Rol } from "@/modules/usuarios/reglas";
import { alternarActivoAccion, cambiarRolAccion } from "./acciones";
import { FormularioPassword } from "./FormularioPassword";

export function AccionesUsuario({ id, rol, activo, esYo }: { id: string; rol: Rol; activo: boolean; esYo: boolean }) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string>();
  const [verPassword, setVerPassword] = useState(false);

  const ejecutar = (accion: () => Promise<EstadoFormulario>) =>
    iniciar(async () => {
      setError(undefined);
      const r = await accion();
      if (!r.ok) setError(r.mensaje);
    });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {!esYo && (
          <>
            <button
              type="button"
              disabled={pendiente}
              onClick={() => ejecutar(() => cambiarRolAccion(id, rol === "ADMIN" ? "EMPLEADO" : "ADMIN"))}
              className={`${boton.secundario} ${boton.chico}`}
            >
              {rol === "ADMIN" ? "Pasar a Empleado" : "Pasar a Admin"}
            </button>
            <button
              type="button"
              disabled={pendiente}
              onClick={() => ejecutar(() => alternarActivoAccion(id, !activo))}
              className={`${boton.fantasma} ${boton.chico}`}
            >
              {activo ? "Desactivar" : "Activar"}
            </button>
          </>
        )}
        <button type="button" onClick={() => setVerPassword((v) => !v)} className={`${boton.fantasma} ${boton.chico}`}>
          Nueva contraseña
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-peligro">
          {error}
        </p>
      )}
      {verPassword && <FormularioPassword id={id} />}
    </div>
  );
}
```

- [ ] **Step 4: Crear `src/app/(panel)/usuarios/FormularioUsuario.tsx`**

```tsx
"use client";

import Link from "next/link";
import { boton, Campo, input, tarjeta } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import { crearUsuarioAccion } from "./acciones";

export function FormularioUsuario() {
  const { estado, enviar, pendiente, error } = useFormularioAccion(crearUsuarioAccion);

  return (
    <form onSubmit={enviar} noValidate className={`${tarjeta} max-w-xl space-y-4 p-6`}>
      {estado.mensaje && !estado.ok && (
        <p role="alert" className="rounded-lg border border-peligro/40 bg-peligro/10 px-3 py-2 text-sm text-peligro">
          {estado.mensaje}
        </p>
      )}

      <Campo etiqueta="Nombre" htmlFor="nombre" error={error("nombre")}>
        <input id="nombre" name="nombre" autoComplete="off" className={input} aria-invalid={!!error("nombre")} />
      </Campo>

      <Campo etiqueta="Usuario" htmlFor="usuario" error={error("usuario")}>
        <input id="usuario" name="usuario" type="text" autoCapitalize="none" spellCheck={false} autoComplete="off" className={input} aria-invalid={!!error("usuario")} />
      </Campo>

      <Campo etiqueta="Contraseña" htmlFor="password" error={error("password")} ayuda="Mínimo 10 caracteres. Se la pasás vos a la persona.">
        <input id="password" name="password" type="password" autoComplete="new-password" className={input} aria-invalid={!!error("password")} />
      </Campo>

      <Campo
        etiqueta="Rol"
        htmlFor="rol"
        error={error("rol")}
        ayuda="Admin gestiona usuarios y servicios. Empleado maneja turnos y stock."
      >
        <select id="rol" name="rol" defaultValue="EMPLEADO" className={input}>
          <option value="EMPLEADO">Empleado</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </Campo>

      <div className="flex gap-2">
        <button type="submit" disabled={pendiente} className={boton.primario}>
          {pendiente ? "Guardando…" : "Crear usuario"}
        </button>
        <Link href="/usuarios" className={boton.secundario}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
```

- [ ] **Step 5: Crear `src/app/(panel)/usuarios/nuevo/page.tsx`**

```tsx
import { EncabezadoPagina } from "@/components/ui";
import { requerirRol } from "@/lib/sesion";
import { FormularioUsuario } from "../FormularioUsuario";

export const metadata = { title: "Nuevo usuario" };

export default async function PaginaNuevoUsuario() {
  await requerirRol("ADMIN");
  return (
    <>
      <EncabezadoPagina seccion="Usuarios" titulo="Nuevo usuario" />
      <FormularioUsuario />
    </>
  );
}
```

- [ ] **Step 6: Crear `src/app/(panel)/usuarios/page.tsx`**

```tsx
import Link from "next/link";
import { Plus } from "lucide-react";
import { Aviso, boton, EncabezadoPagina, Insignia, tarjeta } from "@/components/ui";
import { requerirRol } from "@/lib/sesion";
import { listarUsuarios } from "@/modules/usuarios/usuario.service";
import { AccionesUsuario } from "./AccionesUsuario";

export const metadata = { title: "Usuarios" };

const AVISOS: Record<string, string> = { creado: "Usuario creado." };

const fechaHora = (fecha: Date) =>
  fecha.toLocaleString("es-AR", { timeZone: "America/Argentina/Catamarca", dateStyle: "short", timeStyle: "short" });

export default async function PaginaUsuarios({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  const yo = await requerirRol("ADMIN");
  const { aviso } = await searchParams;
  const usuarios = await listarUsuarios();

  return (
    <>
      <EncabezadoPagina
        seccion="Administración"
        titulo="Usuarios"
        descripcion="Quién puede entrar al panel. El Admin gestiona usuarios y servicios; el Empleado maneja turnos y stock."
        acciones={
          <Link href="/usuarios/nuevo" className={boton.primario}>
            <Plus className="size-4" aria-hidden />
            Nuevo usuario
          </Link>
        }
      />

      {aviso && AVISOS[aviso] && <Aviso>{AVISOS[aviso]}</Aviso>}

      <ul className="space-y-3">
        {usuarios.map((u) => (
          <li key={u.id} className={`${tarjeta} flex flex-wrap items-start justify-between gap-4 p-4 ${u.activo ? "" : "opacity-70"}`}>
            <div className="min-w-0 space-y-1">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {u.nombre}
                {u.id === yo.id && <Insignia>Vos</Insignia>}
                <Insignia tono={u.rol === "ADMIN" ? "marca" : "neutro"}>{u.rol === "ADMIN" ? "Admin" : "Empleado"}</Insignia>
                {!u.activo && <Insignia tono="peligro">Desactivado</Insignia>}
              </p>
              <p className="text-sm text-texto-suave">{u.usuario}</p>
              <p className="text-xs text-texto-suave">
                {u.ultimoAcceso ? `Último acceso: ${fechaHora(u.ultimoAcceso)}` : "Todavía no ingresó"}
              </p>
            </div>
            <AccionesUsuario id={u.id} rol={u.rol} activo={u.activo} esYo={u.id === yo.id} />
          </li>
        ))}
      </ul>
    </>
  );
}
```

- [ ] **Step 7: Run tests y typecheck**

Run: `npm test`
Expected: PASS completo, incluida la guardia estática (ahora encuentra `servicios`, `stock`, `turnos` y `usuarios`).

Run: `npm run typecheck`
Expected: sin errores.

- [ ] **Step 8: Commit**

```bash
git add "src/app/(panel)/usuarios"
git commit -m "feat: administracion de usuarios (alta, rol, activar y contrasena)" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Documentación, localhost y verificación end-to-end

**Files:**
- Modify: `README.md`
- Modify: `docs/ARQUITECTURA.md`

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: docs al día; app corriendo en `http://localhost:3000` con el Admin creado en Task 1.

- [ ] **Step 1: Actualizar `README.md`**

En "Puesta en marcha", reemplazar el bloque de comandos y las líneas siguientes por:

````markdown
```bash
npm install
cp .env.example .env          # completar DATABASE_URL, SESSION_SECRET, ADMIN_USUARIO y ADMIN_PASSWORD
npx prisma migrate deploy     # crea las tablas
npm run db:seed               # catálogos, servicios y el primer administrador
npm run dev                   # http://localhost:3000
```

Si no tenés un Postgres a mano, `npx prisma dev --name local --detach` levanta uno local y muestra la URL de conexión. Agregale `&connection_limit=1` en `.env`: esa base embebida admite una sola conexión a la vez.

- Panel: http://localhost:3000 (pide iniciar sesión)
- Página pública de turnos: http://localhost:3000/reservar

## Acceso al panel

El seed crea un administrador con `ADMIN_USUARIO` y `ADMIN_PASSWORD` del `.env` (solo si todavía no hay usuarios). Después del primer seed podés borrar `ADMIN_PASSWORD` del `.env` y crear el resto de los usuarios desde **Usuarios** en el panel.

| Rol | Puede |
|---|---|
| Administrador | Todo: turnos, stock, servicios y usuarios. |
| Empleado | Turnos y stock. |

`SESSION_SECRET` firma la cookie de sesión (mínimo 32 caracteres). En producción usá una propia y distinta de la de desarrollo.
````

Borrar la línea del aviso `> ⚠️ El panel todavía no tiene login…`. En la tabla de scripts no hay cambios.

- [ ] **Step 2: Actualizar `docs/ARQUITECTURA.md`**

a) En la tabla de **Stack**, agregar una fila al final: `| Sesión | **jose** (JWT firmado en cookie `httpOnly`) + `scrypt` de `node:crypto` | Login propio sin dependencias nativas. Ver "Acceso y sesión". |`

b) En **Estructura**, dentro de `src/`, agregar `lib/sesion.ts`, `lib/token.ts`, `lib/password.ts`, `proxy.ts` y `modules/usuarios/` con sus comentarios (`← cookie de sesión y guardias`, `← JWT de sesión`, `← scrypt`, `← redirige a /login sin sesión`, `← usuarios, roles y reglas`).

c) Antes de "## Identidad visual", agregar la sección:

```markdown
## Acceso y sesión

Tabla `usuarios`: `usuario` (único, minúsculas), `nombre`, `password_hash` (`scrypt$sal$clave`), `rol` (`ADMIN` | `EMPLEADO`), `activo`, `ultimo_acceso`.

La cookie `sesion` (httpOnly, sameSite=lax, 8 h) guarda un JWT firmado con `SESSION_SECRET` que solo contiene el id del usuario. En **cada request** se vuelve a leer al usuario en la base: desactivarlo o cambiarle el rol surte efecto de inmediato.

Tres capas de protección:
1. `src/proxy.ts`: chequeo optimista de la cookie; redirige a `/login`. No consulta la base.
2. Layout y **cada página** del panel llaman a `verificarSesion()` (el layout no se vuelve a renderizar al navegar).
3. **Cada Server Action** empieza con `verificarSesion()` o `requerirRol("ADMIN")`. Un test estático (`src/guardia-acciones.test.ts`) falla si una acción nueva del panel no lo hace.

El Empleado solo accede a Panel, Turnos y Stock. Reglas: nadie puede desactivarse ni cambiarse el rol a sí mismo, y siempre queda al menos un Admin activo.
```

d) En la tabla de **Pantallas**, agregar `| `/login` | **Pública.** Ingreso al panel. |` y `| `/usuarios`, `/usuarios/nuevo` | Solo Admin: alta, rol, activar/desactivar y nueva contraseña. |`.

e) En **Pendiente**: borrar el punto 1 ("Login del panel…") y renumerar. Agregar al final:

```markdown
7. Límite de intentos de login (hoy no hay freno contra fuerza bruta).
8. "Olvidé mi contraseña" por email (hoy la resetea un Admin desde Usuarios).
9. Segundo factor (2FA).
10. Resetear una contraseña no cierra las sesiones abiertas (cookie de 8 h); para cortar un acceso de inmediato hay que desactivar al usuario.
```

- [ ] **Step 3: Suite completa**

Run: `npm test` y `npm run typecheck`
Expected: todo en verde.

- [ ] **Step 4: Levantar localhost**

Run (en segundo plano): `npm run dev`
Expected: `Ready` y la app en `http://localhost:3000`. Si falla con `SESSION_SECRET falta…`, revisar `.env` (Task 1, Step 4); si falla con `P1001`, la base no está levantada (Task 1, Step 3).

- [ ] **Step 5: Verificación con `curl` (sin sesión)**

Run:

```bash
for ruta in / /turnos /stock /servicios /usuarios /stock/nuevo; do curl -s -o /dev/null -w "$ruta -> %{http_code} %{redirect_url}\n" "http://localhost:3000$ruta"; done
for ruta in /login /reservar; do curl -s -o /dev/null -w "$ruta -> %{http_code}\n" "http://localhost:3000$ruta"; done
curl -s -o /dev/null -w "logo -> %{http_code}\n" http://localhost:3000/brand/logo-amarillo.png
```

Expected: las seis rutas del panel devuelven `307` con `redirect_url` terminando en `/login`; `/login` y `/reservar` devuelven `200`; el logo devuelve `200`.

- [ ] **Step 6: Verificación manual en el navegador (Claude in Chrome, o el usuario)**

Checklist (marcar cada uno):
1. `/login` con clave incorrecta → "Usuario o contraseña incorrectos"; con un usuario de 2 letras → "Debe tener al menos 3 caracteres".
2. Login con el Admin (con el usuario y la clave elegidos en Task 1, escribiendo el usuario en MAYÚSCULAS para probar la normalización) → entra al Panel; la barra lateral muestra nombre, "Administrador", "Servicios", "Usuarios" y "Salir".
3. `/usuarios` → lista con "Vos" y "Admin"; los botones "Pasar a Empleado" y "Desactivar" **no aparecen** en la propia fila.
4. Crear un Empleado (usuario `empleado1`, clave de 10+ caracteres): aparece en la lista. Crear otro con el mismo usuario → "Ese nombre de usuario ya está en uso". Clave de 5 caracteres → "Debe tener al menos 10 caracteres".
5. Nueva contraseña para el Empleado con 5 caracteres → error; con 10+ → "Contraseña actualizada." y el campo se vacía.
6. "Salir" → vuelve a `/login`; `/` redirige a `/login`.
7. Login como Empleado → la barra **no** muestra Servicios ni Usuarios; navegar a `/servicios`, `/servicios/nuevo` y `/usuarios` a mano → vuelve a `/`. Stock y Turnos funcionan (crear un movimiento de stock).
8. **Corte inmediato:** con el Empleado logueado en una pestaña, desde el Admin (otra ventana/perfil) desactivarlo. En la pestaña del Empleado, recargar cualquier página → redirige a `/login`; intentar loguearse de nuevo → "Usuario o contraseña incorrectos".
9. Desde el Admin, intentar degradarse o desactivarse: no hay botones; no se puede dejar sin Admin (con un solo Admin activo, degradar/desactivar a otro Admin no existe todavía; crear un segundo Admin, degradarlo y volver a probar que siempre queda uno).
10. `/reservar` sigue abierta sin sesión y permite completar una reserva.

Si un punto falla, NO marcarlo: corregir en la tarea correspondiente, re-correr `npm test` y repetir.

- [ ] **Step 7: Dejar el `.env` prolijo**

Quitar `ADMIN_PASSWORD` de `.env` (ya se usó en el seed). Anotar el valor para dárselo al usuario antes de borrarlo.

- [ ] **Step 8: Commit**

```bash
git add README.md docs/ARQUITECTURA.md
git commit -m "docs: login, roles y acceso al panel" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 9: No pushear sin pedido**

No hacer `git push` hasta que el usuario lo pida (el repo remoto es público). Informar el estado final: commits nuevos, credenciales del Admin, URL de localhost y cualquier punto del checklist que no se haya podido verificar.
