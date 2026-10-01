# Editar y cancelar reservas, y "Buscar tu reserva" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el personal pueda editar y cancelar reservas desde el panel, y que el cliente pueda encontrar su reserva en el portal con cualquiera de varios datos (alcanza con uno) y cancelarla.

**Architecture:** Las reglas (normalizar criterios, coincidencia, enmascarado, verificación de contacto, estados editables, código de reserva) son funciones puras con tests. La edición vive en `turno.service.ts` dentro de una transacción con el bloqueo por servicio que ya usan las reservas. La búsqueda y la cancelación del cliente viven en un servicio nuevo y se exponen por Server Actions públicas (POST, sin datos personales en la dirección). Los contadores de protección reutilizan la tabla `intentos_login`.

**Tech Stack:** Next.js 16 (App Router, Server Actions), Prisma 7 + PostgreSQL, Zod, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-01-reservas-editar-cancelar-design.md`

## Global Constraints

- Estados editables: solo `PENDIENTE`, `CONFIRMADO` y `EN_CURSO`. Estados que el portal busca y cancela: `PENDIENTE`, `CONFIRMADO` y `ESPERANDO_PAGO`, con inicio posterior a ahora.
- La búsqueda del portal nunca muestra datos si hay **más de una** coincidencia, nunca muestra mail, precio, cristal ni notas, y siempre tapa nombre, teléfono y patente.
- **Decisión del implementador (no estaba en la spec):** el servicio y el día **solos no alcanzan** para buscar; hace falta al menos un dato identificatorio (código, nombre, teléfono, mail, patente o vehículo). Motivo: con solo servicio y día, un turno único dejaría ver los datos tapados de un desconocido. Se puede relajar cambiando una constante.
- Cancelar como cliente exige escribir el teléfono (mínimo 8 dígitos coincidentes) o el mail completos de la reserva. Tras 5 intentos fallidos para el mismo turno, bloqueo de 15 minutos (`registrarFallo` / `minutosDeBloqueo` de `src/modules/usuarios/limite.ts`, clave `cancelar:<id del turno>` en `intentos_login`). Tope de 20 búsquedas por minuto en todo el sitio (clave `busqueda:<minuto>`).
- La seña no se recalcula ni se devuelve al editar o cancelar. Editar nunca toca los pagos.
- Textos de interfaz en español rioplatense (voseo). Sin dependencias nuevas.
- Cada Server Action del panel empieza con `await verificarSesion()` (lo exige `src/guardia-acciones.test.ts`). Las acciones de `src/app/(publico)/reservar/acciones.ts` son públicas a propósito y validan todo del lado del servidor.
- Antes de usar APIs de Next que no estén ya usadas en el repo, leer `node_modules/next/dist/docs/`.
- El repo no tiene tests de integración con base de datos: lo puro se prueba con Vitest y lo que toca Prisma con typecheck más el script de la Tarea 8.
- Migraciones: `npx prisma migrate dev` no funciona con la base embebida. Esta migración se escribe a mano (lleva un `UPDATE` para completar datos existentes); se aplica con `npx prisma migrate deploy` y luego `npx prisma generate`. La base embebida se levanta con `npx prisma dev --name local --detach` (se cae si se detiene el servidor con su árbol de procesos; volver a levantarla).
- Rama `feature/reservas-editar-cancelar` (sale de `main`). Un commit por tarea, cada uno terminado con `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Review Focus

Condiciones que la especificación implica y que ninguna tarea cubre por sí sola. Cada una tiene su prueba en la tarea indicada.

1. Buscar con espacios o campos vacíos, o con solo servicio y/o día → error "Completá al menos un dato", sin listar nada. Prueba: Tarea 1 (`normalizarCriterios`).
2. Buscar con un teléfono de menos de 6 dígitos, o un nombre o vehículo de menos de 3 letras → no coincide con nada (no devuelve coincidencias masivas). Prueba: Tarea 1.
3. Un cliente con dos turnos vigentes buscado por su teléfono → "varias", sin mostrar nada. Prueba: script de la Tarea 8 (caso 5).
4. Cancelar con un contacto incorrecto no revela si el teléfono o el mail son los correctos (mensaje genérico) y bloquea tras 5 intentos, incluso si el sexto es correcto. Prueba: script de la Tarea 8 (caso 6).
5. Editar un turno a un horario ocupado por otro → rechazo; editar sin cambiar servicio ni horario funciona aunque la grilla de turnos haya cambiado. Prueba: script de la Tarea 8 (casos 2 y 3).
6. Cambiar el teléfono a uno que ya pertenece a otro cliente mueve el turno sin pisar el nombre de ese cliente. Prueba: script de la Tarea 8 (caso 4).
7. Cancelar dos veces el mismo turno → la segunda dice que no se encontró la reserva (no se rompe). Prueba: script de la Tarea 8 (caso 7).
8. Editar un turno que se completó o canceló entre que se abrió la pantalla y se guardó → rechazo. Prueba: script de la Tarea 8 (caso 8).
9. Los turnos que ya existían se encuentran por su código completado en la migración. Prueba: Tarea 2 (paso 4).

---

### Task 1: Reglas puras: código, búsqueda, enmascarado, tope y edición

**Files:**
- Create: `src/modules/turnos/codigo.ts`, `src/modules/turnos/codigo.test.ts`
- Create: `src/modules/turnos/busqueda.ts`, `src/modules/turnos/busqueda.test.ts`
- Create: `src/modules/turnos/tope.ts`, `src/modules/turnos/tope.test.ts`
- Create: `src/modules/turnos/edicion.ts`, `src/modules/turnos/edicion.test.ts`

**Interfaces (producidas):**
- `codigo.ts`: `ALFABETO_CODIGO`, `LARGO_CODIGO = 6`, `generarCodigo(azar?: (max: number) => number): string`, `normalizarCodigo(texto: string): string`, `esCodigoValido(codigo: string): boolean`.
- `busqueda.ts`: `CAMPOS_BUSQUEDA`, `type CampoBusqueda`, `type Criterios`, `class SinCriteriosError`, `sinTildes`, `soloDigitos`, `normalizarPatente`, `normalizarCriterios(entrada)`, `telefonoCoincide(guardado, ingresado, minimo?)`, `contactoCoincide(guardado: { telefono: string; email: string | null }, ingresado: string)`, `interface TurnoBuscable`, `coincideConCriterios(t, c)`, `resolverBusqueda(turnos, c)`, `tapadoNombre`, `tapadoTelefono`, `tapadoPatente`, `etiquetaEstadoCliente(estado)`, `interface ReservaVisible`, `aReservaVisible(t)`, `ESTADOS_BUSCABLES`, `type RespuestaBusqueda`, `type RespuestaCancelacion`.
- `tope.ts`: `TOPE_BUSQUEDAS_POR_MINUTO = 20`, `claveBusqueda(ahora: Date): string`, `superaTope(conteo: number): boolean`.
- `edicion.ts`: `ESTADOS_EDITABLES`, `puedeEditar(estado)`, `cambiaAgenda(actual, nuevo)`.

- [ ] **Step 1: Tests de `codigo` y `tope` y `edicion` (fallan)**

`src/modules/turnos/codigo.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ALFABETO_CODIGO, esCodigoValido, generarCodigo, LARGO_CODIGO, normalizarCodigo } from "./codigo";

describe("generarCodigo", () => {
  it("genera 6 caracteres del alfabeto sin 0, O, 1 ni I", () => {
    for (let i = 0; i < 200; i++) {
      const c = generarCodigo();
      expect(c).toHaveLength(LARGO_CODIGO);
      for (const ch of c) expect(ALFABETO_CODIGO.includes(ch)).toBe(true);
    }
    expect(ALFABETO_CODIGO).not.toMatch(/[01OI]/);
  });

  it("usa el generador de azar que se le inyecta", () => {
    expect(generarCodigo(() => 0)).toBe("AAAAAA");
    expect(generarCodigo((max) => max - 1)).toBe("999999".replace(/9/g, ALFABETO_CODIGO.at(-1)!));
  });
});

describe("normalizarCodigo y esCodigoValido", () => {
  it("ignora espacios y mayúsculas", () => {
    expect(normalizarCodigo("  k7q2 xa ")).toBe("K7Q2XA");
  });

  it("acepta los de 6 letras o números, también los hexadecimales de los turnos que ya existían", () => {
    expect(esCodigoValido("K7Q2XA")).toBe(true);
    expect(esCodigoValido("1A2B3C")).toBe(true);
  });

  it("rechaza largos distintos y caracteres raros", () => {
    for (const c of ["", "K7Q2X", "K7Q2XAB", "K7Q-XA", "k7q2xa", "ÑK7Q2X"]) expect(esCodigoValido(c), c).toBe(false);
  });
});
```

`src/modules/turnos/tope.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { claveBusqueda, superaTope, TOPE_BUSQUEDAS_POR_MINUTO } from "./tope";

describe("claveBusqueda", () => {
  it("es la misma durante todo un minuto y cambia al siguiente", () => {
    const a = claveBusqueda(new Date("2026-10-01T15:00:01Z"));
    expect(claveBusqueda(new Date("2026-10-01T15:00:59Z"))).toBe(a);
    expect(claveBusqueda(new Date("2026-10-01T15:01:00Z"))).not.toBe(a);
    expect(a).toBe("busqueda:2026-10-01T15:00");
  });
});

describe("superaTope", () => {
  it("permite hasta el tope y corta al pasarse", () => {
    expect(TOPE_BUSQUEDAS_POR_MINUTO).toBe(20);
    expect(superaTope(20)).toBe(false);
    expect(superaTope(21)).toBe(true);
  });
});
```

`src/modules/turnos/edicion.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { cambiaAgenda, ESTADOS_EDITABLES, puedeEditar } from "./edicion";

describe("puedeEditar", () => {
  it("solo se editan los turnos pendientes, confirmados y en curso", () => {
    expect(ESTADOS_EDITABLES).toEqual(["PENDIENTE", "CONFIRMADO", "EN_CURSO"]);
    for (const e of ["PENDIENTE", "CONFIRMADO", "EN_CURSO"] as const) expect(puedeEditar(e), e).toBe(true);
    for (const e of ["ESPERANDO_PAGO", "COMPLETADO", "CANCELADO", "AUSENTE"] as const) expect(puedeEditar(e), e).toBe(false);
  });
});

describe("cambiaAgenda", () => {
  const actual = { servicioId: "s1", inicio: new Date("2026-10-05T13:00:00Z") };

  it("no hay cambio si el servicio y el horario son los mismos", () => {
    expect(cambiaAgenda(actual, { servicioId: "s1", inicio: new Date("2026-10-05T13:00:00Z") })).toBe(false);
  });

  it("hay cambio si cambia el servicio o el horario", () => {
    expect(cambiaAgenda(actual, { servicioId: "s2", inicio: actual.inicio })).toBe(true);
    expect(cambiaAgenda(actual, { servicioId: "s1", inicio: new Date("2026-10-05T14:00:00Z") })).toBe(true);
  });
});
```

- [ ] **Step 2: Verlos fallar**

Run: `npx vitest run src/modules/turnos/codigo.test.ts src/modules/turnos/tope.test.ts src/modules/turnos/edicion.test.ts`
Expected: FAIL (no se pueden resolver los módulos).

