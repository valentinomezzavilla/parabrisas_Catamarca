# Seña por Mercado Pago Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que un turno reservado desde `/reservar` pida una seña (50 % del precio base) por Mercado Pago y solo quede confirmado cuando la seña se aprobó.

**Architecture:** El turno nace `ESPERANDO_PAGO` con un vencimiento de 8 minutos y un registro `Pago`. Se cobra con Checkout Pro (redirección). El pago se confirma por dos vías que ejecutan la misma función idempotente (`aplicarPagoMp`): el webhook y la consulta a la API al volver el cliente. Las decisiones de negocio viven en funciones puras con tests (`calcularSena`, `decidirPago`, `firmaValida`); lo que toca la base se hace dentro de una transacción con el lock por servicio que ya usa `reservarTurno`.

**Tech Stack:** Next.js 16 (App Router, Server Actions, Route Handlers), Prisma 7 + PostgreSQL, Zod, Vitest, `fetch` contra la API de Mercado Pago (sin SDK).

**Spec:** `docs/superpowers/specs/2026-10-01-sena-mercadopago-design.md`

## Global Constraints

- Seña = 50 % de `Servicio.precioBase`, en pesos enteros, mitades hacia arriba; sin precio (o precio ≤ 0) no hay seña y el turno nace `PENDIENTE` como hoy.
- Retención del horario: 8 minutos (`MINUTOS_RETENCION`).
- Solo medios de pago inmediatos: se excluyen los tipos `ticket` y `atm`.
- La seña no se devuelve nunca; única excepción: el pago queda sin turno (`requiere_devolucion`).
- Sin SDK de Mercado Pago ni dependencias nuevas: `fetch` con `AbortSignal.timeout`.
- Nunca confiar en lo que traiga el aviso del webhook o la URL de retorno: siempre consultar el pago a la API de Mercado Pago.
- Los textos de la interfaz van en español rioplatense (voseo), como el resto de la app.
- Cada Server Action del panel empieza con `await verificarSesion()` o `requerirRol(...)` (lo exige `src/guardia-acciones.test.ts`). `reservar/acciones.ts` es pública a propósito.
- Antes de usar APIs de Next (route handlers, `redirect`, `revalidatePath`) seguir lo ya usado en el repo; la documentación de esta versión está en `node_modules/next/dist/docs/` (route handlers: `01-app/01-getting-started/15-route-handlers.md`).
- El repo no tiene tests de integración con base de datos. Lo que toca Prisma se verifica con `npm run typecheck` y con el script manual de la Tarea 12; la lógica de decisión se prueba como funciones puras.
- Migraciones: `npx prisma migrate dev` no funciona con la base embebida de `prisma dev`. Generar con `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`, aplicar con `npx prisma migrate deploy` y luego `npx prisma generate`.
- Trabajar en la rama `feature/sena-mercadopago`. Un commit por tarea. Cada commit termina con la línea `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Review Focus

Entradas o condiciones que la especificación implica pero que ninguna tarea ejercita por sí sola; cada una tiene su prueba en la tarea indicada.

1. Aviso repetido del mismo pago (Mercado Pago reintenta) → no se confirma ni se registra dos veces. Prueba: Tarea 3 (`yaAplicado`) y script de la Tarea 12.
2. Servicio con `precioBase` en 0 o negativo → se trata como sin precio, no cobra una seña de $0. Prueba: Tarea 2.
3. Personal con sesión iniciada reservando desde "Nuevo turno" → sin seña, turno `PENDIENTE`. Prueba: script de la Tarea 12.
4. Mercado Pago caído al crear la preferencia → el turno se cancela y el horario queda libre. Prueba: script de la Tarea 12.
5. Pago aprobado tarde para un horario que arranca dentro de la antelación mínima del servicio → la disponibilidad lo ve no reservable, así que se trata como "horario tomado" y se marca para devolver (lado seguro). Prueba: Tarea 3 (`horarioLibre: false`).
6. Cabecera `x-signature` ausente, mal formada o con otro secreto → 401, sin procesar. Prueba: Tarea 4.
7. Notificación de prueba del panel de Mercado Pago (id inexistente → 404 de la API) → responde 200 y no entra en bucle de reintentos. Prueba: Tarea 9 (revisión manual).

---

### Task 1: Datos: estado `ESPERANDO_PAGO`, `Turno.venceEn` y tabla `pagos`

**Files:**
- Modify: `prisma/schema.prisma` (enum `EstadoTurno`, modelo `Turno`, modelos nuevos)
- Create: `prisma/migrations/20261001130000_pagos_sena/migration.sql`
- Modify: `src/app/(panel)/turnos/estados.ts`
- Modify: `src/app/(panel)/turnos/AccionesTurno.tsx`

**Interfaces:**
- Produces: `EstadoTurno` incluye `"ESPERANDO_PAGO"`; `EstadoPago = "PENDIENTE" | "APROBADO" | "RECHAZADO" | "VENCIDO"`; `Turno.venceEn: Date | null`; `Turno.pagos: Pago[]`; modelo `Pago` con los campos de esta tarea (`db.pago`).

- [ ] **Step 1: Editar el enum y el modelo `Turno` en `prisma/schema.prisma`**

Reemplazar el enum `EstadoTurno` por:

```prisma
enum EstadoTurno {
  ESPERANDO_PAGO
  PENDIENTE
  CONFIRMADO
  EN_CURSO
  COMPLETADO
  CANCELADO
  AUSENTE
}
```

En `model Turno`, agregar después de `estado`:

```prisma
  venceEn         DateTime?         @map("vence_en") // solo en ESPERANDO_PAGO: hasta cuándo se retiene el horario
```

y junto a `movimientos MovimientoStock[]` agregar:

```prisma
  pagos           Pago[]
```

- [ ] **Step 2: Agregar el enum y el modelo `Pago` al final de la sección de turnos (antes de "USUARIOS DEL PANEL")**

```prisma
enum EstadoPago {
  PENDIENTE
  APROBADO
  RECHAZADO
  VENCIDO
}

/// Seña de un turno cobrada con Mercado Pago. `mpPagoId` es único: un mismo pago nunca se aplica dos veces.
model Pago {
  id                  String     @id @default(cuid()) // también es el external_reference que viaja a Mercado Pago
  turnoId             String     @map("turno_id")
  turno               Turno      @relation(fields: [turnoId], references: [id])
  monto               Decimal    @db.Decimal(12, 2)
  estado              EstadoPago @default(PENDIENTE)
  mpPreferenciaId     String?    @map("mp_preferencia_id")
  mpInitPoint         String?    @map("mp_init_point")
  mpPagoId            String?    @unique @map("mp_pago_id")
  aceptoCondicionesEn DateTime   @map("acepto_condiciones_en")
  requiereDevolucion  Boolean    @default(false) @map("requiere_devolucion")
  motivoDevolucion    String?    @map("motivo_devolucion")
  devueltoEn          DateTime?  @map("devuelto_en")
  creadoEn            DateTime   @default(now()) @map("creado_en")
  actualizadoEn       DateTime   @updatedAt @map("actualizado_en")

  @@index([turnoId])
  @@index([requiereDevolucion, devueltoEn])
  @@map("pagos")
}
```

- [ ] **Step 3: Generar y aplicar la migración**

```bash
D=prisma/migrations/20261001130000_pagos_sena
mkdir -p $D
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script > $D/migration.sql
cat $D/migration.sql
npx prisma migrate deploy
npx prisma generate
```

Expected: el SQL contiene `ALTER TYPE "EstadoTurno" ADD VALUE 'ESPERANDO_PAGO'`, `CREATE TYPE "EstadoPago"`, `ALTER TABLE "turnos" ADD COLUMN "vence_en"` y `CREATE TABLE "pagos"` (y solo eso); `migrate deploy` termina con "All migrations have been successfully applied". La base embebida tiene que estar levantada (`npx prisma dev --name local --detach`).

- [ ] **Step 4: Ver el error de tipos que ahora aparece (el mapa de estados es exhaustivo)**

Run: `npm run typecheck`
Expected: FAIL en `src/app/(panel)/turnos/estados.ts` ("Property 'ESPERANDO_PAGO' is missing").

- [ ] **Step 5: Completar `estados.ts` y `AccionesTurno.tsx`**

En `estados.ts`, agregar como primera entrada de `ESTADOS`:

```ts
  ESPERANDO_PAGO: { etiqueta: "Esperando pago", tono: "alerta" },
```

En `AccionesTurno.tsx`, agregar como primera entrada de `ACCIONES`:

```ts
  ESPERANDO_PAGO: [{ estado: "CANCELADO", etiqueta: "Cancelar", variante: "fantasma", confirmar: true }],
```

- [ ] **Step 6: Verificar**

Run: `npm run typecheck && npm test`
Expected: sin errores; todos los tests pasan (166).

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/20261001130000_pagos_sena "src/app/(panel)/turnos/estados.ts" "src/app/(panel)/turnos/AccionesTurno.tsx"
git commit -m "feat: estado ESPERANDO_PAGO, vencimiento del turno y tabla de pagos"
```

---

### Task 2: Regla de la seña (`calcularSena`)

**Files:**
- Create: `src/modules/pagos/sena.ts`
- Test: `src/modules/pagos/sena.test.ts`

**Interfaces:**
- Produces: `PORCENTAJE_SENA = 0.5`, `MINUTOS_RETENCION = 8`, `calcularSena(precioBase: { toString(): string } | number | null | undefined): number | null`.

- [ ] **Step 1: Escribir el test que falla**

```ts
import { describe, expect, it } from "vitest";
import { calcularSena, MINUTOS_RETENCION, PORCENTAJE_SENA } from "./sena";

describe("calcularSena", () => {
  it("es el 50 % del precio base", () => {
    expect(PORCENTAJE_SENA).toBe(0.5);
    expect(calcularSena(20000)).toBe(10000);
  });

  it("acepta el Decimal de Prisma (algo con toString)", () => {
    expect(calcularSena({ toString: () => "15000.00" })).toBe(7500);
  });

  it("redondea a pesos enteros, las mitades hacia arriba", () => {
    expect(calcularSena(10001)).toBe(5001);
    expect(calcularSena(10003)).toBe(5002);
  });

  it("sin precio no hay seña", () => {
    expect(calcularSena(null)).toBeNull();
    expect(calcularSena(undefined)).toBeNull();
  });

  it("un precio en cero, negativo o inválido tampoco cobra seña", () => {
    expect(calcularSena(0)).toBeNull();
    expect(calcularSena(-500)).toBeNull();
    expect(calcularSena({ toString: () => "abc" })).toBeNull();
  });

  it("un precio tan bajo que la seña redondea a cero no cobra seña", () => {
    expect(calcularSena(0.4)).toBeNull();
  });
});

describe("MINUTOS_RETENCION", () => {
  it("el horario se retiene 8 minutos", () => {
    expect(MINUTOS_RETENCION).toBe(8);
  });
});
```