- [ ] **Step 3: Implementar `codigo.ts`, `tope.ts` y `edicion.ts`**

`src/modules/turnos/codigo.ts`:

```ts
import { randomInt } from "node:crypto";

// Código corto y legible para que el cliente busque o cancele su reserva. Sin 0, O, 1 ni I para no confundir.
export const ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const LARGO_CODIGO = 6;

/** `azar(max)` devuelve un entero en [0, max): se inyecta para poder probarlo. */
export function generarCodigo(azar: (max: number) => number = (max) => randomInt(max)): string {
  let codigo = "";
  for (let i = 0; i < LARGO_CODIGO; i++) codigo += ALFABETO_CODIGO[azar(ALFABETO_CODIGO.length)];
  return codigo;
}

export const normalizarCodigo = (texto: string): string => texto.trim().toUpperCase().replace(/\s+/g, "");

/** Acepta los códigos nuevos y los hexadecimales con que se completaron los turnos que ya existían. */
export const esCodigoValido = (codigo: string): boolean => /^[A-Z0-9]{6}$/.test(codigo);
```

`src/modules/turnos/tope.ts`:

```ts
// Puro. Tope de búsquedas del portal: se cuentan por minuto en todo el sitio.

export const TOPE_BUSQUEDAS_POR_MINUTO = 20;

/** Clave del contador del minuto de `ahora` (en UTC, "busqueda:2026-10-01T15:00"). */
export const claveBusqueda = (ahora: Date): string => `busqueda:${ahora.toISOString().slice(0, 16)}`;

export const superaTope = (conteo: number): boolean => conteo > TOPE_BUSQUEDAS_POR_MINUTO;
```

`src/modules/turnos/edicion.ts`:

```ts
import type { EstadoTurno } from "@/generated/prisma/client";

// Puro. Reglas para editar un turno desde el panel.

/** No se editan los completados, cancelados ni ausentes (rompería el stock y el historial) ni los que esperan el pago. */
export const ESTADOS_EDITABLES: EstadoTurno[] = ["PENDIENTE", "CONFIRMADO", "EN_CURSO"];

export const puedeEditar = (estado: EstadoTurno): boolean => ESTADOS_EDITABLES.includes(estado);

/** Hay que revalidar la disponibilidad solo si cambia el servicio o el horario. */
export function cambiaAgenda(
  actual: { servicioId: string; inicio: Date },
  nuevo: { servicioId: string; inicio: Date },
): boolean {
  return actual.servicioId !== nuevo.servicioId || actual.inicio.getTime() !== nuevo.inicio.getTime();
}
```

- [ ] **Step 4: Verlos pasar**

Run: `npx vitest run src/modules/turnos/codigo.test.ts src/modules/turnos/tope.test.ts src/modules/turnos/edicion.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Test de `busqueda` (falla)**

`src/modules/turnos/busqueda.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  aReservaVisible,
  coincideConCriterios,
  contactoCoincide,
  etiquetaEstadoCliente,
  normalizarCriterios,
  resolverBusqueda,
  SinCriteriosError,
  tapadoNombre,
  tapadoPatente,
  tapadoTelefono,
  telefonoCoincide,
  type TurnoBuscable,
} from "./busqueda";

const turno = (o: Partial<TurnoBuscable> = {}): TurnoBuscable => ({
  id: "t1",
  codigo: "K7Q2XA",
  servicioId: "s1",
  servicioNombre: "Lavados",
  inicio: new Date("2026-10-05T13:00:00Z"), // 10:00 en Catamarca
  estado: "CONFIRMADO",
  nombre: "Valentino Mezzavilla",
  telefono: "383 4123456",
  email: "Valen@Example.com",
  patente: "AB 123 CD",
  vehiculo: "Toyota Hilux 2019",
  senaPagada: true,
  ...o,
});

describe("normalizarCriterios", () => {
  it("se queda solo con lo que se completó, ya normalizado", () => {
    expect(normalizarCriterios({ codigo: " k7q2 xa ", nombre: "  Valentíno ", telefono: "(383) 412-3456", email: " VALEN@x.com ", patente: "ab-123 cd", vehiculo: "HILUX" })).toEqual({
      codigo: "K7Q2XA",
      nombre: "valentino",
      telefono: "3834123456",
      email: "valen@x.com",
      patente: "AB123CD",
      vehiculo: "hilux",
    });
  });

  it("con un solo dato alcanza", () => {
    expect(normalizarCriterios({ patente: "ab123cd" })).toEqual({ patente: "AB123CD" });
  });

  it("sin datos, o solo con espacios, falla", () => {
    expect(() => normalizarCriterios({})).toThrow(SinCriteriosError);
    expect(() => normalizarCriterios({ nombre: "   ", telefono: "---", codigo: "" })).toThrow(SinCriteriosError);
  });

  it("el servicio y el día solos no alcanzan: hace falta un dato que identifique", () => {
    expect(() => normalizarCriterios({ servicioId: "s1" })).toThrow(SinCriteriosError);
    expect(() => normalizarCriterios({ fecha: "2026-10-05" })).toThrow(SinCriteriosError);
    expect(() => normalizarCriterios({ servicioId: "s1", fecha: "2026-10-05" })).toThrow(SinCriteriosError);
    expect(normalizarCriterios({ servicioId: "s1", fecha: "2026-10-05", nombre: "ana" })).toEqual({ servicioId: "s1", fecha: "2026-10-05", nombre: "ana" });
  });

  it("una fecha mal escrita se ignora", () => {
    expect(() => normalizarCriterios({ fecha: "5/10" })).toThrow(SinCriteriosError);
  });
});

describe("telefonoCoincide", () => {
  it("compara por dígitos y acepta que falte el prefijo", () => {
    expect(telefonoCoincide("383 4123456", "3834123456")).toBe(true);
    expect(telefonoCoincide("+54 9 383 412-3456", "383-4123456")).toBe(true);
    expect(telefonoCoincide("383 4123456", "4123456")).toBe(true);
  });

  it("no coincide con menos dígitos que el mínimo ni con otro número", () => {
    expect(telefonoCoincide("383 4123456", "23456")).toBe(false);
    expect(telefonoCoincide("383 4123456", "3834999999")).toBe(false);
  });
});

describe("coincideConCriterios", () => {
  it("con un solo criterio busca solo por ese", () => {
    expect(coincideConCriterios(turno(), { patente: "AB123CD" })).toBe(true);
    expect(coincideConCriterios(turno(), { patente: "ZZ999ZZ" })).toBe(false);
  });

  it("con varios criterios deben coincidir todos", () => {
    expect(coincideConCriterios(turno(), { patente: "AB123CD", nombre: "valentino" })).toBe(true);
    expect(coincideConCriterios(turno(), { patente: "AB123CD", nombre: "otra persona" })).toBe(false);
  });

  it("el nombre y el vehículo van por coincidencia parcial sin tildes, con al menos 3 letras", () => {
    expect(coincideConCriterios(turno({ nombre: "Valentíno Mezzavilla" }), { nombre: "mezza" })).toBe(true);
    expect(coincideConCriterios(turno(), { nombre: "va" })).toBe(false);
    expect(coincideConCriterios(turno(), { vehiculo: "hilux" })).toBe(true);
    expect(coincideConCriterios(turno(), { vehiculo: "to" })).toBe(false);
  });

  it("el código, el mail, el servicio y el día son exactos", () => {
    expect(coincideConCriterios(turno(), { codigo: "K7Q2XA" })).toBe(true);
    expect(coincideConCriterios(turno(), { codigo: "K7Q2XB" })).toBe(false);
    expect(coincideConCriterios(turno(), { email: "valen@example.com" })).toBe(true);
    expect(coincideConCriterios(turno({ email: null }), { email: "valen@example.com" })).toBe(false);
    expect(coincideConCriterios(turno(), { servicioId: "s2" })).toBe(false);
    expect(coincideConCriterios(turno(), { fecha: "2026-10-05" })).toBe(true);
    expect(coincideConCriterios(turno(), { fecha: "2026-10-06" })).toBe(false);
  });

  it("un turno sin patente no coincide con una patente", () => {
    expect(coincideConCriterios(turno({ patente: null }), { patente: "AB123CD" })).toBe(false);
  });
});

describe("resolverBusqueda", () => {
  const a = turno({ id: "a", codigo: "AAAAAA", nombre: "Ana López", telefono: "383 1111111" });
  const b = turno({ id: "b", codigo: "BBBBBB", nombre: "Bruno Díaz", telefono: "383 2222222" });

  it("ninguna coincidencia", () => {
    expect(resolverBusqueda([a, b], { nombre: "carlos" })).toEqual({ tipo: "ninguna" });
  });

  it("varias coincidencias: no devuelve ningún turno", () => {
    expect(resolverBusqueda([a, b], { patente: "AB123CD" })).toEqual({ tipo: "varias" });
  });

  it("una sola coincidencia: devuelve ese turno", () => {
    expect(resolverBusqueda([a, b], { telefono: "3832222222" })).toEqual({ tipo: "una", turno: b });
  });
});

describe("enmascarado", () => {
  it("nombre: el primero y la inicial del último apellido", () => {
    expect(tapadoNombre("Valentino Mezzavilla")).toBe("Valentino M.");
    expect(tapadoNombre("Ana María de los Ángeles Pérez")).toBe("Ana P.");
    expect(tapadoNombre("Ana")).toBe("Ana");
    expect(tapadoNombre("  ")).toBe("");
  });

  it("teléfono: solo los últimos 4 dígitos", () => {
    expect(tapadoTelefono("383 4123456")).toBe("****3456");
    expect(tapadoTelefono("123")).toBe("****");
  });

  it("patente: solo la primera y la última", () => {
    expect(tapadoPatente("AB 123 CD")).toBe("A*****D");
    expect(tapadoPatente("AB")).toBe("**");
    expect(tapadoPatente(null)).toBeNull();
  });
});

describe("aReservaVisible", () => {
  it("expone solo lo permitido, en hora de Catamarca y con los datos tapados", () => {
    const v = aReservaVisible(turno());
    expect(v).toEqual({
      codigo: "K7Q2XA",
      servicio: "Lavados",
      dia: "lunes 5 de octubre",
      hora: "10:00",
      estado: "Confirmada",
      senaPagada: true,
      nombre: "Valentino M.",
      telefono: "****3456",
      patente: "A*****D",
    });
    expect(Object.keys(v)).not.toContain("email");
    expect(JSON.stringify(v)).not.toContain("Example");
  });
});

describe("etiquetaEstadoCliente", () => {
  it("usa palabras para el cliente", () => {
    expect(etiquetaEstadoCliente("CONFIRMADO")).toBe("Confirmada");
    expect(etiquetaEstadoCliente("ESPERANDO_PAGO")).toBe("Esperando el pago");
    expect(etiquetaEstadoCliente("PENDIENTE")).toBe("Pendiente de confirmación");
  });
});

describe("contactoCoincide", () => {
  const guardado = { telefono: "383 4123456", email: "Valen@Example.com" };

  it("acepta el teléfono completo o el mail, sin importar formato ni mayúsculas", () => {
    expect(contactoCoincide(guardado, "3834123456")).toBe(true);
    expect(contactoCoincide(guardado, "+54 9 383 412-3456")).toBe(true);
    expect(contactoCoincide(guardado, " valen@example.COM ")).toBe(true);
  });

  it("rechaza un teléfono corto, otro número u otro mail", () => {
    expect(contactoCoincide(guardado, "4123456")).toBe(false);
    expect(contactoCoincide(guardado, "3834999999")).toBe(false);
    expect(contactoCoincide(guardado, "otro@example.com")).toBe(false);
  });

  it("si la reserva no tiene mail, un mail nunca coincide", () => {
    expect(contactoCoincide({ telefono: "383 4123456", email: null }, "valen@example.com")).toBe(false);
  });
});
```

- [ ] **Step 6: Verlo fallar**

Run: `npx vitest run src/modules/turnos/busqueda.test.ts`
Expected: FAIL (no se puede resolver `./busqueda`).

- [ ] **Step 7: Implementar `busqueda.ts`**

```ts
import type { EstadoTurno } from "@/generated/prisma/client";
import { fechaLocal, formatearFecha, formatearHora } from "@/lib/tiempo";
import { normalizarCodigo } from "./codigo";

// Puro. Búsqueda de reservas desde el portal: normalizar, comparar, tapar datos.

export const CAMPOS_BUSQUEDA = ["codigo", "nombre", "telefono", "email", "patente", "vehiculo", "servicioId", "fecha"] as const;
export type CampoBusqueda = (typeof CAMPOS_BUSQUEDA)[number];
export type Criterios = Partial<Record<CampoBusqueda, string>>;

/** Datos que identifican a una reserva. El servicio y el día solos no alcanzan (ver el plan). */
const IDENTIFICADORES: CampoBusqueda[] = ["codigo", "nombre", "telefono", "email", "patente", "vehiculo"];
const MIN_LETRAS = 3;
export const MIN_DIGITOS_BUSQUEDA = 6;
export const MIN_DIGITOS_VERIFICACION = 8;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

/** Estados que el portal busca y deja cancelar (siempre que el turno sea futuro). */
export const ESTADOS_BUSCABLES: EstadoTurno[] = ["PENDIENTE", "CONFIRMADO", "ESPERANDO_PAGO"];

export class SinCriteriosError extends Error {
  constructor() {
    super("Completá al menos un dato de la reserva (código, nombre, teléfono, mail, patente o vehículo)");
    this.name = "SinCriteriosError";
  }
}

export const sinTildes = (t: string): string =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
export const soloDigitos = (t: string): string => t.replace(/\D/g, "");
export const normalizarPatente = (t: string): string => t.replace(/[\s-]/g, "").toUpperCase();

/** Deja solo los criterios completados, ya normalizados. Lanza `SinCriteriosError` si no hay ningún dato que identifique. */
export function normalizarCriterios(entrada: Partial<Record<CampoBusqueda, string | undefined>>): Criterios {
  const c: Criterios = {};
  const codigo = entrada.codigo ? normalizarCodigo(entrada.codigo) : "";
  if (codigo) c.codigo = codigo;
  const nombre = entrada.nombre ? sinTildes(entrada.nombre) : "";
  if (nombre) c.nombre = nombre;
  const telefono = entrada.telefono ? soloDigitos(entrada.telefono) : "";
  if (telefono) c.telefono = telefono;
  const email = entrada.email?.trim().toLowerCase() ?? "";
  if (email) c.email = email;
  const patente = entrada.patente ? normalizarPatente(entrada.patente) : "";
  if (patente) c.patente = patente;
  const vehiculo = entrada.vehiculo ? sinTildes(entrada.vehiculo) : "";
  if (vehiculo) c.vehiculo = vehiculo;
  const servicioId = entrada.servicioId?.trim() ?? "";
  if (servicioId) c.servicioId = servicioId;
  const fecha = entrada.fecha?.trim() ?? "";
  if (FECHA.test(fecha)) c.fecha = fecha;

  if (!IDENTIFICADORES.some((campo) => c[campo] !== undefined)) throw new SinCriteriosError();
  return c;
}

/** Compara por dígitos y acepta que falte el prefijo (el guardado termina con lo ingresado). */
export function telefonoCoincide(guardado: string, ingresado: string, minimo = MIN_DIGITOS_BUSQUEDA): boolean {
  const buscado = soloDigitos(ingresado);
  if (buscado.length < minimo) return false;
  return soloDigitos(guardado).endsWith(buscado);
}

/** Verificación para cancelar: el teléfono (al menos 8 dígitos) o el mail completos de la reserva. */
export function contactoCoincide(guardado: { telefono: string; email: string | null }, ingresado: string): boolean {
  const texto = ingresado.trim();
  if (texto.includes("@")) return !!guardado.email && guardado.email.trim().toLowerCase() === texto.toLowerCase();
  return telefonoCoincide(guardado.telefono, texto, MIN_DIGITOS_VERIFICACION);
}

export interface TurnoBuscable {
  id: string;
  codigo: string;
  servicioId: string;
  servicioNombre: string;
  inicio: Date;
  estado: EstadoTurno;
  nombre: string;
  telefono: string;
  email: string | null;
  patente: string | null;
  vehiculo: string | null;
  senaPagada: boolean;
}

/** Todos los criterios completados deben coincidir (Y). */
export function coincideConCriterios(t: TurnoBuscable, c: Criterios): boolean {
  if (c.codigo !== undefined && normalizarCodigo(t.codigo) !== c.codigo) return false;
  if (c.nombre !== undefined && !(c.nombre.length >= MIN_LETRAS && sinTildes(t.nombre).includes(c.nombre))) return false;
  if (c.telefono !== undefined && !telefonoCoincide(t.telefono, c.telefono)) return false;
  if (c.email !== undefined && (t.email ?? "").trim().toLowerCase() !== c.email) return false;
  if (c.patente !== undefined && (t.patente === null || normalizarPatente(t.patente) !== c.patente)) return false;
  if (c.vehiculo !== undefined && !(c.vehiculo.length >= MIN_LETRAS && sinTildes(t.vehiculo ?? "").includes(c.vehiculo))) return false;
  if (c.servicioId !== undefined && t.servicioId !== c.servicioId) return false;
  if (c.fecha !== undefined && fechaLocal(t.inicio) !== c.fecha) return false;
  return true;
}

export type ResultadoResolucion =
  | { tipo: "ninguna" }
  | { tipo: "varias" }
  | { tipo: "una"; turno: TurnoBuscable };

export function resolverBusqueda(turnos: TurnoBuscable[], c: Criterios): ResultadoResolucion {
  const hallados = turnos.filter((t) => coincideConCriterios(t, c));
  if (hallados.length === 0) return { tipo: "ninguna" };
  if (hallados.length > 1) return { tipo: "varias" };
  return { tipo: "una", turno: hallados[0] };
}

export function tapadoNombre(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "";
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[partes.length - 1][0].toUpperCase()}.`;
}

export function tapadoTelefono(telefono: string): string {
  const d = soloDigitos(telefono);
  return d.length <= 4 ? "****" : `****${d.slice(-4)}`;
}

export function tapadoPatente(patente: string | null): string | null {
  if (!patente) return null;
  const p = normalizarPatente(patente);
  if (p.length <= 2) return "**";
  return `${p[0]}${"*".repeat(p.length - 2)}${p[p.length - 1]}`;
}

export function etiquetaEstadoCliente(estado: EstadoTurno): string {
  switch (estado) {
    case "CONFIRMADO":
      return "Confirmada";
    case "ESPERANDO_PAGO":
      return "Esperando el pago";
    default:
      return "Pendiente de confirmación";
  }
}

/** Lo único que el portal le muestra al cliente de una reserva. Nunca mail, precio, cristal ni notas. */
export interface ReservaVisible {
  codigo: string;
  servicio: string;
  dia: string;
  hora: string;
  estado: string;
  senaPagada: boolean;
  nombre: string;
  telefono: string;
  patente: string | null;
}

export function aReservaVisible(t: TurnoBuscable): ReservaVisible {
  return {
    codigo: t.codigo,
    servicio: t.servicioNombre,
    dia: formatearFecha(fechaLocal(t.inicio)),
    hora: formatearHora(t.inicio),
    estado: etiquetaEstadoCliente(t.estado),
    senaPagada: t.senaPagada,
    nombre: tapadoNombre(t.nombre),
    telefono: tapadoTelefono(t.telefono),
    patente: tapadoPatente(t.patente),
  };
}

/** Respuestas de las acciones del portal (viajan al navegador). */
export type RespuestaBusqueda =
  | { tipo: "inicial" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "ninguna" }
  | { tipo: "varias" }
  | { tipo: "una"; reserva: ReservaVisible };

export type RespuestaCancelacion =
  | { tipo: "cancelada"; teniaSena: boolean }
  | { tipo: "contacto_incorrecto" }
  | { tipo: "bloqueada"; minutos: number }
  | { tipo: "no_encontrada" };
```

Nota: el rango `[̀-ͯ]` del regex de `sinTildes` son los caracteres combinantes de acentos; si el editor los muestra como símbolos raros, escribirlo como `/[̀-ͯ]/g`.

- [ ] **Step 8: Verlo pasar**

Run: `npx vitest run src/modules/turnos && npm run typecheck`
Expected: todos los tests de `turnos` pasan y el typecheck no tiene errores.

- [ ] **Step 9: Commit**

```bash
git add src/modules/turnos/codigo.ts src/modules/turnos/codigo.test.ts src/modules/turnos/tope.ts src/modules/turnos/tope.test.ts src/modules/turnos/edicion.ts src/modules/turnos/edicion.test.ts src/modules/turnos/busqueda.ts src/modules/turnos/busqueda.test.ts
git commit -m "feat: reglas puras de busqueda de reservas, codigo, tope y edicion"
```

---

### Task 2: Código de reserva: migración, alta y vistas

**Files:**
- Modify: `prisma/schema.prisma` (modelo `Turno`)
- Create: `prisma/migrations/20261002100000_turnos_codigo/migration.sql`
- Modify: `src/modules/turnos/servicio.service.ts` (`reservarTurno`)
- Modify: `src/app/(publico)/reservar/confirmado/page.tsx`
- Modify: `src/app/(panel)/turnos/page.tsx`

**Interfaces:**
- Consumes: `generarCodigo` (Tarea 1).
- Produces: `Turno.codigo: string` (único, obligatorio); todo turno nuevo lo trae.

- [ ] **Step 1: Buscar otros lugares que crean turnos**

Run: `git grep -n "turno.create\|turnos: { create\|db.turno.create" -- src prisma`
Expected: solo `reservarTurno` en `servicio.service.ts`. Si aparece otro (por ejemplo un seed), agregarle `codigo: generarCodigo()` en el paso 4.

- [ ] **Step 2: Agregar la columna al schema**

En el modelo `Turno` de `prisma/schema.prisma`, después de la línea de `id`, agregar:

```prisma
  codigo          String            @unique // código corto para que el cliente busque o cancele su reserva
```

- [ ] **Step 3: Escribir la migración a mano y aplicarla**