- [ ] **Step 2: Verlo fallar**

Run: `npx vitest run src/modules/pagos/sena.test.ts`
Expected: FAIL (no se puede resolver `./sena`).

- [ ] **Step 3: Implementar**

```ts
// Reglas puras de la seña. Sin base de datos: se prueban solas.

/** Parte del precio base que se cobra como seña. */
export const PORCENTAJE_SENA = 0.5;
/** Minutos que se retiene el horario mientras el cliente paga. */
export const MINUTOS_RETENCION = 8;

/** Seña en pesos enteros, o `null` si el servicio no tiene un precio con el que calcularla. */
export function calcularSena(precioBase: { toString(): string } | number | null | undefined): number | null {
  if (precioBase === null || precioBase === undefined) return null;
  const precio = Number(precioBase.toString());
  if (!Number.isFinite(precio) || precio <= 0) return null;
  const sena = Math.round(precio * PORCENTAJE_SENA);
  return sena > 0 ? sena : null;
}
```

- [ ] **Step 4: Verlo pasar**

Run: `npx vitest run src/modules/pagos/sena.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/modules/pagos/sena.ts src/modules/pagos/sena.test.ts
git commit -m "feat: calculo de la sena (50 % del precio base)"
```

---

### Task 3: Decisión sobre un pago (`decidirPago`)

**Files:**
- Create: `src/modules/pagos/decision.ts`
- Test: `src/modules/pagos/decision.test.ts`

**Interfaces:**
- Consumes: tipos `EstadoPago`, `EstadoTurno` de `@/generated/prisma/client` (Tarea 1).
- Produces:
  - `interface PagoMp { id: string; estado: string; monto: number; moneda: string; referencia: string | null }`
  - `interface ContextoDecision { montoEsperado: number; pagoEstado: EstadoPago; yaAplicado: boolean; turnoEstado: EstadoTurno; venceEnPasado: boolean; horarioLibre: boolean }`
  - `type MotivoDevolucion = "monto_distinto" | "horario_tomado" | "turno_cancelado" | "pago_duplicado"`
  - `type Decision = { accion: "ignorar" } | { accion: "confirmar" } | { accion: "rechazar" } | { accion: "devolver"; motivo: MotivoDevolucion }`
  - `decidirPago(mp: PagoMp, ctx: ContextoDecision): Decision`

- [ ] **Step 1: Escribir el test que falla**

```ts
import { describe, expect, it } from "vitest";
import { decidirPago, type ContextoDecision, type PagoMp } from "./decision";

const mp = (o: Partial<PagoMp> = {}): PagoMp => ({ id: "100", estado: "approved", monto: 7500, moneda: "ARS", referencia: "pago1", ...o });
const ctx = (o: Partial<ContextoDecision> = {}): ContextoDecision => ({
  montoEsperado: 7500,
  pagoEstado: "PENDIENTE",
  yaAplicado: false,
  turnoEstado: "ESPERANDO_PAGO",
  venceEnPasado: false,
  horarioLibre: false,
  ...o,
});

describe("decidirPago: pago aprobado", () => {
  it("a tiempo confirma el turno", () => {
    expect(decidirPago(mp(), ctx())).toEqual({ accion: "confirmar" });
  });

  it("un pago ya aplicado se ignora (el aviso llegó repetido)", () => {
    expect(decidirPago(mp(), ctx({ yaAplicado: true, pagoEstado: "APROBADO", turnoEstado: "CONFIRMADO" }))).toEqual({ accion: "ignorar" });
  });

  it("vencido pero con el horario todavía libre, confirma", () => {
    expect(decidirPago(mp(), ctx({ venceEnPasado: true, horarioLibre: true }))).toEqual({ accion: "confirmar" });
  });

  it("vencido y con el horario tomado por otro, hay que devolver", () => {
    expect(decidirPago(mp(), ctx({ venceEnPasado: true, horarioLibre: false }))).toEqual({ accion: "devolver", motivo: "horario_tomado" });
  });

  it("el barrido ya canceló el turno (pago VENCIDO) y el horario sigue libre, confirma", () => {
    expect(decidirPago(mp(), ctx({ turnoEstado: "CANCELADO", pagoEstado: "VENCIDO", venceEnPasado: true, horarioLibre: true }))).toEqual({ accion: "confirmar" });
  });

  it("el barrido ya canceló el turno y el horario lo tomó otro, hay que devolver", () => {
    expect(decidirPago(mp(), ctx({ turnoEstado: "CANCELADO", pagoEstado: "VENCIDO", venceEnPasado: true, horarioLibre: false }))).toEqual({ accion: "devolver", motivo: "horario_tomado" });
  });

  it("el local canceló el turno a mano (el pago seguía pendiente), hay que devolver", () => {
    expect(decidirPago(mp(), ctx({ turnoEstado: "CANCELADO", pagoEstado: "PENDIENTE", horarioLibre: true }))).toEqual({ accion: "devolver", motivo: "turno_cancelado" });
  });

  it("un monto distinto al de la seña nunca confirma", () => {
    expect(decidirPago(mp({ monto: 100 }), ctx())).toEqual({ accion: "devolver", motivo: "monto_distinto" });
  });

  it("una moneda distinta a ARS nunca confirma", () => {
    expect(decidirPago(mp({ moneda: "USD" }), ctx())).toEqual({ accion: "devolver", motivo: "monto_distinto" });
  });

  it("un segundo pago aprobado para la misma seña es un duplicado a devolver", () => {
    expect(decidirPago(mp({ id: "200" }), ctx({ pagoEstado: "APROBADO", turnoEstado: "CONFIRMADO" }))).toEqual({ accion: "devolver", motivo: "pago_duplicado" });
  });

  it("tras un rechazo, un reintento aprobado confirma", () => {
    expect(decidirPago(mp(), ctx({ pagoEstado: "RECHAZADO" }))).toEqual({ accion: "confirmar" });
  });

  it("tolera diferencias de centavos por redondeo", () => {
    expect(decidirPago(mp({ monto: 7500.001 }), ctx())).toEqual({ accion: "confirmar" });
  });
});

describe("decidirPago: otros estados de Mercado Pago", () => {
  it("rechazado con el pago pendiente lo marca rechazado", () => {
    expect(decidirPago(mp({ estado: "rejected" }), ctx())).toEqual({ accion: "rechazar" });
    expect(decidirPago(mp({ estado: "cancelled" }), ctx())).toEqual({ accion: "rechazar" });
  });

  it("rechazado cuando el pago ya estaba aprobado no cambia nada", () => {
    expect(decidirPago(mp({ id: "300", estado: "rejected" }), ctx({ pagoEstado: "APROBADO", turnoEstado: "CONFIRMADO" }))).toEqual({ accion: "ignorar" });
  });

  it("pendiente, en proceso o reintegrado se ignoran", () => {
    for (const estado of ["pending", "in_process", "refunded", "charged_back", "algo_nuevo"]) {
      expect(decidirPago(mp({ estado }), ctx())).toEqual({ accion: "ignorar" });
    }
  });
});
```

- [ ] **Step 2: Verlo fallar**

Run: `npx vitest run src/modules/pagos/decision.test.ts`
Expected: FAIL (no se puede resolver `./decision`).

- [ ] **Step 3: Implementar**

```ts
import type { EstadoPago, EstadoTurno } from "@/generated/prisma/client";

// Regla pura que decide qué hacer con un pago que informa Mercado Pago. Sin base de datos: se prueba sola.

/** Lo que importa de un pago de Mercado Pago (ya consultado a su API, nunca tomado del aviso). */
export interface PagoMp {
  id: string;
  estado: string; // "approved" | "pending" | "in_process" | "rejected" | "cancelled" | "refunded" | ...
  monto: number;
  moneda: string;
  referencia: string | null; // external_reference = id de nuestro Pago
}

export interface ContextoDecision {
  montoEsperado: number;
  pagoEstado: EstadoPago;
  /** Este mismo pago de Mercado Pago ya se registró antes (aviso repetido). */
  yaAplicado: boolean;
  turnoEstado: EstadoTurno;
  venceEnPasado: boolean;
  /** El horario del turno sigue libre si se ignora este mismo turno. */
  horarioLibre: boolean;
}

export type MotivoDevolucion = "monto_distinto" | "horario_tomado" | "turno_cancelado" | "pago_duplicado";

export type Decision =
  | { accion: "ignorar" }
  | { accion: "confirmar" }
  | { accion: "rechazar" }
  | { accion: "devolver"; motivo: MotivoDevolucion };

const IGNORAR: Decision = { accion: "ignorar" };
const devolver = (motivo: MotivoDevolucion): Decision => ({ accion: "devolver", motivo });

export function decidirPago(mp: PagoMp, ctx: ContextoDecision): Decision {
  if (ctx.yaAplicado) return IGNORAR;

  if (mp.estado === "rejected" || mp.estado === "cancelled") {
    return ctx.pagoEstado === "PENDIENTE" ? { accion: "rechazar" } : IGNORAR;
  }
  if (mp.estado !== "approved") return IGNORAR;

  // Desde acá el pago está aprobado.
  if (ctx.pagoEstado === "APROBADO") return devolver("pago_duplicado");
  if (mp.moneda !== "ARS" || Math.abs(mp.monto - ctx.montoEsperado) > 0.005) return devolver("monto_distinto");

  if (ctx.turnoEstado === "ESPERANDO_PAGO" && !ctx.venceEnPasado) return { accion: "confirmar" };

  // Venció (aún figura esperando, o el barrido ya lo canceló y marcó el pago VENCIDO): confirma solo si el horario sigue libre.
  const vencido =
    (ctx.turnoEstado === "ESPERANDO_PAGO" && ctx.venceEnPasado) ||
    (ctx.turnoEstado === "CANCELADO" && ctx.pagoEstado === "VENCIDO");
  if (vencido) return ctx.horarioLibre ? { accion: "confirmar" } : devolver("horario_tomado");

  return devolver("turno_cancelado");
}
```

- [ ] **Step 4: Verlo pasar**

Run: `npx vitest run src/modules/pagos/decision.test.ts`
Expected: PASS (15 tests).

- [ ] **Step 5: Commit**

```bash
git add src/modules/pagos/decision.ts src/modules/pagos/decision.test.ts
git commit -m "feat: regla pura que decide que hacer con un pago de Mercado Pago"
```

---

### Task 4: Firma del webhook (`firmaValida`)

**Files:**
- Create: `src/modules/pagos/firma.ts`
- Test: `src/modules/pagos/firma.test.ts`

**Interfaces:**
- Produces: `firmaValida(p: { xSignature: string | null; xRequestId: string | null; dataId: string | null; secreto: string }): boolean`. Nunca lanza.

Formato (documentación de Mercado Pago, a confirmar en el sandbox en la Tarea 12): cabecera `x-signature: ts=<epoch>,v1=<hex>`; mensaje firmado `id:<data.id en minúsculas>;request-id:<x-request-id>;ts:<ts>;` con HMAC-SHA256 en hexadecimal. Si falta `x-request-id` o `data.id`, se omite ese segmento.

- [ ] **Step 1: Escribir el test que falla**

```ts
import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { firmaValida } from "./firma";

const SECRETO = "secreto-de-prueba";
const firmar = (dataId: string, requestId: string, ts: string, secreto = SECRETO) =>
  createHmac("sha256", secreto).update(`id:${dataId};request-id:${requestId};ts:${ts};`).digest("hex");
const cabecera = (ts: string, v1: string) => `ts=${ts},v1=${v1}`;

describe("firmaValida", () => {
  it("acepta una firma correcta", () => {
    const v1 = firmar("123456", "req-1", "1700000000");
    expect(firmaValida({ xSignature: cabecera("1700000000", v1), xRequestId: "req-1", dataId: "123456", secreto: SECRETO })).toBe(true);
  });

  it("normaliza el id a minúsculas antes de firmar", () => {
    const v1 = firmar("abc123", "req-1", "1700000000");
    expect(firmaValida({ xSignature: cabecera("1700000000", v1), xRequestId: "req-1", dataId: "ABC123", secreto: SECRETO })).toBe(true);
  });

  it("rechaza si cambió el id del pago", () => {
    const v1 = firmar("123456", "req-1", "1700000000");
    expect(firmaValida({ xSignature: cabecera("1700000000", v1), xRequestId: "req-1", dataId: "999999", secreto: SECRETO })).toBe(false);
  });

  it("rechaza una firma hecha con otro secreto", () => {
    const v1 = firmar("123456", "req-1", "1700000000", "otro-secreto");
    expect(firmaValida({ xSignature: cabecera("1700000000", v1), xRequestId: "req-1", dataId: "123456", secreto: SECRETO })).toBe(false);
  });

  it("rechaza si falta la cabecera o está mal formada", () => {
    const base = { xRequestId: "req-1", dataId: "123456", secreto: SECRETO };
    expect(firmaValida({ ...base, xSignature: null })).toBe(false);
    expect(firmaValida({ ...base, xSignature: "" })).toBe(false);
    expect(firmaValida({ ...base, xSignature: "v1=abc" })).toBe(false);
    expect(firmaValida({ ...base, xSignature: "ts=1700000000" })).toBe(false);
    expect(firmaValida({ ...base, xSignature: "basura" })).toBe(false);
  });

  it("rechaza una firma que no es hexadecimal o tiene otro largo, sin lanzar", () => {
    const base = { xRequestId: "req-1", dataId: "123456", secreto: SECRETO };
    expect(firmaValida({ ...base, xSignature: cabecera("1700000000", "zz") })).toBe(false);
    expect(firmaValida({ ...base, xSignature: cabecera("1700000000", "ab") })).toBe(false);
  });

  it("rechaza si no hay secreto configurado", () => {
    const v1 = firmar("123456", "req-1", "1700000000", "");
    expect(firmaValida({ xSignature: cabecera("1700000000", v1), xRequestId: "req-1", dataId: "123456", secreto: "" })).toBe(false);
  });
});
```

- [ ] **Step 2: Verlo fallar**

Run: `npx vitest run src/modules/pagos/firma.test.ts`
Expected: FAIL (no se puede resolver `./firma`).

- [ ] **Step 3: Implementar**

```ts
import { createHmac, timingSafeEqual } from "node:crypto";

interface Entrada {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  secreto: string;
}

/** Valida la cabecera `x-signature` de un aviso de Mercado Pago. Nunca lanza: ante la duda, devuelve false. */
export function firmaValida({ xSignature, xRequestId, dataId, secreto }: Entrada): boolean {
  if (!xSignature || !secreto) return false;

  let ts: string | undefined;
  let v1: string | undefined;
  for (const parte of xSignature.split(",")) {
    const [clave, valor] = parte.split("=").map((s) => s.trim());
    if (clave === "ts") ts = valor;
    if (clave === "v1") v1 = valor;
  }
  if (!ts || !v1 || !/^[0-9a-f]+$/i.test(v1)) return false;

  const mensaje =
    (dataId ? `id:${dataId.toLowerCase()};` : "") + (xRequestId ? `request-id:${xRequestId};` : "") + `ts:${ts};`;
  const esperada = createHmac("sha256", secreto).update(mensaje).digest();
  const recibida = Buffer.from(v1, "hex");
  return recibida.length === esperada.length && timingSafeEqual(recibida, esperada);
}
```

- [ ] **Step 4: Verlo pasar**

Run: `npx vitest run src/modules/pagos/firma.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/modules/pagos/firma.ts src/modules/pagos/firma.test.ts
git commit -m "feat: validacion de la firma de los avisos de Mercado Pago"
```

---

### Task 5: Cliente de Mercado Pago (`src/lib/mercadopago.ts`)

**Files:**
- Create: `src/lib/mercadopago.ts`
- Test: `src/lib/mercadopago.test.ts`

**Interfaces:**
- Consumes: `PagoMp` de `@/modules/pagos/decision` (Tarea 3); `z` de `@/lib/zod`.
- Produces:
  - `class ErrorMercadoPago extends Error { status: number }`
  - `interface DatosPreferencia { pagoId: string; turnoId: string; titulo: string; monto: number; nombreCliente: string; emailCliente?: string; venceEn: Date; ahora: Date; urlApp: string }`
  - `armarPreferencia(d: DatosPreferencia): object` (pura)
  - `crearPreferencia(d: DatosPreferencia): Promise<{ id: string; initPoint: string }>`
  - `obtenerPago(id: string): Promise<PagoMp>` (lanza `ErrorMercadoPago` con `status` 404 si no existe)
  - `buscarPagosPorReferencia(pagoId: string): Promise<PagoMp[]>`
  - Variables de entorno leídas: `MP_ACCESS_TOKEN`, `APP_URL`.

- [ ] **Step 1: Escribir el test que falla (solo la parte pura)**

```ts
import { describe, expect, it } from "vitest";
import { armarPreferencia, type DatosPreferencia } from "./mercadopago";

const ahora = new Date("2026-10-01T15:00:00Z");
const base: DatosPreferencia = {
  pagoId: "pago1",
  turnoId: "turno1",
  titulo: "Seña · Colocación de vidrios",
  monto: 7500,
  nombreCliente: "Ana Pérez",
  emailCliente: "ana@example.com",
  venceEn: new Date(ahora.getTime() + 8 * 60_000),
  ahora,
  urlApp: "https://turnos.ejemplo.com",
};
type Preferencia = ReturnType<typeof armarPreferencia> & Record<string, any>;
const armar = (o: Partial<DatosPreferencia> = {}) => armarPreferencia({ ...base, ...o }) as Preferencia;

describe("armarPreferencia", () => {
  it("cobra el monto de la seña en pesos, una sola unidad", () => {
    expect(armar().items).toEqual([{ id: "turno1", title: "Seña · Colocación de vidrios", quantity: 1, unit_price: 7500, currency_id: "ARS" }]);
  });

  it("usa el id del pago como referencia externa", () => {
    expect(armar().external_reference).toBe("pago1");
  });

  it("vence a los 8 minutos, con la hora de Catamarca (-03:00)", () => {
    const p = armar();
    expect(p.expires).toBe(true);
    expect(p.expiration_date_from).toBe("2026-10-01T12:00:00.000-03:00");
    expect(p.expiration_date_to).toBe("2026-10-01T12:08:00.000-03:00");
  });

  it("excluye los pagos en efectivo y por cajero", () => {
    expect(armar().payment_methods.excluded_payment_types).toEqual([{ id: "ticket" }, { id: "atm" }]);
  });

  it("vuelve a la página de confirmación del turno", () => {
    const { back_urls } = armar();
    for (const url of [back_urls.success, back_urls.failure, back_urls.pending]) {
      expect(url).toBe("https://turnos.ejemplo.com/reservar/confirmado?turno=turno1");
    }
  });

  it("con una URL https pide el aviso por webhook y el regreso automático", () => {
    const p = armar();
    expect(p.notification_url).toBe("https://turnos.ejemplo.com/api/mercadopago/webhook");
    expect(p.auto_return).toBe("approved");
  });

  it("con una URL local no manda notification_url ni auto_return (Mercado Pago los rechaza)", () => {
    const p = armar({ urlApp: "http://localhost:3000" });
    expect(p).not.toHaveProperty("notification_url");
    expect(p).not.toHaveProperty("auto_return");
  });

  it("ignora la barra final de APP_URL", () => {
    expect(armar({ urlApp: "https://turnos.ejemplo.com/" }).back_urls.success).toBe("https://turnos.ejemplo.com/reservar/confirmado?turno=turno1");
  });

  it("sin email no manda el campo", () => {
    const p = armar({ emailCliente: undefined });
    expect(p.payer).toEqual({ name: "Ana Pérez" });
  });
});
```

- [ ] **Step 2: Verlo fallar**

Run: `npx vitest run src/lib/mercadopago.test.ts`
Expected: FAIL (no se puede resolver `./mercadopago`).

- [ ] **Step 3: Implementar**

```ts
import { z } from "@/lib/zod";
import type { PagoMp } from "@/modules/pagos/decision";

// Cliente mínimo de la API de Mercado Pago (Checkout Pro). Solo servidor: usa MP_ACCESS_TOKEN.

const API = "https://api.mercadopago.com";
const TIEMPO_MAXIMO_MS = 10_000;

export class ErrorMercadoPago extends Error {
  constructor(
    public readonly status: number,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = "ErrorMercadoPago";
  }
}

export interface DatosPreferencia {
  pagoId: string;
  turnoId: string;
  titulo: string;
  monto: number;
  nombreCliente: string;
  emailCliente?: string;
  venceEn: Date;
  ahora: Date;
  urlApp: string;
}

/** Catamarca está en UTC-3 todo el año, y Mercado Pago pide la fecha con su desfase. */
function conDesfase(fecha: Date): string {
  return new Date(fecha.getTime() - 3 * 60 * 60_000).toISOString().replace("Z", "-03:00");
}

/** Cuerpo de la preferencia de pago. Pura: se prueba sin red. */
export function armarPreferencia(d: DatosPreferencia) {
  const urlApp = d.urlApp.replace(/\/+$/, "");
  const volver = `${urlApp}/reservar/confirmado?turno=${d.turnoId}`;
  // Mercado Pago rechaza el aviso y el regreso automático con direcciones que no son públicas (https).
  const publica = urlApp.startsWith("https://");

  return {
    items: [{ id: d.turnoId, title: d.titulo, quantity: 1, unit_price: d.monto, currency_id: "ARS" }],
    payer: { name: d.nombreCliente, ...(d.emailCliente ? { email: d.emailCliente } : {}) },
    external_reference: d.pagoId,
    back_urls: { success: volver, failure: volver, pending: volver },
    expires: true,
    expiration_date_from: conDesfase(d.ahora),
    expiration_date_to: conDesfase(d.venceEn),
    // La reserva dura 8 minutos: un pago en efectivo no llega a tiempo.
    payment_methods: { excluded_payment_types: [{ id: "ticket" }, { id: "atm" }] },
    ...(publica ? { auto_return: "approved", notification_url: `${urlApp}/api/mercadopago/webhook` } : {}),
  };
}

function configuracion() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("Falta MP_ACCESS_TOKEN en .env (credencial de Mercado Pago).");
  return { token };
}

async function pedir(ruta: string, init: RequestInit = {}): Promise<unknown> {
  const { token } = configuracion();
  const respuesta = await fetch(`${API}${ruta}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
    signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
  });
  if (!respuesta.ok) {
    // El detalle puede ser largo; se recorta. Nunca se incluye el token.
    const detalle = (await respuesta.text().catch(() => "")).slice(0, 300);
    throw new ErrorMercadoPago(respuesta.status, `Mercado Pago respondió ${respuesta.status} en ${ruta}: ${detalle}`);
  }
  return respuesta.json();
}