```bash
npx prisma dev --name local --detach
D=prisma/migrations/20261002100000_turnos_codigo
mkdir -p $D
cat > $D/migration.sql <<'EOF'
-- AlterTable: la columna nace nula para poder completar los turnos que ya existen.
ALTER TABLE "turnos" ADD COLUMN     "codigo" TEXT;

-- Valor único y determinista por turno: (orden de creación × impar) módulo 2^24, en hexadecimal de 6 dígitos.
-- Un multiplicador impar módulo una potencia de 2 es una biyección: no hay repetidos para menos de 16 millones de turnos.
UPDATE "turnos" AS t
SET "codigo" = upper(lpad(to_hex(((s.n * 2654435761) % 16777216)::int), 6, '0'))
FROM (SELECT "id", row_number() OVER (ORDER BY "creado_en", "id") AS n FROM "turnos") AS s
WHERE s."id" = t."id";

ALTER TABLE "turnos" ALTER COLUMN "codigo" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "turnos_codigo_key" ON "turnos"("codigo");
EOF
cat $D/migration.sql
npx prisma migrate deploy
npx prisma generate
```

Expected: `migrate deploy` termina con "All migrations have been successfully applied"; `prisma generate` termina bien.

- [ ] **Step 4: Verificar que los turnos que ya existían tienen código**

Crear `ver.tmp.ts`:

```ts
import { db } from "@/lib/db";
async function main() {
  const t = await db.turno.findMany({ select: { codigo: true }, orderBy: { creadoEn: "asc" } });
  console.log(`turnos: ${t.length} | códigos: ${t.map((x) => x.codigo).join(", ")} | únicos: ${new Set(t.map((x) => x.codigo)).size === t.length} | formato ok: ${t.every((x) => /^[A-Z0-9]{6}$/.test(x.codigo))}`);
  await db.$disconnect();
}
main();
```

Run: `npx tsx --env-file=.env ver.tmp.ts && rm ver.tmp.ts`
Expected: cada turno existente con un código de 6 caracteres, `únicos: true` y `formato ok: true`.

- [ ] **Step 5: Generar el código en `reservarTurno`**

En `servicio.service.ts` agregar el import `import { generarCodigo } from "./codigo";` y, encima de `reservarTurno`, la función:

```ts
/** Código de reserva que todavía no usa ningún turno. */
async function codigoLibre(tx: Cliente): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const codigo = generarCodigo();
    if (!(await tx.turno.findUnique({ where: { codigo }, select: { id: true } }))) return codigo;
  }
  throw new Error("No se pudo generar un código de reserva único");
}
```

En el `tx.turno.create({ data: { … } })` de `reservarTurno`, agregar como primera propiedad de `data`:

```ts
        codigo: await codigoLibre(tx),
```

- [ ] **Step 6: Mostrar el código en la confirmación y en la agenda**

En `src/app/(publico)/reservar/confirmado/page.tsx`, dentro del `<dl>` de datos del turno (el de `hayTurno`), después del último `<div>` (el de la hora), agregar:

```tsx
          <div className="col-span-2 border-t border-borde pt-3">
            <dt className="text-xs text-texto-suave">Código de reserva</dt>
            <dd className="font-mono text-lg font-bold tracking-widest">{turno.codigo}</dd>
            <p className="mt-1 text-xs text-texto-suave">Guardalo: lo necesitás para buscar o cancelar tu reserva.</p>
          </div>
```

En `src/app/(panel)/turnos/page.tsx`, justo debajo de `<p className="text-xs text-texto-suave">hasta {formatearHora(t.fin)}</p>`, agregar:

```tsx
                    <p className="mt-1 font-mono text-[11px] tracking-wider text-texto-suave">#{t.codigo}</p>
```

- [ ] **Step 7: Verificar**

Run: `npm run typecheck && npm test`
Expected: sin errores y todos los tests pasan.

- [ ] **Step 8: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/20261002100000_turnos_codigo src/modules/turnos/servicio.service.ts "src/app/(publico)/reservar/confirmado/page.tsx" "src/app/(panel)/turnos/page.tsx"
git commit -m "feat: codigo de reserva en cada turno (migracion con datos existentes)"
```

---

### Task 3: Servicio `editarTurno`

**Files:**
- Modify: `src/modules/turnos/servicio.service.ts` (`disponibilidadDelDia`, `obtenerDisponibilidad`)
- Modify: `src/modules/turnos/schemas.ts`
- Modify: `src/modules/turnos/turno.service.ts`

**Interfaces:**
- Consumes: `puedeEditar`, `cambiaAgenda` (Tarea 1); `disponibilidadDelDia`, `TurnoNoDisponibleError` (`servicio.service.ts`).
- Produces:
  - `disponibilidadDelDia(cliente, servicioId, fecha, excluirTurnoId?: string)` y `obtenerDisponibilidad(servicioId, fecha, excluirTurnoId?)`
  - `editarTurnoSchema`, `type EditarTurnoInput`
  - `class TurnoNoEditableError`
  - `editarTurno(id: string, input: EditarTurnoInput)`: devuelve el turno actualizado
  - `obtenerTurnoParaEditar(id: string)`: turno con `cliente`, `servicio`, `cristal` y `pagos` aprobados

- [ ] **Step 1: Poder ignorar un turno al calcular la disponibilidad**

En `servicio.service.ts`, cambiar la firma de `disponibilidadDelDia` a:

```ts
export async function disponibilidadDelDia(cliente: Cliente, servicioId: string, fecha: string, excluirTurnoId?: string) {
```

y en el `where` de `cliente.turno.findMany`, agregar después de `...enElDia,`:

```ts
      ...(excluirTurnoId && { id: { not: excluirTurnoId } }),
```

Reemplazar `obtenerDisponibilidad` por:

```ts
/** Turnos libres de un servicio para un día local "YYYY-MM-DD". `excluirTurnoId` ignora ese turno (para editarlo). */
export function obtenerDisponibilidad(servicioId: string, fecha: string, excluirTurnoId?: string) {
  return disponibilidadDelDia(db, servicioId, fecha, excluirTurnoId);
}
```

- [ ] **Step 2: Esquema de edición en `schemas.ts`**

Agregar debajo de `reservaSchema`:

```ts
export const editarTurnoSchema = z.object({
  servicioId: z.string().min(1),
  inicio: z.coerce.date(),
  cliente: z.object({
    nombre: z.string().trim().min(2).max(100),
    telefono: z.string().trim().min(6).max(30),
    email: z.email().optional(),
  }),
  vehiculo: z.string().trim().max(100).optional(),
  patente: z.string().trim().toUpperCase().max(10).optional(),
  cristalId: z.string().optional(),
  precio: z.number().min(0).optional(),
  notas: z.string().trim().max(500).optional(),
});

export type EditarTurnoInput = z.input<typeof editarTurnoSchema>;
```

- [ ] **Step 3: Implementar en `turno.service.ts`**

Agregar los imports:

```ts
import { disponibilidadDelDia, TurnoNoDisponibleError } from "./servicio.service";
import { cambiaAgenda, puedeEditar } from "./edicion";
import { editarTurnoSchema, type EditarTurnoInput } from "./schemas";
```

y al final del archivo:

```ts
export class TurnoNoEditableError extends Error {
  constructor() {
    super("Este turno ya no se puede editar");
    this.name = "TurnoNoEditableError";
  }
}

/** Turno con todo lo que necesita la pantalla de edición. */
export function obtenerTurnoParaEditar(id: string) {
  return db.turno.findUnique({
    where: { id },
    include: {
      servicio: true,
      cliente: true,
      cristal: { select: { id: true, codigo: true, descripcion: true } },
      pagos: { where: { estado: "APROBADO" }, select: { monto: true } },
    },
  });
}

/**
 * Edita un turno vigente. Si cambia el servicio o el horario, toma el bloqueo del servicio de destino (el mismo que
 * usan las reservas), recalcula la disponibilidad ignorando este turno y exige que el horario esté libre.
 * Nunca toca los pagos. Si cambia el teléfono, el turno pasa al cliente de ese teléfono (o a uno nuevo); si no,
 * nombre y mail se corrigen en la ficha del cliente actual.
 */
export async function editarTurno(id: string, input: EditarTurnoInput) {
  const r = editarTurnoSchema.parse(input);

  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${r.servicioId}))`;

    const actual = await tx.turno.findUniqueOrThrow({ where: { id }, include: { cliente: true } });
    if (!puedeEditar(actual.estado)) throw new TurnoNoEditableError();

    let { inicio, fin } = actual;
    if (cambiaAgenda(actual, r)) {
      const libres = await disponibilidadDelDia(tx, r.servicioId, fechaLocal(r.inicio), id);
      const elegido = libres.find((t) => t.inicio.getTime() === r.inicio.getTime());
      if (!elegido) throw new TurnoNoDisponibleError();
      ({ inicio, fin } = elegido);
    }

    let clienteId = actual.clienteId;
    if (r.cliente.telefono !== actual.cliente.telefono) {
      const existente = await tx.cliente.findFirst({ where: { telefono: r.cliente.telefono } });
      // Si el teléfono ya es de otra persona, se la deja como está: no se le pisa el nombre.
      clienteId = (existente ?? (await tx.cliente.create({ data: r.cliente }))).id;
    } else {
      await tx.cliente.update({ where: { id: actual.clienteId }, data: { nombre: r.cliente.nombre, email: r.cliente.email ?? null } });
    }

    return tx.turno.update({
      where: { id },
      data: {
        servicioId: r.servicioId,
        clienteId,
        inicio,
        fin,
        vehiculo: r.vehiculo ?? null,
        patente: r.patente ?? null,
        cristalId: r.cristalId ?? null,
        precio: r.precio ?? null,
        notas: r.notas ?? null,
      },
    });
  });
}
```

- [ ] **Step 4: Verificar**

Run: `npm run typecheck && npm test`
Expected: sin errores y todos los tests pasan. (La conducta contra la base se verifica con el script de la Tarea 8.) Si hay un ciclo de importación entre `turno.service.ts` y `servicio.service.ts`, comprobar que `servicio.service.ts` no importa `turno.service.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/modules/turnos
git commit -m "feat: editar un turno validando la disponibilidad"
```

---

### Task 4: Pantalla y acción de edición en el panel

**Files:**
- Modify: `src/app/(panel)/turnos/acciones.ts`
- Create: `src/app/(panel)/turnos/[id]/editar/page.tsx`
- Create: `src/app/(panel)/turnos/[id]/editar/FormularioEditarTurno.tsx`
- Modify: `src/app/(panel)/turnos/page.tsx`

**Interfaces:**
- Consumes: `editarTurno`, `TurnoNoEditableError`, `obtenerTurnoParaEditar` (Tarea 3); `puedeEditar` (Tarea 1); `obtenerDisponibilidad(servicioId, fecha, excluirTurnoId)`, `TurnoNoDisponibleError`.
- Produces: `editarTurnoAccion(id: string, previo: EstadoFormulario, fd: FormData)`; ruta `/turnos/[id]/editar`.

- [ ] **Step 1: Acción (`turnos/acciones.ts`)**

Agregar los imports que falten (`redirect` de `next/navigation`, `ZodError` de `zod`) y:

```ts
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { erroresDeZod, fallo, numero, texto } from "@/lib/formularios";
import { fechaLocal } from "@/lib/tiempo";
import { TurnoNoDisponibleError } from "@/modules/turnos/servicio.service";
import { editarTurno, TurnoNoEditableError } from "@/modules/turnos/turno.service";
```