const preferenciaSchema = z.object({ id: z.string(), init_point: z.string() });

export async function crearPreferencia(d: DatosPreferencia): Promise<{ id: string; initPoint: string }> {
  const datos = preferenciaSchema.parse(
    await pedir("/checkout/preferences", { method: "POST", body: JSON.stringify(armarPreferencia(d)) }),
  );
  return { id: datos.id, initPoint: datos.init_point };
}

const pagoSchema = z.object({
  id: z.union([z.number(), z.string()]),
  status: z.string(),
  transaction_amount: z.number(),
  currency_id: z.string().optional(),
  external_reference: z.string().nullish(),
});

function aPagoMp(datos: z.infer<typeof pagoSchema>): PagoMp {
  return {
    id: String(datos.id),
    estado: datos.status,
    monto: datos.transaction_amount,
    moneda: datos.currency_id ?? "ARS",
    referencia: datos.external_reference ?? null,
  };
}

/** Consulta un pago por su id. Lanza `ErrorMercadoPago` (status 404) si no existe. */
export async function obtenerPago(id: string): Promise<PagoMp> {
  return aPagoMp(pagoSchema.parse(await pedir(`/v1/payments/${encodeURIComponent(id)}`)));
}

/** Pagos asociados a una referencia externa (el id de nuestro Pago), del más nuevo al más viejo. */
export async function buscarPagosPorReferencia(pagoId: string): Promise<PagoMp[]> {
  const ruta = `/v1/payments/search?external_reference=${encodeURIComponent(pagoId)}&sort=date_created&criteria=desc`;
  const { results } = z.object({ results: z.array(pagoSchema) }).parse(await pedir(ruta));
  return results.map(aPagoMp);
}
```

- [ ] **Step 4: Verlo pasar**

Run: `npx vitest run src/lib/mercadopago.test.ts && npm run typecheck`
Expected: PASS (9 tests) y typecheck sin errores. Si `@/lib/zod` no exporta `z` con `.nullish()`, usar `.nullable().optional()`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mercadopago.ts src/lib/mercadopago.test.ts
git commit -m "feat: cliente de la API de Mercado Pago (preferencia, consulta y busqueda de pagos)"
```

---

### Task 6: La disponibilidad ignora los turnos vencidos y se barren

**Files:**
- Modify: `src/modules/turnos/servicio.service.ts` (`disponibilidadDelDia`, export)
- Modify: `src/modules/turnos/turno.service.ts` (`contarTurnosPorDia`, `listarTurnosDelDia`, `obtenerTurno`)
- Create: `src/modules/pagos/pagos.service.ts`

**Interfaces:**
- Consumes: modelo `Pago`, `Turno.venceEn` (Tarea 1).
- Produces: `disponibilidadDelDia(cliente: Prisma.TransactionClient, servicioId: string, fecha: string)` exportada; `liberarVencidos(ahora?: Date): Promise<number>` en `pagos.service.ts`; `obtenerTurno(id)` incluye `pagos` (el último); `listarTurnosDelDia` incluye `pagos` aprobados.

- [ ] **Step 1: Exportar `disponibilidadDelDia` y excluir los vencidos**

En `servicio.service.ts`, cambiar `async function disponibilidadDelDia` por `export async function disponibilidadDelDia` y reemplazar la consulta de `turnos` por:

```ts
  const turnos = await cliente.turno.findMany({
    where: {
      servicioId,
      estado: { notIn: ["CANCELADO", "AUSENTE"] },
      // Un turno esperando el pago que ya venció no ocupa el horario, aunque el barrido todavía no lo haya cancelado.
      NOT: { estado: "ESPERANDO_PAGO", venceEn: { lte: new Date() } },
      ...enElDia,
    },
    select: { inicio: true, fin: true },
  });
```

- [ ] **Step 2: Lo mismo en la tira semanal y datos extra en `turno.service.ts`**

En `contarTurnosPorDia`, reemplazar el `where` por:

```ts
    where: {
      inicio: rangoDias(desde, dias),
      estado: { notIn: ["CANCELADO", "AUSENTE"] },
      NOT: { estado: "ESPERANDO_PAGO", venceEn: { lte: new Date() } },
    },
```

En `listarTurnosDelDia`, agregar al `include`:

```ts
      pagos: { where: { estado: "APROBADO" }, select: { monto: true } },
```

Reemplazar `obtenerTurno` por:

```ts
export function obtenerTurno(id: string) {
  return db.turno.findUnique({
    where: { id },
    include: { servicio: true, cliente: true, pagos: { orderBy: { creadoEn: "desc" }, take: 1 } },
  });
}
```

- [ ] **Step 3: Crear `src/modules/pagos/pagos.service.ts` con el barrido**

```ts
import { db } from "@/lib/db";

/**
 * Cancela los turnos que esperaban el pago y ya vencieron, y marca sus pagos como vencidos, en una sola
 * transacción. La disponibilidad ya los ignora por la fecha; esto evita que se acumulen en la agenda.
 * Si el pago llega después, `aplicarPagoMp` lo trata como "pago tardío".
 */
export async function liberarVencidos(ahora: Date = new Date()): Promise<number> {
  return db.$transaction(async (tx) => {
    const vencidos = await tx.turno.findMany({
      where: { estado: "ESPERANDO_PAGO", venceEn: { lte: ahora } },
      select: { id: true },
    });
    if (vencidos.length === 0) return 0;

    const ids = vencidos.map((t) => t.id);
    await tx.turno.updateMany({ where: { id: { in: ids } }, data: { estado: "CANCELADO" } });
    await tx.pago.updateMany({
      where: { turnoId: { in: ids }, estado: { in: ["PENDIENTE", "RECHAZADO"] } },
      data: { estado: "VENCIDO" },
    });
    return ids.length;
  });
}
```

- [ ] **Step 4: Verificar**

Run: `npm run typecheck && npm test`
Expected: sin errores; todos los tests pasan.

- [ ] **Step 5: Commit**

```bash
git add src/modules/turnos/servicio.service.ts src/modules/turnos/turno.service.ts src/modules/pagos/pagos.service.ts
git commit -m "feat: la disponibilidad ignora los turnos con el pago vencido y se barren"
```

---

### Task 7: Reservar con seña (`reservarTurno` e `iniciarCobro`)

**Files:**
- Modify: `src/modules/turnos/servicio.service.ts` (`reservarTurno`, error nuevo)
- Modify: `src/modules/pagos/pagos.service.ts` (`iniciarCobro`, `CobroNoDisponibleError`)

**Interfaces:**
- Consumes: `calcularSena`, `MINUTOS_RETENCION` (Tarea 2); `crearPreferencia` (Tarea 5).
- Produces:
  - `class CondicionesNoAceptadasError extends Error` (en `servicio.service.ts`)
  - `reservarTurno(input: ReservaInput, opciones?: { omitirSena?: boolean; aceptoCondiciones?: boolean }): Promise<{ turno: Turno & { servicio: Servicio; cliente: Cliente }; pagoId: string | null }>`
  - `class CobroNoDisponibleError extends Error` y `iniciarCobro(pagoId: string): Promise<{ urlPago: string }>` (en `pagos.service.ts`)

- [ ] **Step 1: Buscar otros usos de `reservarTurno` (cambia su retorno)**

Run: `git grep -n "reservarTurno" -- src`
Expected: solo `servicio.service.ts` y `src/app/(publico)/reservar/acciones.ts` (esta última se adapta en la Tarea 10). Si aparece otro uso, adaptarlo a `{ turno, pagoId }`.

- [ ] **Step 2: Agregar el error y reemplazar `reservarTurno` en `servicio.service.ts`**

Agregar los imports `import { calcularSena, MINUTOS_RETENCION } from "@/modules/pagos/sena";` y, junto a `TurnoNoDisponibleError`:

```ts
export class CondicionesNoAceptadasError extends Error {
  constructor() {
    super("Hay que aceptar las condiciones de la seña");
  }
}
```

Reemplazar la función `reservarTurno` completa (y su comentario) por:

```ts
/**
 * Reserva un turno. Un lock de Postgres por servicio serializa las reservas
 * concurrentes, y la disponibilidad se recalcula dentro de la transacción: dos
 * clientes que eligen el mismo horario a la vez no pueden superar la capacidad.
 *
 * Si el servicio tiene precio, el turno nace `ESPERANDO_PAGO` (se retiene `MINUTOS_RETENCION` minutos)
 * con un `Pago` pendiente por la seña. Con `omitirSena` (carga hecha por el personal) o sin precio,
 * nace `PENDIENTE` como siempre.
 */
export async function reservarTurno(
  input: ReservaInput,
  { omitirSena = false, aceptoCondiciones = false }: { omitirSena?: boolean; aceptoCondiciones?: boolean } = {},
) {
  const r = reservaSchema.parse(input);

  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${r.servicioId}))`;

    const libres = await disponibilidadDelDia(tx, r.servicioId, fechaLocal(r.inicio));
    const elegido = libres.find((t) => t.inicio.getTime() === r.inicio.getTime());
    if (!elegido) throw new TurnoNoDisponibleError();

    const servicio = await tx.servicio.findUniqueOrThrow({ where: { id: r.servicioId } });
    const sena = omitirSena ? null : calcularSena(servicio.precioBase);
    if (sena !== null && !aceptoCondiciones) throw new CondicionesNoAceptadasError();

    const cliente =
      (await tx.cliente.findFirst({ where: { telefono: r.cliente.telefono } })) ??
      (await tx.cliente.create({ data: r.cliente }));

    const ahora = new Date();
    const turno = await tx.turno.create({
      data: {
        servicioId: r.servicioId,
        clienteId: cliente.id,
        inicio: elegido.inicio,
        fin: elegido.fin,
        estado: sena === null ? "PENDIENTE" : "ESPERANDO_PAGO",
        venceEn: sena === null ? null : sumarMinutos(ahora, MINUTOS_RETENCION),
        precio: servicio.precioBase,
        vehiculo: r.vehiculo,
        patente: r.patente,
        cristalId: r.cristalId,
        notas: r.notas,
        pagos: sena === null ? undefined : { create: { monto: sena, aceptoCondicionesEn: ahora } },
      },
      include: { servicio: true, cliente: true, pagos: { select: { id: true } } },
    });
    return { turno, pagoId: turno.pagos[0]?.id ?? null };
  });
}
```

- [ ] **Step 3: Agregar `iniciarCobro` a `pagos.service.ts`**

Agregar al principio del archivo los imports y, después de `liberarVencidos`, la clase y la función:

```ts
import { crearPreferencia } from "@/lib/mercadopago";
```

```ts
export class CobroNoDisponibleError extends Error {
  constructor() {
    super("No se pudo iniciar el cobro de la seña");
  }
}

/**
 * Crea la preferencia de pago en Mercado Pago y guarda su link. Si Mercado Pago no responde, cancela el turno
 * recién creado (el horario queda libre) y lanza `CobroNoDisponibleError`.
 */
export async function iniciarCobro(pagoId: string): Promise<{ urlPago: string }> {
  const pago = await db.pago.findUniqueOrThrow({
    where: { id: pagoId },
    include: { turno: { include: { servicio: true, cliente: true } } },
  });

  try {
    const urlApp = process.env.APP_URL;
    if (!urlApp) throw new Error("Falta APP_URL en .env");
    if (!pago.turno.venceEn) throw new Error("El turno no tiene vencimiento");

    const preferencia = await crearPreferencia({
      pagoId: pago.id,
      turnoId: pago.turnoId,
      titulo: `Seña · ${pago.turno.servicio.nombre}`,
      monto: Number(pago.monto),
      nombreCliente: pago.turno.cliente.nombre,
      emailCliente: pago.turno.cliente.email ?? undefined,
      venceEn: pago.turno.venceEn,
      ahora: new Date(),
      urlApp,
    });
    await db.pago.update({ where: { id: pago.id }, data: { mpPreferenciaId: preferencia.id, mpInitPoint: preferencia.initPoint } });
    return { urlPago: preferencia.initPoint };
  } catch (error) {
    console.error("No se pudo crear la preferencia de Mercado Pago:", error);
    await db.$transaction([
      db.turno.update({ where: { id: pago.turnoId }, data: { estado: "CANCELADO" } }),
      db.pago.update({ where: { id: pago.id }, data: { estado: "VENCIDO" } }),
    ]);
    throw new CobroNoDisponibleError();
  }
}
```

- [ ] **Step 4: Verificar**

Run: `npm run typecheck && npm test`
Expected: typecheck falla solo en `src/app/(publico)/reservar/acciones.ts` (usa el retorno viejo de `reservarTurno`); es esperado y se corrige en la Tarea 10. Los tests pasan. Para seguir con commits limpios, hacer el commit igual: la rama no se mergea hasta el final.

- [ ] **Step 5: Commit**

```bash
git add src/modules/turnos/servicio.service.ts src/modules/pagos/pagos.service.ts
git commit -m "feat: reservar con sena (turno ESPERANDO_PAGO) e inicio del cobro en Mercado Pago"
```

---

### Task 8: Aplicar un pago, sincronizar al volver y devoluciones

**Files:**
- Modify: `src/modules/pagos/pagos.service.ts`

**Interfaces:**
- Consumes: `decidirPago`, `PagoMp` (Tarea 3); `buscarPagosPorReferencia` (Tarea 5); `disponibilidadDelDia` (Tarea 6).
- Produces:
  - `type ResultadoAplicacion = { tipo: "confirmado" | "rechazado" | "a_devolver" | "ignorado" | "no_encontrado" }`
  - `aplicarPagoMp(mp: PagoMp): Promise<ResultadoAplicacion>`
  - `sincronizarPago(turnoId: string): Promise<void>` (nunca lanza)
  - `listarPagosParaDevolver()`: pagos con `requiereDevolucion` y sin `devueltoEn`, con `turno.cliente` y `turno.servicio.nombre`
  - `marcarDevuelto(pagoId: string): Promise<void>`

- [ ] **Step 1: Agregar los imports al principio de `pagos.service.ts`**

```ts
import { buscarPagosPorReferencia } from "@/lib/mercadopago";
import { fechaLocal } from "@/lib/tiempo";
import { disponibilidadDelDia } from "@/modules/turnos/servicio.service";
import { decidirPago, type MotivoDevolucion, type PagoMp } from "./decision";
```

(el import de `crearPreferencia` ya existe; combinarlos en una sola línea: `import { buscarPagosPorReferencia, crearPreferencia } from "@/lib/mercadopago";`)

- [ ] **Step 2: Agregar `aplicarPagoMp` y `sincronizarPago`**

```ts
const TEXTO_MOTIVO: Record<MotivoDevolucion, string> = {
  monto_distinto: "El monto cobrado no coincide con la seña",
  horario_tomado: "Pagó después de que venciera y el horario ya lo tomó otro",
  turno_cancelado: "Pagó un turno que ya estaba cancelado",
  pago_duplicado: "Pago duplicado",
};

export interface ResultadoAplicacion {
  tipo: "confirmado" | "rechazado" | "a_devolver" | "ignorado" | "no_encontrado";
}

/**
 * Aplica a nuestros datos un pago que Mercado Pago informó (ya consultado a su API). Lo usan el webhook y la
 * página de retorno. Es idempotente: se ejecuta dentro del lock del servicio, así que avisos repetidos o
 * simultáneos no confirman dos veces ni se saltan el vencimiento.
 */
export async function aplicarPagoMp(mp: PagoMp): Promise<ResultadoAplicacion> {
  if (!mp.referencia) return { tipo: "no_encontrado" };
  const previo = await db.pago.findUnique({
    where: { id: mp.referencia },
    select: { id: true, turno: { select: { servicioId: true } } },
  });
  if (!previo) return { tipo: "no_encontrado" };

  return db.$transaction(async (tx): Promise<ResultadoAplicacion> => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${previo.turno.servicioId}))`;
    const pago = await tx.pago.findUniqueOrThrow({ where: { id: previo.id }, include: { turno: true } });
    const turno = pago.turno;

    let horarioLibre = false;
    if (mp.estado === "approved") {
      const libres = await disponibilidadDelDia(tx, turno.servicioId, fechaLocal(turno.inicio));
      horarioLibre = libres.some((t) => t.inicio.getTime() === turno.inicio.getTime());
    }

    const decision = decidirPago(mp, {
      montoEsperado: Number(pago.monto),
      pagoEstado: pago.estado,
      yaAplicado: pago.mpPagoId === mp.id || (pago.motivoDevolucion ?? "").includes(`#${mp.id}`),
      turnoEstado: turno.estado,
      venceEnPasado: !!turno.venceEn && turno.venceEn <= new Date(),
      horarioLibre,
    });

    switch (decision.accion) {
      case "confirmar":
        await tx.pago.update({ where: { id: pago.id }, data: { estado: "APROBADO", mpPagoId: mp.id } });
        await tx.turno.update({ where: { id: turno.id }, data: { estado: "CONFIRMADO", venceEn: null } });
        return { tipo: "confirmado" };

      case "rechazar":
        await tx.pago.update({ where: { id: pago.id }, data: { estado: "RECHAZADO" } });
        return { tipo: "rechazado" };

      case "devolver": {
        const detalle = `${TEXTO_MOTIVO[decision.motivo]} (Mercado Pago #${mp.id})`;
        if (decision.motivo === "pago_duplicado") {
          // El primer pago sigue siendo el válido: solo se anota el duplicado para devolverlo.
          await tx.pago.update({
            where: { id: pago.id },
            data: {
              requiereDevolucion: true,
              devueltoEn: null,
              motivoDevolucion: [pago.motivoDevolucion, detalle].filter(Boolean).join(" · "),
            },
          });
        } else {
          await tx.pago.update({
            where: { id: pago.id },
            data: { estado: "APROBADO", mpPagoId: mp.id, requiereDevolucion: true, motivoDevolucion: detalle },
          });
          if (turno.estado === "ESPERANDO_PAGO") {
            await tx.turno.update({ where: { id: turno.id }, data: { estado: "CANCELADO" } });
          }
        }
        return { tipo: "a_devolver" };
      }

      default:
        return { tipo: "ignorado" };
    }
  });
}

/**
 * Al volver el cliente de Mercado Pago, consulta sus pagos y los aplica. No lanza: si la consulta falla,
 * la página muestra "esperando confirmación" y el webhook lo resuelve después.
 */
export async function sincronizarPago(turnoId: string): Promise<void> {
  const pago = await db.pago.findFirst({
    where: { turnoId, estado: { not: "APROBADO" } },
    orderBy: { creadoEn: "desc" },
    select: { id: true },
  });
  if (!pago) return;
  try {
    for (const p of await buscarPagosPorReferencia(pago.id)) await aplicarPagoMp(p);
  } catch (error) {
    console.error("No se pudo sincronizar el pago con Mercado Pago:", error);
  }
}
```

- [ ] **Step 3: Agregar las devoluciones**

```ts
/** Pagos que el local tiene que devolver a mano desde Mercado Pago. */
export function listarPagosParaDevolver() {
  return db.pago.findMany({
    where: { requiereDevolucion: true, devueltoEn: null },
    include: { turno: { include: { cliente: true, servicio: { select: { nombre: true } } } } },
    orderBy: { actualizadoEn: "desc" },
  });
}

export async function marcarDevuelto(pagoId: string): Promise<void> {
  await db.pago.update({ where: { id: pagoId }, data: { devueltoEn: new Date() } });
}
```

- [ ] **Step 4: Verificar**

Run: `npm run typecheck`
Expected: el único error restante es el de `src/app/(publico)/reservar/acciones.ts` (Tarea 10). Si el import circular entre `pagos.service.ts` y `servicio.service.ts` diera problemas, comprobar que `servicio.service.ts` no importa `pagos.service.ts` (solo importa `@/modules/pagos/sena`).

- [ ] **Step 5: Commit**

```bash
git add src/modules/pagos/pagos.service.ts
git commit -m "feat: aplicar un pago de Mercado Pago (idempotente), sincronizar al volver y devoluciones"
```

---

### Task 9: Webhook de Mercado Pago y configuración

**Files:**
- Create: `src/app/api/mercadopago/webhook/route.ts`
- Modify: `src/lib/rutas.ts`
- Test: `src/lib/rutas.test.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `firmaValida` (Tarea 4); `obtenerPago`, `ErrorMercadoPago` (Tarea 5); `aplicarPagoMp` (Tarea 8).
- Produces: `POST /api/mercadopago/webhook`; `esRutaPublica("/api/mercadopago/webhook") === true`.