(combinar con los imports existentes del archivo, sin duplicarlos) y al final:

```ts
export async function editarTurnoAccion(id: string, _previo: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await verificarSesion();

  let destino: string;
  try {
    const turno = await editarTurno(id, {
      servicioId: texto(fd, "servicioId") ?? "",
      inicio: texto(fd, "inicio") ?? "",
      cliente: { nombre: texto(fd, "nombre") ?? "", telefono: texto(fd, "telefono") ?? "", email: texto(fd, "email") },
      vehiculo: texto(fd, "vehiculo"),
      patente: texto(fd, "patente"),
      cristalId: texto(fd, "cristalId"),
      precio: numero(fd, "precio"),
      notas: texto(fd, "notas"),
    });
    destino = `/turnos?fecha=${fechaLocal(turno.inicio)}`;
  } catch (e) {
    if (e instanceof ZodError) return fallo(erroresDeZod(e));
    if (e instanceof TurnoNoDisponibleError) return { ok: false, mensaje: "Ese horario ya no está disponible. Elegí otro." };
    if (e instanceof TurnoNoEditableError) return { ok: false, mensaje: e.message };
    throw e;
  }
  revalidatePath("/turnos");
  revalidatePath("/");
  redirect(destino);
}
```

- [ ] **Step 2: Formulario (`FormularioEditarTurno.tsx`)**

```tsx
"use client";

import Link from "next/link";
import { Aviso, boton, Campo, input, tarjeta } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import { editarTurnoAccion } from "../../acciones";

export interface DatosEditables {
  nombre: string;
  telefono: string;
  email: string;
  vehiculo: string;
  patente: string;
  notas: string;
  precio: string;
  cristalId: string;
}

export function FormularioEditarTurno({
  id,
  servicioId,
  inicio,
  datos,
  cristales,
  mostrarCristal,
  sena,
  volver,
}: {
  id: string;
  servicioId: string;
  inicio: string;
  datos: DatosEditables;
  cristales: { id: string; etiqueta: string }[];
  mostrarCristal: boolean;
  /** Seña pagada ya formateada ("$ 10.000"), o null si no hay. */
  sena: string | null;
  volver: string;
}) {
  const { estado, enviar, pendiente, error } = useFormularioAccion(editarTurnoAccion.bind(null, id));

  return (
    <form onSubmit={enviar} className={`${tarjeta} space-y-5 p-5`} noValidate>
      {estado.mensaje && !estado.ok && <Aviso tono="peligro">{estado.mensaje}</Aviso>}
      {sena && <Aviso tono="alerta">Este turno tiene una seña de {sena} pagada. La seña no cambia aunque modifiques el servicio.</Aviso>}
      <input type="hidden" name="servicioId" value={servicioId} />
      <input type="hidden" name="inicio" value={inicio} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nombre y apellido" htmlFor="nombre" error={error("cliente.nombre")}>
          <input id="nombre" name="nombre" defaultValue={datos.nombre} className={input} aria-invalid={!!error("cliente.nombre")} />
        </Campo>
        <Campo etiqueta="Teléfono / WhatsApp" htmlFor="telefono" error={error("cliente.telefono")} ayuda="Si lo cambiás, el turno pasa al cliente de ese teléfono">
          <input id="telefono" name="telefono" type="tel" defaultValue={datos.telefono} className={input} aria-invalid={!!error("cliente.telefono")} />
        </Campo>
        <Campo etiqueta="Email (opcional)" htmlFor="email" error={error("cliente.email")}>
          <input id="email" name="email" type="email" defaultValue={datos.email} className={input} />
        </Campo>
        <Campo etiqueta="Vehículo" htmlFor="vehiculo" error={error("vehiculo")}>
          <input id="vehiculo" name="vehiculo" defaultValue={datos.vehiculo} className={input} />
        </Campo>
        <Campo etiqueta="Patente (opcional)" htmlFor="patente" error={error("patente")}>
          <input id="patente" name="patente" defaultValue={datos.patente} className={`${input} uppercase`} />
        </Campo>
        <Campo etiqueta="Precio (opcional)" htmlFor="precio" error={error("precio")}>
          <input id="precio" name="precio" type="number" min={0} step="0.01" defaultValue={datos.precio} className={input} />
        </Campo>
        {mostrarCristal && (
          <Campo etiqueta="Cristal a colocar" htmlFor="cristalId" error={error("cristalId")} className="sm:col-span-2">
            <select id="cristalId" name="cristalId" defaultValue={datos.cristalId} className={input}>
              <option value="">Sin cristal asignado</option>
              {cristales.map((c) => (
                <option key={c.id} value={c.id}>{c.etiqueta}</option>
              ))}
            </select>
          </Campo>
        )}
        <Campo etiqueta="Notas" htmlFor="notas" error={error("notas")} className="sm:col-span-2">
          <textarea id="notas" name="notas" rows={3} defaultValue={datos.notas} className={input} />
        </Campo>
      </div>

      <div className="flex justify-end gap-2">
        <Link href={volver} className={boton.secundario}>Cancelar</Link>
        <button type="submit" disabled={pendiente} className={boton.primario}>{pendiente ? "Guardando…" : "Guardar cambios"}</button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Página (`turnos/[id]/editar/page.tsx`)**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Aviso, boton, EncabezadoPagina, input, tarjeta, Vacio } from "@/components/ui";
import { pesos } from "@/lib/formato";
import { verificarSesion } from "@/lib/sesion";
import { fechaLocal, formatearFecha, formatearHora } from "@/lib/tiempo";
import { puedeEditar } from "@/modules/turnos/edicion";
import { listarServicios, obtenerDisponibilidad } from "@/modules/turnos/servicio.service";
import { cristalesDisponibles, obtenerTurnoParaEditar } from "@/modules/turnos/turno.service";
import { FormularioEditarTurno } from "./FormularioEditarTurno";

export const metadata = { title: "Editar turno" };

export default async function PaginaEditarTurno({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ servicio?: string; fecha?: string; inicio?: string }>;
}) {
  await verificarSesion();
  const { id } = await params;
  const p = await searchParams;
  const turno = await obtenerTurnoParaEditar(id);
  if (!turno) notFound();

  const diaDelTurno = fechaLocal(turno.inicio);
  const volver = `/turnos?fecha=${diaDelTurno}`;

  if (!puedeEditar(turno.estado)) {
    return (
      <>
        <EncabezadoPagina seccion="Agenda" titulo="Editar turno" />
        <Aviso tono="alerta">Este turno ya no se puede editar (está completado, cancelado, ausente o esperando el pago).</Aviso>
        <Link href={volver} className={boton.secundario}>Volver a la agenda</Link>
      </>
    );
  }

  const servicios = (await listarServicios()).filter((s) => s.activo || s.id === turno.servicioId);
  const servicioId = servicios.some((s) => s.id === p.servicio) ? p.servicio! : turno.servicioId;
  const servicio = servicios.find((s) => s.id === servicioId)!;
  const fecha = p.fecha && /^\d{4}-\d{2}-\d{2}$/.test(p.fecha) ? p.fecha : diaDelTurno;

  const mismaAgenda = servicioId === turno.servicioId && fecha === diaDelTurno;
  const libres = await obtenerDisponibilidad(servicioId, fecha, turno.id);
  const actualISO = turno.inicio.toISOString();
  const candidato = p.inicio ?? (mismaAgenda ? actualISO : undefined);
  // Un horario solo vale si está libre; el actual siempre vale mientras no cambie el servicio ni el día.
  const inicio = candidato && (libres.some((t) => t.inicio.toISOString() === candidato) || (mismaAgenda && candidato === actualISO)) ? candidato : undefined;

  const cristales = await cristalesDisponibles();
  const opcionesCristal = [
    ...(turno.cristal && !cristales.some((c) => c.id === turno.cristal!.id)
      ? [{ id: turno.cristal.id, etiqueta: `${turno.cristal.codigo} · sin stock` }]
      : []),
    ...cristales.map((c) => ({ id: c.id, etiqueta: `${c.codigo} · ${c.descripcion} (${c.cantidad})` })),
  ];
  const sena = turno.pagos[0] ? pesos(turno.pagos[0].monto) : null;

  return (
    <>
      <Link href={volver} className={`${boton.fantasma} ${boton.chico} -ml-2.5`}>
        <ArrowLeft className="size-3.5" aria-hidden /> Agenda
      </Link>
      <EncabezadoPagina seccion="Agenda" titulo="Editar turno" descripcion={`Código ${turno.codigo} · ${turno.cliente.nombre}`} />

      <section className={`${tarjeta} space-y-4 p-5`}>
        <h2 className="font-display font-bold">Día y horario</h2>
        <p className="text-sm text-texto-suave">
          Ahora: {turno.servicio.nombre}, {formatearFecha(diaDelTurno)} a las {formatearHora(turno.inicio)} hs.
        </p>
        {/* Formulario GET: no lleva datos personales, solo el servicio y el día. */}
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <label htmlFor="servicio" className="block text-sm font-medium">Servicio</label>
            <select id="servicio" name="servicio" defaultValue={servicioId} className={input}>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="fecha" className="block text-sm font-medium">Día</label>
            <input id="fecha" name="fecha" type="date" defaultValue={fecha} className={input} />
          </div>
          <button type="submit" className={boton.secundario}>Ver horarios</button>
        </form>

        {libres.length === 0 ? (
          <Vacio>No quedan horarios libres ese día para {servicio.nombre}.</Vacio>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {libres.map((t) => {
              const iso = t.inicio.toISOString();
              const actual = iso === inicio;
              return (
                <Link
                  key={iso}
                  href={`/turnos/${turno.id}/editar?servicio=${servicioId}&fecha=${fecha}&inicio=${encodeURIComponent(iso)}`}
                  className={`rounded-lg border py-2 text-center font-semibold tabular-nums transition-colors ${
                    actual ? "border-marca bg-marca text-sobre-marca" : "border-borde bg-superficie hover:border-marca"
                  }`}
                >
                  {formatearHora(t.inicio)}
                </Link>
              );
            })}
          </div>
        )}
        {p.inicio && !inicio && <p className="text-sm text-peligro">Ese horario ya no está disponible. Elegí otro.</p>}
      </section>

      {inicio ? (
        <FormularioEditarTurno
          key={`${servicioId}-${inicio}`}
          id={turno.id}
          servicioId={servicioId}
          inicio={inicio}
          datos={{
            nombre: turno.cliente.nombre,
            telefono: turno.cliente.telefono,
            email: turno.cliente.email ?? "",
            vehiculo: turno.vehiculo ?? "",
            patente: turno.patente ?? "",
            notas: turno.notas ?? "",
            precio: turno.precio === null ? "" : String(turno.precio),
            cristalId: turno.cristalId ?? "",
          }}
          cristales={opcionesCristal}
          mostrarCristal={servicio.requiereCristal || !!turno.cristalId}
          sena={sena}
          volver={volver}
        />
      ) : (
        <Vacio>Elegí un horario para poder guardar los cambios.</Vacio>
      )}
    </>
  );
}
```

- [ ] **Step 4: Botón "Editar" en la agenda**

En `turnos/page.tsx` agregar los imports `import { Pencil } from "lucide-react";` (sumarlo al import existente de `lucide-react`) y `import { puedeEditar } from "@/modules/turnos/edicion";`, y reemplazar el bloque:

```tsx
                  <div className="sm:text-right">
                    <AccionesTurno id={t.id} estado={t.estado} />
                  </div>
```

por:

```tsx
                  <div className="space-y-2 sm:text-right">
                    {puedeEditar(t.estado) && (
                      <Link href={`/turnos/${t.id}/editar`} className={`${boton.secundario} ${boton.chico}`}>
                        <Pencil className="size-3.5" aria-hidden /> Editar
                      </Link>
                    )}
                    <AccionesTurno id={t.id} estado={t.estado} />
                  </div>
```

- [ ] **Step 5: Verificar**

Run: `npm run typecheck && npm test`
Expected: sin errores y todos los tests pasan (incluido `guardia-acciones`: `editarTurnoAccion` empieza con `await verificarSesion()`).

Revisión manual (`npm run build && npm start`, sesión del panel): en `/turnos` cada turno editable muestra "Editar"; la pantalla permite cambiar servicio y día con "Ver horarios", elegir un horario libre y guardar; un turno completado o cancelado no muestra el botón.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(panel)/turnos"
git commit -m "feat: pantalla y accion para editar un turno en el panel"
```

---

### Task 5: Cancelar en el panel con aviso de seña

**Files:**
- Modify: `src/app/(panel)/turnos/AccionesTurno.tsx`
- Modify: `src/app/(panel)/turnos/page.tsx`

**Interfaces:**
- Produces: `AccionesTurno({ id, estado, sena? })` con `sena?: string | null` (monto ya formateado).

- [ ] **Step 1: Mostrar el aviso en la confirmación**

En `AccionesTurno.tsx`, cambiar la firma a:

```tsx
export function AccionesTurno({ id, estado, sena = null }: { id: string; estado: EstadoTurno; sena?: string | null }) {
```

y dentro del bloque `aConfirmar ? ( <> … </> )`, justo después de `<span className="text-xs text-texto-suave">¿{aConfirmar.etiqueta}?</span>`, agregar:

```tsx
            {aConfirmar.estado === "CANCELADO" && sena && (
              <span className="basis-full text-xs text-alerta">
                Tiene una seña de {sena} cobrada por Mercado Pago. No se devuelve automáticamente.
              </span>
            )}
```

- [ ] **Step 2: Pasarle la seña desde la agenda**

En `turnos/page.tsx`, cambiar `<AccionesTurno id={t.id} estado={t.estado} />` por:

```tsx
                    <AccionesTurno id={t.id} estado={t.estado} sena={t.pagos[0] ? pesos(t.pagos[0].monto) : null} />
```

(`pesos` ya está importado en esa página; si no, agregar `import { pesos } from "@/lib/formato";`.)

- [ ] **Step 3: Verificar**

Run: `npm run typecheck && npm test`
Expected: sin errores y todos los tests pasan.

Revisión manual: en un turno con seña pagada, "Cancelar" muestra el aviso de la seña antes de confirmar; en un turno sin seña no aparece.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(panel)/turnos"
git commit -m "feat: la cancelacion en el panel avisa cuando hay una sena cobrada"
```

---

### Task 6: Servicio y acciones del portal (buscar y cancelar)

**Files:**
- Create: `src/modules/turnos/reservas-cliente.service.ts`
- Modify: `src/app/(publico)/reservar/acciones.ts`

**Interfaces:**
- Consumes: todo `busqueda.ts`, `tope.ts`, `codigo.ts` (Tarea 1); `registrarFallo`, `minutosDeBloqueo` (`@/modules/usuarios/limite`).
- Produces:
  - `class BusquedasExcedidasError`
  - `buscarReservas(entrada, ahora?)`: `Promise<RespuestaBusqueda>` (nunca `inicial` ni `error`)
  - `cancelarReservaCliente(codigoEntrada: string, contacto: string, ahora?)`: `Promise<RespuestaCancelacion>`
  - Server Actions `buscarReservaAccion(previo: RespuestaBusqueda, fd: FormData): Promise<RespuestaBusqueda>` y `cancelarReservaAccion(codigo: string, contacto: string): Promise<RespuestaCancelacion>`

- [ ] **Step 1: Servicio (`reservas-cliente.service.ts`)**

```ts
import { db } from "@/lib/db";
import { fechaLocal, formatearHora } from "@/lib/tiempo";
import { minutosDeBloqueo, registrarFallo } from "@/modules/usuarios/limite";
import {
  aReservaVisible,
  contactoCoincide,
  ESTADOS_BUSCABLES,
  normalizarCriterios,
  resolverBusqueda,
  type CampoBusqueda,
  type RespuestaBusqueda,
  type RespuestaCancelacion,
  type TurnoBuscable,
} from "./busqueda";
import { esCodigoValido, normalizarCodigo } from "./codigo";
import { claveBusqueda, superaTope } from "./tope";

export class BusquedasExcedidasError extends Error {
  constructor() {
    super("Hay muchas búsquedas en este momento");
    this.name = "BusquedasExcedidasError";
  }
}

const MAXIMO_TURNOS_A_REVISAR = 2000;

/** Cuenta esta búsqueda en el minuto actual (en todo el sitio) y corta si se pasó del tope. */
async function contarBusqueda(ahora: Date): Promise<void> {
  const clave = claveBusqueda(ahora);
  const fila = await db.intentoLogin.upsert({
    where: { usuario: clave },
    create: { usuario: clave, fallos: 1, ultimoFallo: ahora },
    update: { fallos: { increment: 1 }, ultimoFallo: ahora },
  });
  // Los contadores de minutos viejos no sirven para nada: se limpian.
  await db.intentoLogin.deleteMany({ where: { usuario: { startsWith: "busqueda:" }, ultimoFallo: { lt: new Date(ahora.getTime() - 60 * 60_000) } } });
  if (superaTope(fila.fallos)) throw new BusquedasExcedidasError();
}

const desdeBase = (t: {
  id: string;
  codigo: string;
  servicioId: string;
  inicio: Date;
  estado: TurnoBuscable["estado"];
  patente: string | null;
  vehiculo: string | null;
  servicio: { nombre: string };
  cliente: { nombre: string; telefono: string; email: string | null };
  pagos: { id: string }[];
}): TurnoBuscable => ({
  id: t.id,
  codigo: t.codigo,
  servicioId: t.servicioId,
  servicioNombre: t.servicio.nombre,
  inicio: t.inicio,
  estado: t.estado,
  nombre: t.cliente.nombre,
  telefono: t.cliente.telefono,
  email: t.cliente.email,
  patente: t.patente,
  vehiculo: t.vehiculo,
  senaPagada: t.pagos.length > 0,
});

/** Busca entre las reservas vigentes y futuras. Lanza `SinCriteriosError` o `BusquedasExcedidasError`. */
export async function buscarReservas(
  entrada: Partial<Record<CampoBusqueda, string | undefined>>,
  ahora: Date = new Date(),
): Promise<Exclude<RespuestaBusqueda, { tipo: "inicial" } | { tipo: "error" }>> {
  const criterios = normalizarCriterios(entrada);
  await contarBusqueda(ahora);

  const turnos = await db.turno.findMany({
    where: {
      estado: { in: ESTADOS_BUSCABLES },
      inicio: { gt: ahora },
      NOT: { estado: "ESPERANDO_PAGO", venceEn: { lte: ahora } },
    },
    include: {
      servicio: { select: { nombre: true } },
      cliente: { select: { nombre: true, telefono: true, email: true } },
      pagos: { where: { estado: "APROBADO" }, select: { id: true } },
    },
    take: MAXIMO_TURNOS_A_REVISAR,
  });

  const r = resolverBusqueda(turnos.map(desdeBase), criterios);
  if (r.tipo === "una") return { tipo: "una", reserva: aReservaVisible(r.turno) };
  return r;
}

function notaDeCancelacion(ahora: Date): string {
  const [, mes, dia] = fechaLocal(ahora).split("-");
  return `Cancelado por el cliente el ${dia}/${mes} ${formatearHora(ahora)}`;
}

/**
 * Cancela una reserva por pedido del cliente. Hay que escribir el teléfono o el mail completos; tras 5 fallos
 * para el mismo turno se bloquea 15 minutos. El mensaje de fallo no dice cuál de los datos estaba bien.
 */
export async function cancelarReservaCliente(
  codigoEntrada: string,
  contacto: string,
  ahora: Date = new Date(),
): Promise<RespuestaCancelacion> {
  const codigo = normalizarCodigo(codigoEntrada);
  if (!esCodigoValido(codigo)) return { tipo: "no_encontrada" };

  const turno = await db.turno.findUnique({
    where: { codigo },
    include: { cliente: true, pagos: { where: { estado: "APROBADO" }, select: { id: true } } },
  });
  if (!turno || !ESTADOS_BUSCABLES.includes(turno.estado) || turno.inicio <= ahora) return { tipo: "no_encontrada" };

  const clave = `cancelar:${turno.id}`;
  return db.$transaction(async (tx): Promise<RespuestaCancelacion> => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${clave}))`;

    // Otro pedido pudo cancelarlo mientras tanto.
    const vigente = await tx.turno.findUnique({ where: { id: turno.id }, select: { estado: true, notas: true } });
    if (!vigente || !ESTADOS_BUSCABLES.includes(vigente.estado)) return { tipo: "no_encontrada" };

    const previo = await tx.intentoLogin.findUnique({ where: { usuario: clave } });
    const espera = minutosDeBloqueo(previo, ahora);
    if (espera > 0) return { tipo: "bloqueada", minutos: espera };

    if (!contactoCoincide(turno.cliente, contacto)) {
      const nuevo = registrarFallo(previo, ahora);
      await tx.intentoLogin.upsert({ where: { usuario: clave }, create: { usuario: clave, ...nuevo }, update: nuevo });
      return nuevo.bloqueadoHasta ? { tipo: "bloqueada", minutos: minutosDeBloqueo(nuevo, ahora) } : { tipo: "contacto_incorrecto" };
    }

    await tx.intentoLogin.deleteMany({ where: { usuario: clave } });
    await tx.turno.update({
      where: { id: turno.id },
      data: { estado: "CANCELADO", notas: [vigente.notas, notaDeCancelacion(ahora)].filter(Boolean).join("\n") },
    });
    await tx.pago.updateMany({ where: { turnoId: turno.id, estado: { in: ["PENDIENTE", "RECHAZADO"] } }, data: { estado: "VENCIDO" } });
    return { tipo: "cancelada", teniaSena: turno.pagos.length > 0 };
  });
}
```

- [ ] **Step 2: Acciones públicas (`reservar/acciones.ts`)**

Agregar al final del archivo (y los imports que falten, sin duplicar):

```ts
import { SinCriteriosError, type RespuestaBusqueda, type RespuestaCancelacion } from "@/modules/turnos/busqueda";
import { buscarReservas, BusquedasExcedidasError, cancelarReservaCliente } from "@/modules/turnos/reservas-cliente.service";