- [ ] **Step 1: Escribir los tests que fallan en `rutas.test.ts`**

Dentro de `describe("esRutaPublica", ...)` agregar:

```ts
  it("permite el webhook de Mercado Pago y nada más de /api", () => {
    expect(esRutaPublica("/api/mercadopago/webhook")).toBe(true);
    for (const ruta of ["/api", "/api/mercadopago", "/api/mercadopago/otra", "/api/mercadopago/webhook-x", "/x/api/mercadopago/webhook"]) {
      expect(esRutaPublica(ruta)).toBe(false);
    }
  });
```

- [ ] **Step 2: Verlo fallar**

Run: `npx vitest run src/lib/rutas.test.ts`
Expected: FAIL (el webhook devuelve `false`).

- [ ] **Step 3: Hacer pública la ruta**

En `src/lib/rutas.ts`, cambiar la lista y el comentario:

```ts
const PUBLICAS = ["/login", "/reservar", "/api/mercadopago/webhook"];
```

```ts
/** `/login`, `/reservar` (con sus subrutas) y el webhook de Mercado Pago no requieren sesión. */
```

- [ ] **Step 4: Verlo pasar**

Run: `npx vitest run src/lib/rutas.test.ts`
Expected: PASS.

- [ ] **Step 5: Crear el route handler**

`src/app/api/mercadopago/webhook/route.ts`:

```ts
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { ErrorMercadoPago, obtenerPago } from "@/lib/mercadopago";
import { firmaValida } from "@/modules/pagos/firma";
import { aplicarPagoMp } from "@/modules/pagos/pagos.service";

/**
 * Aviso de Mercado Pago. Ruta pública (no hay sesión): se protege validando la firma, y aun así nunca se
 * confía en lo que trae el aviso: el pago se vuelve a consultar a la API de Mercado Pago.
 */
export async function POST(request: NextRequest) {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto) {
    console.error("Falta MP_WEBHOOK_SECRET en .env: no se pueden validar los avisos de Mercado Pago.");
    return NextResponse.json({ error: "no configurado" }, { status: 500 });
  }

  const { searchParams } = request.nextUrl;
  const dataId = searchParams.get("data.id");
  const valida = firmaValida({
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId,
    secreto,
  });
  if (!valida) return NextResponse.json({ error: "firma inválida" }, { status: 401 });

  // Solo interesan los avisos de pagos.
  if (searchParams.get("type") !== "payment" || !dataId) return NextResponse.json({ ok: true });

  try {
    const resultado = await aplicarPagoMp(await obtenerPago(dataId));
    revalidatePath("/turnos");
    revalidatePath("/");
    return NextResponse.json({ ok: true, resultado: resultado.tipo });
  } catch (error) {
    // Una notificación de prueba trae un id que no existe: no tiene sentido que Mercado Pago la reintente.
    if (error instanceof ErrorMercadoPago && error.status === 404) return NextResponse.json({ ok: true, resultado: "ignorado" });
    console.error("No se pudo procesar el aviso de Mercado Pago:", error);
    return NextResponse.json({ error: "reintentar" }, { status: 500 });
  }
}
```

- [ ] **Step 6: Documentar las variables en `.env.example`**

Agregar al final:

```
# Mercado Pago (cobro de la seña de los turnos).
# Credenciales en https://www.mercadopago.com.ar/developers/panel (primero las de prueba).
MP_ACCESS_TOKEN=""
# Clave secreta del webhook (Tus integraciones > Webhooks) para validar la firma de los avisos.
MP_WEBHOOK_SECRET=""
# URL pública de la app, sin barra final. Se usa para el regreso desde Mercado Pago y para el aviso por webhook.
# En desarrollo local (http://localhost:3000) Mercado Pago no puede avisar: hace falta un túnel https (ngrok, cloudflared).
APP_URL="http://localhost:3000"
```

- [ ] **Step 7: Verificar**

Run: `npm run typecheck && npm test`
Expected: typecheck con el único error pendiente de la Tarea 10; tests pasan. Revisión manual del Review Focus 7: leer el handler y confirmar que un 404 de `obtenerPago` responde 200.

- [ ] **Step 8: Commit**

```bash
git add src/app/api/mercadopago/webhook/route.ts src/lib/rutas.ts src/lib/rutas.test.ts .env.example
git commit -m "feat: webhook de Mercado Pago con firma validada y variables de entorno"
```

---

### Task 10: Formulario de reserva, acción pública y página de confirmación

**Files:**
- Modify: `src/app/(publico)/reservar/acciones.ts`
- Modify: `src/app/(publico)/reservar/FormularioReserva.tsx`
- Modify: `src/app/(publico)/reservar/page.tsx`
- Modify: `src/app/(publico)/reservar/confirmado/page.tsx`

**Interfaces:**
- Consumes: `reservarTurno`, `CondicionesNoAceptadasError` (Tarea 7); `iniciarCobro`, `CobroNoDisponibleError`, `liberarVencidos`, `sincronizarPago` (Tareas 6–8); `calcularSena`, `MINUTOS_RETENCION` (Tarea 2); `obtenerSesion` de `@/lib/sesion`; `casilla` de `@/lib/formularios`.
- Produces: `FormularioReserva({ servicioId, inicio, sena })` con `sena: number | null`.

- [ ] **Step 1: Reemplazar `acciones.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { casilla, erroresDeZod, fallo, texto, type EstadoFormulario } from "@/lib/formularios";
import { obtenerSesion } from "@/lib/sesion";
import { CobroNoDisponibleError, iniciarCobro } from "@/modules/pagos/pagos.service";
import { CondicionesNoAceptadasError, reservarTurno, TurnoNoDisponibleError } from "@/modules/turnos/servicio.service";

export async function reservar(_previo: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  // Si quien reserva tiene sesión del panel (carga un turno desde "Nuevo turno"), no se le cobra seña.
  const personal = (await obtenerSesion()) !== null;

  let destino: string;
  try {
    const { turno, pagoId } = await reservarTurno(
      {
        servicioId: texto(fd, "servicioId") ?? "",
        inicio: texto(fd, "inicio") ?? "",
        cliente: { nombre: texto(fd, "nombre") ?? "", telefono: texto(fd, "telefono") ?? "", email: texto(fd, "email") },
        vehiculo: texto(fd, "vehiculo"),
        patente: texto(fd, "patente"),
        notas: texto(fd, "notas"),
      },
      { omitirSena: personal, aceptoCondiciones: casilla(fd, "aceptaCondiciones") },
    );
    destino = pagoId ? (await iniciarCobro(pagoId)).urlPago : `/reservar/confirmado?turno=${turno.id}`;
  } catch (e) {
    if (e instanceof ZodError) return fallo(erroresDeZod(e));
    if (e instanceof CondicionesNoAceptadasError)
      return fallo({ aceptaCondiciones: "Tenés que aceptar las condiciones de la seña para reservar" });
    if (e instanceof TurnoNoDisponibleError)
      return { ok: false, mensaje: "Ese horario se acaba de ocupar. Volvé atrás y elegí otro, por favor." };
    if (e instanceof CobroNoDisponibleError)
      return { ok: false, mensaje: "No pudimos iniciar el pago. Probá de nuevo en unos minutos." };
    throw e;
  }
  revalidatePath("/turnos");
  redirect(destino);
}
```

- [ ] **Step 2: Reemplazar `FormularioReserva.tsx`**

```tsx
"use client";

import { Aviso, boton, Campo, input } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import { pesos } from "@/lib/formato";
import { MINUTOS_RETENCION } from "@/modules/pagos/sena";
import { reservar } from "./acciones";

/** `sena`: monto a pagar ahora por Mercado Pago, o `null` si el turno se reserva sin seña. */
export function FormularioReserva({ servicioId, inicio, sena }: { servicioId: string; inicio: string; sena: number | null }) {
  const { estado, enviar, pendiente, error } = useFormularioAccion(reservar);

  return (
    <form onSubmit={enviar} className="space-y-5" noValidate>
      {estado.mensaje && !estado.ok && <Aviso tono="peligro">{estado.mensaje}</Aviso>}
      <input type="hidden" name="servicioId" value={servicioId} />
      <input type="hidden" name="inicio" value={inicio} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nombre y apellido" htmlFor="nombre" error={error("cliente.nombre")}>
          <input id="nombre" name="nombre" autoComplete="name" className={input} aria-invalid={!!error("cliente.nombre")} />
        </Campo>
        <Campo etiqueta="Teléfono / WhatsApp" htmlFor="telefono" error={error("cliente.telefono")} ayuda="Te escribimos si hay algún cambio">
          <input id="telefono" name="telefono" type="tel" autoComplete="tel" placeholder="383 4123456" className={input} aria-invalid={!!error("cliente.telefono")} />
        </Campo>
        <Campo etiqueta="Email (opcional)" htmlFor="email" error={error("cliente.email")}>
          <input id="email" name="email" type="email" autoComplete="email" className={input} />
        </Campo>
        <Campo etiqueta="Vehículo" htmlFor="vehiculo" error={error("vehiculo")}>
          <input id="vehiculo" name="vehiculo" placeholder="Toyota Hilux 2019" className={input} />
        </Campo>
        <Campo etiqueta="Patente (opcional)" htmlFor="patente" error={error("patente")}>
          <input id="patente" name="patente" placeholder="AB123CD" className={`${input} uppercase`} />
        </Campo>
        <Campo etiqueta="Comentarios (opcional)" htmlFor="notas" error={error("notas")} className="sm:col-span-2">
          <textarea id="notas" name="notas" rows={2} placeholder="Ej.: el parabrisas tiene sensor de lluvia" className={input} />
        </Campo>
      </div>

      {sena !== null && (
        <div className="space-y-3 rounded-lg border border-marca/60 bg-marca/10 p-4 text-sm">
          <p>
            Para confirmar el turno se paga una <strong>seña de {pesos(sena)}</strong> (la mitad del servicio) con Mercado Pago.
            Tenés <strong>{MINUTOS_RETENCION} minutos</strong> para pagar: pasado ese tiempo el horario se libera.
          </p>
          <label className="flex items-start gap-2">
            <input type="checkbox" name="aceptaCondiciones" className="mt-0.5 size-5 shrink-0" aria-invalid={!!error("aceptaCondiciones")} />
            <span>Entiendo que la seña no se devuelve.</span>
          </label>
          {error("aceptaCondiciones") && <p role="alert" className="text-xs text-peligro">{error("aceptaCondiciones")}</p>}
        </div>
      )}

      <button type="submit" disabled={pendiente} className={`${boton.primario} w-full py-3 text-base`}>
        {pendiente ? "Reservando…" : sena !== null ? `Pagar seña de ${pesos(sena)}` : "Confirmar turno"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Adaptar `page.tsx`**

Agregar los imports:

```ts
import { obtenerSesion } from "@/lib/sesion";
import { calcularSena } from "@/modules/pagos/sena";
import { liberarVencidos } from "@/modules/pagos/pagos.service";
```

Al comienzo de `PaginaReservar`, antes de `const params = await searchParams;`, agregar:

```ts
  await liberarVencidos(); // libera los horarios cuyo pago venció antes de calcular la disponibilidad