/** Pública: busca una reserva con los datos que complete el cliente. Todo se valida en el servidor. */
export async function buscarReservaAccion(_previo: RespuestaBusqueda, fd: FormData): Promise<RespuestaBusqueda> {
  try {
    return await buscarReservas({
      codigo: texto(fd, "codigo"),
      nombre: texto(fd, "nombre"),
      telefono: texto(fd, "telefono"),
      email: texto(fd, "email"),
      patente: texto(fd, "patente"),
      vehiculo: texto(fd, "vehiculo"),
      servicioId: texto(fd, "servicioId"),
      fecha: texto(fd, "fecha"),
    });
  } catch (e) {
    if (e instanceof SinCriteriosError) return { tipo: "error", mensaje: e.message };
    if (e instanceof BusquedasExcedidasError) return { tipo: "error", mensaje: "Hay muchas búsquedas en este momento. Probá de nuevo en un minuto." };
    throw e;
  }
}

/** Pública: cancela la reserva si el contacto coincide. */
export async function cancelarReservaAccion(codigo: string, contacto: string): Promise<RespuestaCancelacion> {
  if (typeof codigo !== "string" || typeof contacto !== "string") return { tipo: "no_encontrada" };
  const respuesta = await cancelarReservaCliente(codigo, contacto);
  if (respuesta.tipo === "cancelada") revalidatePath("/turnos");
  return respuesta;
}
```

- [ ] **Step 3: Verificar**

Run: `npm run typecheck && npm test`
Expected: sin errores y todos los tests pasan. `guardia-acciones` no incluye esta carpeta (es pública a propósito).

- [ ] **Step 4: Commit**

```bash
git add src/modules/turnos/reservas-cliente.service.ts "src/app/(publico)/reservar/acciones.ts"
git commit -m "feat: buscar y cancelar una reserva desde el portal con proteccion contra abusos"
```

---

### Task 7: Modal "Buscar tu reserva" en el portal

**Files:**
- Create: `src/app/(publico)/reservar/BuscarReserva.tsx`
- Modify: `src/app/(publico)/reservar/page.tsx`

**Interfaces:**
- Consumes: `buscarReservaAccion`, `cancelarReservaAccion` (Tarea 6); `RespuestaBusqueda`, `RespuestaCancelacion`, `ReservaVisible` (Tarea 1).
- Produces: `BuscarReserva({ servicios })` con `servicios: { id: string; nombre: string }[]`.

- [ ] **Step 1: Componente (`BuscarReserva.tsx`)**

```tsx
"use client";