```

En el paso 4, reemplazar la línea de `<FormularioReserva ... />` por:

```tsx
              <FormularioReserva
                servicioId={servicio.id}
                inicio={elegido.inicio.toISOString()}
                sena={(await obtenerSesion()) ? null : calcularSena(servicio.precioBase)}
              />
```

(`PaginaReservar` es `async`, así que el `await` dentro del JSX es válido.)

- [ ] **Step 4: Reemplazar `confirmado/page.tsx`**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Aviso, boton, tarjeta } from "@/components/ui";
import { pesos } from "@/lib/formato";
import { fechaLocal, formatearFecha, formatearHora } from "@/lib/tiempo";
import { sincronizarPago } from "@/modules/pagos/pagos.service";
import { obtenerTurno } from "@/modules/turnos/turno.service";

export const metadata = { title: "Tu turno" };

export default async function PaginaConfirmado({ searchParams }: { searchParams: Promise<{ turno?: string }> }) {
  const { turno: id } = await searchParams;
  if (!id) notFound();

  // Nada de lo que diga la URL sobre el pago se toma como cierto: se consulta a Mercado Pago.
  await sincronizarPago(id);
  const turno = await obtenerTurno(id);
  if (!turno) notFound();

  const pago = turno.pagos[0];
  const vigente = turno.estado === "ESPERANDO_PAGO" && !!turno.venceEn && turno.venceEn > new Date();
  const sinTurno = !!pago?.requiereDevolucion;
  const cancelado = turno.estado === "CANCELADO";

  const Icono = vigente ? Clock : sinTurno || cancelado ? XCircle : CheckCircle2;
  const claseIcono = vigente ? "text-alerta" : sinTurno || cancelado ? "text-peligro" : "text-exito";
  const nombre = turno.cliente.nombre.split(" ")[0];
  const titulo = vigente ? "Estamos esperando tu pago" : sinTurno ? "Recibimos tu pago, pero…" : cancelado ? "No se completó el pago" : `¡Listo, ${nombre}!`;
  const confirmado = turno.estado === "CONFIRMADO" || turno.estado === "EN_CURSO" || turno.estado === "COMPLETADO";

  return (
    <div className={`${tarjeta} space-y-5 p-6 text-center`}>
      <Icono className={`mx-auto size-14 ${claseIcono}`} aria-hidden />
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-extrabold">{titulo}</h1>
        {vigente && <p className="text-texto-suave">Cuando Mercado Pago nos avise, tu turno queda confirmado.</p>}
        {!vigente && !sinTurno && !cancelado && (
          <p className="text-texto-suave">{confirmado ? `Tu turno quedó confirmado${pago ? ` con la seña de ${pesos(pago.monto)}` : ""}.` : "Tu turno quedó reservado."}</p>
        )}
      </div>

      {sinTurno && (
        <Aviso tono="alerta">
          El horario ya no estaba disponible, así que el turno no se pudo confirmar. Comunicate con el local para que te devuelvan la seña.
        </Aviso>
      )}
      {cancelado && !sinTurno && (
        <Aviso tono="alerta">El pago no se completó y el horario se liberó. Podés sacar un turno nuevo.</Aviso>
      )}

      {!cancelado && !sinTurno && (
        <dl className="mx-auto grid max-w-sm grid-cols-2 gap-4 rounded-lg bg-marca/15 p-4 text-left text-sm">
          <div className="col-span-2">
            <dt className="text-xs text-texto-suave">Servicio</dt>
            <dd className="font-semibold">{turno.servicio.nombre}</dd>
          </div>
          <div>
            <dt className="text-xs text-texto-suave">Día</dt>
            <dd className="font-semibold">{formatearFecha(fechaLocal(turno.inicio))}</dd>
          </div>
          <div>
            <dt className="text-xs text-texto-suave">Hora</dt>
            <dd className="font-semibold">{formatearHora(turno.inicio)} hs</dd>
          </div>
        </dl>
      )}

      {vigente && (
        <div className="flex flex-wrap justify-center gap-2">
          <Link href={`/reservar/confirmado?turno=${turno.id}`} className={boton.primario}>Ya pagué, actualizar</Link>
          {pago?.mpInitPoint && <a href={pago.mpInitPoint} className={boton.secundario}>Volver a pagar</a>}
        </div>
      )}

      {!vigente && !cancelado && !sinTurno && (
        <p className="text-sm text-texto-suave">Si necesitás cambiarlo o cancelarlo, comunicate con el local. La seña no se devuelve.</p>
      )}
      {!vigente && <Link href="/reservar" className={boton.secundario}>Sacar otro turno</Link>}
    </div>
  );
}
```

- [ ] **Step 5: Verificar**

Run: `npm run typecheck && npm test`
Expected: typecheck limpio (se resuelve el error pendiente de las tareas 7–9) y todos los tests pasan. Si `Aviso` no admite `tono="alerta"` o `pesos` no acepta `Decimal`, revisar `src/components/ui/index.tsx` y `src/lib/formato.ts` y ajustar (ambos ya se usan así en el repo).

- [ ] **Step 6: Commit**

```bash
git add "src/app/(publico)/reservar"
git commit -m "feat: la reserva publica pide la sena y la confirmacion consulta a Mercado Pago"
```

---

### Task 11: Panel: seña pagada, vencimientos, pagos para devolver y seña por servicio

**Files:**
- Modify: `src/app/(panel)/turnos/page.tsx`
- Modify: `src/app/(panel)/turnos/acciones.ts`
- Modify: `src/app/(panel)/page.tsx`
- Modify: `src/app/(panel)/servicios/page.tsx`

**Interfaces:**
- Consumes: `liberarVencidos`, `listarPagosParaDevolver`, `marcarDevuelto` (Tareas 6 y 8); `calcularSena` (Tarea 2); `listarTurnosDelDia` ya trae `pagos` y `venceEn` (Tarea 6).
- Produces: Server Action `marcarPagoDevuelto(pagoId: string): Promise<void>`.

- [ ] **Step 1: Agregar la acción en `turnos/acciones.ts`**

Agregar el import `import { marcarDevuelto } from "@/modules/pagos/pagos.service";` y al final del archivo:

```ts
export async function marcarPagoDevuelto(pagoId: string) {
  await verificarSesion();
  await marcarDevuelto(pagoId);
  revalidatePath("/");
}
```

- [ ] **Step 2: Agenda (`turnos/page.tsx`)**

Agregar los imports `import { pesos } from "@/lib/formato";` y `import { liberarVencidos } from "@/modules/pagos/pagos.service";`.

Después de `await verificarSesion();` agregar:

```ts
  await liberarVencidos();
```

Dentro de `<div className="flex flex-wrap items-center gap-2">` (el que muestra el servicio y la insignia de estado), después de la `Insignia` del estado, agregar:

```tsx
                      {t.pagos[0] && <Insignia tono="exito">Seña pagada {pesos(t.pagos[0].monto)}</Insignia>}
                      {t.estado === "ESPERANDO_PAGO" && t.venceEn && (
                        <span className="text-xs text-texto-suave">vence a las {formatearHora(t.venceEn)}</span>
                      )}
```

- [ ] **Step 3: Inicio (`page.tsx`)**

Agregar los imports `import { marcarPagoDevuelto } from "./turnos/acciones";`, `import { BotonEnviar } from "@/components/ui/cliente";`, `import { pesos } from "@/lib/formato";` y `import { liberarVencidos, listarPagosParaDevolver } from "@/modules/pagos/pagos.service";`; sumar `Undo2` al import de `lucide-react`.

Después de `await connection();` agregar `await liberarVencidos();` y reemplazar la línea de `Promise.all` por:

```ts
  const [turnos, stockBajo, aDevolver] = await Promise.all([listarTurnosDelDia(fecha), cristalesConStockBajo(), listarPagosParaDevolver()]);
```

Justo antes del `<div className="grid grid-cols-3 ...">` de las estadísticas, agregar:

```tsx
      {aDevolver.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold">Pagos para devolver</h2>
          <ul className={`${tarjeta} divide-y divide-borde overflow-hidden`}>
            {aDevolver.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                <Undo2 className="size-4 shrink-0 text-alerta" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    {p.turno.cliente.nombre} · {pesos(p.monto)}
                  </span>
                  <span className="block text-xs text-texto-suave">
                    {p.turno.servicio.nombre} · {p.motivoDevolucion}
                  </span>
                </span>
                <form action={marcarPagoDevuelto.bind(null, p.id)}>
                  <BotonEnviar variante="secundario" className={boton.chico}>Ya lo devolví</BotonEnviar>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
```

(importar también `boton` desde `@/components/ui`).

- [ ] **Step 4: Servicios (`servicios/page.tsx`)**

Agregar los imports `import { pesos } from "@/lib/formato";` y `import { calcularSena } from "@/modules/pagos/sena";`.

Después del `<div className="flex flex-wrap gap-x-5 ...">` de duración y capacidad, agregar:

```tsx
                {(() => {
                  const sena = calcularSena(s.precioBase);
                  return sena === null ? (
                    <p className="text-xs text-texto-suave">Sin precio: se reserva sin seña.</p>
                  ) : (
                    <p className="text-xs text-texto-suave">Seña al reservar: <strong>{pesos(sena)}</strong></p>
                  );
                })()}
```

- [ ] **Step 5: Verificar**

Run: `npm run typecheck && npm test`
Expected: sin errores; el test de `guardia-acciones` sigue verde (la acción nueva empieza con `await verificarSesion()`). Revisar los imports duplicados que `typecheck` o ESLint marquen.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(panel)"
git commit -m "feat: el panel muestra la sena pagada, los vencimientos y los pagos para devolver"
```

---

### Task 12: Verificación contra la base, documentación y prueba en el sandbox

**Files:**
- Create (temporal, se borra al final): `verificar-sena.tmp.ts`
- Modify: `docs/ARQUITECTURA.md`
- Modify: `README.md`

- [ ] **Step 1: Escribir el script de verificación (temporal)**

`verificar-sena.tmp.ts` en la raíz. Crea un servicio de prueba con precio, recorre los casos y deja todo limpio:

```ts
import { db } from "@/lib/db";
import { aplicarPagoMp } from "@/modules/pagos/pagos.service";
import { liberarVencidos } from "@/modules/pagos/pagos.service";
import { CondicionesNoAceptadasError, obtenerDisponibilidad, reservarTurno } from "@/modules/turnos/servicio.service";
import { hoy, sumarDias } from "@/lib/tiempo";

const NOMBRE = "ZZ prueba seña";
let n = 0;
const pagoMp = (referencia: string, o: Record<string, unknown> = {}) => ({ id: `t${Date.now()}${n++}`, estado: "approved", monto: 5000, moneda: "ARS", referencia, ...o });
const datos = (servicioId: string, inicio: Date, tel: string) => ({ servicioId, inicio: inicio.toISOString(), cliente: { nombre: "Prueba Seña", telefono: tel } });

async function main() {
  const servicio = await db.servicio.create({
    data: {
      nombre: NOMBRE, slug: "zz-prueba-sena", duracionMinutos: 60, intervaloMinutos: 60, capacidad: 1, anticipacionMinutos: 0, precioBase: 10000,
      horarios: { create: [0, 1, 2, 3, 4, 5, 6].map((d) => ({ diaSemana: d, horaInicio: 8 * 60, horaFin: 20 * 60 })) },
    },
  });
  const sinPrecio = await db.servicio.create({
    data: { nombre: `${NOMBRE} 2`, slug: "zz-prueba-sena-2", duracionMinutos: 60, intervaloMinutos: 60, capacidad: 1, anticipacionMinutos: 0, horarios: { create: [0, 1, 2, 3, 4, 5, 6].map((d) => ({ diaSemana: d, horaInicio: 8 * 60, horaFin: 20 * 60 })) } },
  });
  const salida: string[] = [];
  const ver = async (turnoId: string) => {
    const t = await db.turno.findUniqueOrThrow({ where: { id: turnoId }, include: { pagos: true } });
    return `${t.estado} | pago ${t.pagos[0]?.estado ?? "-"}${t.pagos[0]?.requiereDevolucion ? " (a devolver)" : ""}`;
  };

  try {
    const dia = sumarDias(hoy(), 3);
    const [h1, h2, h3, h4] = await obtenerDisponibilidad(servicio.id, dia);

    // 1. Sin aceptar las condiciones no se reserva
    try { await reservarTurno(datos(servicio.id, h1.inicio, "3834000001")); salida.push("1. ERROR: reservó sin aceptar"); }
    catch (e) { salida.push(`1. sin aceptar condiciones -> ${e instanceof CondicionesNoAceptadasError ? "rechazado (ok)" : "ERROR " + e}`); }

    // 2. Con seña: nace ESPERANDO_PAGO, la seña es el 50 %
    const a = await reservarTurno(datos(servicio.id, h1.inicio, "3834000001"), { aceptoCondiciones: true });
    const pagoA = await db.pago.findUniqueOrThrow({ where: { id: a.pagoId! } });
    salida.push(`2. reserva con seña -> ${await ver(a.turno.id)} | monto ${pagoA.monto} | vence ${a.turno.venceEn?.toISOString()}`);

    // 3. El horario retenido ya no se ofrece
    salida.push(`3. horario retenido ofrecido otra vez: ${(await obtenerDisponibilidad(servicio.id, dia)).some((t) => t.inicio.getTime() === h1.inicio.getTime())}`);

    // 4. Pago aprobado a tiempo confirma; el aviso repetido no cambia nada
    salida.push(`4a. aprobado -> ${(await aplicarPagoMp(pagoMp(a.pagoId!, { monto: 5000, id: "idA" }) as never)).tipo} | ${await ver(a.turno.id)}`);
    salida.push(`4b. aviso repetido -> ${(await aplicarPagoMp(pagoMp(a.pagoId!, { monto: 5000, id: "idA" }) as never)).tipo}`);
    salida.push(`4c. segundo pago distinto -> ${(await aplicarPagoMp(pagoMp(a.pagoId!, { monto: 5000, id: "idA2" }) as never)).tipo} | ${await ver(a.turno.id)}`);

    // 5. Monto distinto: no confirma, queda para devolver
    const b = await reservarTurno(datos(servicio.id, h2.inicio, "3834000002"), { aceptoCondiciones: true });
    salida.push(`5. monto distinto -> ${(await aplicarPagoMp(pagoMp(b.pagoId!, { monto: 100 }) as never)).tipo} | ${await ver(b.turno.id)}`);

    // 6. Vence: el horario se libera solo y el barrido cancela
    const c = await reservarTurno(datos(servicio.id, h3.inicio, "3834000003"), { aceptoCondiciones: true });
    await db.turno.update({ where: { id: c.turno.id }, data: { venceEn: new Date(Date.now() - 1000) } });
    salida.push(`6a. vencido, antes del barrido, horario libre: ${(await obtenerDisponibilidad(servicio.id, dia)).some((t) => t.inicio.getTime() === h3.inicio.getTime())}`);
    salida.push(`6b. barrido canceló ${await liberarVencidos()} turno(s) -> ${await ver(c.turno.id)}`);

    // 7. Pago tardío con el horario libre: confirma
    salida.push(`7. pago tardío, horario libre -> ${(await aplicarPagoMp(pagoMp(c.pagoId!) as never)).tipo} | ${await ver(c.turno.id)}`);

    // 8. Pago tardío con el horario tomado: a devolver
    const d = await reservarTurno(datos(servicio.id, h4.inicio, "3834000004"), { aceptoCondiciones: true });
    await db.turno.update({ where: { id: d.turno.id }, data: { venceEn: new Date(Date.now() - 1000) } });
    await liberarVencidos();
    await reservarTurno(datos(servicio.id, h4.inicio, "3834000005"), { aceptoCondiciones: true }); // otro cliente toma el horario
    salida.push(`8. pago tardío, horario tomado -> ${(await aplicarPagoMp(pagoMp(d.pagoId!) as never)).tipo} | ${await ver(d.turno.id)}`);

    // 9. Personal con sesión: sin seña
    const e = await reservarTurno(datos(sinPrecio.id, (await obtenerDisponibilidad(sinPrecio.id, dia))[0].inicio, "3834000006"));
    salida.push(`9a. servicio sin precio -> ${await ver(e.turno.id)}`);
    const f = await reservarTurno(datos(servicio.id, (await obtenerDisponibilidad(servicio.id, dia))[0].inicio, "3834000007"), { omitirSena: true });
    salida.push(`9b. cargado por el personal -> ${await ver(f.turno.id)}`);

    console.log(salida.join("\n"));
  } finally {
    const ids = [servicio.id, sinPrecio.id];
    await db.pago.deleteMany({ where: { turno: { servicioId: { in: ids } } } });
    await db.turno.deleteMany({ where: { servicioId: { in: ids } } });
    await db.cliente.deleteMany({ where: { telefono: { startsWith: "38340000" } } });
    await db.servicio.deleteMany({ where: { id: { in: ids } } });
    await db.$disconnect();
  }
}
main();
```

- [ ] **Step 2: Correrlo**

Run: `npx tsx --env-file=.env verificar-sena.tmp.ts`
Expected (cada línea):
- `1. … rechazado (ok)`
- `2. … ESPERANDO_PAGO | pago PENDIENTE | monto 5000.00`
- `3. … false`
- `4a. … confirmado | CONFIRMADO | pago APROBADO`; `4b. … ignorado`; `4c. … a_devolver | CONFIRMADO | pago APROBADO (a devolver)`
- `5. … a_devolver | CANCELADO | pago APROBADO (a devolver)`
- `6a. … true`; `6b. barrido canceló 1 turno(s) -> CANCELADO | pago VENCIDO`
- `7. … confirmado | CONFIRMADO | pago APROBADO`
- `8. … a_devolver | CANCELADO | pago APROBADO (a devolver)`
- `9a. … PENDIENTE | pago -`; `9b. … PENDIENTE | pago -`

Si algo difiere, corregir el código de la tarea que corresponda (no el script) y volver a correrlo. Al terminar: `rm verificar-sena.tmp.ts` y `git status` limpio de archivos temporales.

- [ ] **Step 3: Documentar en `docs/ARQUITECTURA.md`**

Agregar, después de la sección "Acceso y sesión", una sección "Seña con Mercado Pago" que resuma: la regla (50 % del `precioBase`, sin precio no hay seña, 8 minutos de retención, la seña no se devuelve), el estado `ESPERANDO_PAGO`, la tabla `pagos`, el flujo (reserva → preferencia → Mercado Pago → retorno + webhook → `aplicarPagoMp`), el pago tardío y los pagos para devolver, que el personal con sesión reserva sin seña, y las variables `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `APP_URL`. Agregar a la lista de pantallas que `/reservar` cobra seña y que `/api/mercadopago/webhook` es pública. En "Pendiente", agregar: "Los servicios sin precio base se reservan sin seña y sin ningún freno contra reservas falsas" y "Devolución automática de la seña".

- [ ] **Step 4: Documentar en `README.md`**

Agregar una sección "Mercado Pago" con: crear la aplicación y las credenciales de prueba en el panel de desarrolladores, completar `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` y `APP_URL` en `.env`, configurar el webhook (evento "Pagos") apuntando a `<APP_URL>/api/mercadopago/webhook`, y que en desarrollo local hace falta un túnel https (ngrok o cloudflared) para recibir avisos; sin túnel el pago se confirma igual al volver el cliente a la página de confirmación.

- [ ] **Step 5: Prueba de punta a punta en el sandbox de Mercado Pago (manual, con el usuario)**

Con credenciales de prueba y la app corriendo (con túnel https en `APP_URL` si se quiere probar el webhook):
1. Reservar un servicio con precio desde `/reservar` sin sesión: se ve la seña, la casilla y el botón "Pagar seña de $X"; sin tildar la casilla no avanza.
2. Pagar con la tarjeta de prueba aprobada → vuelve a `/reservar/confirmado` y dice "confirmado con la seña de $X"; en `/turnos` el turno figura `Confirmado` con "Seña pagada".
3. Pagar con la tarjeta de prueba rechazada → "Estamos esperando tu pago" con "Volver a pagar".
4. Reservar y abandonar sin pagar → pasados 8 minutos el horario vuelve a aparecer en `/reservar`.
5. Confirmar que la cabecera `x-signature` real valida (si el webhook devuelve 401 con una notificación legítima, contrastar el formato del mensaje firmado de `firma.ts` con la documentación vigente de Mercado Pago y corregirlo).
6. Iniciar sesión en el panel y reservar desde "Nuevo turno": no pide seña y el turno queda `Pendiente`.

- [ ] **Step 6: Verificación final**

Run: `npm run typecheck && npm test`
Expected: typecheck limpio y todos los tests pasan (166 anteriores + los nuevos de las tareas 2 a 5 y 9).

- [ ] **Step 7: Commit**

```bash
git add docs/ARQUITECTURA.md README.md
git commit -m "docs: sena con Mercado Pago (arquitectura y configuracion)"
```