import { startTransition, useActionState, useRef, useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { Aviso, boton, Campo, input } from "@/components/ui";
import type { RespuestaBusqueda, RespuestaCancelacion } from "@/modules/turnos/busqueda";
import { buscarReservaAccion, cancelarReservaAccion } from "./acciones";

const INICIAL: RespuestaBusqueda = { tipo: "inicial" };

function MensajeCancelacion({ r }: { r: RespuestaCancelacion }) {
  switch (r.tipo) {
    case "cancelada":
      return (
        <Aviso tono="exito">
          Tu reserva fue cancelada.{r.teniaSena ? " La seña no se devuelve." : ""}
        </Aviso>
      );
    case "contacto_incorrecto":
      return <Aviso tono="peligro">Ese dato no coincide con el de la reserva. Revisalo e intentá de nuevo.</Aviso>;
    case "bloqueada":
      return <Aviso tono="peligro">Demasiados intentos. Probá de nuevo en {r.minutos} {r.minutos === 1 ? "minuto" : "minutos"}.</Aviso>;
    default:
      return <Aviso tono="alerta">No encontramos la reserva. Puede que ya esté cancelada.</Aviso>;
  }
}

export function BuscarReserva({ servicios }: { servicios: { id: string; nombre: string }[] }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [respuesta, ejecutar, pendiente] = useActionState(buscarReservaAccion, INICIAL);
  const [confirmando, setConfirmando] = useState(false);
  const [contacto, setContacto] = useState("");
  const [cancelacion, setCancelacion] = useState<RespuestaCancelacion>();
  const [cancelando, setCancelando] = useState(false);

  const buscar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setConfirmando(false);
    setContacto("");
    setCancelacion(undefined);
    startTransition(() => ejecutar(fd));
  };

  const cancelar = async (codigo: string) => {
    setCancelando(true);
    setCancelacion(await cancelarReservaAccion(codigo, contacto));
    setCancelando(false);
  };

  const cancelada = cancelacion?.tipo === "cancelada";

  return (
    <>
      <button type="button" onClick={() => dialogo.current?.showModal()} className={boton.secundario}>
        <Search className="size-4" aria-hidden /> Buscar tu reserva
      </button>

      <dialog
        ref={dialogo}
        aria-labelledby="titulo-buscar"
        className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-tarjeta border border-borde bg-superficie p-0 text-texto backdrop:bg-black/60"
      >
        <div className="max-h-[85vh] space-y-4 overflow-y-auto p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="titulo-buscar" className="font-display text-lg font-bold">Buscar tu reserva</h2>
              <p className="text-sm text-texto-suave">Completá los datos que tengas: alcanza con uno.</p>
            </div>
            <button type="button" onClick={() => dialogo.current?.close()} aria-label="Cerrar" className={`${boton.fantasma} ${boton.chico}`}>
              <X className="size-4" aria-hidden />
            </button>
          </div>

          <form onSubmit={buscar} className="grid gap-3 sm:grid-cols-2" noValidate>
            <Campo etiqueta="Código de reserva" htmlFor="b-codigo">
              <input id="b-codigo" name="codigo" autoComplete="off" placeholder="K7Q2XA" className={`${input} uppercase`} />
            </Campo>
            <Campo etiqueta="Nombre" htmlFor="b-nombre">
              <input id="b-nombre" name="nombre" autoComplete="name" className={input} />
            </Campo>
            <Campo etiqueta="Teléfono" htmlFor="b-telefono">
              <input id="b-telefono" name="telefono" type="tel" autoComplete="tel" className={input} />
            </Campo>
            <Campo etiqueta="Email" htmlFor="b-email">
              <input id="b-email" name="email" type="email" autoComplete="email" className={input} />
            </Campo>
            <Campo etiqueta="Patente" htmlFor="b-patente">
              <input id="b-patente" name="patente" className={`${input} uppercase`} />
            </Campo>
            <Campo etiqueta="Vehículo" htmlFor="b-vehiculo">
              <input id="b-vehiculo" name="vehiculo" className={input} />
            </Campo>
            <Campo etiqueta="Servicio" htmlFor="b-servicio">
              <select id="b-servicio" name="servicioId" defaultValue="" className={input}>
                <option value="">Cualquiera</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </Campo>
            <Campo etiqueta="Día del turno" htmlFor="b-fecha">
              <input id="b-fecha" name="fecha" type="date" className={input} />
            </Campo>
            <div className="sm:col-span-2">
              <button type="submit" disabled={pendiente} className={`${boton.primario} w-full`}>
                {pendiente ? "Buscando…" : "Buscar"}
              </button>
            </div>
          </form>

          {respuesta.tipo === "error" && <Aviso tono="peligro">{respuesta.mensaje}</Aviso>}
          {respuesta.tipo === "ninguna" && <Aviso tono="alerta">No encontramos tu reserva. Revisá los datos o probá con otro.</Aviso>}
          {respuesta.tipo === "varias" && <Aviso tono="alerta">Encontramos más de una reserva con esos datos. Agregá más datos para encontrar la tuya.</Aviso>}

          {respuesta.tipo === "una" && (
            <div className="space-y-4 rounded-lg border border-borde p-4">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2">
                  <dt className="text-xs text-texto-suave">Servicio</dt>
                  <dd className="font-semibold">{respuesta.reserva.servicio}</dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">Día</dt>
                  <dd className="font-semibold">{respuesta.reserva.dia}</dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">Hora</dt>
                  <dd className="font-semibold">{respuesta.reserva.hora} hs</dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">Estado</dt>
                  <dd className="font-semibold">{respuesta.reserva.estado}{respuesta.reserva.senaPagada ? " · seña pagada" : ""}</dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">Código</dt>
                  <dd className="font-mono font-bold tracking-widest">{respuesta.reserva.codigo}</dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">A nombre de</dt>
                  <dd>{respuesta.reserva.nombre}</dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">Teléfono</dt>
                  <dd>{respuesta.reserva.telefono}</dd>
                </div>
                {respuesta.reserva.patente && (
                  <div>
                    <dt className="text-xs text-texto-suave">Patente</dt>
                    <dd>{respuesta.reserva.patente}</dd>
                  </div>
                )}
              </dl>

              {cancelacion && <MensajeCancelacion r={cancelacion} />}

              {!cancelada && !confirmando && (
                <button type="button" onClick={() => setConfirmando(true)} className={boton.peligro}>Cancelar mi reserva</button>
              )}

              {!cancelada && confirmando && (
                <div className="space-y-3">
                  {respuesta.reserva.senaPagada && (
                    <Aviso tono="alerta">Esta reserva tiene una seña pagada. Si la cancelás, la seña no se devuelve.</Aviso>
                  )}
                  <Campo etiqueta="Para confirmar, escribí el teléfono o el mail con el que reservaste" htmlFor="b-contacto">
                    <input id="b-contacto" value={contacto} onChange={(e) => setContacto(e.target.value)} autoComplete="off" className={input} />
                  </Campo>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={cancelando || contacto.trim() === ""}
                      onClick={() => cancelar(respuesta.reserva.codigo)}
                      className={boton.peligro}
                    >
                      {cancelando ? "Cancelando…" : "Sí, cancelar mi reserva"}
                    </button>
                    <button type="button" onClick={() => { setConfirmando(false); setCancelacion(undefined); }} className={boton.fantasma}>No</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
```

- [ ] **Step 2: Integrarlo en `/reservar` (paso 1)**

En `page.tsx` agregar `import { BuscarReserva } from "./BuscarReserva";` y, en la rama del paso 1 (`if (!servicio) { … }`), reemplazar:

```tsx
    return (
      <Paso numero={1} titulo="¿Qué necesitás?">
```

por:

```tsx
    return (
      <>
        <div className={`${tarjeta} flex flex-wrap items-center justify-between gap-3 p-4`}>
          <div>
            <p className="font-display font-bold">¿Ya reservaste?</p>
            <p className="text-sm text-texto-suave">Buscá tu reserva para ver sus datos o cancelarla.</p>
          </div>
          <BuscarReserva servicios={servicios.map((s) => ({ id: s.id, nombre: s.nombre }))} />
        </div>
      <Paso numero={1} titulo="¿Qué necesitás?">
```

y el cierre de esa rama, que hoy es:

```tsx
      </Paso>
    );
  }

  // Paso 2
```

por:

```tsx
      </Paso>
      </>
    );
  }

  // Paso 2
```

(la indentación queda irregular pero es válida; si el formateador del proyecto la acomoda, mejor).

- [ ] **Step 3: Verificar**

Run: `npm run typecheck && npm test`
Expected: sin errores y todos los tests pasan.

Revisión manual (`npm run build && npm start`, ventana de incógnito): en `/reservar` aparece "¿Ya reservaste?" con el botón; el modal abre y cierra (también con Escape); buscar sin completar nada muestra el error; buscar con un dato (por ejemplo la patente de una reserva) abre los datos tapados; cancelar pide el teléfono o el mail y funciona; en celular el modal entra en pantalla y se desplaza.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(publico)/reservar"
git commit -m "feat: modal Buscar tu reserva en el portal de clientes"
```

---

### Task 8: Verificación contra la base y documentación

**Files:**
- Create (temporal, se borra al final): `verificar-reservas.tmp.ts`
- Modify: `docs/ARQUITECTURA.md`

- [ ] **Step 1: Script de verificación (temporal)**

`verificar-reservas.tmp.ts` en la raíz. Crea un servicio de prueba con capacidad 1, recorre los casos del Review Focus y limpia todo:

```ts
import { db } from "@/lib/db";
import { SinCriteriosError } from "@/modules/turnos/busqueda";
import { BusquedasExcedidasError, buscarReservas, cancelarReservaCliente } from "@/modules/turnos/reservas-cliente.service";
import { obtenerDisponibilidad, reservarTurno, TurnoNoDisponibleError } from "@/modules/turnos/servicio.service";
import { editarTurno, TurnoNoEditableError } from "@/modules/turnos/turno.service";
import { hoy, sumarDias } from "@/lib/tiempo";

const horarios = [0, 1, 2, 3, 4, 5, 6].map((d) => ({ diaSemana: d, horaInicio: 8 * 60, horaFin: 20 * 60 }));
const datos = (servicioId: string, inicio: Date, nombre: string, telefono: string, extra: Record<string, string> = {}) =>
  ({ servicioId, inicio: inicio.toISOString(), cliente: { nombre, telefono, email: extra.email }, patente: extra.patente, vehiculo: extra.vehiculo });
const intenta = (p: Promise<unknown>) => p.then(() => "ok", (e) => e);

async function main() {
  const servicio = await db.servicio.create({
    data: { nombre: "ZZ prueba reservas", slug: "zz-prueba-reservas", duracionMinutos: 60, intervaloMinutos: 60, capacidad: 1, anticipacionMinutos: 0, horarios: { create: horarios } },
  });
  const salida: string[] = [];
  try {
    const dia = sumarDias(hoy(), 3);
    const [h1, h2, h3, h4] = await obtenerDisponibilidad(servicio.id, dia);

    // 1. Los turnos nuevos traen código de 6 caracteres
    const a = (await reservarTurno(datos(servicio.id, h1.inicio, "ZZ Ana López", "3834000201", { email: "ana@zz.com", patente: "ZZ111AA" }), { omitirSena: true })).turno;
    const b = (await reservarTurno(datos(servicio.id, h2.inicio, "ZZ Bruno Díaz", "3834000202", { patente: "ZZ222BB" }), { omitirSena: true })).turno;
    salida.push(`1. códigos: ${a.codigo} / ${b.codigo} | formato ok: ${/^[A-Z0-9]{6}$/.test(a.codigo) && a.codigo !== b.codigo}`);

    // 2. Editar sin cambiar servicio ni horario corrige la ficha del cliente
    await editarTurno(a.id, { servicioId: servicio.id, inicio: a.inicio.toISOString(), cliente: { nombre: "ZZ Ana M. López", telefono: "3834000201", email: "ana@zz.com" }, patente: "ZZ111AA", notas: "editado" });
    const ficha = await db.cliente.findUniqueOrThrow({ where: { id: a.clienteId } });
    salida.push(`2. editar sin mover -> nombre ahora "${ficha.nombre}"`);

    // 3. Cambiar a un horario ocupado se rechaza; a uno libre funciona
    const r3a = await intenta(editarTurno(a.id, { servicioId: servicio.id, inicio: h2.inicio.toISOString(), cliente: { nombre: ficha.nombre, telefono: "3834000201" } }));
    const r3b = await intenta(editarTurno(a.id, { servicioId: servicio.id, inicio: h3.inicio.toISOString(), cliente: { nombre: ficha.nombre, telefono: "3834000201" } }));
    const libreH1 = (await obtenerDisponibilidad(servicio.id, dia)).some((t) => t.inicio.getTime() === h1.inicio.getTime());
    salida.push(`3. a horario ocupado -> ${r3a instanceof TurnoNoDisponibleError ? "rechazado (ok)" : "ERROR " + r3a} | a horario libre -> ${r3b} | el horario viejo quedó libre: ${libreH1}`);

    // 4. Cambiar el teléfono al de otro cliente mueve el turno sin pisar su nombre
    await editarTurno(a.id, { servicioId: servicio.id, inicio: h3.inicio.toISOString(), cliente: { nombre: "ZZ Nombre que no debe pisar", telefono: "3834000202" }, patente: "ZZ111AA" });
    const turnoA = await db.turno.findUniqueOrThrow({ where: { id: a.id }, include: { cliente: true } });
    salida.push(`4. teléfono de otro cliente -> el turno ahora es de "${turnoA.cliente.nombre}" (debe seguir siendo "ZZ Bruno Díaz")`);

    // 5. Búsqueda: sin datos, con solo servicio/día, un campo único, y varias coincidencias
    const r5a = await intenta(buscarReservas({}));
    const r5b = await intenta(buscarReservas({ servicioId: servicio.id, fecha: dia }));
    const r5c = await buscarReservas({ codigo: b.codigo.toLowerCase() });
    const r5d = await buscarReservas({ telefono: "383 4000202" });
    const r5e = await buscarReservas({ patente: "zz-222-bb" });
    salida.push(`5. sin datos: ${r5a instanceof SinCriteriosError ? "error (ok)" : "ERROR"} | solo servicio+día: ${r5b instanceof SinCriteriosError ? "error (ok)" : "ERROR"} | por código: ${r5c.tipo} ${r5c.tipo === "una" ? `(${r5c.reserva.nombre}, ${r5c.reserva.telefono})` : ""} | por teléfono con 2 turnos: ${r5d.tipo} | por patente: ${r5e.tipo}`);

    // 6. Cancelar con contacto incorrecto: genérico y bloquea al 5.º, aun si el 6.º es correcto
    const respuestas: string[] = [];
    for (let i = 1; i <= 5; i++) respuestas.push((await cancelarReservaCliente(b.codigo, "3830000000")).tipo);
    const sexto = await cancelarReservaCliente(b.codigo, "3834000202");
    salida.push(`6. intentos fallidos: ${respuestas.join(",")} | con el dato correcto estando bloqueado: ${sexto.tipo}`);

    // 7. Cancelar bien (se destraba a mano para la prueba), libera el horario y la segunda vez no se encuentra
    await db.intentoLogin.deleteMany({ where: { usuario: `cancelar:${b.id}` } });
    const r7a = await cancelarReservaCliente(b.codigo, "383-4000202");
    const r7b = await cancelarReservaCliente(b.codigo, "3834000202");
    const libreH2 = (await obtenerDisponibilidad(servicio.id, dia)).some((t) => t.inicio.getTime() === h2.inicio.getTime());
    const notas = (await db.turno.findUniqueOrThrow({ where: { id: b.id } })).notas;
    salida.push(`7. cancelar -> ${r7a.tipo} | de nuevo -> ${r7b.tipo} | horario liberado: ${libreH2} | nota: "${notas}"`);

    // 8. Un turno cancelado no se edita
    const r8 = await intenta(editarTurno(b.id, { servicioId: servicio.id, inicio: h2.inicio.toISOString(), cliente: { nombre: "ZZ Bruno Díaz", telefono: "3834000202" } }));
    salida.push(`8. editar un cancelado -> ${r8 instanceof TurnoNoEditableError ? "rechazado (ok)" : "ERROR " + r8}`);

    // 9. Tope de búsquedas por minuto
    let corto = "no cortó";
    for (let i = 0; i < 22; i++) {
      const r = await intenta(buscarReservas({ codigo: "ZZZZZZ" }));
      if (r instanceof BusquedasExcedidasError) { corto = `cortó en la búsqueda ${i + 1} (debe ser entre 20 y 22)`; break; }
    }
    salida.push(`9. tope de búsquedas -> ${corto}`);

    console.log(salida.join("\n"));
  } finally {
    await db.pago.deleteMany({ where: { turno: { servicioId: servicio.id } } });
    await db.turno.deleteMany({ where: { servicioId: servicio.id } });
    await db.cliente.deleteMany({ where: { telefono: { in: ["3834000201", "3834000202"] } } });
    await db.servicio.deleteMany({ where: { id: servicio.id } });
    await db.intentoLogin.deleteMany({ where: { OR: [{ usuario: { startsWith: "busqueda:" } }, { usuario: { startsWith: "cancelar:" } }] } });
    await db.$disconnect();
  }
}
main();
```

- [ ] **Step 2: Correrlo**

Run: `npx tsx --env-file=.env verificar-reservas.tmp.ts`
Expected (cada línea):
- `1. códigos: XXXXXX / YYYYYY | formato ok: true`
- `2. editar sin mover -> nombre ahora "ZZ Ana M. López"`
- `3. a horario ocupado -> rechazado (ok) | a horario libre -> ok | el horario viejo quedó libre: true`
- `4. teléfono de otro cliente -> el turno ahora es de "ZZ Bruno Díaz" (debe seguir siendo "ZZ Bruno Díaz")`
- `5. sin datos: error (ok) | solo servicio+día: error (ok) | por código: una (ZZ B., ****0202) | por teléfono con 2 turnos: varias | por patente: una`
- `6. intentos fallidos: contacto_incorrecto,contacto_incorrecto,contacto_incorrecto,contacto_incorrecto,bloqueada | con el dato correcto estando bloqueado: bloqueada`
- `7. cancelar -> cancelada | de nuevo -> no_encontrada | horario liberado: true | nota: "Cancelado por el cliente el dd/mm hh:mm"`
- `8. editar un cancelado -> rechazado (ok)`
- `9. tope de búsquedas -> cortó en la búsqueda 21 (debe ser entre 20 y 22)` (el contador ya suma las búsquedas del caso 5, así que puede cortar un poco antes)

Si algo difiere, corregir el código de la tarea que corresponda (no el script) y repetir. Al terminar: `rm verificar-reservas.tmp.ts` y `git status` limpio de temporales y de datos "ZZ …" en la base.

- [ ] **Step 3: Documentar en `docs/ARQUITECTURA.md`**

Agregar una sección "Editar y cancelar reservas" con: el código de reserva (6 caracteres, columna `turnos.codigo`, se muestra en la confirmación y en la agenda); la edición del panel (estados editables, campos, validación de disponibilidad con el bloqueo por servicio, reglas de cliente y de seña); la cancelación del panel (aviso de seña); y el buscador del portal (campos, comparación, "servicio y día solos no alcanzan", resultado ninguna/varias/una, datos tapados, verificación con teléfono o mail, bloqueo tras 5 fallos y tope de 20 búsquedas por minuto en `intentos_login`). Agregar a la tabla de pantallas `/turnos/[id]/editar` (panel) y mencionar el modal de `/reservar`. En "Pendiente" anotar: que el cliente pueda reprogramar, avisos por mail o WhatsApp, y la devolución automática de la seña.

- [ ] **Step 4: Verificación final**

Run: `npm run typecheck && npm test`
Expected: typecheck limpio y todos los tests pasan (los anteriores más los de `codigo`, `tope`, `edicion` y `busqueda`).

- [ ] **Step 5: Commit**

```bash
git add docs/ARQUITECTURA.md
git commit -m "docs: editar y cancelar reservas y buscar tu reserva"
```
