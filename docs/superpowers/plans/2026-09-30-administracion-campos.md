# Administración de campos (paso 1: base + Stock) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un módulo Administración (solo Admin) para ver, renombrar, ocultar y reordenar los campos de Stock, sumar campos propios de seis tipos y administrar las listas (marcas, tipos, ubicaciones, marcas y modelos de vehículo).

**Architecture:** Una tabla de definiciones de campos propios (`campos_personalizados`) y una de ajustes sobre los campos del sistema (`configuracion_campos`); los valores propios viven en una columna JSON `extras` de `cristales`. La lógica pura (claves, opciones, registro del sistema, combinación, validación de valores, conversión de datos viejos) está en `src/modules/campos/` sin Prisma ni Next, con tests; los servicios de base y las pantallas se apoyan en ella. Se migra `Caracteristica` a campos propios con un esquema "expandir / migrar / contraer".

**Tech Stack:** Next.js 16 (App Router, Server Actions), React 19, Prisma 7 + PostgreSQL (`jsonb`), Zod 4, Vitest 5, Tailwind 4.

**Spec:** `docs/superpowers/specs/2026-09-30-administracion-campos-design.md`

> **Antes de escribir código de Next:** `AGENTS.md` avisa que esta versión de Next tiene cambios incompatibles; las guías están en `node_modules/next/dist/docs/`. Si algo no compila o no se comporta como el plan, mirá ahí primero.

## Global Constraints

- Sin dependencias nuevas.
- Los módulos de `src/modules/campos/` que se marcan "puro" no importan Prisma, `next/*` ni `@/lib/db`; pueden usar `@/lib/zod`. No usan `node:crypto`: los ids se generan con `globalThis.crypto.randomUUID()` (los usan también componentes de cliente).
- `EntidadCampo`: `CRISTAL | SERVICIO | TURNO | CLIENTE` (los cuatro desde ya). `TipoCampo`: `TEXTO | TEXTO_LARGO | NUMERO | SI_NO | LISTA | FECHA`. Este paso solo habilita `CRISTAL`; las demás devuelven "Este módulo todavía no admite campos propios".
- Valores en `cristales.extras`: `TEXTO`/`TEXTO_LARGO` → string, `NUMERO` → number, `SI_NO` → boolean, `LISTA` → id de la opción, `FECHA` → `"YYYY-MM-DD"`. La clave del campo (`clave`) no cambia nunca, aunque se renombre la etiqueta.
- Campos protegidos de Stock (no se ocultan, no cambian de tipo, obligatoriedad fija): `codigo`, `descripcion`, `marcaId`, `tipoId`, `ubicacionId`, `stockMinimo`, `cantidad`. Ocultables: `codigoFabricante`, `lado`, `anchoMm`, `altoMm`, `espesorMm`, `ubicacionDeposito`, `costo`, `precioVenta`, `compatibilidades`.
- Borrados: archivar conserva los valores; eliminar o cambiar el tipo de un campo con datos exige confirmación que muestra cuántos registros se afectan; una opción de lista en uso solo se desactiva.
- Nombres de campo de formulario para campos propios: `extra_<clave>`; los errores de validación usan esa misma clave.
- Todas las rutas y Server Actions de `administracion/` exigen `requerirRol("ADMIN")` como primera sentencia de cada acción (el test de guardia lo verifica).
- Todo el texto de interfaz en español rioplatense (voseo), como el resto de la app. Identificadores en español, imports con alias `@/`.
- `prisma migrate dev` no funciona con la base embebida de `prisma dev`: las migraciones se generan con `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` y se aplican con `npx prisma migrate deploy`; después `npx prisma generate`.
- Cada commit termina con el trailer `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` (segundo `-m`). Las rutas con paréntesis se citan siempre en el shell.
- Trabajar en una rama `feature/administracion` cortada de `main` (no implementar sobre `main`).

## Review Focus

Condiciones que el spec implica y que ningún test "de casualidad" cubre; cada una tiene su test o verificación en la tarea indicada.

1. **Editar un cristal con campos del sistema ocultos no pisa sus valores guardados.** Zod 4 aplica los `default` dentro de `.partial()` (`actualizarCristalSchema.parse({})` hoy devuelve `lado`, `stockMinimo`, `caracteristicas` y `compatibilidades` con valores por defecto): una edición con `lado` o `compatibilidades` ocultos los borraría → Task 7 (test de `actualizarCristalSchema`).
2. **Un campo propio obligatorio que está oculto o archivado no bloquea el guardado y sus valores se conservan** → Task 3.
3. **Renombrar una opción no toca los valores guardados; una opción desactivada se sigue mostrando en los registros viejos; quitar una opción en uso se rechaza** → Tasks 1, 3 y 6.
4. **Etiquetas duplicadas sin distinguir mayúsculas ni tildes** ("Año" contra "ano"), también contra campos del sistema renombrados → Tasks 1 y 6.
5. **Un Empleado no accede a Administración, ni por POST directo a una acción** → Task 9 (guardia) y verificación manual en Task 12.
6. **La migración de `Caracteristica` conserva todos los valores** (Sí/No, número, texto, lista con valor fuera de las opciones) → Task 5.

---

## Mapa de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/modules/campos/tipos.ts` | Tipos y constantes compartidos (puro). |
| `src/modules/campos/clave.ts` | `generarClave`, `claveUnica`, `normalizarTexto` (puro). |
| `src/modules/campos/opciones.ts` | Operaciones sobre las opciones de una lista (puro). |
| `src/modules/campos/registro.ts` | Campos del sistema por entidad (puro). |
| `src/modules/campos/combinar.ts` | `combinarCampos`, `camposVisibles`, `moverCampo` (puro). |
| `src/modules/campos/extras.ts` | Validación y formato de los valores propios (puro, usa Zod). |
| `src/modules/campos/migracion.ts` | Conversión de `Caracteristica` a campos propios (puro). |
| `src/modules/campos/schemas.ts` | Schemas Zod de los formularios de Administración. |
| `src/modules/campos/campo.service.ts` | Acceso a `campos_personalizados` y `configuracion_campos`. |
| `src/modules/campos/lista.service.ts` | Administración de las listas del sistema. |
| `prisma/migrar-caracteristicas.ts` | Script único: copia `Caracteristica` a campos propios. |
| `src/components/campos/CampoPersonalizado.tsx` | Control de formulario para un campo propio. |
| `src/app/(panel)/administracion/**` | Pantallas y acciones de Administración. |

---

### Task 1: Tipos, claves y opciones

**Files:**
- Create: `src/modules/campos/tipos.ts`, `src/modules/campos/clave.ts`, `src/modules/campos/opciones.ts`
- Test: `src/modules/campos/clave.test.ts`, `src/modules/campos/opciones.test.ts`

**Interfaces:**
- Produces (`tipos.ts`): `ENTIDADES_CAMPO`, `EntidadCampo`, `TIPOS_CAMPO`, `TipoCampo`, `ETIQUETA_TIPO: Record<TipoCampo, string>`, `OpcionCampo { id: string; etiqueta: string; activo: boolean }`, `ValorExtra = string | number | boolean`, `Extras = Record<string, ValorExtra>`, `nombreInput(clave): string` (`"extra_" + clave`), `CampoPropio` (ver código).
- Produces (`clave.ts`): `normalizarTexto(t: string): string`, `generarClave(etiqueta: string): string`, `claveUnica(etiqueta: string, existentes: Iterable<string>): string`.
- Produces (`opciones.ts`): `GeneradorId = () => string`, `generarIdOpcion: GeneradorId`, `etiquetasDeTexto(texto: string): string[]`, `crearOpciones(etiquetas: string[], generarId?: GeneradorId): OpcionCampo[]`, `validarOpciones(opciones: OpcionCampo[]): string | null`, `agregarOpcion(opciones, etiqueta, generarId?)`, `renombrarOpcion(opciones, id, etiqueta)`, `alternarOpcion(opciones, id, activo)`, `quitarOpcion(opciones, id)`.

- [ ] **Step 1: Write the failing tests**

Crear `src/modules/campos/clave.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { claveUnica, generarClave, normalizarTexto } from "./clave";

describe("generarClave", () => {
  it("pasa a minúsculas, sin tildes y con guiones bajos", () => {
    expect(generarClave("Sensor de lluvia")).toBe("sensor_de_lluvia");
    expect(generarClave("Año de fabricación")).toBe("ano_de_fabricacion");
    expect(generarClave("  Ñandú / Test!! ")).toBe("nandu_test");
  });

  it("usa 'campo' si no queda ningún carácter válido", () => {
    expect(generarClave("!!!")).toBe("campo");
    expect(generarClave("")).toBe("campo");
  });

  it("se corta a 40 caracteres sin dejar un guion bajo al final", () => {
    const clave = generarClave("a".repeat(39) + " bbb");
    expect(clave.length).toBeLessThanOrEqual(40);
    expect(clave.endsWith("_")).toBe(false);
  });
});

describe("claveUnica", () => {
  it("devuelve la clave base si está libre", () => {
    expect(claveUnica("Color", ["costo"])).toBe("color");
  });

  it("agrega un sufijo numérico si ya existe", () => {
    expect(claveUnica("Color", ["color"])).toBe("color_2");
    expect(claveUnica("Color", ["color", "color_2"])).toBe("color_3");
  });

  it("no choca con las claves reservadas que se le pasen", () => {
    expect(claveUnica("Costo", ["costo", "codigo"])).toBe("costo_2");
  });
});

describe("normalizarTexto", () => {
  it("ignora mayúsculas, tildes y espacios de los bordes y repetidos", () => {
    expect(normalizarTexto("  Sensor  de LLUVIA ")).toBe(normalizarTexto("sensor de lluvia"));
    expect(normalizarTexto("Año")).toBe(normalizarTexto("ano"));
  });
});
```

Crear `src/modules/campos/opciones.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  agregarOpcion,
  alternarOpcion,
  crearOpciones,
  etiquetasDeTexto,
  quitarOpcion,
  renombrarOpcion,
  validarOpciones,
} from "./opciones";

const ids = () => {
  let n = 0;
  return () => `o${++n}`;
};

describe("etiquetasDeTexto", () => {
  it("separa por renglón, recorta y descarta vacíos", () => {
    expect(etiquetasDeTexto("Verde\r\n  Gris \n\n Bronce ")).toEqual(["Verde", "Gris", "Bronce"]);
  });
});

describe("crearOpciones", () => {
  it("crea opciones activas con ids únicos y descarta etiquetas vacías", () => {
    const r = crearOpciones([" Verde ", "", "Gris"], ids());
    expect(r).toEqual([
      { id: "o1", etiqueta: "Verde", activo: true },
      { id: "o2", etiqueta: "Gris", activo: true },
    ]);
  });
});

describe("validarOpciones", () => {
  it("acepta una lista válida", () => {
    expect(validarOpciones(crearOpciones(["A", "B"], ids()))).toBeNull();
  });

  it("rechaza etiquetas repetidas sin distinguir mayúsculas ni tildes", () => {
    expect(validarOpciones(crearOpciones(["Año", "ANO"], ids()))).toMatch(/repetirse/);
  });

  it("rechaza una lista sin opciones activas", () => {
    const apagadas = crearOpciones(["A", "B"], ids()).map((o) => ({ ...o, activo: false }));
    expect(validarOpciones(apagadas)).toMatch(/al menos una opción activa/);
    expect(validarOpciones([])).toMatch(/al menos una opción activa/);
  });

  it("rechaza una etiqueta vacía", () => {
    expect(validarOpciones([{ id: "x", etiqueta: "  ", activo: true }])).toMatch(/vacía/);
  });
});

describe("operaciones sobre opciones", () => {
  const base = crearOpciones(["Verde", "Gris"], ids());

  it("agrega al final con un id nuevo", () => {
    const r = agregarOpcion(base, " Bronce ", () => "nuevo");
    expect(r.at(-1)).toEqual({ id: "nuevo", etiqueta: "Bronce", activo: true });
    expect(r).toHaveLength(3);
  });

  it("renombrar cambia la etiqueta y conserva el id (los valores guardados no se tocan)", () => {
    const r = renombrarOpcion(base, "o1", "Verde oscuro");
    expect(r[0]).toEqual({ id: "o1", etiqueta: "Verde oscuro", activo: true });
    expect(r[1]).toEqual(base[1]);
  });

  it("alternar activa o desactiva sin borrar la opción", () => {
    const r = alternarOpcion(base, "o2", false);
    expect(r[1]).toEqual({ id: "o2", etiqueta: "Gris", activo: false });
    expect(r).toHaveLength(2);
  });

  it("quitar elimina solo la opción indicada", () => {
    expect(quitarOpcion(base, "o1").map((o) => o.id)).toEqual(["o2"]);
  });

  it("no modifica la lista original", () => {
    renombrarOpcion(base, "o1", "X");
    alternarOpcion(base, "o1", false);
    quitarOpcion(base, "o1");
    expect(base.map((o) => o.etiqueta)).toEqual(["Verde", "Gris"]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/modules/campos`
Expected: FAIL (`Failed to resolve import "./clave"` y `"./opciones"`).

- [ ] **Step 3: Write minimal implementation**

Crear `src/modules/campos/tipos.ts`:

```ts
// Tipos compartidos del motor de campos. Sin Prisma ni Next: los usan módulos puros y componentes de cliente.

export const ENTIDADES_CAMPO = ["CRISTAL", "SERVICIO", "TURNO", "CLIENTE"] as const;
export type EntidadCampo = (typeof ENTIDADES_CAMPO)[number];

export const TIPOS_CAMPO = ["TEXTO", "TEXTO_LARGO", "NUMERO", "SI_NO", "LISTA", "FECHA"] as const;
export type TipoCampo = (typeof TIPOS_CAMPO)[number];

export const ETIQUETA_TIPO: Record<TipoCampo, string> = {
  TEXTO: "Texto",
  TEXTO_LARGO: "Texto largo",
  NUMERO: "Número",
  SI_NO: "Sí / No",
  LISTA: "Lista de opciones",
  FECHA: "Fecha",
};

export interface OpcionCampo {
  id: string;
  etiqueta: string;
  activo: boolean;
}

export type ValorExtra = string | number | boolean;
export type Extras = Record<string, ValorExtra>;

/** Nombre del control de formulario de un campo propio. */
export const nombreInput = (clave: string) => `extra_${clave}`;

/** Campo propio tal como lo usa la lógica (ya sin detalles de Prisma). */
export interface CampoPropio {
  id: string;
  entidad: EntidadCampo;
  clave: string;
  etiqueta: string;
  ayuda: string | null;
  tipo: TipoCampo;
  requerido: boolean;
  unidad: string | null;
  opciones: OpcionCampo[];
  orden: number;
  visible: boolean;
  archivado: boolean;
}
```

Crear `src/modules/campos/clave.ts`:

```ts
// Puro.

/** Para comparar etiquetas: sin mayúsculas, sin tildes y con espacios normalizados. */
export const normalizarTexto = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

/** "Año de fabricación" → "ano_de_fabricacion". Máximo 40 caracteres. */
export function generarClave(etiqueta: string): string {
  const base = normalizarTexto(etiqueta)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40)
    .replace(/_+$/g, "");
  return base || "campo";
}

/** Clave a partir de la etiqueta que no choque con `existentes` (se agrega `_2`, `_3`…). */
export function claveUnica(etiqueta: string, existentes: Iterable<string>): string {
  const usadas = new Set(existentes);
  const base = generarClave(etiqueta);
  if (!usadas.has(base)) return base;
  let n = 2;
  while (usadas.has(`${base}_${n}`)) n++;
  return `${base}_${n}`;
}
```

Crear `src/modules/campos/opciones.ts`:

```ts
import { normalizarTexto } from "./clave";
import type { OpcionCampo } from "./tipos";

// Puro. Las operaciones devuelven una lista nueva; no modifican la recibida.

export type GeneradorId = () => string;
export const generarIdOpcion: GeneradorId = () => `o_${globalThis.crypto.randomUUID().slice(0, 8)}`;

/** Un renglón por opción; se recortan los espacios y se descartan los renglones vacíos. */
export function etiquetasDeTexto(texto: string): string[] {
  return texto
    .split(/\r?\n/)
    .map((e) => e.trim())
    .filter((e) => e !== "");
}

export function crearOpciones(etiquetas: string[], generarId: GeneradorId = generarIdOpcion): OpcionCampo[] {
  return etiquetas
    .map((e) => e.trim())
    .filter((e) => e !== "")
    .map((etiqueta) => ({ id: generarId(), etiqueta, activo: true }));
}

/** Motivo por el que la lista no es válida, o `null` si lo es. */
export function validarOpciones(opciones: OpcionCampo[]): string | null {
  if (opciones.some((o) => o.etiqueta.trim() === "")) return "Una opción no puede estar vacía.";
  const vistas = new Set<string>();
  for (const o of opciones) {
    const n = normalizarTexto(o.etiqueta);
    if (vistas.has(n)) return "Las opciones no pueden repetirse.";
    vistas.add(n);
  }
  if (!opciones.some((o) => o.activo)) return "Dejá al menos una opción activa.";
  return null;
}

export function agregarOpcion(
  opciones: OpcionCampo[],
  etiqueta: string,
  generarId: GeneradorId = generarIdOpcion,
): OpcionCampo[] {
  return [...opciones, { id: generarId(), etiqueta: etiqueta.trim(), activo: true }];
}

export const renombrarOpcion = (opciones: OpcionCampo[], id: string, etiqueta: string): OpcionCampo[] =>
  opciones.map((o) => (o.id === id ? { ...o, etiqueta: etiqueta.trim() } : o));

export const alternarOpcion = (opciones: OpcionCampo[], id: string, activo: boolean): OpcionCampo[] =>
  opciones.map((o) => (o.id === id ? { ...o, activo } : o));

export const quitarOpcion = (opciones: OpcionCampo[], id: string): OpcionCampo[] =>
  opciones.filter((o) => o.id !== id);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/modules/campos`
Expected: PASS (todos los tests de `clave.test.ts` y `opciones.test.ts`).

- [ ] **Step 5: Commit**

```bash
git add src/modules/campos
git commit -m "feat: tipos, claves y opciones del motor de campos" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Registro de campos del sistema y combinación

**Files:**
- Create: `src/modules/campos/registro.ts`, `src/modules/campos/combinar.ts`
- Test: `src/modules/campos/combinar.test.ts`

**Interfaces:**
- Consumes: `EntidadCampo`, `TipoCampo`, `OpcionCampo`, `CampoPropio` (Task 1).
- Produces (`registro.ts`): `SeccionCampo`, `SECCIONES: { id: SeccionCampo; etiqueta: string }[]`, `ListaSistema`, `CampoSistema`, `REGISTRO: Record<EntidadCampo, CampoSistema[]>`, `clavesReservadas(entidad): string[]`.
- Produces (`combinar.ts`): `ConfigCampo { clave; etiqueta: string | null; ayuda: string | null; oculto: boolean; orden: number | null }`, `CampoFinal` (ver código), `combinarCampos(entidad, configuraciones, propios): CampoFinal[]`, `camposVisibles(campos): CampoFinal[]`, `moverCampo(campos, clave, direccion: "ARRIBA" | "ABAJO"): { clave: string; orden: number }[]`.

- [ ] **Step 1: Write the failing test**

Crear `src/modules/campos/combinar.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { camposVisibles, combinarCampos, moverCampo, type ConfigCampo } from "./combinar";
import { clavesReservadas, REGISTRO } from "./registro";
import type { CampoPropio } from "./tipos";

const propio = (cambios: Partial<CampoPropio> = {}): CampoPropio => ({
  id: "p1",
  entidad: "CRISTAL",
  clave: "sensor_de_lluvia",
  etiqueta: "Sensor de lluvia",
  ayuda: null,
  tipo: "SI_NO",
  requerido: false,
  unidad: null,
  opciones: [],
  orden: 10,
  visible: true,
  archivado: false,
  ...cambios,
});

const config = (clave: string, cambios: Partial<ConfigCampo> = {}): ConfigCampo => ({
  clave,
  etiqueta: null,
  ayuda: null,
  oculto: false,
  orden: null,
  ...cambios,
});

const claves = (campos: { clave: string }[]) => campos.map((c) => c.clave);

describe("registro", () => {
  it("los campos protegidos de Stock no son ocultables", () => {
    const protegidos = ["codigo", "descripcion", "marcaId", "tipoId", "ubicacionId", "stockMinimo", "cantidad"];
    for (const clave of protegidos) {
      const c = REGISTRO.CRISTAL.find((x) => x.clave === clave);
      expect(c?.protegido, clave).toBe(true);
      expect(c?.ocultable, clave).toBe(false);
    }
  });

  it("clavesReservadas devuelve todas las claves del sistema", () => {
    expect(clavesReservadas("CRISTAL")).toContain("costo");
    expect(clavesReservadas("CRISTAL")).toHaveLength(REGISTRO.CRISTAL.length);
  });
});

describe("combinarCampos", () => {
  it("sin ajustes devuelve los campos de fábrica, con los propios al final", () => {
    const r = combinarCampos("CRISTAL", [], [propio()]);
    expect(r[0].clave).toBe("codigo");
    expect(r.at(-1)?.clave).toBe("sensor_de_lluvia");
    expect(r.at(-1)?.origen).toBe("PROPIO");
    expect(r.at(-1)?.seccion).toBe("adicionales");
    expect(r.filter((c) => c.origen === "SISTEMA")).toHaveLength(REGISTRO.CRISTAL.length);
  });

  it("aplica etiqueta y ayuda ajustadas; una etiqueta o ayuda en blanco vuelve a la de fábrica", () => {
    const r = combinarCampos(
      "CRISTAL",
      [config("costo", { etiqueta: "Precio de compra", ayuda: "Sin IVA" }), config("precioVenta", { etiqueta: "  ", ayuda: " " })],
      [],
    );
    expect(r.find((c) => c.clave === "costo")).toMatchObject({ etiqueta: "Precio de compra", ayuda: "Sin IVA" });
    expect(r.find((c) => c.clave === "precioVenta")?.etiqueta).toBe("Precio de venta");
  });

  it("oculta solo los campos ocultables: el ajuste sobre un protegido se ignora", () => {
    const r = combinarCampos("CRISTAL", [config("costo", { oculto: true }), config("codigo", { oculto: true })], []);
    expect(r.find((c) => c.clave === "costo")?.visible).toBe(false);
    expect(r.find((c) => c.clave === "codigo")?.visible).toBe(true);
  });

  it("reordena dentro de la sección según `orden`", () => {
    const r = combinarCampos("CRISTAL", [config("descripcion", { orden: 1 })], []);
    const identificacion = r.filter((c) => c.seccion === "identificacion");
    expect(identificacion[0].clave).toBe("descripcion");
  });

  it("un campo propio archivado u oculto no es visible; los de otra entidad se ignoran", () => {
    const r = combinarCampos(
      "CRISTAL",
      [],
      [propio({ id: "a", clave: "a", archivado: true }), propio({ id: "b", clave: "b", visible: false }), propio({ id: "c", clave: "c", entidad: "SERVICIO" })],
    );
    expect(r.find((c) => c.clave === "a")).toMatchObject({ visible: false, archivado: true });
    expect(r.find((c) => c.clave === "b")?.visible).toBe(false);
    expect(r.find((c) => c.clave === "c")).toBeUndefined();
  });

  it("el campo propio conserva tipo, unidad, opciones, obligatorio e id", () => {
    const opciones = [{ id: "o1", etiqueta: "Verde", activo: true }];
    const r = combinarCampos("CRISTAL", [], [propio({ tipo: "LISTA", opciones, requerido: true, unidad: null })]);
    expect(r.at(-1)).toMatchObject({ tipo: "LISTA", opciones, requerido: true, id: "p1", protegido: false, ocultable: true });
  });
});

describe("camposVisibles", () => {
  it("deja solo los visibles y no archivados", () => {
    const todos = combinarCampos("CRISTAL", [config("costo", { oculto: true })], [propio({ archivado: true })]);
    const visibles = camposVisibles(todos);
    expect(claves(visibles)).not.toContain("costo");
    expect(claves(visibles)).not.toContain("sensor_de_lluvia");
    expect(claves(visibles)).toContain("codigo");
  });
});

describe("moverCampo", () => {
  const todos = () => combinarCampos("CRISTAL", [], []);

  it("intercambia con el vecino de la sección y renumera la sección completa", () => {
    const r = moverCampo(todos(), "descripcion", "ARRIBA");
    const identificacion = REGISTRO.CRISTAL.filter((c) => c.seccion === "identificacion").map((c) => c.clave);
    expect(identificacion.slice(0, 3)).toEqual(["codigo", "codigoFabricante", "descripcion"]);
    expect(r.map((c) => c.clave)).toEqual(["codigo", "descripcion", "codigoFabricante"]);
    expect(r.map((c) => c.orden)).toEqual([10, 20, 30]);
  });

  it("no hace nada en los bordes ni con una clave inexistente", () => {
    expect(moverCampo(todos(), "codigo", "ARRIBA")).toEqual([]);
    expect(moverCampo(todos(), "descripcion", "ABAJO").length).toBeGreaterThan(0);
    expect(moverCampo(todos(), "noExiste", "ABAJO")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/modules/campos/combinar.test.ts`
Expected: FAIL (imports no resueltos).

- [ ] **Step 3: Write minimal implementation**

Crear `src/modules/campos/registro.ts`:

```ts
import type { EntidadCampo, TipoCampo } from "./tipos";

// Puro. Campos que el sistema trae de fábrica; lo que el Admin ajusta se guarda aparte (configuracion_campos).

export type SeccionCampo = "identificacion" | "principales" | "compatibilidades" | "stock" | "adicionales";

export const SECCIONES: { id: SeccionCampo; etiqueta: string }[] = [
  { id: "identificacion", etiqueta: "Identificación" },
  { id: "principales", etiqueta: "Características principales" },
  { id: "compatibilidades", etiqueta: "Vehículos compatibles" },
  { id: "stock", etiqueta: "Stock y precios" },
  { id: "adicionales", etiqueta: "Datos adicionales" },
];

export type ListaSistema = "marcas" | "tipos" | "ubicaciones" | "lado";

export interface CampoSistema {
  clave: string;
  etiqueta: string;
  ayuda?: string;
  tipo: TipoCampo;
  seccion: SeccionCampo;
  /** La base o la lógica lo exigen: es obligatorio siempre. */
  requerido: boolean;
  /** No se oculta, no cambia de tipo y su obligatoriedad no se edita. */
  protegido: boolean;
  ocultable: boolean;
  unidad?: string;
  lista?: ListaSistema;
  soloLectura?: boolean;
  /** Sección con diseño propio (vehículos compatibles). */
  especial?: boolean;
}

const cristal = (
  clave: string,
  etiqueta: string,
  tipo: TipoCampo,
  seccion: SeccionCampo,
  extra: Partial<CampoSistema> & { protegido?: boolean } = {},
): CampoSistema => {
  const protegido = extra.protegido ?? false;
  return { clave, etiqueta, tipo, seccion, requerido: protegido && clave !== "cantidad", protegido, ocultable: !protegido, ...extra };
};

export const REGISTRO: Record<EntidadCampo, CampoSistema[]> = {
  CRISTAL: [
    cristal("codigo", "Código interno", "TEXTO", "identificacion", { protegido: true, ayuda: "Ej. PB-HIL-16" }),
    cristal("codigoFabricante", "Código de fabricante", "TEXTO", "identificacion", { ayuda: "Eurocode o catálogo" }),
    cristal("descripcion", "Descripción", "TEXTO", "identificacion", { protegido: true }),
    cristal("marcaId", "Marca", "LISTA", "principales", { protegido: true, lista: "marcas" }),
    cristal("tipoId", "Tipo de cristal", "LISTA", "principales", { protegido: true, lista: "tipos" }),
    cristal("ubicacionId", "Ubicación en el vehículo", "LISTA", "principales", { protegido: true, lista: "ubicaciones" }),
    cristal("lado", "Lado", "LISTA", "principales", { lista: "lado" }),
    cristal("anchoMm", "Ancho (mm)", "NUMERO", "principales", { unidad: "mm" }),
    cristal("altoMm", "Alto (mm)", "NUMERO", "principales", { unidad: "mm" }),
    cristal("espesorMm", "Espesor (mm)", "NUMERO", "principales", { unidad: "mm" }),
    cristal("compatibilidades", "Vehículos compatibles", "LISTA", "compatibilidades", { especial: true }),
    cristal("cantidad", "Cantidad", "NUMERO", "stock", { protegido: true, soloLectura: true }),
    cristal("stockMinimo", "Stock mínimo", "NUMERO", "stock", { protegido: true, ayuda: "Avisa cuando hay que reponer" }),
    cristal("ubicacionDeposito", "Ubicación en depósito", "TEXTO", "stock"),
    cristal("costo", "Costo", "NUMERO", "stock"),
    cristal("precioVenta", "Precio de venta", "NUMERO", "stock"),
  ],
  SERVICIO: [],
  TURNO: [],
  CLIENTE: [],
};

export const clavesReservadas = (entidad: EntidadCampo): string[] => REGISTRO[entidad].map((c) => c.clave);
```

Crear `src/modules/campos/combinar.ts`:

```ts
import { REGISTRO, SECCIONES, type ListaSistema, type SeccionCampo } from "./registro";
import type { CampoPropio, EntidadCampo, OpcionCampo, TipoCampo } from "./tipos";

// Puro. Única fuente para el formulario, la ficha y la pantalla de Administración.

export interface ConfigCampo {
  clave: string;
  etiqueta: string | null;
  ayuda: string | null;
  oculto: boolean;
  orden: number | null;
}

export interface CampoFinal {
  clave: string;
  etiqueta: string;
  ayuda: string | null;
  tipo: TipoCampo;
  origen: "SISTEMA" | "PROPIO";
  seccion: SeccionCampo;
  requerido: boolean;
  protegido: boolean;
  ocultable: boolean;
  visible: boolean;
  archivado: boolean;
  orden: number;
  unidad: string | null;
  lista: ListaSistema | null;
  soloLectura: boolean;
  especial: boolean;
  opciones: OpcionCampo[];
  id: string | null;
}

const PASO = 10;
const enBlanco = (t: string | null | undefined) => (t ?? "").trim();

export function combinarCampos(
  entidad: EntidadCampo,
  configuraciones: ConfigCampo[],
  propios: CampoPropio[],
): CampoFinal[] {
  const ajustes = new Map(configuraciones.map((c) => [c.clave, c]));

  const sistema = REGISTRO[entidad].map((c, i): CampoFinal => {
    const ajuste = ajustes.get(c.clave);
    return {
      clave: c.clave,
      etiqueta: enBlanco(ajuste?.etiqueta) || c.etiqueta,
      ayuda: enBlanco(ajuste?.ayuda) || c.ayuda || null,
      tipo: c.tipo,
      origen: "SISTEMA",
      seccion: c.seccion,
      requerido: c.requerido,
      protegido: c.protegido,
      ocultable: c.ocultable,
      visible: c.ocultable ? !ajuste?.oculto : true,
      archivado: false,
      orden: ajuste?.orden ?? (i + 1) * PASO,
      unidad: c.unidad ?? null,
      lista: c.lista ?? null,
      soloLectura: c.soloLectura ?? false,
      especial: c.especial ?? false,
      opciones: [],
      id: null,
    };
  });

  const adicionales = propios
    .filter((p) => p.entidad === entidad)
    .map(
      (p): CampoFinal => ({
        clave: p.clave,
        etiqueta: p.etiqueta,
        ayuda: p.ayuda,
        tipo: p.tipo,
        origen: "PROPIO",
        seccion: "adicionales",
        requerido: p.requerido,
        protegido: false,
        ocultable: true,
        visible: p.visible && !p.archivado,
        archivado: p.archivado,
        orden: p.orden,
        unidad: p.unidad,
        lista: null,
        soloLectura: false,
        especial: false,
        opciones: p.opciones,
        id: p.id,
      }),
    );

  const ordenSeccion = new Map(SECCIONES.map((s, i) => [s.id, i]));
  return [...sistema, ...adicionales].sort(
    (a, b) => ordenSeccion.get(a.seccion)! - ordenSeccion.get(b.seccion)! || a.orden - b.orden,
  );
}

export const camposVisibles = (campos: CampoFinal[]): CampoFinal[] => campos.filter((c) => c.visible && !c.archivado);

/**
 * Sube o baja un campo dentro de su sección. Devuelve el nuevo `orden` (10, 20, 30…) de TODOS los campos
 * de esa sección, o una lista vacía si no hay nada que mover (borde de la sección o clave inexistente).
 */
export function moverCampo(
  campos: CampoFinal[],
  clave: string,
  direccion: "ARRIBA" | "ABAJO",
): { clave: string; orden: number }[] {
  const campo = campos.find((c) => c.clave === clave);
  if (!campo) return [];
  const seccion = campos.filter((c) => c.seccion === campo.seccion);
  const i = seccion.findIndex((c) => c.clave === clave);
  const j = direccion === "ARRIBA" ? i - 1 : i + 1;
  if (j < 0 || j >= seccion.length) return [];
  const reordenada = [...seccion];
  [reordenada[i], reordenada[j]] = [reordenada[j], reordenada[i]];
  return reordenada.map((c, n) => ({ clave: c.clave, orden: (n + 1) * PASO }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/modules/campos/combinar.test.ts`
Expected: PASS. (Si falla "intercambia con el vecino", revisar que el orden de fábrica de `identificacion` sea `codigo`, `codigoFabricante`, `descripcion`.)

- [ ] **Step 5: Commit**

```bash
git add src/modules/campos/registro.ts src/modules/campos/combinar.ts src/modules/campos/combinar.test.ts
git commit -m "feat: registro de campos del sistema y combinacion con ajustes y campos propios" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Valores de los campos propios

**Files:**
- Create: `src/modules/campos/extras.ts`
- Test: `src/modules/campos/extras.test.ts`

**Interfaces:**
- Consumes: `CampoPropio`, `Extras`, `ValorExtra` (Task 1); `@/lib/zod`.
- Produces: `nombreInput(clave: string): string` (`"extra_" + clave`), `procesarExtras(propios: CampoPropio[], entrada: Record<string, unknown>, actuales?: Extras): Extras` (lanza `ZodError`, con las rutas `extra_<clave>`), `formatearValor(campo: Pick<CampoPropio, "tipo" | "unidad" | "opciones">, valor: ValorExtra | undefined): string`.

- [ ] **Step 1: Write the failing test**

Crear `src/modules/campos/extras.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { formatearValor, nombreInput, procesarExtras } from "./extras";
import type { CampoPropio } from "./tipos";

const campo = (cambios: Partial<CampoPropio>): CampoPropio => ({
  id: "id",
  entidad: "CRISTAL",
  clave: "c",
  etiqueta: "C",
  ayuda: null,
  tipo: "TEXTO",
  requerido: false,
  unidad: null,
  opciones: [],
  orden: 10,
  visible: true,
  archivado: false,
  ...cambios,
});

const lista = campo({
  clave: "tono",
  tipo: "LISTA",
  opciones: [
    { id: "o1", etiqueta: "Verde", activo: true },
    { id: "o2", etiqueta: "Gris", activo: false },
  ],
});

const errores = (fn: () => unknown): Record<string, string> => {
  try {
    fn();
  } catch (e) {
    if (e instanceof ZodError) return Object.fromEntries(e.issues.map((i) => [i.path.join("."), i.message]));
    throw e;
  }
  return {};
};

describe("procesarExtras: tipos", () => {
  it("texto: recorta y descarta el vacío", () => {
    const t = campo({ clave: "nota", tipo: "TEXTO" });
    expect(procesarExtras([t], { [nombreInput("nota")]: "  hola  " })).toEqual({ nota: "hola" });
    expect(procesarExtras([t], { [nombreInput("nota")]: "   " })).toEqual({});
    expect(procesarExtras([t], {})).toEqual({}); // ausente = vacío
  });

  it("texto: rechaza más de 200 caracteres; texto largo admite hasta 2000", () => {
    const corto = campo({ clave: "t", tipo: "TEXTO" });
    const largo = campo({ clave: "l", tipo: "TEXTO_LARGO" });
    expect(Object.keys(errores(() => procesarExtras([corto], { extra_t: "x".repeat(201) })))).toEqual(["extra_t"]);
    expect(procesarExtras([largo], { extra_l: "x".repeat(2000) })).toEqual({ l: "x".repeat(2000) });
    expect(Object.keys(errores(() => procesarExtras([largo], { extra_l: "x".repeat(2001) })))).toEqual(["extra_l"]);
  });

  it("número: acepta texto con coma decimal y rechaza lo que no es número", () => {
    const n = campo({ clave: "n", tipo: "NUMERO" });
    expect(procesarExtras([n], { extra_n: "12,5" })).toEqual({ n: 12.5 });
    expect(procesarExtras([n], { extra_n: 0 })).toEqual({ n: 0 });
    expect(procesarExtras([n], {})).toEqual({}); // ausente = vacío
    expect(errores(() => procesarExtras([n], { extra_n: "abc" })).extra_n).toBe("Ingresá un número");
  });

  it("sí/no: una casilla sin tildar (ausente) es false y siempre queda guardada", () => {
    const b = campo({ clave: "b", tipo: "SI_NO" });
    expect(procesarExtras([b], { extra_b: "on" })).toEqual({ b: true });
    expect(procesarExtras([b], {})).toEqual({ b: false });
  });

  it("fecha: exige AAAA-MM-DD válida", () => {
    const f = campo({ clave: "f", tipo: "FECHA" });
    expect(procesarExtras([f], { extra_f: "2026-09-30" })).toEqual({ f: "2026-09-30" });
    expect(errores(() => procesarExtras([f], { extra_f: "30/09/2026" })).extra_f).toBeDefined();
    expect(errores(() => procesarExtras([f], { extra_f: "2026-02-31" })).extra_f).toBeDefined();
  });

  it("lista: solo opciones activas, más la que ya tenía guardada el registro", () => {
    expect(procesarExtras([lista], { extra_tono: "o1" })).toEqual({ tono: "o1" });
    expect(errores(() => procesarExtras([lista], { extra_tono: "o2" })).extra_tono).toBe("Elegí una opción válida");
    expect(errores(() => procesarExtras([lista], { extra_tono: "inexistente" })).extra_tono).toBe("Elegí una opción válida");
    expect(procesarExtras([lista], { extra_tono: "o2" }, { tono: "o2" })).toEqual({ tono: "o2" });
  });
});

describe("procesarExtras: obligatorios, ocultos y archivados", () => {
  it("un campo obligatorio vacío falla con 'Campo obligatorio'", () => {
    const t = campo({ clave: "nota", requerido: true });
    expect(errores(() => procesarExtras([t], {})).extra_nota).toBe("Campo obligatorio");
    expect(errores(() => procesarExtras([t], { extra_nota: "  " })).extra_nota).toBe("Campo obligatorio");
  });

  it("un campo obligatorio pero oculto o archivado no se exige y conserva su valor", () => {
    const oculto = campo({ clave: "a", requerido: true, visible: false });
    const archivado = campo({ clave: "b", requerido: true, archivado: true });
    expect(procesarExtras([oculto, archivado], {}, { a: "x", b: "y" })).toEqual({ a: "x", b: "y" });
    expect(procesarExtras([oculto, archivado], {})).toEqual({});
  });

  it("vaciar un campo opcional visible borra su valor guardado", () => {
    const t = campo({ clave: "nota" });
    expect(procesarExtras([t], { extra_nota: "" }, { nota: "viejo" })).toEqual({});
  });

  it("descarta los valores de campos que ya no existen y las claves desconocidas de la entrada", () => {
    const t = campo({ clave: "nota" });
    expect(procesarExtras([t], { extra_nota: "x", extra_otro: "y" }, { nota: "a", eliminado: "z" })).toEqual({ nota: "x" });
  });

  it("no modifica el objeto `actuales` recibido", () => {
    const t = campo({ clave: "nota" });
    const actuales = { nota: "a" };
    procesarExtras([t], { extra_nota: "b" }, actuales);
    expect(actuales).toEqual({ nota: "a" });
  });
});

describe("formatearValor", () => {
  it("formatea según el tipo", () => {
    expect(formatearValor(campo({ tipo: "SI_NO" }), true)).toBe("Sí");
    expect(formatearValor(campo({ tipo: "SI_NO" }), false)).toBe("No");
    expect(formatearValor(campo({ tipo: "NUMERO", unidad: "mm" }), 4.8)).toBe("4.8 mm");
    expect(formatearValor(campo({ tipo: "NUMERO" }), 3)).toBe("3");
    expect(formatearValor(campo({ tipo: "FECHA" }), "2026-09-30")).toBe("30/09/2026");
    expect(formatearValor(campo({ tipo: "TEXTO" }), "hola")).toBe("hola");
  });

  it("una lista muestra la etiqueta, incluso de una opción desactivada; sin valor o sin opción, un guion", () => {
    expect(formatearValor(lista, "o1")).toBe("Verde");
    expect(formatearValor(lista, "o2")).toBe("Gris");
    expect(formatearValor(lista, "borrada")).toBe("—");
    expect(formatearValor(lista, undefined)).toBe("—");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/modules/campos/extras.test.ts`
Expected: FAIL (`Failed to resolve import "./extras"`).

- [ ] **Step 3: Write minimal implementation**

Crear `src/modules/campos/extras.ts`:

```ts
import { z } from "@/lib/zod";
import { nombreInput, type CampoPropio, type Extras, type ValorExtra } from "./tipos";

// Puro (usa Zod). Valida y da formato a los valores de los campos propios.

export { nombreInput };

const vacioAUndefined = (v: unknown) =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "") ? undefined : v;

const opcional = (esquema: z.ZodType, requerido: boolean) =>
  z.preprocess(vacioAUndefined, requerido ? esquema : esquema.optional());

function fechaValida(s: string) {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(s);
}

function esquemaDe(campo: CampoPropio, valorGuardado: unknown): z.ZodType {
  switch (campo.tipo) {
    case "SI_NO":
      return z.preprocess((v) => v === true || v === "on" || v === "true", z.boolean());
    case "TEXTO":
      return opcional(z.string().trim().max(200), campo.requerido);
    case "TEXTO_LARGO":
      return opcional(z.string().trim().max(2000), campo.requerido);
    case "NUMERO":
      return z.preprocess(
        (v) => {
          const s = vacioAUndefined(v);
          return typeof s === "string" ? Number(s.replace(",", ".")) : s;
        },
        campo.requerido ? z.number() : z.number().optional(),
      );
    case "FECHA":
      return opcional(
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida").refine(fechaValida, "Fecha inválida"),
        campo.requerido,
      );
    case "LISTA": {
      const permitidas = new Set(campo.opciones.filter((o) => o.activo).map((o) => o.id));
      if (typeof valorGuardado === "string") permitidas.add(valorGuardado); // no bloquear registros viejos
      return opcional(z.string().refine((id) => permitidas.has(id), "Elegí una opción válida"), campo.requerido);
    }
  }
}

/**
 * Valida la entrada del formulario (claves `extra_<clave>`) y devuelve los extras resultantes.
 * Solo se validan los campos visibles y no archivados; los ocultos y archivados conservan su valor.
 * Los valores de campos que ya no existen se descartan. Lanza `ZodError` con rutas `extra_<clave>`.
 */
export function procesarExtras(propios: CampoPropio[], entrada: Record<string, unknown>, actuales: Extras = {}): Extras {
  const activos = propios.filter((p) => !p.archivado && p.visible);
  const forma: Record<string, z.ZodType> = {};
  for (const p of activos) forma[nombreInput(p.clave)] = esquemaDe(p, actuales[p.clave]);
  // Los campos ausentes (p. ej. una casilla sin tildar) se completan con `undefined` para validarlos igual que los vacíos.
  const completa = Object.fromEntries(activos.map((p) => [nombreInput(p.clave), entrada[nombreInput(p.clave)]]));
  const datos = z.object(forma).parse(completa) as Record<string, unknown>;

  const resultado: Extras = {};
  for (const p of propios) if (actuales[p.clave] !== undefined) resultado[p.clave] = actuales[p.clave];
  for (const p of activos) {
    const valor = datos[nombreInput(p.clave)];
    if (valor === undefined) delete resultado[p.clave];
    else resultado[p.clave] = valor as ValorExtra;
  }
  return resultado;
}

/** Texto para mostrar un valor en la ficha. */
export function formatearValor(
  campo: Pick<CampoPropio, "tipo" | "unidad" | "opciones">,
  valor: ValorExtra | undefined,
): string {
  if (valor === undefined) return "—";
  switch (campo.tipo) {
    case "SI_NO":
      return valor === true ? "Sí" : "No";
    case "LISTA":
      return campo.opciones.find((o) => o.id === valor)?.etiqueta ?? "—";
    case "NUMERO":
      return `${valor}${campo.unidad ? ` ${campo.unidad}` : ""}`;
    case "FECHA": {
      const [a, m, d] = String(valor).split("-");
      return `${d}/${m}/${a}`;
    }
    default:
      return String(valor);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/modules/campos/extras.test.ts`
Expected: PASS. Si `"Ingresá un número"` no aparece para `"abc"`, revisar `src/lib/zod.ts`: el mensaje sale del `customError` para `invalid_type` con `expected === "number"`.

- [ ] **Step 5: Commit**

```bash
git add src/modules/campos/extras.ts src/modules/campos/extras.test.ts
git commit -m "feat: validacion y formato de los valores de campos propios" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Base de datos — expandir (tablas nuevas, `extras`, columnas `activo`)

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260930130000_campos_personalizados/migration.sql` (lo genera Prisma)

**Interfaces:**
- Produces: modelos `CampoPersonalizado` y `ConfiguracionCampo`; enums `EntidadCampo` y `TipoCampo`; `Cristal.extras Json`; `activo Boolean` en `TipoCristal`, `UbicacionVehiculo`, `MarcaVehiculo` y `ModeloVehiculo`. `Caracteristica` y `CristalCaracteristica` siguen existiendo hasta la Task 8.

- [ ] **Step 1: Crear la rama**

Run: `git checkout -b feature/administracion`
Expected: `Switched to a new branch 'feature/administracion'`.

- [ ] **Step 2: Editar `prisma/schema.prisma`**

a) En `model TipoCristal`, agregar después de `descripcion String?`:

```prisma
  activo      Boolean   @default(true)
```

b) En `model UbicacionVehiculo`, agregar después de `orden Int @default(0)`:

```prisma
  activo     Boolean   @default(true)
```

c) En `model MarcaVehiculo`, agregar después de `nombre String @unique`:

```prisma
  activo  Boolean         @default(true)
```

d) En `model ModeloVehiculo`, agregar después de `nombre String`:

```prisma
  activo           Boolean                  @default(true)
```

e) En `model Cristal`, agregar después de `activo Boolean @default(true)`:

```prisma
  extras            Json              @default("{}") // valores de campos propios: { [clave]: valor }
```

f) Agregar al final del archivo:

```prisma
// =====================================================================
//  ADMINISTRACIÓN DE CAMPOS
// =====================================================================

enum EntidadCampo {
  CRISTAL
  SERVICIO
  TURNO
  CLIENTE
}

enum TipoCampo {
  TEXTO
  TEXTO_LARGO
  NUMERO
  SI_NO
  LISTA
  FECHA
}

/// Campo propio definido desde Administración. Sus valores se guardan en la columna `extras`
/// de la tabla de la entidad, indexados por `clave` (que nunca cambia).
model CampoPersonalizado {
  id          String       @id @default(cuid())
  entidad     EntidadCampo
  clave       String
  etiqueta    String
  ayuda       String?
  tipo        TipoCampo
  requerido   Boolean      @default(false)
  unidad      String? // solo NUMERO
  opciones    Json         @default("[]") // solo LISTA: [{ id, etiqueta, activo }]
  orden       Int          @default(0)
  visible     Boolean      @default(true)
  archivadoEn DateTime?    @map("archivado_en")
  creadoEn    DateTime     @default(now()) @map("creado_en")

  @@unique([entidad, clave])
  @@map("campos_personalizados")
}

/// Ajustes del Admin sobre un campo del sistema (etiqueta, ayuda, oculto, orden).
/// Sin fila, el campo usa sus valores de fábrica (ver `src/modules/campos/registro.ts`).
model ConfiguracionCampo {
  entidad  EntidadCampo
  clave    String
  etiqueta String?
  ayuda    String?
  oculto   Boolean      @default(false)
  orden    Int?

  @@id([entidad, clave])
  @@map("configuracion_campos")
}
```

- [ ] **Step 3: Generar y revisar el SQL de la migración**

```bash
mkdir -p prisma/migrations/20260930130000_campos_personalizados
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script > prisma/migrations/20260930130000_campos_personalizados/migration.sql
cat prisma/migrations/20260930130000_campos_personalizados/migration.sql
```

Expected: el SQL solo contiene `CREATE TYPE "EntidadCampo"`, `CREATE TYPE "TipoCampo"`, cuatro `ALTER TABLE ... ADD COLUMN "activo" BOOLEAN NOT NULL DEFAULT true`, `ALTER TABLE "cristales" ADD COLUMN "extras" JSONB NOT NULL DEFAULT '{}'`, y los `CREATE TABLE "campos_personalizados"` / `"configuracion_campos"` con sus índices. Si aparece algún `DROP`, parar y revisar el schema.

- [ ] **Step 4: Aplicar, regenerar el cliente y verificar**

Run: `npx prisma migrate deploy` y luego `npx prisma generate`
Expected: `Applying migration '20260930130000_campos_personalizados'` y `All migrations have been successfully applied.`

Run: `npm run typecheck`
Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: tablas de campos personalizados, columna extras y activo en listas" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Migrar `Caracteristica` a campos propios

**Files:**
- Create: `src/modules/campos/migracion.ts`, `prisma/migrar-caracteristicas.ts`
- Modify: `package.json` (script `db:migrar-caracteristicas`)
- Test: `src/modules/campos/migracion.test.ts`

**Interfaces:**
- Consumes: `claveUnica` (Task 1), `crearOpciones`, `GeneradorId`, `generarIdOpcion` (Task 1), `clavesReservadas` (Task 2), tablas nuevas (Task 4).
- Produces: `CaracteristicaAntigua`, `ValorAntiguo`, `CampoMigrado`, `convertirCaracteristicas(caracteristicas, valores, clavesOcupadas, generarId?): { campos: CampoMigrado[]; extrasPorCristal: Record<string, Extras> }`. Script idempotente `npm run db:migrar-caracteristicas`.

- [ ] **Step 1: Write the failing test**

Crear `src/modules/campos/migracion.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { convertirCaracteristicas, type CaracteristicaAntigua, type ValorAntiguo } from "./migracion";

const ids = () => {
  let n = 0;
  return () => `o${++n}`;
};

const car = (id: string, nombre: string, tipoDato: CaracteristicaAntigua["tipoDato"], extra: Partial<CaracteristicaAntigua> = {}): CaracteristicaAntigua => ({
  id,
  nombre,
  tipoDato,
  opciones: [],
  unidad: null,
  ...extra,
});
const val = (cristalId: string, caracteristicaId: string, valor: string): ValorAntiguo => ({ cristalId, caracteristicaId, valor });

describe("convertirCaracteristicas: definiciones", () => {
  it("mapea los tipos y ordena por nombre con orden 10, 20, 30…", () => {
    const { campos } = convertirCaracteristicas(
      [car("1", "Tonalidad", "OPCION", { opciones: ["Verde", "Gris"] }), car("2", "Antena", "BOOLEANO"), car("3", "Espesor extra", "NUMERO", { unidad: "mm" }), car("4", "Nota", "TEXTO")],
      [],
      [],
      ids(),
    );
    expect(campos.map((c) => [c.etiqueta, c.tipo, c.orden])).toEqual([
      ["Antena", "SI_NO", 10],
      ["Espesor extra", "NUMERO", 20],
      ["Nota", "TEXTO", 30],
      ["Tonalidad", "LISTA", 40],
    ]);
    expect(campos.find((c) => c.etiqueta === "Espesor extra")?.unidad).toBe("mm");
    expect(campos.find((c) => c.etiqueta === "Tonalidad")?.opciones).toEqual([
      { id: "o1", etiqueta: "Verde", activo: true },
      { id: "o2", etiqueta: "Gris", activo: true },
    ]);
  });

  it("genera claves únicas que no chocan con las reservadas ni entre sí", () => {
    const { campos } = convertirCaracteristicas([car("1", "Costo", "TEXTO"), car("2", "Color", "TEXTO"), car("3", "color", "TEXTO")], [], ["costo"], ids());
    expect(campos.map((c) => c.clave).sort()).toEqual(["color", "color_2", "costo_2"]);
  });

  it("sin datos devuelve listas vacías", () => {
    expect(convertirCaracteristicas([], [], [], ids())).toEqual({ campos: [], extrasPorCristal: {} });
  });
});

describe("convertirCaracteristicas: valores", () => {
  it("convierte cada tipo al formato nuevo y agrupa por cristal", () => {
    const cs = [car("b", "Antena", "BOOLEANO"), car("n", "Grosor", "NUMERO", { unidad: "mm" }), car("t", "Nota", "TEXTO"), car("o", "Tono", "OPCION", { opciones: ["Verde", "Gris"] })];
    const { campos, extrasPorCristal } = convertirCaracteristicas(
      cs,
      [val("c1", "b", "true"), val("c1", "n", "4,8"), val("c1", "t", "  hola "), val("c1", "o", "Gris"), val("c2", "b", "true")],
      [],
      ids(),
    );
    const clave = (etiqueta: string) => campos.find((c) => c.etiqueta === etiqueta)!.clave;
    const gris = campos.find((c) => c.etiqueta === "Tono")!.opciones.find((o) => o.etiqueta === "Gris")!.id;
    expect(extrasPorCristal.c1).toEqual({ [clave("Antena")]: true, [clave("Grosor")]: 4.8, [clave("Nota")]: "hola", [clave("Tono")]: gris });
    expect(extrasPorCristal.c2).toEqual({ [clave("Antena")]: true });
  });

  it("un Sí/No 'false' no guarda nada (ausente equivale a no)", () => {
    const { extrasPorCristal } = convertirCaracteristicas([car("b", "Antena", "BOOLEANO")], [val("c1", "b", "false")], [], ids());
    expect(extrasPorCristal).toEqual({});
  });

  it("un número que no es número se descarta", () => {
    const { extrasPorCristal } = convertirCaracteristicas([car("n", "Grosor", "NUMERO")], [val("c1", "n", "abc"), val("c2", "n", "")], [], ids());
    expect(extrasPorCristal).toEqual({});
  });

  it("un valor de lista fuera de las opciones agrega una opción inactiva y no se pierde el dato", () => {
    const { campos, extrasPorCristal } = convertirCaracteristicas(
      [car("o", "Tono", "OPCION", { opciones: ["Verde"] })],
      [val("c1", "o", "Bronce"), val("c2", "o", "Bronce")],
      [],
      ids(),
    );
    const tono = campos[0];
    const bronce = tono.opciones.find((o) => o.etiqueta === "Bronce");
    expect(bronce).toMatchObject({ activo: false });
    expect(tono.opciones).toHaveLength(2); // se agrega una sola vez
    expect(extrasPorCristal.c1).toEqual({ tono: bronce!.id });
    expect(extrasPorCristal.c2).toEqual({ tono: bronce!.id });
  });

  it("ignora valores de características que no existen", () => {
    expect(convertirCaracteristicas([], [val("c1", "fantasma", "x")], [], ids()).extrasPorCristal).toEqual({});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/modules/campos/migracion.test.ts`
Expected: FAIL (`Failed to resolve import "./migracion"`).

- [ ] **Step 3: Write minimal implementation**

Crear `src/modules/campos/migracion.ts`:

```ts
import { claveUnica } from "./clave";
import { crearOpciones, generarIdOpcion, type GeneradorId } from "./opciones";
import type { Extras, OpcionCampo, TipoCampo, ValorExtra } from "./tipos";

// Puro. Convierte las `Caracteristica` de la versión anterior en campos propios y sus valores en `extras`.

export interface CaracteristicaAntigua {
  id: string;
  nombre: string;
  tipoDato: "BOOLEANO" | "TEXTO" | "NUMERO" | "OPCION";
  opciones: string[];
  unidad: string | null;
}

export interface ValorAntiguo {
  cristalId: string;
  caracteristicaId: string;
  valor: string;
}

export interface CampoMigrado {
  idAntiguo: string;
  clave: string;
  etiqueta: string;
  tipo: TipoCampo;
  unidad: string | null;
  opciones: OpcionCampo[];
  orden: number;
}

const TIPO: Record<CaracteristicaAntigua["tipoDato"], TipoCampo> = {
  BOOLEANO: "SI_NO",
  TEXTO: "TEXTO",
  NUMERO: "NUMERO",
  OPCION: "LISTA",
};

function convertirValor(campo: CampoMigrado, texto: string, generarId: GeneradorId): ValorExtra | undefined {
  const limpio = texto.trim();
  switch (campo.tipo) {
    case "SI_NO":
      return limpio === "true" ? true : undefined;
    case "NUMERO": {
      const n = Number(limpio.replace(",", "."));
      return limpio !== "" && Number.isFinite(n) ? n : undefined;
    }
    case "LISTA": {
      if (limpio === "") return undefined;
      let opcion = campo.opciones.find((o) => o.etiqueta === limpio);
      if (!opcion) {
        // El dato no estaba entre las opciones: se conserva como opción inactiva.
        opcion = { id: generarId(), etiqueta: limpio, activo: false };
        campo.opciones.push(opcion);
      }
      return opcion.id;
    }
    default:
      return limpio === "" ? undefined : limpio;
  }
}

export function convertirCaracteristicas(
  caracteristicas: CaracteristicaAntigua[],
  valores: ValorAntiguo[],
  clavesOcupadas: string[],
  generarId: GeneradorId = generarIdOpcion,
): { campos: CampoMigrado[]; extrasPorCristal: Record<string, Extras> } {
  const ocupadas = new Set(clavesOcupadas);
  const ordenadas = [...caracteristicas].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const campos = ordenadas.map((c, i): CampoMigrado => {
    const clave = claveUnica(c.nombre, ocupadas);
    ocupadas.add(clave);
    return {
      idAntiguo: c.id,
      clave,
      etiqueta: c.nombre.trim(),
      tipo: TIPO[c.tipoDato],
      unidad: c.tipoDato === "NUMERO" ? c.unidad : null,
      opciones: c.tipoDato === "OPCION" ? crearOpciones(c.opciones, generarId) : [],
      orden: (i + 1) * 10,
    };
  });

  const porId = new Map(campos.map((c) => [c.idAntiguo, c]));
  const extrasPorCristal: Record<string, Extras> = {};
  for (const v of valores) {
    const campo = porId.get(v.caracteristicaId);
    if (!campo) continue;
    const valor = convertirValor(campo, v.valor, generarId);
    if (valor === undefined) continue;
    (extrasPorCristal[v.cristalId] ??= {})[campo.clave] = valor;
  }
  return { campos, extrasPorCristal };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/modules/campos/migracion.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Crear el script de migración (idempotente) y el comando**

Crear `prisma/migrar-caracteristicas.ts` (consulta las tablas viejas con SQL crudo, así sigue compilando cuando las tablas ya no existan en el schema):

```ts
/**
 * Copia las `Caracteristica` de la versión anterior a campos propios de Stock y sus valores a `cristales.extras`.
 * Es idempotente: si ya hay campos propios de Stock, o ya no existen las tablas viejas, no hace nada.
 * Correrlo ANTES de la migración que elimina `caracteristicas` (esa migración lo verifica).
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { convertirCaracteristicas, type CaracteristicaAntigua, type ValorAntiguo } from "../src/modules/campos/migracion";
import { clavesReservadas } from "../src/modules/campos/registro";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  let antiguas: CaracteristicaAntigua[];
  try {
    antiguas = await db.$queryRaw<CaracteristicaAntigua[]>`
      SELECT id, nombre, tipo_dato::text AS "tipoDato", opciones, unidad FROM caracteristicas`;
  } catch {
    console.log("No existe la tabla caracteristicas: no hay nada que migrar.");
    return;
  }
  if (antiguas.length === 0) {
    console.log("No hay características cargadas: no hay nada que migrar.");
    return;
  }
  if ((await db.campoPersonalizado.count({ where: { entidad: "CRISTAL" } })) > 0) {
    console.log("Ya hay campos propios de Stock: se asume migrado, no se toca nada.");
    return;
  }

  const valores = await db.$queryRaw<ValorAntiguo[]>`
    SELECT cristal_id AS "cristalId", caracteristica_id AS "caracteristicaId", valor FROM cristal_caracteristicas`;
  const { campos, extrasPorCristal } = convertirCaracteristicas(antiguas, valores, clavesReservadas("CRISTAL"));

  await db.$transaction(async (tx) => {
    for (const c of campos) {
      await tx.campoPersonalizado.create({
        data: {
          entidad: "CRISTAL",
          clave: c.clave,
          etiqueta: c.etiqueta,
          tipo: c.tipo,
          unidad: c.unidad,
          opciones: c.opciones as unknown as Prisma.InputJsonArray,
          orden: c.orden,
        },
      });
    }
    for (const [cristalId, extras] of Object.entries(extrasPorCristal)) {
      await tx.cristal.update({ where: { id: cristalId }, data: { extras } });
    }
  });
  console.log(`Migrados ${campos.length} campos y los valores de ${Object.keys(extrasPorCristal).length} cristales.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
```

En `package.json`, agregar en `scripts` (después de `db:seed`):

```json
    "db:migrar-caracteristicas": "tsx prisma/migrar-caracteristicas.ts",
```

- [ ] **Step 6: Correrlo y verificar que no se perdió nada**

Antes, anotar cuántos hay. Run:

```bash
cat > tmp-conteo.ts <<'EOF'
import "dotenv/config";
import { db } from "./src/lib/db";
const n = async (q: Promise<{ n: number }[]>) => (await q)[0].n;
console.log("caracteristicas:", await n(db.$queryRaw`SELECT count(*)::int AS n FROM caracteristicas`));
console.log("valores viejos:", await n(db.$queryRaw`SELECT count(*)::int AS n FROM cristal_caracteristicas`));
console.log("campos propios:", await db.campoPersonalizado.count());
console.log("cristales con extras:", await n(db.$queryRaw`SELECT count(*)::int AS n FROM cristales WHERE extras <> '{}'::jsonb`));
console.log("cristales con valores viejos:", await n(db.$queryRaw`SELECT count(DISTINCT cristal_id)::int AS n FROM cristal_caracteristicas`));
process.exit(0);
EOF
npx tsx tmp-conteo.ts 2>&1 | grep -E "caracteristicas|valores|campos|cristales"
npm run db:migrar-caracteristicas 2>&1 | tail -2
npx tsx tmp-conteo.ts 2>&1 | grep -E "caracteristicas|valores|campos|cristales"
npm run db:migrar-caracteristicas 2>&1 | tail -1
rm -f tmp-conteo.ts
```

Expected: antes, `campos propios: 0`; después, `campos propios` es igual a `caracteristicas` y `cristales con extras` es igual a `cristales con valores viejos` (salvo cristales cuyos únicos valores eran "false" o no numéricos; el número puede ser menor pero nunca mayor). La segunda corrida imprime `Ya hay campos propios de Stock: se asume migrado, no se toca nada.`

- [ ] **Step 7: Suite y commit**

Run: `npm test` y `npm run typecheck`
Expected: todo en verde.

```bash
git add src/modules/campos/migracion.ts src/modules/campos/migracion.test.ts prisma/migrar-caracteristicas.ts package.json
git commit -m "feat: migracion de Caracteristica a campos propios con script idempotente" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Servicios de campos y de listas

**Files:**
- Create: `src/modules/campos/schemas.ts`, `src/modules/campos/campo.service.ts`, `src/modules/campos/lista.service.ts`
- Test: `src/modules/campos/schemas.test.ts`

**Interfaces:**
- Consumes: todo lo de las Tasks 1–4.
- Produces (`schemas.ts`): `tipoCampoSchema`, `crearCampoSchema`, `editarCampoPropioSchema`, `editarCampoSistemaSchema`, `CrearCampoInput`, `EditarCampoPropioInput`, `EditarCampoSistemaInput`.
- Produces (`campo.service.ts`): `CampoInvalidoError(mensaje, campo?)`, `ConfirmacionRequeridaError(afectados)`, `listarCamposPropios(entidad): Promise<CampoPropio[]>`, `obtenerCampos(entidad): Promise<CampoFinal[]>`, `crearCampoPropio(entidad, entrada)`, `actualizarCampoPropio(id, entrada)`, `actualizarCampoSistema(entidad, clave, entrada)`, `moverCampoAdmin(entidad, clave, direccion)`, `archivarCampoPropio(id, archivar)`, `eliminarCampoPropio(id, { confirmar })`, `cambiarTipoCampo(id, tipo, { opcionesTexto, confirmar })`, `modificarOpciones(id, operacion)`, `OperacionOpcion`.
- Produces (`lista.service.ts`): `ListaId`, `ListaError`, `obtenerListas()`, `Listas`, `crearItem(lista, datos)`, `renombrarItem(lista, id, nombre)`, `activarItem(lista, id, activo)`, `eliminarItem(lista, id)`, `moverUbicacion(id, direccion)`, `cambiarTieneLado(id, tieneLado)`.

- [ ] **Step 1: Write the failing test (schemas)**

Crear `src/modules/campos/schemas.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { crearCampoSchema, editarCampoPropioSchema, editarCampoSistemaSchema } from "./schemas";

describe("crearCampoSchema", () => {
  it("acepta un campo simple y aplica los valores por defecto", () => {
    const r = crearCampoSchema.parse({ etiqueta: "  Sensor  ", tipo: "SI_NO" });
    expect(r).toMatchObject({ etiqueta: "Sensor", tipo: "SI_NO", requerido: false, opcionesTexto: "" });
  });

  it("rechaza una etiqueta vacía o de más de 60 caracteres y un tipo inexistente", () => {
    expect(crearCampoSchema.safeParse({ etiqueta: "  ", tipo: "TEXTO" }).success).toBe(false);
    expect(crearCampoSchema.safeParse({ etiqueta: "x".repeat(61), tipo: "TEXTO" }).success).toBe(false);
    expect(crearCampoSchema.safeParse({ etiqueta: "A", tipo: "COLOR" }).success).toBe(false);
  });

  it("una lista necesita al menos una opción y marca el campo opcionesTexto", () => {
    const r = crearCampoSchema.safeParse({ etiqueta: "Tono", tipo: "LISTA", opcionesTexto: " \n " });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["opcionesTexto"]);
    expect(crearCampoSchema.safeParse({ etiqueta: "Tono", tipo: "LISTA", opcionesTexto: "Verde\nGris" }).success).toBe(true);
  });
});

describe("editarCampoPropioSchema / editarCampoSistemaSchema", () => {
  it("el campo propio exige los booleanos y una etiqueta", () => {
    expect(editarCampoPropioSchema.safeParse({ etiqueta: "A", requerido: true, visible: true }).success).toBe(true);
    expect(editarCampoPropioSchema.safeParse({ etiqueta: "", requerido: true, visible: true }).success).toBe(false);
  });

  it("el campo del sistema acepta etiqueta y ayuda en blanco (vuelven a la de fábrica)", () => {
    expect(editarCampoSistemaSchema.parse({})).toEqual({ oculto: false });
    expect(editarCampoSistemaSchema.safeParse({ etiqueta: "x".repeat(61) }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/modules/campos/schemas.test.ts`
Expected: FAIL (`Failed to resolve import "./schemas"`).

- [ ] **Step 3: Implementar los schemas**

Crear `src/modules/campos/schemas.ts`:

```ts
import { z } from "@/lib/zod";
import { etiquetasDeTexto } from "./opciones";
import { TIPOS_CAMPO } from "./tipos";

export const tipoCampoSchema = z.enum(TIPOS_CAMPO);

const etiqueta = z.string().trim().min(1).max(60);
const ayuda = z.string().trim().max(120).optional();
const unidad = z.string().trim().max(12).optional();

export const crearCampoSchema = z
  .object({
    etiqueta,
    ayuda,
    tipo: tipoCampoSchema,
    requerido: z.boolean().default(false),
    unidad,
    /** Un renglón por opción (solo para LISTA). */
    opcionesTexto: z.string().default(""),
  })
  .superRefine((c, ctx) => {
    if (c.tipo === "LISTA" && etiquetasDeTexto(c.opcionesTexto).length === 0) {
      ctx.addIssue({ code: "custom", path: ["opcionesTexto"], message: "Cargá al menos una opción" });
    }
  });

export const editarCampoPropioSchema = z.object({
  etiqueta,
  ayuda,
  requerido: z.boolean(),
  unidad,
  visible: z.boolean(),
});

export const editarCampoSistemaSchema = z.object({
  etiqueta: z.string().trim().max(60).optional(),
  ayuda,
  oculto: z.boolean().default(false),
});

export type CrearCampoInput = z.input<typeof crearCampoSchema>;
export type EditarCampoPropioInput = z.input<typeof editarCampoPropioSchema>;
export type EditarCampoSistemaInput = z.input<typeof editarCampoSistemaSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/modules/campos/schemas.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Crear `src/modules/campos/campo.service.ts`**

```ts
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { normalizarTexto, claveUnica } from "./clave";
import { camposVisibles, combinarCampos, moverCampo, type CampoFinal } from "./combinar";
import {
  agregarOpcion,
  alternarOpcion,
  crearOpciones,
  etiquetasDeTexto,
  quitarOpcion,
  renombrarOpcion,
  validarOpciones,
} from "./opciones";
import { clavesReservadas, REGISTRO } from "./registro";
import {
  crearCampoSchema,
  editarCampoPropioSchema,
  editarCampoSistemaSchema,
  tipoCampoSchema,
  type CrearCampoInput,
  type EditarCampoPropioInput,
  type EditarCampoSistemaInput,
} from "./schemas";
import type { CampoPropio, EntidadCampo, OpcionCampo, TipoCampo } from "./tipos";

/** Un pedido inválido (duplicado, lista sin opciones, campo protegido…). `campo` dice a qué control del formulario apunta. */
export class CampoInvalidoError extends Error {
  constructor(
    mensaje: string,
    public campo?: string,
  ) {
    super(mensaje);
    this.name = "CampoInvalidoError";
  }
}

/** La operación borra datos y hace falta que el Admin la confirme. */
export class ConfirmacionRequeridaError extends Error {
  constructor(public afectados: number) {
    super(`Se borrarán los valores de ${afectados} ${afectados === 1 ? "registro" : "registros"}.`);
    this.name = "ConfirmacionRequeridaError";
  }
}

// Solo Stock tiene columna `extras` en este paso. El nombre de tabla sale de este mapa, nunca de la entrada.
const TABLAS: Partial<Record<EntidadCampo, string>> = { CRISTAL: "cristales" };

function tabla(entidad: EntidadCampo): Prisma.Sql {
  const nombre = TABLAS[entidad];
  if (!nombre) throw new CampoInvalidoError("Este módulo todavía no admite campos propios.");
  return Prisma.raw(nombre);
}

type Fila = Awaited<ReturnType<typeof db.campoPersonalizado.findMany>>[number];

const aCampoPropio = (f: Fila): CampoPropio => ({
  id: f.id,
  entidad: f.entidad,
  clave: f.clave,
  etiqueta: f.etiqueta,
  ayuda: f.ayuda,
  tipo: f.tipo,
  requerido: f.requerido,
  unidad: f.unidad,
  opciones: (f.opciones as unknown as OpcionCampo[]) ?? [],
  orden: f.orden,
  visible: f.visible,
  archivado: f.archivadoEn !== null,
});

const json = (opciones: OpcionCampo[]) => opciones as unknown as Prisma.InputJsonArray;

export async function listarCamposPropios(entidad: EntidadCampo): Promise<CampoPropio[]> {
  const filas = await db.campoPersonalizado.findMany({
    where: { entidad },
    orderBy: [{ orden: "asc" }, { creadoEn: "asc" }],
  });
  return filas.map(aCampoPropio);
}

/** Todos los campos del módulo (del sistema y propios, incluidos ocultos y archivados), ya combinados. */
export async function obtenerCampos(entidad: EntidadCampo): Promise<CampoFinal[]> {
  const [ajustes, propios] = await Promise.all([
    db.configuracionCampo.findMany({ where: { entidad } }),
    listarCamposPropios(entidad),
  ]);
  return combinarCampos(
    entidad,
    ajustes.map((a) => ({ clave: a.clave, etiqueta: a.etiqueta, ayuda: a.ayuda, oculto: a.oculto, orden: a.orden })),
    propios,
  );
}

export async function obtenerCamposVisibles(entidad: EntidadCampo): Promise<CampoFinal[]> {
  return camposVisibles(await obtenerCampos(entidad));
}

const etiquetaEnUso = (campos: CampoFinal[], etiqueta: string, excluirClave?: string) =>
  campos.some((c) => c.clave !== excluirClave && normalizarTexto(c.etiqueta) === normalizarTexto(etiqueta));

export async function crearCampoPropio(entidad: EntidadCampo, entrada: CrearCampoInput): Promise<CampoPropio> {
  tabla(entidad);
  const datos = crearCampoSchema.parse(entrada);
  const existentes = await obtenerCampos(entidad);
  if (etiquetaEnUso(existentes, datos.etiqueta)) throw new CampoInvalidoError("Ya hay un campo con ese nombre.", "etiqueta");

  const opciones = datos.tipo === "LISTA" ? crearOpciones(etiquetasDeTexto(datos.opcionesTexto)) : [];
  const error = datos.tipo === "LISTA" ? validarOpciones(opciones) : null;
  if (error) throw new CampoInvalidoError(error, "opcionesTexto");

  const clave = claveUnica(datos.etiqueta, [...clavesReservadas(entidad), ...existentes.map((c) => c.clave)]);
  const orden = Math.max(0, ...existentes.filter((c) => c.seccion === "adicionales").map((c) => c.orden)) + 10;

  const fila = await db.campoPersonalizado.create({
    data: {
      entidad,
      clave,
      etiqueta: datos.etiqueta,
      ayuda: datos.ayuda || null,
      tipo: datos.tipo,
      requerido: datos.requerido,
      unidad: datos.tipo === "NUMERO" ? datos.unidad || null : null,
      opciones: json(opciones),
      orden,
    },
  });
  return aCampoPropio(fila);
}

export async function actualizarCampoPropio(id: string, entrada: EditarCampoPropioInput): Promise<void> {
  const datos = editarCampoPropioSchema.parse(entrada);
  const fila = await db.campoPersonalizado.findUniqueOrThrow({ where: { id } });
  const existentes = await obtenerCampos(fila.entidad);
  if (etiquetaEnUso(existentes, datos.etiqueta, fila.clave)) throw new CampoInvalidoError("Ya hay un campo con ese nombre.", "etiqueta");

  await db.campoPersonalizado.update({
    where: { id },
    data: {
      etiqueta: datos.etiqueta,
      ayuda: datos.ayuda || null,
      requerido: datos.requerido,
      visible: datos.visible,
      unidad: fila.tipo === "NUMERO" ? datos.unidad || null : null,
    },
  });
}

export async function actualizarCampoSistema(
  entidad: EntidadCampo,
  clave: string,
  entrada: EditarCampoSistemaInput,
): Promise<void> {
  const definicion = REGISTRO[entidad].find((c) => c.clave === clave);
  if (!definicion) throw new CampoInvalidoError("Ese campo no existe.");
  const datos = editarCampoSistemaSchema.parse(entrada);
  if (datos.oculto && !definicion.ocultable) {
    throw new CampoInvalidoError("Este campo es necesario para que el sistema funcione y no se puede ocultar.", "oculto");
  }
  const etiqueta = datos.etiqueta || null;
  if (etiqueta && etiquetaEnUso(await obtenerCampos(entidad), etiqueta, clave)) {
    throw new CampoInvalidoError("Ya hay un campo con ese nombre.", "etiqueta");
  }
  const valores = { etiqueta, ayuda: datos.ayuda || null, oculto: datos.oculto };
  await db.configuracionCampo.upsert({
    where: { entidad_clave: { entidad, clave } },
    create: { entidad, clave, ...valores },
    update: valores,
  });
}

export async function moverCampoAdmin(entidad: EntidadCampo, clave: string, direccion: "ARRIBA" | "ABAJO"): Promise<void> {
  const campos = await obtenerCampos(entidad);
  const cambios = moverCampo(campos, clave, direccion);
  if (cambios.length === 0) return;
  await db.$transaction(async (tx) => {
    for (const { clave: k, orden } of cambios) {
      if (campos.find((c) => c.clave === k)?.origen === "PROPIO") {
        await tx.campoPersonalizado.update({ where: { entidad_clave: { entidad, clave: k } }, data: { orden } });
      } else {
        await tx.configuracionCampo.upsert({
          where: { entidad_clave: { entidad, clave: k } },
          create: { entidad, clave: k, orden },
          update: { orden },
        });
      }
    }
  });
}

export async function archivarCampoPropio(id: string, archivar: boolean): Promise<void> {
  await db.campoPersonalizado.update({ where: { id }, data: { archivadoEn: archivar ? new Date() : null } });
}

async function contarValores(entidad: EntidadCampo, clave: string): Promise<number> {
  const [{ n }] = await db.$queryRaw<{ n: number }[]>(
    Prisma.sql`SELECT count(*)::int AS n FROM ${tabla(entidad)} WHERE jsonb_exists(extras, ${clave})`,
  );
  return n;
}

async function contarUsoOpcion(entidad: EntidadCampo, clave: string, opcionId: string): Promise<number> {
  const [{ n }] = await db.$queryRaw<{ n: number }[]>(
    Prisma.sql`SELECT count(*)::int AS n FROM ${tabla(entidad)} WHERE extras ->> ${clave} = ${opcionId}`,
  );
  return n;
}

/** Elimina el campo y sus valores. Devuelve cuántos registros tenían valor. Con datos, exige `confirmar`. */
export async function eliminarCampoPropio(id: string, { confirmar }: { confirmar: boolean }): Promise<number> {
  const fila = await db.campoPersonalizado.findUniqueOrThrow({ where: { id } });
  const afectados = await contarValores(fila.entidad, fila.clave);
  if (afectados > 0 && !confirmar) throw new ConfirmacionRequeridaError(afectados);
  await db.$transaction(async (tx) => {
    if (afectados > 0) await tx.$executeRaw(Prisma.sql`UPDATE ${tabla(fila.entidad)} SET extras = extras - ${fila.clave}::text`);
    await tx.campoPersonalizado.delete({ where: { id } });
  });
  return afectados;
}

/** Cambia el tipo de un campo propio. Sus valores anteriores se borran (con datos, exige `confirmar`). */
export async function cambiarTipoCampo(
  id: string,
  tipo: TipoCampo,
  { opcionesTexto = "", confirmar }: { opcionesTexto?: string; confirmar: boolean },
): Promise<number> {
  const nuevoTipo = tipoCampoSchema.parse(tipo);
  const fila = await db.campoPersonalizado.findUniqueOrThrow({ where: { id } });
  if (fila.tipo === nuevoTipo) return 0;

  const opciones = nuevoTipo === "LISTA" ? crearOpciones(etiquetasDeTexto(opcionesTexto)) : [];
  const error = nuevoTipo === "LISTA" ? validarOpciones(opciones) : null;
  if (error) throw new CampoInvalidoError(error, "opcionesTexto");

  const afectados = await contarValores(fila.entidad, fila.clave);
  if (afectados > 0 && !confirmar) throw new ConfirmacionRequeridaError(afectados);
  await db.$transaction(async (tx) => {
    if (afectados > 0) await tx.$executeRaw(Prisma.sql`UPDATE ${tabla(fila.entidad)} SET extras = extras - ${fila.clave}::text`);
    await tx.campoPersonalizado.update({
      where: { id },
      data: { tipo: nuevoTipo, opciones: json(opciones), unidad: nuevoTipo === "NUMERO" ? fila.unidad : null },
    });
  });
  return afectados;
}

export type OperacionOpcion =
  | { tipo: "agregar"; etiqueta: string }
  | { tipo: "renombrar"; opcionId: string; etiqueta: string }
  | { tipo: "alternar"; opcionId: string; activo: boolean }
  | { tipo: "quitar"; opcionId: string };

/** Agrega, renombra, desactiva o quita una opción de un campo de tipo lista. */
export async function modificarOpciones(id: string, operacion: OperacionOpcion): Promise<void> {
  const fila = await db.campoPersonalizado.findUniqueOrThrow({ where: { id } });
  if (fila.tipo !== "LISTA") throw new CampoInvalidoError("Este campo no es una lista.");
  let opciones = aCampoPropio(fila).opciones;

  switch (operacion.tipo) {
    case "agregar":
      opciones = agregarOpcion(opciones, operacion.etiqueta);
      break;
    case "renombrar":
      opciones = renombrarOpcion(opciones, operacion.opcionId, operacion.etiqueta);
      break;
    case "alternar":
      opciones = alternarOpcion(opciones, operacion.opcionId, operacion.activo);
      break;
    case "quitar": {
      const enUso = await contarUsoOpcion(fila.entidad, fila.clave, operacion.opcionId);
      if (enUso > 0) {
        throw new CampoInvalidoError(
          `La opción está en uso en ${enUso} ${enUso === 1 ? "registro" : "registros"}: desactivala en lugar de borrarla.`,
          "opciones",
        );
      }
      opciones = quitarOpcion(opciones, operacion.opcionId);
    }
  }

  const error = validarOpciones(opciones);
  if (error) throw new CampoInvalidoError(error, "opciones");
  await db.campoPersonalizado.update({ where: { id }, data: { opciones: json(opciones) } });
}
```

- [ ] **Step 6: Crear `src/modules/campos/lista.service.ts`**

```ts
import { db } from "@/lib/db";
import { z } from "@/lib/zod";

export type ListaId = "marcas" | "tipos" | "ubicaciones" | "marcasVehiculo" | "modelos";

/** Una operación no permitida sobre un elemento de lista (en uso, inexistente…). */
export class ListaError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ListaError";
  }
}

const nombreSchema = z.string().trim().min(1).max(80);

/** Todo lo que muestra la pantalla de listas, con cuántos registros usa cada elemento. */
export async function obtenerListas() {
  const [marcas, tipos, ubicaciones, marcasVehiculo] = await Promise.all([
    db.marcaCristal.findMany({ orderBy: { nombre: "asc" }, include: { _count: { select: { cristales: true } } } }),
    db.tipoCristal.findMany({ orderBy: { nombre: "asc" }, include: { _count: { select: { cristales: true } } } }),
    db.ubicacionVehiculo.findMany({ orderBy: { orden: "asc" }, include: { _count: { select: { cristales: true } } } }),
    db.marcaVehiculo.findMany({
      orderBy: { nombre: "asc" },
      include: {
        modelos: { orderBy: { nombre: "asc" }, include: { _count: { select: { compatibilidades: true } } } },
      },
    }),
  ]);
  return { marcas, tipos, ubicaciones, marcasVehiculo };
}
export type Listas = Awaited<ReturnType<typeof obtenerListas>>;

export async function crearItem(lista: ListaId, datos: { nombre: string; marcaId?: string; tieneLado?: boolean }) {
  const nombre = nombreSchema.parse(datos.nombre);
  switch (lista) {
    case "marcas":
      return db.marcaCristal.create({ data: { nombre } });
    case "tipos":
      return db.tipoCristal.create({ data: { nombre } });
    case "ubicaciones": {
      const { _max } = await db.ubicacionVehiculo.aggregate({ _max: { orden: true } });
      return db.ubicacionVehiculo.create({ data: { nombre, tieneLado: datos.tieneLado ?? false, orden: (_max.orden ?? 0) + 10 } });
    }
    case "marcasVehiculo":
      return db.marcaVehiculo.create({ data: { nombre } });
    case "modelos": {
      if (!datos.marcaId) throw new ListaError("Elegí la marca del modelo.");
      return db.modeloVehiculo.create({ data: { nombre, marcaId: datos.marcaId } });
    }
  }
}

export async function renombrarItem(lista: ListaId, id: string, nombreNuevo: string) {
  const nombre = nombreSchema.parse(nombreNuevo);
  switch (lista) {
    case "marcas":
      return db.marcaCristal.update({ where: { id }, data: { nombre } });
    case "tipos":
      return db.tipoCristal.update({ where: { id }, data: { nombre } });
    case "ubicaciones":
      return db.ubicacionVehiculo.update({ where: { id }, data: { nombre } });
    case "marcasVehiculo":
      return db.marcaVehiculo.update({ where: { id }, data: { nombre } });
    case "modelos":
      return db.modeloVehiculo.update({ where: { id }, data: { nombre } });
  }
}

export async function activarItem(lista: ListaId, id: string, activo: boolean) {
  switch (lista) {
    case "marcas":
      return db.marcaCristal.update({ where: { id }, data: { activo } });
    case "tipos":
      return db.tipoCristal.update({ where: { id }, data: { activo } });
    case "ubicaciones":
      return db.ubicacionVehiculo.update({ where: { id }, data: { activo } });
    case "marcasVehiculo":
      return db.marcaVehiculo.update({ where: { id }, data: { activo } });
    case "modelos":
      return db.modeloVehiculo.update({ where: { id }, data: { activo } });
  }
}

async function contarUso(lista: ListaId, id: string): Promise<number> {
  switch (lista) {
    case "marcas":
      return db.cristal.count({ where: { marcaId: id } });
    case "tipos":
      return db.cristal.count({ where: { tipoId: id } });
    case "ubicaciones":
      return db.cristal.count({ where: { ubicacionId: id } });
    case "marcasVehiculo":
      return db.modeloVehiculo.count({ where: { marcaId: id } });
    case "modelos":
      return db.compatibilidadVehiculo.count({ where: { modeloId: id } });
  }
}

/** Solo se borra lo que no está en uso; si lo está, hay que desactivarlo. */
export async function eliminarItem(lista: ListaId, id: string): Promise<void> {
  const uso = await contarUso(lista, id);
  if (uso > 0) {
    throw new ListaError(
      lista === "marcasVehiculo"
        ? `Tiene ${uso} ${uso === 1 ? "modelo" : "modelos"}: borralos primero o desactivala.`
        : `Está en uso en ${uso} ${uso === 1 ? "registro" : "registros"}: desactivalo en lugar de borrarlo.`,
    );
  }
  switch (lista) {
    case "marcas":
      await db.marcaCristal.delete({ where: { id } });
      return;
    case "tipos":
      await db.tipoCristal.delete({ where: { id } });
      return;
    case "ubicaciones":
      await db.ubicacionVehiculo.delete({ where: { id } });
      return;
    case "marcasVehiculo":
      await db.marcaVehiculo.delete({ where: { id } });
      return;
    case "modelos":
      await db.modeloVehiculo.delete({ where: { id } });
      return;
  }
}

export async function cambiarTieneLado(id: string, tieneLado: boolean) {
  return db.ubicacionVehiculo.update({ where: { id }, data: { tieneLado } });
}

export async function moverUbicacion(id: string, direccion: "ARRIBA" | "ABAJO"): Promise<void> {
  const ubicaciones = await db.ubicacionVehiculo.findMany({ orderBy: { orden: "asc" }, select: { id: true } });
  const i = ubicaciones.findIndex((u) => u.id === id);
  const j = direccion === "ARRIBA" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ubicaciones.length) return;
  const reordenadas = [...ubicaciones];
  [reordenadas[i], reordenadas[j]] = [reordenadas[j], reordenadas[i]];
  await db.$transaction(
    reordenadas.map((u, n) => db.ubicacionVehiculo.update({ where: { id: u.id }, data: { orden: (n + 1) * 10 } })),
  );
}
```

- [ ] **Step 7: Verificar con un script de humo contra la base**

Run:

```bash
npm run typecheck
cat > tmp-humo.ts <<'EOF'
import "dotenv/config";
import { db } from "./src/lib/db";
import {
  actualizarCampoSistema, archivarCampoPropio, cambiarTipoCampo, crearCampoPropio, eliminarCampoPropio,
  moverCampoAdmin, modificarOpciones, obtenerCampos, ConfirmacionRequeridaError, CampoInvalidoError,
} from "./src/modules/campos/campo.service";
import { crearItem, eliminarItem, activarItem, obtenerListas, ListaError } from "./src/modules/campos/lista.service";

const intentar = async (nombre: string, fn: () => Promise<unknown>) => {
  try { await fn(); console.log("FALTA ERROR:", nombre); } catch (e) { console.log("ok error:", nombre, "->", (e as Error).name); }
};

const c = await crearCampoPropio("CRISTAL", { etiqueta: "Prueba humo", tipo: "LISTA", opcionesTexto: "Uno\nDos" });
console.log("creado:", c.clave, c.opciones.length, "opciones");
await intentar("etiqueta duplicada (sin tildes/mayusculas)", () => crearCampoPropio("CRISTAL", { etiqueta: "PRUEBA  humo", tipo: "TEXTO" }));
await intentar("etiqueta igual a un campo del sistema", () => crearCampoPropio("CRISTAL", { etiqueta: "costo", tipo: "TEXTO" }));
await intentar("ocultar un campo protegido", () => actualizarCampoSistema("CRISTAL", "codigo", { oculto: true }));
await intentar("modulo no habilitado", () => crearCampoPropio("SERVICIO", { etiqueta: "X", tipo: "TEXTO" }));

await actualizarCampoSistema("CRISTAL", "costo", { etiqueta: "Precio de compra", oculto: false });
await moverCampoAdmin("CRISTAL", "precioVenta", "ARRIBA");
let campos = await obtenerCampos("CRISTAL");
console.log("costo =>", campos.find((x) => x.clave === "costo")?.etiqueta, "| orden stock:", campos.filter((x) => x.seccion === "stock").map((x) => x.clave).join(","));
await moverCampoAdmin("CRISTAL", "precioVenta", "ABAJO");
await actualizarCampoSistema("CRISTAL", "costo", { oculto: false }); // vuelve a la etiqueta de fábrica

// valor en un cristal para probar los avisos de borrado
const cristal = await db.cristal.findFirstOrThrow();
const opcion = c.opciones[0].id;
const extrasOriginales = cristal.extras;
await db.cristal.update({ where: { id: cristal.id }, data: { extras: { ...(cristal.extras as object), [c.clave]: opcion } } });
await intentar("quitar una opcion en uso", () => modificarOpciones(c.id, { tipo: "quitar", opcionId: opcion }));
await modificarOpciones(c.id, { tipo: "renombrar", opcionId: opcion, etiqueta: "Uno renombrada" });
await modificarOpciones(c.id, { tipo: "alternar", opcionId: opcion, activo: false });
await intentar("desactivar todas las opciones", () => modificarOpciones(c.id, { tipo: "alternar", opcionId: c.opciones[1].id, activo: false }));
await intentar("cambiar tipo con datos sin confirmar", () => cambiarTipoCampo(c.id, "TEXTO", { confirmar: false }));
await intentar("eliminar con datos sin confirmar", () => eliminarCampoPropio(c.id, { confirmar: false }));
await archivarCampoPropio(c.id, true);
console.log("archivado visible?:", (await obtenerCampos("CRISTAL")).find((x) => x.clave === c.clave)?.visible);
const borrados = await eliminarCampoPropio(c.id, { confirmar: true });
console.log("eliminado, registros afectados:", borrados);
await db.cristal.update({ where: { id: cristal.id }, data: { extras: extrasOriginales as object } });

// listas
const marca = await crearItem("marcas", { nombre: "Marca de humo" });
await activarItem("marcas", marca.id, false);
await eliminarItem("marcas", marca.id);
console.log("marca de humo creada, desactivada y borrada");
const { marcas } = await obtenerListas();
const enUso = marcas.find((m) => m._count.cristales > 0);
if (enUso) await intentar("borrar una marca en uso", () => eliminarItem("marcas", enUso.id));
process.exit(0);
EOF
npx tsx tmp-humo.ts 2>&1 | grep -v "^$"
rm -f tmp-humo.ts
```

Expected (en este orden): `creado: prueba_humo 2 opciones`; cuatro líneas `ok error:` (etiqueta duplicada, igual a un campo del sistema, ocultar protegido, módulo no habilitado — `CampoInvalidoError`); `costo => Precio de compra | orden stock: cantidad,stockMinimo,ubicacionDeposito,precioVenta,costo` (`precioVenta` subió un lugar); luego `ok error:` para quitar opción en uso (`CampoInvalidoError`), desactivar todas (`CampoInvalidoError`), cambiar tipo y eliminar sin confirmar (`ConfirmacionRequeridaError`); `archivado visible?: false`; `eliminado, registros afectados: 1`; `marca de humo creada, desactivada y borrada`; y, si alguna marca está en uso, `ok error: borrar una marca en uso -> ListaError`. Ninguna línea `FALTA ERROR`. Después verificar que la base quedó como antes: `git status` no muestra archivos nuevos (los datos de prueba se borraron solos).

- [ ] **Step 8: Suite y commit**

Run: `npm test` y `npm run typecheck`
Expected: todo en verde.

```bash
git add src/modules/campos/schemas.ts src/modules/campos/schemas.test.ts src/modules/campos/campo.service.ts src/modules/campos/lista.service.ts
git commit -m "feat: servicios de campos propios, ajustes de campos del sistema y listas" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Stock usa los campos configurables

**Files:**
- Test (nuevo): `src/modules/inventario/schemas.test.ts`
- Modify: `src/modules/inventario/schemas.ts`, `src/modules/inventario/cristal.service.ts`
- Modify: `src/app/(panel)/stock/acciones.ts`, `src/app/(panel)/stock/FormularioCristal.tsx`, `src/app/(panel)/stock/page.tsx`, `src/app/(panel)/stock/nuevo/page.tsx`, `src/app/(panel)/stock/[id]/page.tsx`, `src/app/(panel)/stock/[id]/editar/page.tsx`
- Create: `src/components/campos/CampoPersonalizado.tsx`

**Interfaces:**
- Consumes: `obtenerCampos`, `listarCamposPropios` (Task 6); `procesarExtras`, `formatearValor`, `nombreInput` (Task 3); `CampoFinal` (Task 2); `SECCIONES` (Task 2).
- Produces: `crearCristalSchema`/`actualizarCristalSchema` con `extrasEntrada` (sin `caracteristicas`); `actualizarCristalSchema` **sin valores por defecto**; `obtenerCatalogos({ incluirInactivos?, conservar? })` (sin `caracteristicas`); `FormularioCristal({ catalogos, campos, cristal? })` con `CristalEditable.extras: Extras`; componente `CampoPersonalizado({ campo, valor?, error? })`.

- [ ] **Step 1: Write the failing test**

Crear `src/modules/inventario/schemas.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { actualizarCristalSchema, crearCristalSchema } from "./schemas";

const minimo = { codigo: "a", descripcion: "abc", marcaId: "m", tipoId: "t", ubicacionId: "u" };

describe("actualizarCristalSchema", () => {
  it("no inyecta valores por defecto: una edición que omite campos no pisa lo guardado", () => {
    expect(actualizarCristalSchema.parse({})).toEqual({});
  });

  it("devuelve solo lo enviado y normaliza el código", () => {
    expect(actualizarCristalSchema.parse({ codigo: "x1" })).toEqual({ codigo: "X1" });
  });

  it("ignora la cantidad: el stock solo cambia con movimientos", () => {
    expect(actualizarCristalSchema.parse({ cantidadInicial: 5 })).toEqual({});
  });
});

describe("crearCristalSchema", () => {
  it("aplica los valores por defecto al crear", () => {
    expect(crearCristalSchema.parse(minimo)).toMatchObject({
      codigo: "A",
      lado: "NO_APLICA",
      cantidadInicial: 0,
      stockMinimo: 0,
      compatibilidades: [],
      extrasEntrada: {},
    });
  });

  it("ya no tiene `caracteristicas`: los campos propios viajan en extrasEntrada", () => {
    expect(crearCristalSchema.parse({ ...minimo, caracteristicas: [{ caracteristicaId: "x", valor: "y" }] })).not.toHaveProperty("caracteristicas");
    expect(crearCristalSchema.parse({ ...minimo, extrasEntrada: { extra_nota: "hola" } }).extrasEntrada).toEqual({ extra_nota: "hola" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/modules/inventario/schemas.test.ts`
Expected: FAIL. `actualizarCristalSchema.parse({})` devuelve `{ lado: "NO_APLICA", stockMinimo: 0, caracteristicas: [], compatibilidades: [] }` en lugar de `{}` (y falla el test de `caracteristicas`/`extrasEntrada`).

- [ ] **Step 3: Reescribir `src/modules/inventario/schemas.ts` (partes de cristal)**

Reemplazar desde la línea `export const valorCaracteristicaSchema = ...` hasta el final de `actualizarCristalSchema` (inclusive) por:

```ts
/** Campos de un cristal SIN valores por defecto: sirve de base para alta y edición. */
const camposCristal = {
  codigo: z.string().trim().min(1).max(40).toUpperCase(),
  codigoFabricante: z.string().trim().max(40).optional(),
  descripcion: z.string().trim().min(3).max(200),
  marcaId: z.string().min(1),
  tipoId: z.string().min(1),
  ubicacionId: z.string().min(1),
  lado: z.enum(["NO_APLICA", "IZQUIERDO", "DERECHO"]),
  anchoMm: z.number().int().positive().optional(),
  altoMm: z.number().int().positive().optional(),
  espesorMm: z.number().positive().max(99).optional(),
  stockMinimo: z.number().int().min(0),
  ubicacionDeposito: z.string().trim().max(40).optional(),
  costo: z.number().min(0).optional(),
  precioVenta: z.number().min(0).optional(),
  compatibilidades: z.array(compatibilidadSchema),
  /** Valores del formulario de los campos propios (`extra_<clave>`); el servicio los valida con la definición de cada campo. */
  extrasEntrada: z.record(z.string(), z.unknown()),
};

export const crearCristalSchema = z.object({
  ...camposCristal,
  lado: camposCristal.lado.default("NO_APLICA"),
  cantidadInicial: z.number().int().min(0).default(0),
  stockMinimo: camposCristal.stockMinimo.default(0),
  compatibilidades: camposCristal.compatibilidades.default([]),
  extrasEntrada: camposCristal.extrasEntrada.default({}),
});

/**
 * Edición: todo opcional y SIN valores por defecto (Zod 4 los aplica aun dentro de `.partial()`).
 * Un campo oculto o ausente no viaja en el formulario y no debe pisar lo que ya está guardado.
 */
export const actualizarCristalSchema = z.object(camposCristal).partial();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/modules/inventario/schemas.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Actualizar `src/modules/inventario/cristal.service.ts`**

a) Reemplazar los imports de arriba (desde `import { db } from "@/lib/db";` hasta `} from "./schemas";`) por:

```ts
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { listarCamposPropios } from "@/modules/campos/campo.service";
import { procesarExtras } from "@/modules/campos/extras";
import type { Extras } from "@/modules/campos/tipos";
import {
  actualizarCristalSchema,
  busquedaCristalSchema,
  crearCristalSchema,
  movimientoStockSchema,
  type ActualizarCristalInput,
  type BusquedaCristalInput,
  type CrearCristalInput,
  type MovimientoStockInput,
} from "./schemas";
```

b) En `incluirDetalle`, borrar la línea `  caracteristicas: { include: { caracteristica: true } },`.

c) Reemplazar las funciones `crearCristal` y `actualizarCristal` (con sus comentarios) por:

```ts
/** Alta de un cristal con sus campos propios, compatibilidades y stock inicial. */
export async function crearCristal(input: CrearCristalInput) {
  const { cantidadInicial, extrasEntrada, compatibilidades, ...datos } = crearCristalSchema.parse(input);
  const extras = procesarExtras(await listarCamposPropios("CRISTAL"), extrasEntrada);

  return db.cristal.create({
    data: {
      ...datos,
      extras,
      cantidad: cantidadInicial,
      compatibilidades: { create: compatibilidades },
      movimientos:
        cantidadInicial > 0
          ? {
              create: {
                tipo: "INGRESO",
                cantidad: cantidadInicial,
                saldo: cantidadInicial,
                motivo: "Stock inicial",
              },
            }
          : undefined,
    },
    include: incluirDetalle,
  });
}

/**
 * Edita datos del artículo. Solo cambia lo que se envía: un campo ausente (por ejemplo, oculto
 * desde Administración) conserva su valor. Si se envían compatibilidades, reemplazan a las actuales.
 */
export async function actualizarCristal(id: string, input: ActualizarCristalInput) {
  const { extrasEntrada, compatibilidades, ...datos } = actualizarCristalSchema.parse(input);

  let extras: Extras | undefined;
  if (extrasEntrada) {
    const actual = await db.cristal.findUniqueOrThrow({ where: { id }, select: { extras: true } });
    extras = procesarExtras(await listarCamposPropios("CRISTAL"), extrasEntrada, actual.extras as Extras);
  }

  return db.cristal.update({
    where: { id },
    data: {
      ...datos,
      ...(extras && { extras }),
      compatibilidades: compatibilidades && { deleteMany: {}, create: compatibilidades },
    },
    include: incluirDetalle,
  });
}
```

d) Reemplazar `obtenerCatalogos` y el `export type Catalogos` (final del archivo) por:

```ts
export interface OpcionesCatalogos {
  /** Incluye los elementos desactivados (filtros y fichas). Los formularios solo ofrecen los activos. */
  incluirInactivos?: boolean;
  /** Ids que se conservan aunque estén desactivados: lo que ya tiene guardado el registro que se edita. */
  conservar?: string[];
}

/** Todo lo que necesitan los formularios y filtros de stock. */
export async function obtenerCatalogos({ incluirInactivos = false, conservar = [] }: OpcionesCatalogos = {}) {
  const visibles = incluirInactivos ? undefined : { OR: [{ activo: true }, { id: { in: conservar } }] };
  const [marcas, tipos, ubicaciones, marcasVehiculo] = await Promise.all([
    db.marcaCristal.findMany({ where: visibles, orderBy: { nombre: "asc" } }),
    db.tipoCristal.findMany({ where: visibles, orderBy: { nombre: "asc" } }),
    db.ubicacionVehiculo.findMany({ where: visibles, orderBy: { orden: "asc" } }),
    db.marcaVehiculo.findMany({
      where: visibles,
      orderBy: { nombre: "asc" },
      include: { modelos: { where: visibles, orderBy: { nombre: "asc" } } },
    }),
  ]);
  return { marcas, tipos, ubicaciones, marcasVehiculo };
}

export type Catalogos = Awaited<ReturnType<typeof obtenerCatalogos>>;
```

- [ ] **Step 6: Reescribir `src/app/(panel)/stock/acciones.ts`**

Reemplazar el archivo completo por (se conservan `guardarMovimiento` y `alternarCristal`; cambian los imports, `leerCaracteristicas` → `leerExtras` y `guardarCristal`):

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { erroresDeZod, esDuplicado, fallo, json, numero, texto, type EstadoFormulario } from "@/lib/formularios";
import { verificarSesion } from "@/lib/sesion";
import { obtenerCampos } from "@/modules/campos/campo.service";
import {
  actualizarCristal,
  cambiarEstadoCristal,
  crearCristal,
  registrarMovimiento,
  StockInsuficienteError,
} from "@/modules/inventario/cristal.service";
import type { CrearCristalInput } from "@/modules/inventario/schemas";

/** Campos propios: cada control `extra_<clave>` del formulario. Las casillas sin tildar no llegan. */
function leerExtras(fd: FormData): Record<string, unknown> {
  const extras: Record<string, unknown> = {};
  for (const [clave, valor] of fd.entries()) {
    if (clave.startsWith("extra_") && typeof valor === "string") extras[clave] = valor;
  }
  return extras;
}

export async function guardarCristal(
  id: string | null,
  _previo: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  await verificarSesion();

  // Un campo del sistema oculto no viaja en el formulario: queda sin valor al crear y sin tocar al editar.
  const campos = await obtenerCampos("CRISTAL");
  const visible = (clave: string) => campos.find((c) => c.clave === clave)?.visible ?? true;
  const siVisible = <T,>(clave: string, leer: () => T): T | undefined => (visible(clave) ? leer() : undefined);

  // Los tipos se validan en el servicio (crearCristalSchema); acá solo se leen los campos.
  const entrada = {
    codigo: texto(fd, "codigo"),
    codigoFabricante: siVisible("codigoFabricante", () => texto(fd, "codigoFabricante")),
    descripcion: texto(fd, "descripcion"),
    marcaId: texto(fd, "marcaId"),
    tipoId: texto(fd, "tipoId"),
    ubicacionId: texto(fd, "ubicacionId"),
    lado: siVisible("lado", () => texto(fd, "lado") ?? "NO_APLICA"),
    anchoMm: siVisible("anchoMm", () => numero(fd, "anchoMm")),
    altoMm: siVisible("altoMm", () => numero(fd, "altoMm")),
    espesorMm: siVisible("espesorMm", () => numero(fd, "espesorMm")),
    cantidadInicial: numero(fd, "cantidadInicial") ?? 0,
    stockMinimo: numero(fd, "stockMinimo") ?? 0,
    ubicacionDeposito: siVisible("ubicacionDeposito", () => texto(fd, "ubicacionDeposito")),
    costo: siVisible("costo", () => numero(fd, "costo")),
    precioVenta: siVisible("precioVenta", () => numero(fd, "precioVenta")),
    extrasEntrada: leerExtras(fd),
    compatibilidades: siVisible("compatibilidades", () => json(fd, "compatibilidades", [])),
  } as CrearCristalInput;

  let destino: string;
  try {
    if (id) {
      const { cantidadInicial: _, ...cambios } = entrada;
      await actualizarCristal(id, cambios);
      destino = `/stock/${id}?aviso=actualizado`;
    } else {
      const creado = await crearCristal(entrada);
      destino = `/stock/${creado.id}?aviso=creado`;
    }
  } catch (e) {
    if (e instanceof ZodError) return fallo(erroresDeZod(e));
    if (esDuplicado(e)) return fallo({ codigo: "Ya existe un cristal con ese código" });
    throw e;
  }

  revalidatePath("/stock");
  redirect(destino);
}

export async function guardarMovimiento(
  cristalId: string,
  _previo: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  await verificarSesion();
  const tipo = texto(fd, "tipo") as "INGRESO" | "EGRESO" | "AJUSTE";
  try {
    const mov = await registrarMovimiento({ cristalId, tipo, cantidad: numero(fd, "cantidad") as number, motivo: texto(fd, "motivo") });
    revalidatePath(`/stock/${cristalId}`);
    revalidatePath("/stock");
    return { ok: true, mensaje: `Movimiento registrado. Stock actual: ${mov.saldo}` };
  } catch (e) {
    if (e instanceof ZodError) return fallo(erroresDeZod(e));
    if (e instanceof StockInsuficienteError) return fallo({ cantidad: e.message }, e.message);
    throw e;
  }
}

export async function alternarCristal(id: string, activo: boolean) {
  await verificarSesion();
  await cambiarEstadoCristal(id, activo);
  revalidatePath(`/stock/${id}`);
  revalidatePath("/stock");
}
```

- [ ] **Step 7: Crear el control de campo propio `src/components/campos/CampoPersonalizado.tsx`**

```tsx
"use client";

import { Campo, input } from "@/components/ui";
import type { CampoFinal } from "@/modules/campos/combinar";
import { nombreInput, type ValorExtra } from "@/modules/campos/tipos";

/** Control de formulario para un campo propio, según su tipo. El nombre del control es `extra_<clave>`. */
export function CampoPersonalizado({ campo, valor, error }: { campo: CampoFinal; valor?: ValorExtra; error?: string }) {
  const nombre = nombreInput(campo.clave);

  if (campo.tipo === "SI_NO") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name={nombre} defaultChecked={valor === true} className="size-4 accent-amarillo-500" />
        {campo.etiqueta}
        {campo.ayuda && <span className="text-xs text-texto-suave"> · {campo.ayuda}</span>}
      </label>
    );
  }

  const etiqueta = campo.unidad ? `${campo.etiqueta} (${campo.unidad})` : campo.etiqueta;
  const comun = { id: nombre, name: nombre, className: input, "aria-invalid": !!error };
  const texto = typeof valor === "string" ? valor : "";

  return (
    <Campo etiqueta={etiqueta} htmlFor={nombre} error={error} ayuda={campo.ayuda ?? undefined}>
      {campo.tipo === "LISTA" ? (
        <select {...comun} defaultValue={texto}>
          <option value="">—</option>
          {campo.opciones
            .filter((o) => o.activo || o.id === valor)
            .map((o) => (
              <option key={o.id} value={o.id}>
                {o.etiqueta}
                {o.activo ? "" : " (desactivada)"}
              </option>
            ))}
        </select>
      ) : campo.tipo === "TEXTO_LARGO" ? (
        <textarea {...comun} rows={3} defaultValue={texto} />
      ) : (
        <input
          {...comun}
          type={campo.tipo === "NUMERO" ? "number" : campo.tipo === "FECHA" ? "date" : "text"}
          step={campo.tipo === "NUMERO" ? "any" : undefined}
          defaultValue={valor === undefined || typeof valor === "boolean" ? "" : String(valor)}
        />
      )}
    </Campo>
  );
}
```

- [ ] **Step 8: Reescribir `src/app/(panel)/stock/FormularioCristal.tsx`**

Reemplazar el archivo completo por (mismo diseño y validaciones que hoy; ahora las secciones y campos salen de `campos`):

```tsx
"use client";

import Link from "next/link";
import { Fragment, useState, type ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { CampoPersonalizado } from "@/components/campos/CampoPersonalizado";
import { Aviso, boton, Campo, input, tarjeta } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import type { CampoFinal } from "@/modules/campos/combinar";
import { SECCIONES, type SeccionCampo } from "@/modules/campos/registro";
import { nombreInput, type Extras } from "@/modules/campos/tipos";
import type { Catalogos } from "@/modules/inventario/cristal.service";
import { guardarCristal } from "./acciones";

export interface CristalEditable {
  id: string;
  codigo: string;
  codigoFabricante: string | null;
  descripcion: string;
  marcaId: string;
  tipoId: string;
  ubicacionId: string;
  lado: "NO_APLICA" | "IZQUIERDO" | "DERECHO";
  anchoMm: number | null;
  altoMm: number | null;
  espesorMm: number | null;
  stockMinimo: number;
  ubicacionDeposito: string | null;
  costo: number | null;
  precioVenta: number | null;
  extras: Extras;
  compatibilidades: Compatibilidad[];
}

interface Compatibilidad {
  modeloId: string;
  anioDesde: number | null;
  anioHasta: number | null;
  carroceria: string | null;
}

const COMPATIBILIDAD_VACIA: Compatibilidad = { modeloId: "", anioDesde: null, anioHasta: null, carroceria: null };
const ANCHO: Record<string, string> = { descripcion: "sm:col-span-2" };

export function FormularioCristal({
  catalogos,
  campos,
  cristal,
}: {
  catalogos: Catalogos;
  campos: CampoFinal[];
  cristal?: CristalEditable;
}) {
  const { estado, enviar, pendiente, error } = useFormularioAccion(guardarCristal.bind(null, cristal?.id ?? null));
  const [ubicacionId, setUbicacionId] = useState(cristal?.ubicacionId ?? catalogos.ubicaciones[0]?.id ?? "");
  const [compat, setCompat] = useState<Compatibilidad[]>(cristal?.compatibilidades ?? []);
  const tieneLado = catalogos.ubicaciones.find((u) => u.id === ubicacionId)?.tieneLado ?? false;

  const visibles = campos.filter((c) => c.visible && !c.archivado);
  const deSeccion = (s: SeccionCampo) => visibles.filter((c) => c.seccion === s);
  const titulo = (s: SeccionCampo) => SECCIONES.find((x) => x.id === s)!.etiqueta;

  const editarCompat = (i: number, cambios: Partial<Compatibilidad>) =>
    setCompat(compat.map((c, j) => (j === i ? { ...c, ...cambios } : c)));
  const anio = (v: string) => (v === "" ? null : Number(v));

  // Solo se envían las filas con modelo elegido; los años vacíos viajan como undefined.
  const compatParaEnviar = compat
    .filter((c) => c.modeloId)
    .map((c) => ({
      modeloId: c.modeloId,
      anioDesde: c.anioDesde ?? undefined,
      anioHasta: c.anioHasta ?? undefined,
      carroceria: c.carroceria || undefined,
    }));

  /** Control de un campo del sistema. La etiqueta, la ayuda, el orden y la visibilidad vienen de `campos`. */
  const sistema = (c: CampoFinal): ReactNode => {
    const base = { etiqueta: c.etiqueta, ayuda: c.ayuda ?? undefined, className: ANCHO[c.clave] };
    const numerico = (clave: "anchoMm" | "altoMm" | "espesorMm" | "costo" | "precioVenta", extra: object) => (
      <Campo {...base} htmlFor={clave} error={error(clave)}>
        <input id={clave} name={clave} type="number" defaultValue={cristal?.[clave] ?? ""} className={input} {...extra} />
      </Campo>
    );
    switch (c.clave) {
      case "codigo":
        return (
          <Campo {...base} htmlFor="codigo" error={error("codigo")}>
            <input id="codigo" name="codigo" defaultValue={cristal?.codigo} className={`${input} uppercase`} aria-invalid={!!error("codigo")} />
          </Campo>
        );
      case "codigoFabricante":
        return (
          <Campo {...base} htmlFor="codigoFabricante" error={error("codigoFabricante")}>
            <input id="codigoFabricante" name="codigoFabricante" defaultValue={cristal?.codigoFabricante ?? ""} className={input} />
          </Campo>
        );
      case "descripcion":
        return (
          <Campo {...base} htmlFor="descripcion" error={error("descripcion")}>
            <input id="descripcion" name="descripcion" defaultValue={cristal?.descripcion} placeholder="Parabrisas Hilux 2016+ con sensor" className={input} aria-invalid={!!error("descripcion")} />
          </Campo>
        );
      case "marcaId":
        return (
          <Campo {...base} htmlFor="marcaId" error={error("marcaId")}>
            <select id="marcaId" name="marcaId" defaultValue={cristal?.marcaId ?? ""} className={input}>
              <option value="" disabled>Elegir…</option>
              {catalogos.marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </Campo>
        );
      case "tipoId":
        return (
          <Campo {...base} htmlFor="tipoId" error={error("tipoId")}>
            <select id="tipoId" name="tipoId" defaultValue={cristal?.tipoId ?? ""} className={input}>
              <option value="" disabled>Elegir…</option>
              {catalogos.tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </Campo>
        );
      case "ubicacionId":
        return (
          <Campo {...base} htmlFor="ubicacionId" error={error("ubicacionId")}>
            <select id="ubicacionId" name="ubicacionId" value={ubicacionId} onChange={(e) => setUbicacionId(e.target.value)} className={input}>
              {catalogos.ubicaciones.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </Campo>
        );
      case "lado":
        return (
          <Campo {...base} htmlFor="lado" error={error("lado")}>
            <select id="lado" name="lado" defaultValue={cristal?.lado ?? "NO_APLICA"} disabled={!tieneLado} className={input}>
              <option value="NO_APLICA">No aplica</option>
              <option value="IZQUIERDO">Izquierdo</option>
              <option value="DERECHO">Derecho</option>
            </select>
          </Campo>
        );
      case "anchoMm":
      case "altoMm":
        return numerico(c.clave, { min: 1 });
      case "espesorMm":
        return numerico("espesorMm", { min: 0, step: "0.1" });
      case "cantidad":
        return cristal ? (
          <p className="self-end text-xs text-texto-suave lg:col-span-1">La cantidad se modifica con movimientos de stock, desde la ficha.</p>
        ) : (
          <Campo {...base} etiqueta={`${c.etiqueta} inicial`} htmlFor="cantidadInicial" error={error("cantidadInicial")}>
            <input id="cantidadInicial" name="cantidadInicial" type="number" min={0} defaultValue={0} className={input} />
          </Campo>
        );
      case "stockMinimo":
        return (
          <Campo {...base} htmlFor="stockMinimo" error={error("stockMinimo")}>
            <input id="stockMinimo" name="stockMinimo" type="number" min={0} defaultValue={cristal?.stockMinimo ?? 1} className={input} />
          </Campo>
        );
      case "ubicacionDeposito":
        return (
          <Campo {...base} htmlFor="ubicacionDeposito" error={error("ubicacionDeposito")}>
            <input id="ubicacionDeposito" name="ubicacionDeposito" placeholder="Rack A-3" defaultValue={cristal?.ubicacionDeposito ?? ""} className={input} />
          </Campo>
        );
      case "costo":
      case "precioVenta":
        return numerico(c.clave, { min: 0, step: "0.01" });
      default:
        return null;
    }
  };

  const seccion = (s: SeccionCampo, columnas: string, ancho: string) => {
    const items = deSeccion(s);
    if (items.length === 0) return null;
    return (
      <section className={`${tarjeta} grid gap-5 p-5 ${columnas}`}>
        <h2 className={`font-display font-bold ${ancho}`}>{titulo(s)}</h2>
        {items.map((c) => <Fragment key={c.clave}>{sistema(c)}</Fragment>)}
      </section>
    );
  };

  const compatibilidades = deSeccion("compatibilidades")[0];
  const adicionales = deSeccion("adicionales");

  return (
    <form onSubmit={enviar} className="space-y-6" noValidate>
      {estado.mensaje && !estado.ok && <Aviso tono="peligro">{estado.mensaje}</Aviso>}
      {compatibilidades && <input type="hidden" name="compatibilidades" value={JSON.stringify(compatParaEnviar)} />}

      {seccion("identificacion", "sm:grid-cols-2 lg:grid-cols-4", "sm:col-span-2 lg:col-span-4")}
      {seccion("principales", "sm:grid-cols-2 lg:grid-cols-4", "sm:col-span-2 lg:col-span-4")}

      {compatibilidades && (
        <section className={`${tarjeta} space-y-4 p-5`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-bold">{compatibilidades.etiqueta}</h2>
              <p className="text-sm text-texto-suave">Dejá “hasta” vacío si el modelo sigue vigente.</p>
            </div>
            <button type="button" onClick={() => setCompat([...compat, COMPATIBILIDAD_VACIA])} className={`${boton.secundario} ${boton.chico}`}>
              <Plus className="size-3.5" aria-hidden /> Agregar vehículo
            </button>
          </div>
          {error("compatibilidades") && <p className="text-sm text-peligro">{error("compatibilidades")}</p>}
          {compat.length === 0 && <p className="text-sm text-texto-suave">Sin vehículos cargados.</p>}
          <div className="space-y-3">
            {compat.map((c, i) => {
              const fallo = error(`compatibilidades.${i}.anioHasta`) ?? error(`compatibilidades.${i}.anioDesde`) ?? error(`compatibilidades.${i}.modeloId`);
              return (
                <div key={i} className="space-y-1">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-[2fr_1fr_1fr_2fr_auto]">
                    <select aria-label="Modelo" value={c.modeloId} onChange={(e) => editarCompat(i, { modeloId: e.target.value })} className={`${input} col-span-2 sm:col-span-1`}>
                      <option value="">Elegir modelo…</option>
                      {catalogos.marcasVehiculo.map((m) => (
                        <optgroup key={m.id} label={m.nombre}>
                          {m.modelos.map((mo) => <option key={mo.id} value={mo.id}>{m.nombre} {mo.nombre}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <input aria-label="Año desde" type="number" placeholder="Desde" value={c.anioDesde ?? ""} onChange={(e) => editarCompat(i, { anioDesde: anio(e.target.value) })} className={input} />
                    <input aria-label="Año hasta" type="number" placeholder="Hasta" value={c.anioHasta ?? ""} onChange={(e) => editarCompat(i, { anioHasta: anio(e.target.value) })} className={input} />
                    <input aria-label="Carrocería o versión" placeholder="Carrocería / versión" value={c.carroceria ?? ""} onChange={(e) => editarCompat(i, { carroceria: e.target.value })} className={input} />
                    <button type="button" onClick={() => setCompat(compat.filter((_, j) => j !== i))} aria-label="Quitar vehículo" className={`${boton.fantasma} ${boton.chico}`}>
                      <X className="size-4" />
                    </button>
                  </div>
                  {fallo && <p className="text-xs text-peligro">{fallo}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {seccion("stock", "sm:grid-cols-2 lg:grid-cols-5", "sm:col-span-2 lg:col-span-5")}

      {adicionales.length > 0 && (
        <section className={`${tarjeta} space-y-4 p-5`}>
          <h2 className="font-display font-bold">{titulo("adicionales")}</h2>
          <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {adicionales.map((c) => (
              <CampoPersonalizado key={c.clave} campo={c} valor={cristal?.extras[c.clave]} error={error(nombreInput(c.clave))} />
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-end gap-2">
        <Link href={cristal ? `/stock/${cristal.id}` : "/stock"} className={boton.secundario}>Cancelar</Link>
        <button type="submit" disabled={pendiente} className={boton.primario}>
          {pendiente ? "Guardando…" : cristal ? "Guardar cambios" : "Dar de alta"}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 9: Páginas de Stock (nuevo, editar, lista y ficha)**

Reemplazar `src/app/(panel)/stock/nuevo/page.tsx` por:

```tsx
import { connection } from "next/server";
import { EncabezadoPagina } from "@/components/ui";
import { verificarSesion } from "@/lib/sesion";
import { obtenerCampos } from "@/modules/campos/campo.service";
import { obtenerCatalogos } from "@/modules/inventario/cristal.service";
import { FormularioCristal } from "../FormularioCristal";

export const metadata = { title: "Nuevo cristal" };

export default async function PaginaNuevoCristal() {
  await verificarSesion();
  await connection(); // los catálogos y los campos se leen en cada visita, no al compilar
  const [catalogos, campos] = await Promise.all([obtenerCatalogos(), obtenerCampos("CRISTAL")]);
  return (
    <>
      <EncabezadoPagina seccion="Stock" titulo="Nuevo cristal" />
      <FormularioCristal catalogos={catalogos} campos={campos} />
    </>
  );
}
```

Reemplazar `src/app/(panel)/stock/[id]/editar/page.tsx` por:

```tsx
import { notFound } from "next/navigation";
import { EncabezadoPagina } from "@/components/ui";
import { verificarSesion } from "@/lib/sesion";
import { obtenerCampos } from "@/modules/campos/campo.service";
import type { Extras } from "@/modules/campos/tipos";
import { obtenerCatalogos, obtenerCristal } from "@/modules/inventario/cristal.service";
import { FormularioCristal } from "../../FormularioCristal";

export const metadata = { title: "Editar cristal" };

const aNumero = (v: { toString(): string } | null) => (v === null ? null : Number(v));

export default async function PaginaEditarCristal({ params }: { params: Promise<{ id: string }> }) {
  await verificarSesion();
  const { id } = await params;
  const cristal = await obtenerCristal(id);
  if (!cristal) notFound();

  // Lo que el cristal ya tiene guardado se ofrece aunque esté desactivado en las listas.
  const conservar = [
    cristal.marcaId,
    cristal.tipoId,
    cristal.ubicacionId,
    ...cristal.compatibilidades.flatMap((v) => [v.modeloId, v.modelo.marcaId]),
  ];
  const [catalogos, campos] = await Promise.all([obtenerCatalogos({ conservar }), obtenerCampos("CRISTAL")]);

  return (
    <>
      <EncabezadoPagina seccion="Stock" titulo={`Editar ${cristal.codigo}`} descripcion={cristal.descripcion} />
      <FormularioCristal
        catalogos={catalogos}
        campos={campos}
        cristal={{
          ...cristal,
          // Los Decimal de Prisma no se pueden pasar a un componente de cliente.
          espesorMm: aNumero(cristal.espesorMm),
          costo: aNumero(cristal.costo),
          precioVenta: aNumero(cristal.precioVenta),
          extras: cristal.extras as Extras,
          compatibilidades: cristal.compatibilidades.map(({ modeloId, anioDesde, anioHasta, carroceria }) => ({
            modeloId,
            anioDesde,
            anioHasta,
            carroceria,
          })),
        }}
      />
    </>
  );
}
```

En `src/app/(panel)/stock/page.tsx`, reemplazar `obtenerCatalogos(),` por `obtenerCatalogos({ incluirInactivos: true }),` (los filtros también listan lo desactivado).

En `src/app/(panel)/stock/[id]/page.tsx` aplicar estos cambios:

a) Import: reemplazar `import { Aviso, boton, EncabezadoPagina, Insignia, tarjeta } from "@/components/ui";` por `import { Aviso, boton, EncabezadoPagina, tarjeta } from "@/components/ui";` y reemplazar `import { obtenerCristal } from "@/modules/inventario/cristal.service";` por:

```ts
import { obtenerCampos } from "@/modules/campos/campo.service";
import { formatearValor } from "@/modules/campos/extras";
import type { Extras } from "@/modules/campos/tipos";
import { obtenerCristal } from "@/modules/inventario/cristal.service";
```

b) Reemplazar
```ts
  const c = await obtenerCristal(id);
  if (!c) notFound();

  const bajo = c.cantidad <= c.stockMinimo;
  const caracteristicas = c.caracteristicas.map((x) =>
    x.caracteristica.tipoDato === "BOOLEANO" ? (x.valor === "true" ? x.caracteristica.nombre : null) : `${x.caracteristica.nombre}: ${x.valor}${x.caracteristica.unidad ? ` ${x.caracteristica.unidad}` : ""}`,
  ).filter(Boolean);
```
por:
```ts
  const [c, campos] = await Promise.all([obtenerCristal(id), obtenerCampos("CRISTAL")]);
  if (!c) notFound();

  const bajo = c.cantidad <= c.stockMinimo;
  const campo = (clave: string) => campos.find((x) => x.clave === clave);
  const visible = (clave: string) => campo(clave)?.visible ?? true;
  const etiqueta = (clave: string) => campo(clave)?.etiqueta ?? clave;
  const extras = c.extras as Extras;
  const adicionales = campos
    .filter((x) => x.origen === "PROPIO" && x.visible && extras[x.clave] !== undefined)
    .map((x) => ({ clave: x.clave, etiqueta: x.etiqueta, texto: formatearValor(x, extras[x.clave]) }));
```

c) Reemplazar el bloque de la segunda tarjeta (desde `<dl className="grid grid-cols-2 gap-4 text-sm">` hasta el cierre del `{caracteristicas.length > 0 && (...)}`) por:

```tsx
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {(visible("anchoMm") || visible("altoMm") || visible("espesorMm")) && (
                <Dato etiqueta="Medidas">{medidas(c.anchoMm, c.altoMm, c.espesorMm)}</Dato>
              )}
              {visible("ubicacionDeposito") && <Dato etiqueta={etiqueta("ubicacionDeposito")}>{c.ubicacionDeposito ?? "—"}</Dato>}
              {visible("costo") && <Dato etiqueta={etiqueta("costo")}>{pesos(c.costo)}</Dato>}
              {visible("precioVenta") && <Dato etiqueta={etiqueta("precioVenta")}>{pesos(c.precioVenta)}</Dato>}
              {visible("codigoFabricante") && <Dato etiqueta={etiqueta("codigoFabricante")}>{c.codigoFabricante ?? "—"}</Dato>}
              {adicionales.map((a) => (
                <Dato key={a.clave} etiqueta={a.etiqueta}>{a.texto}</Dato>
              ))}
            </dl>
```
(dejando `</section>` como estaba).

d) La tarjeta "Vehículos compatibles" se muestra solo si el campo está visible. Dos ediciones:

Reemplazar
```tsx
          <section className={`${tarjeta} p-5`}>
            <h2 className="mb-3 font-display font-bold">Vehículos compatibles</h2>
```
por
```tsx
          {visible("compatibilidades") && (
          <section className={`${tarjeta} p-5`}>
            <h2 className="mb-3 font-display font-bold">{etiqueta("compatibilidades")}</h2>
```

y reemplazar
```tsx
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
```
por
```tsx
              </ul>
            )}
          </section>
          )}
        </div>

        <div className="space-y-6">
```

- [ ] **Step 10: Reiniciar el servidor de desarrollo y verificar**

El cliente de Prisma se regeneró y `db` se cachea en `globalThis`: hay que reiniciar el servidor para que vea los modelos nuevos.

```bash
netstat -ano | grep -E ":3000 .*LISTENING"      # anotar el PID de la última columna
taskkill //PID <PID> //F
```

Luego correr `npm run dev` en segundo plano (`run_in_background`, `timeout` 7200000). Esperar a `Ready`.

Run:

```bash
npm run typecheck
npm test
cat > tmp-cookie.ts <<'EOF'
import "dotenv/config";
import { db } from "./src/lib/db";
import { firmarToken, obtenerSecreto } from "./src/lib/token";
const u = await db.usuario.findFirstOrThrow({ where: { rol: "ADMIN", activo: true } });
process.stdout.write(await firmarToken(u.id, obtenerSecreto()));
process.exit(0);
EOF
TOKEN=$(npx tsx tmp-cookie.ts 2>/dev/null); rm -f tmp-cookie.ts
for ruta in /stock /stock/nuevo; do curl -s -b "sesion=$TOKEN" -o "$TEMP/p.html" -w "$ruta -> %{http_code}\n" "http://localhost:3000$ruta"; done
curl -s -b "sesion=$TOKEN" http://localhost:3000/stock/nuevo | grep -o -E "Datos adicionales|Sensor de lluvia|Tonalidad|Código interno|Precio de venta" | sort -u
ID=$(curl -s -b "sesion=$TOKEN" http://localhost:3000/stock | grep -o -E '/stock/[a-z0-9]{20,}' | head -1)
echo "ficha: $ID"; for sufijo in "" "/editar"; do curl -s -b "sesion=$TOKEN" -o "$TEMP/p.html" -w "$ID$sufijo -> %{http_code}\n" "http://localhost:3000$ID$sufijo"; done
```

Expected: typecheck y tests en verde; `/stock`, `/stock/nuevo`, la ficha y `/editar` devuelven `200`; en `/stock/nuevo` aparecen `Código interno`, `Precio de venta`, `Datos adicionales`, `Sensor de lluvia` y `Tonalidad`. Si alguna ruta da 500, mirar la salida del servidor (`Read` del archivo de salida de la tarea en segundo plano).

- [ ] **Step 11: Commit**

```bash
git add src/modules/inventario src/app/\(panel\)/stock src/components/campos
git commit -m "feat: Stock usa campos del sistema configurables y campos propios" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Contraer — eliminar `Caracteristica` y sembrar los campos propios por defecto

**Files:**
- Modify: `prisma/schema.prisma`, `prisma/seed.ts`
- Create: `prisma/migrations/20260930140000_eliminar_caracteristicas/migration.sql` (lo genera Prisma; se le antepone una guarda)

**Interfaces:**
- Consumes: campos propios ya migrados (Task 5) y el código de Stock que ya no usa `Caracteristica` (Task 7).
- Produces: sin tablas `caracteristicas` ni `cristal_caracteristicas` ni enum `TipoDato`; el seed crea los 7 campos propios por defecto de Stock si no existen.

- [ ] **Step 1: Quitar los modelos viejos del schema**

Run:

```bash
python - <<'EOF'
import re
ruta = "prisma/schema.prisma"
s = open(ruta, encoding="utf-8", newline="").read()
for patron in [
    r"enum TipoDato \{.*?\n\}\n\n",
    r"/// Definición de una característica.*?\nmodel Caracteristica \{.*?\n\}\n\n",
    r"/// Valor de una característica.*?\nmodel CristalCaracteristica \{.*?\n\}\n\n",
]:
    s, n = re.subn(patron, "", s, flags=re.S)
    assert n == 1, (patron, n)
s, n = re.subn(r"  caracteristicas   CristalCaracteristica\[\]\n", "", s)
assert n == 1, n
open(ruta, "w", encoding="utf-8", newline="").write(s)
print("ok")
EOF
git diff --stat prisma/schema.prisma
grep -n -i "caracteristica\|TipoDato" prisma/schema.prisma
```

Expected: `ok`; el diff solo borra líneas; el `grep` no imprime nada.

- [ ] **Step 2: Generar la migración y anteponerle la guarda de seguridad**

```bash
D=prisma/migrations/20260930140000_eliminar_caracteristicas
mkdir -p $D
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script > $D/generado.sql
cat > $D/migration.sql <<'EOF'
-- Seguridad: no borrar las características si todavía no se copiaron a campos propios.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "caracteristicas")
     AND NOT EXISTS (SELECT 1 FROM "campos_personalizados" WHERE "entidad" = 'CRISTAL') THEN
    RAISE EXCEPTION 'Corré primero: npm run db:migrar-caracteristicas';
  END IF;
END $$;

EOF
cat $D/generado.sql >> $D/migration.sql && rm $D/generado.sql
cat $D/migration.sql
```

Expected: además de la guarda, el SQL solo tiene `DROP TABLE "cristal_caracteristicas"`, `DROP TABLE "caracteristicas"` y `DROP TYPE "TipoDato"` (con sus `ALTER TABLE ... DROP CONSTRAINT` previos). Si aparece cualquier otra sentencia, parar y revisar el schema.

- [ ] **Step 3: Aplicar y regenerar el cliente**

Run: `npx prisma migrate deploy` y `npx prisma generate`
Expected: `Applying migration '20260930140000_eliminar_caracteristicas'` y éxito. (Si la guarda dispara el error "Corré primero…", correr `npm run db:migrar-caracteristicas` y repetir.)

- [ ] **Step 4: Sembrar los campos propios por defecto**

En `prisma/seed.ts`:

a) Reemplazar `import { PrismaClient } from "../src/generated/prisma/client";` por `import { Prisma, PrismaClient } from "../src/generated/prisma/client";` y agregar junto a los otros imports relativos:

```ts
import { generarClave } from "../src/modules/campos/clave";
import { crearOpciones } from "../src/modules/campos/opciones";
```

b) Reemplazar el bloque de características (desde `  const caracteristicas = [` hasta el `for` que las inserta, inclusive) corriendo:

```bash
python - <<'PYEOF'
import re
ruta = "prisma/seed.ts"
s = open(ruta, encoding="utf-8", newline="").read()
nuevo = '''  // Campos propios de Stock que trae el sistema. Es idempotente: no pisa lo que el Admin haya editado.
  const camposStock: { etiqueta: string; tipo: "SI_NO" | "LISTA"; opciones?: string[] }[] = [
    { etiqueta: "Sensor de lluvia", tipo: "SI_NO" },
    { etiqueta: "Calefaccionado", tipo: "SI_NO" },
    { etiqueta: "Antena incorporada", tipo: "SI_NO" },
    { etiqueta: "Soporte de espejo", tipo: "SI_NO" },
    { etiqueta: "Franja degradé", tipo: "SI_NO" },
    { etiqueta: "Preparado para cámara ADAS", tipo: "SI_NO" },
    { etiqueta: "Tonalidad", tipo: "LISTA", opciones: ["Incoloro", "Verde", "Gris", "Bronce"] },
  ];
  for (const [i, c] of camposStock.entries()) {
    const clave = generarClave(c.etiqueta);
    await db.campoPersonalizado.upsert({
      where: { entidad_clave: { entidad: "CRISTAL", clave } },
      update: {},
      create: {
        entidad: "CRISTAL",
        clave,
        etiqueta: c.etiqueta,
        tipo: c.tipo,
        opciones: crearOpciones(c.opciones ?? []) as unknown as Prisma.InputJsonArray,
        orden: (i + 1) * 10,
      },
    });
  }
'''
patron = r"  const caracteristicas = \[.*?\n  for \(const c of caracteristicas\) \{\n.*?\n  \}\n"
s, n = re.subn(patron, lambda _: nuevo, s, flags=re.S)
assert n == 1, n
open(ruta, "w", encoding="utf-8", newline="").write(s)
print("seed ok")
PYEOF
grep -n "caracteristica" prisma/seed.ts
```

Expected: `seed ok`; el `grep` no imprime nada.

- [ ] **Step 5: Verificar seed idempotente, código sin referencias y suite**

```bash
npm run db:seed 2>&1 | grep -E "Seed|Error|error"
npm run db:seed 2>&1 | grep -E "Seed|Error|error"
git grep -n -i "caracteristica" -- src prisma ':!prisma/migrations' ':!src/generated' | grep -v -E "migracion|migrar-caracteristicas|campos/"
npm run typecheck
npm test
```

Expected: dos veces `Seed completo.` y ningún error; el `git grep` filtrado no imprime nada (solo quedan referencias en el conversor, su script y sus tests); typecheck y tests en verde.

- [ ] **Step 6: Reiniciar el servidor de desarrollo y comprobar Stock**

Reiniciar como en la Task 7 (Step 10: `taskkill` del PID del puerto 3000 y `npm run dev` en segundo plano). Luego repetir la verificación con `curl` y el token firmado de la Task 7 sobre `/stock`, `/stock/nuevo` y una ficha; esperar `200`.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/seed.ts prisma/migrations
git commit -m "feat: elimina Caracteristica y siembra los campos propios por defecto de Stock" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Administración — entrada con cards, vista de campos y menú lateral

**Files:**
- Create: `src/app/(panel)/administracion/page.tsx`
- Create: `src/app/(panel)/administracion/stock/layout.tsx`, `src/app/(panel)/administracion/stock/PestanasAdmin.tsx`, `src/app/(panel)/administracion/stock/page.tsx`
- Modify: `src/components/layout/BarraLateral.tsx`

**Interfaces:**
- Consumes: `obtenerCampos` (Task 6), `ETIQUETA_TIPO` (Task 1), `SECCIONES` (Task 2), `requerirRol` (sesión existente).
- Produces: rutas `/administracion` (cards) y `/administracion/stock` (pestaña **Campos**, de solo lectura por ahora); `PestanasAdmin` (pestañas Campos / Listas); ítem "Administración" en el menú para el Admin.

- [ ] **Step 1: Crear la pantalla de entrada `src/app/(panel)/administracion/page.tsx`**

```tsx
import Link from "next/link";
import { ArrowRight, CalendarClock, Package, Wrench } from "lucide-react";
import { EncabezadoPagina, Insignia, tarjeta } from "@/components/ui";
import { requerirRol } from "@/lib/sesion";

export const metadata = { title: "Administración" };

const modulos = [
  {
    href: "/administracion/stock",
    titulo: "Stock",
    descripcion: "Campos y listas de los cristales: marcas, tipos, ubicaciones, medidas, precios y campos propios.",
    Icono: Package,
    disponible: true,
  },
  {
    href: "/administracion/servicios",
    titulo: "Servicios",
    descripcion: "Campos de los servicios: duración, capacidad, precio y campos propios.",
    Icono: Wrench,
    disponible: false,
  },
  {
    href: "/administracion/turnos",
    titulo: "Turnos y clientes",
    descripcion: "Campos del turno y del cliente, también los del formulario público de reservas.",
    Icono: CalendarClock,
    disponible: false,
  },
];

export default async function PaginaAdministracion() {
  await requerirRol("ADMIN");

  return (
    <>
      <EncabezadoPagina
        seccion="Administración"
        titulo="¿Qué querés administrar?"
        descripcion="Elegí un módulo para ver, renombrar, ocultar y sumar campos, y para administrar sus listas de opciones."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modulos.map(({ href, titulo, descripcion, Icono, disponible }) => {
          const contenido = (
            <>
              <div className="flex items-center justify-between">
                <Icono className="size-6 text-acento" aria-hidden />
                {disponible ? <ArrowRight className="size-4 text-texto-suave" aria-hidden /> : <Insignia>Próximamente</Insignia>}
              </div>
              <h2 className="mt-4 font-display text-xl font-extrabold">{titulo}</h2>
              <p className="mt-1 text-sm text-texto-suave">{descripcion}</p>
            </>
          );
          return disponible ? (
            <Link key={titulo} href={href} className={`${tarjeta} block p-5 transition-colors hover:border-amarillo-500`}>
              {contenido}
            </Link>
          ) : (
            <div key={titulo} aria-disabled="true" className={`${tarjeta} p-5 opacity-60`}>
              {contenido}
            </div>
          );
        })}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Crear el layout con pestañas de Stock**

`src/app/(panel)/administracion/stock/PestanasAdmin.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LISTAS = "/administracion/stock/listas";

export function PestanasAdmin() {
  const ruta = usePathname();
  // "Campos" cubre también /campos/nuevo y /campos/[clave].
  const pestanas = [
    { href: "/administracion/stock", etiqueta: "Campos", activa: !ruta.startsWith(LISTAS) },
    { href: LISTAS, etiqueta: "Listas", activa: ruta.startsWith(LISTAS) },
  ];
  return (
    <nav aria-label="Secciones de Stock" className="flex gap-1 border-b border-borde">
      {pestanas.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          aria-current={p.activa ? "page" : undefined}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
            p.activa ? "border-amarillo-500 text-texto" : "border-transparent text-texto-suave hover:text-texto"
          }`}
        >
          {p.etiqueta}
        </Link>
      ))}
    </nav>
  );
}
```

`src/app/(panel)/administracion/stock/layout.tsx`:

```tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { boton, EncabezadoPagina } from "@/components/ui";
import { requerirRol } from "@/lib/sesion";
import { PestanasAdmin } from "./PestanasAdmin";

export default async function LayoutAdministracionStock({ children }: { children: React.ReactNode }) {
  await requerirRol("ADMIN");
  return (
    <>
      <Link href="/administracion" className={`${boton.fantasma} ${boton.chico} -ml-2.5`}>
        <ArrowLeft className="size-3.5" aria-hidden /> Administración
      </Link>
      <EncabezadoPagina
        seccion="Administración"
        titulo="Stock"
        descripcion="Los cambios se aplican enseguida en el alta, la edición y la ficha de cada cristal."
      />
      <PestanasAdmin />
      {children}
    </>
  );
}
```

- [ ] **Step 3: Crear la vista de campos (solo lectura) `src/app/(panel)/administracion/stock/page.tsx`**

```tsx
import Link from "next/link";
import { Fragment } from "react";
import { Aviso, Insignia, tarjeta } from "@/components/ui";
import { requerirRol } from "@/lib/sesion";
import { obtenerCampos } from "@/modules/campos/campo.service";
import type { CampoFinal } from "@/modules/campos/combinar";
import { SECCIONES } from "@/modules/campos/registro";
import { ETIQUETA_TIPO } from "@/modules/campos/tipos";

export const metadata = { title: "Administración · Campos de Stock" };

const AVISOS: Record<string, string> = {
  creado: "Campo creado.",
  guardado: "Cambios guardados.",
  eliminado: "Campo eliminado.",
};

const ANCLA_LISTA = { marcas: "marcas", tipos: "tipos", ubicaciones: "ubicaciones" } as const;

function Tipo({ c }: { c: CampoFinal }) {
  if (c.especial) return <>Sección de vehículos</>;
  if (c.lista === "lado") return <>Lista fija (No aplica, Izquierdo, Derecho)</>;
  if (c.lista) {
    return (
      <>
        Lista ·{" "}
        <Link href={`/administracion/stock/listas#${ANCLA_LISTA[c.lista]}`} className="font-medium text-acento underline">
          ver opciones
        </Link>
      </>
    );
  }
  if (c.tipo === "LISTA") {
    const activas = c.opciones.filter((o) => o.activo).length;
    return <>Lista · {activas} {activas === 1 ? "opción activa" : "opciones activas"}</>;
  }
  return <>{ETIQUETA_TIPO[c.tipo]}{c.unidad ? ` (${c.unidad})` : ""}</>;
}

export default async function PaginaCamposStock({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  await requerirRol("ADMIN");
  const { aviso } = await searchParams;
  const campos = await obtenerCampos("CRISTAL");

  return (
    <>
      {aviso && AVISOS[aviso] && <Aviso>{AVISOS[aviso]}</Aviso>}

      <div className={`${tarjeta} overflow-x-auto`}>
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-borde text-left text-xs text-texto-suave uppercase">
            <tr>
              <th className="px-4 py-2 font-semibold">Campo</th>
              <th className="px-4 py-2 font-semibold">Tipo</th>
              <th className="px-4 py-2 font-semibold">Origen</th>
              <th className="px-4 py-2 font-semibold">Obligatorio</th>
              <th className="px-4 py-2 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {SECCIONES.map((s) => {
              const deSeccion = campos.filter((c) => c.seccion === s.id);
              if (deSeccion.length === 0) return null;
              return (
                <Fragment key={s.id}>
                  <tr className="bg-grafito-500/10">
                    <th colSpan={5} className="px-4 py-1.5 text-left text-xs font-semibold tracking-wide text-texto-suave uppercase">
                      {s.etiqueta}
                    </th>
                  </tr>
                  {deSeccion.map((c) => (
                    <tr key={c.clave} className={c.visible ? "" : "opacity-60"}>
                      <td className="px-4 py-2.5">
                        <p className="font-medium">{c.etiqueta}</p>
                        {c.ayuda && <p className="text-xs text-texto-suave">{c.ayuda}</p>}
                      </td>
                      <td className="px-4 py-2.5 text-texto-suave">
                        <Tipo c={c} />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          <Insignia tono={c.origen === "PROPIO" ? "marca" : "neutro"}>{c.origen === "PROPIO" ? "Propio" : "Sistema"}</Insignia>
                          {c.protegido && <Insignia>Protegido</Insignia>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">{c.soloLectura || c.especial ? "—" : c.requerido ? "Sí" : "No"}</td>
                      <td className="px-4 py-2.5">
                        {c.archivado ? <Insignia tono="alerta">Archivado</Insignia> : c.visible ? "Visible" : <Insignia tono="alerta">Oculto</Insignia>}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Agregar "Administración" al menú lateral (solo Admin)**

En `src/components/layout/BarraLateral.tsx`:

a) Reemplazar el import de lucide:
`import { CalendarClock, ExternalLink, LayoutDashboard, LogOut, Package, UserCog, Wrench } from "lucide-react";`
por
`import { CalendarClock, ExternalLink, LayoutDashboard, LogOut, Package, SlidersHorizontal, UserCog, Wrench } from "lucide-react";`

b) En el arreglo `secciones`, agregar al final (después del ítem de Usuarios):

```ts
  { href: "/administracion", etiqueta: "Administración", Icono: SlidersHorizontal, soloAdmin: true },
```

- [ ] **Step 5: Verificar**

Run: `npm run typecheck` y `npm test`
Expected: en verde.

Con el servidor en marcha y el token firmado (como en Task 7, Step 10):

```bash
for ruta in /administracion /administracion/stock; do curl -s -b "sesion=$TOKEN" -o "$TEMP/p.html" -w "$ruta -> %{http_code}\n" "http://localhost:3000$ruta"; done
curl -s -b "sesion=$TOKEN" http://localhost:3000/administracion | grep -o -E "Stock|Servicios|Turnos y clientes|Próximamente" | sort | uniq -c
curl -s -b "sesion=$TOKEN" http://localhost:3000/administracion/stock | grep -o -E "Código interno|Precio de venta|Sensor de lluvia|Protegido|Propio|Sistema|Datos adicionales" | sort | uniq -c
curl -s -o /dev/null -w "sin sesión /administracion -> %{http_code}\n" http://localhost:3000/administracion
```

Expected: `200` en las dos rutas; las cards muestran `Stock`, `Servicios`, `Turnos y clientes` y dos `Próximamente`; la tabla lista los campos de fábrica y los 7 propios; sin sesión devuelve `307`.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(panel\)/administracion src/components/layout/BarraLateral.tsx
git commit -m "feat: pantalla de Administracion con cards y vista de campos de Stock" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Administración de campos de Stock (crear, editar, ocultar, reordenar, opciones, archivar, eliminar)

**Files:**
- Modify (test): `src/guardia-acciones.test.ts`
- Modify: `src/lib/formularios.ts` (tipo `EstadoConConteo`)
- Create: `src/app/(panel)/administracion/stock/acciones.ts`
- Modify (reemplazo completo): `src/app/(panel)/administracion/stock/page.tsx`
- Create: `src/app/(panel)/administracion/stock/AccionesFila.tsx`
- Create: `src/app/(panel)/administracion/stock/campos/nuevo/page.tsx`, `.../campos/nuevo/FormularioCampoNuevo.tsx`
- Create: `src/app/(panel)/administracion/stock/campos/[clave]/page.tsx`, `FormularioCampoSistema.tsx`, `FormularioCampoPropio.tsx`, `CambiarTipo.tsx`, `EditorOpciones.tsx`, `ZonaPeligro.tsx` (todos en `.../campos/[clave]/`)

**Interfaces:**
- Consumes: servicios de la Task 6, `CampoFinal` (Task 2), `nombreInput`/`TIPOS_CAMPO`/`ETIQUETA_TIPO` (Task 1), `REGISTRO` (Task 2).
- Produces (acciones, todas con `requerirRol("ADMIN")` primero): `crearCampoAccion(previo, fd)`, `guardarCampoSistemaAccion(clave, previo, fd)`, `guardarCampoPropioAccion(id, previo, fd)`, `moverCampoAccion(clave, direccion)`, `archivarCampoAccion(id, archivar)`, `eliminarCampoAccion(id, confirmar)`, `cambiarTipoAccion(id, tipo, opcionesTexto, confirmar)`, `opcionAccion(id, operacion)`. Las que pueden pedir confirmación devuelven `EstadoConConteo` (`afectados` cuando hay datos por borrar).

- [ ] **Step 1: Write the failing test (extender la guardia)**

En `src/guardia-acciones.test.ts` hacer dos cambios:

a) `const SOLO_ADMIN = ["servicios", "usuarios"];` → `const SOLO_ADMIN = ["administracion", "servicios", "usuarios"];`

b) En el test "encuentra los archivos de acciones esperados", reemplazar `expect(carpetas).toEqual(["servicios", "stock", "turnos", "usuarios"]);` por:

```ts
    expect([...new Set(carpetas)]).toEqual(["administracion", "servicios", "stock", "turnos", "usuarios"]);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/guardia-acciones.test.ts`
Expected: FAIL solo en "encuentra los archivos de acciones esperados" (todavía no existe `administracion/stock/acciones.ts`).

- [ ] **Step 3: Tipo de resultado con conteo**

En `src/lib/formularios.ts`, agregar después de la definición de `EstadoFormulario`:

```ts
/** Resultado de una acción que puede pedir confirmación: `afectados` = registros cuyos datos se borrarían. */
export interface EstadoConConteo extends EstadoFormulario {
  afectados?: number;
}
```

- [ ] **Step 4: Crear las acciones `src/app/(panel)/administracion/stock/acciones.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { casilla, erroresDeZod, esDuplicado, fallo, texto, type EstadoConConteo, type EstadoFormulario } from "@/lib/formularios";
import { requerirRol } from "@/lib/sesion";
import {
  actualizarCampoPropio,
  actualizarCampoSistema,
  archivarCampoPropio,
  cambiarTipoCampo,
  CampoInvalidoError,
  ConfirmacionRequeridaError,
  crearCampoPropio,
  eliminarCampoPropio,
  modificarOpciones,
  moverCampoAdmin,
  type OperacionOpcion,
} from "@/modules/campos/campo.service";
import type { TipoCampo } from "@/modules/campos/tipos";

function refrescar() {
  revalidatePath("/administracion/stock");
  revalidatePath("/stock", "layout");
}

/** Traduce los errores esperados del servicio a un resultado para el formulario; el resto se propaga. */
function aResultado(e: unknown): EstadoConConteo {
  if (e instanceof ZodError) return fallo(erroresDeZod(e));
  if (e instanceof CampoInvalidoError) return e.campo ? fallo({ [e.campo]: e.message }, e.message) : { ok: false, mensaje: e.message };
  if (e instanceof ConfirmacionRequeridaError) return { ok: false, mensaje: e.message, afectados: e.afectados };
  if (esDuplicado(e)) return fallo({ etiqueta: "Ya hay un campo con ese nombre." });
  throw e;
}

const textoLargo = (fd: FormData, campo: string) => {
  const v = fd.get(campo);
  return typeof v === "string" ? v : "";
};

export async function crearCampoAccion(_previo: EstadoFormulario, fd: FormData): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  try {
    await crearCampoPropio("CRISTAL", {
      etiqueta: texto(fd, "etiqueta") as string,
      ayuda: texto(fd, "ayuda"),
      tipo: texto(fd, "tipo") as TipoCampo,
      requerido: casilla(fd, "requerido"),
      unidad: texto(fd, "unidad"),
      opcionesTexto: textoLargo(fd, "opcionesTexto"),
    });
  } catch (e) {
    return aResultado(e);
  }
  refrescar();
  redirect("/administracion/stock?aviso=creado");
}

export async function guardarCampoSistemaAccion(clave: string, _previo: EstadoFormulario, fd: FormData): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  // Los campos protegidos no muestran la casilla "visible": sin la marca `puedeOcultar` nunca se ocultan.
  const oculto = fd.get("puedeOcultar") === "1" ? !casilla(fd, "visible") : false;
  try {
    await actualizarCampoSistema("CRISTAL", clave, { etiqueta: texto(fd, "etiqueta"), ayuda: texto(fd, "ayuda"), oculto });
  } catch (e) {
    return aResultado(e);
  }
  refrescar();
  redirect("/administracion/stock?aviso=guardado");
}

export async function guardarCampoPropioAccion(id: string, _previo: EstadoFormulario, fd: FormData): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  try {
    await actualizarCampoPropio(id, {
      etiqueta: texto(fd, "etiqueta") as string,
      ayuda: texto(fd, "ayuda"),
      requerido: casilla(fd, "requerido"),
      unidad: texto(fd, "unidad"),
      visible: casilla(fd, "visible"),
    });
  } catch (e) {
    return aResultado(e);
  }
  refrescar();
  redirect("/administracion/stock?aviso=guardado");
}

export async function moverCampoAccion(clave: string, direccion: "ARRIBA" | "ABAJO"): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  if (direccion !== "ARRIBA" && direccion !== "ABAJO") return { ok: false, mensaje: "Dirección inválida." };
  await moverCampoAdmin("CRISTAL", clave, direccion);
  refrescar();
  return { ok: true };
}

export async function archivarCampoAccion(id: string, archivar: boolean): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  await archivarCampoPropio(id, archivar === true);
  refrescar();
  return { ok: true };
}

/** Sin datos se elimina directo; con datos devuelve `afectados` y espera una segunda llamada con `confirmar = true`. */
export async function eliminarCampoAccion(id: string, confirmar: boolean): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  try {
    await eliminarCampoPropio(id, { confirmar: confirmar === true });
  } catch (e) {
    return aResultado(e);
  }
  refrescar();
  redirect("/administracion/stock?aviso=eliminado");
}

export async function cambiarTipoAccion(id: string, tipo: string, opcionesTexto: string, confirmar: boolean): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  try {
    await cambiarTipoCampo(id, tipo as TipoCampo, { opcionesTexto, confirmar: confirmar === true });
  } catch (e) {
    return aResultado(e);
  }
  refrescar();
  return { ok: true, mensaje: "Tipo cambiado." };
}

export async function opcionAccion(id: string, operacion: OperacionOpcion): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  try {
    await modificarOpciones(id, operacion);
  } catch (e) {
    return aResultado(e);
  }
  refrescar();
  return { ok: true };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/guardia-acciones.test.ts`
Expected: PASS (incluye las nueve acciones de `administracion/stock`: cada una empieza con `requerirRol("ADMIN")`, y `administracion/acciones.ts` solo exporta funciones async).

- [ ] **Step 6: Reemplazar `src/app/(panel)/administracion/stock/page.tsx` (ahora con acciones por fila)**

Mismo contenido de la Task 9 Step 3 con estos cambios: agregar los imports `Plus` (de `lucide-react`), `boton` (de `@/components/ui`) y `AccionesFila` (de `./AccionesFila`); agregar el botón "Nuevo campo" y una sexta columna. Archivo completo:

```tsx
import Link from "next/link";
import { Fragment } from "react";
import { Plus } from "lucide-react";
import { Aviso, boton, Insignia, tarjeta } from "@/components/ui";
import { requerirRol } from "@/lib/sesion";
import { obtenerCampos } from "@/modules/campos/campo.service";
import type { CampoFinal } from "@/modules/campos/combinar";
import { SECCIONES } from "@/modules/campos/registro";
import { ETIQUETA_TIPO } from "@/modules/campos/tipos";
import { AccionesFila } from "./AccionesFila";

export const metadata = { title: "Administración · Campos de Stock" };

const AVISOS: Record<string, string> = {
  creado: "Campo creado.",
  guardado: "Cambios guardados.",
  eliminado: "Campo eliminado.",
};

const ANCLA_LISTA = { marcas: "marcas", tipos: "tipos", ubicaciones: "ubicaciones" } as const;

function Tipo({ c }: { c: CampoFinal }) {
  if (c.especial) return <>Sección de vehículos</>;
  if (c.lista === "lado") return <>Lista fija (No aplica, Izquierdo, Derecho)</>;
  if (c.lista) {
    return (
      <>
        Lista ·{" "}
        <Link href={`/administracion/stock/listas#${ANCLA_LISTA[c.lista]}`} className="font-medium text-acento underline">
          ver opciones
        </Link>
      </>
    );
  }
  if (c.tipo === "LISTA") {
    const activas = c.opciones.filter((o) => o.activo).length;
    return <>Lista · {activas} {activas === 1 ? "opción activa" : "opciones activas"}</>;
  }
  return <>{ETIQUETA_TIPO[c.tipo]}{c.unidad ? ` (${c.unidad})` : ""}</>;
}

export default async function PaginaCamposStock({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  await requerirRol("ADMIN");
  const { aviso } = await searchParams;
  const campos = await obtenerCampos("CRISTAL");

  return (
    <>
      {aviso && AVISOS[aviso] && <Aviso>{AVISOS[aviso]}</Aviso>}

      <div className="flex justify-end">
        <Link href="/administracion/stock/campos/nuevo" className={boton.primario}>
          <Plus className="size-4" aria-hidden /> Nuevo campo
        </Link>
      </div>

      <div className={`${tarjeta} overflow-x-auto`}>
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b border-borde text-left text-xs text-texto-suave uppercase">
            <tr>
              <th className="px-4 py-2 font-semibold">Campo</th>
              <th className="px-4 py-2 font-semibold">Tipo</th>
              <th className="px-4 py-2 font-semibold">Origen</th>
              <th className="px-4 py-2 font-semibold">Obligatorio</th>
              <th className="px-4 py-2 font-semibold">Estado</th>
              <th className="px-4 py-2 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {SECCIONES.map((s) => {
              const deSeccion = campos.filter((c) => c.seccion === s.id);
              if (deSeccion.length === 0) return null;
              return (
                <Fragment key={s.id}>
                  <tr className="bg-grafito-500/10">
                    <th colSpan={6} className="px-4 py-1.5 text-left text-xs font-semibold tracking-wide text-texto-suave uppercase">
                      {s.etiqueta}
                    </th>
                  </tr>
                  {deSeccion.map((c) => (
                    <tr key={c.clave} className={c.visible ? "" : "opacity-60"}>
                      <td className="px-4 py-2.5">
                        <p className="font-medium">{c.etiqueta}</p>
                        {c.ayuda && <p className="text-xs text-texto-suave">{c.ayuda}</p>}
                      </td>
                      <td className="px-4 py-2.5 text-texto-suave">
                        <Tipo c={c} />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          <Insignia tono={c.origen === "PROPIO" ? "marca" : "neutro"}>{c.origen === "PROPIO" ? "Propio" : "Sistema"}</Insignia>
                          {c.protegido && <Insignia>Protegido</Insignia>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">{c.soloLectura || c.especial ? "—" : c.requerido ? "Sí" : "No"}</td>
                      <td className="px-4 py-2.5">
                        {c.archivado ? <Insignia tono="alerta">Archivado</Insignia> : c.visible ? "Visible" : <Insignia tono="alerta">Oculto</Insignia>}
                      </td>
                      <td className="px-4 py-2.5">
                        <AccionesFila clave={c.clave} />
                      </td>
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
```

- [ ] **Step 7: Acciones por fila (subir, bajar, editar)**

`src/app/(panel)/administracion/stock/AccionesFila.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ArrowDown, ArrowUp, Pencil } from "lucide-react";
import { boton } from "@/components/ui";
import { moverCampoAccion } from "./acciones";

export function AccionesFila({ clave }: { clave: string }) {
  const [pendiente, iniciar] = useTransition();
  const mover = (direccion: "ARRIBA" | "ABAJO") =>
    iniciar(async () => {
      await moverCampoAccion(clave, direccion);
    });

  return (
    <div className="flex justify-end gap-1">
      <button type="button" disabled={pendiente} onClick={() => mover("ARRIBA")} aria-label="Subir" className={`${boton.fantasma} ${boton.chico}`}>
        <ArrowUp className="size-3.5" aria-hidden />
      </button>
      <button type="button" disabled={pendiente} onClick={() => mover("ABAJO")} aria-label="Bajar" className={`${boton.fantasma} ${boton.chico}`}>
        <ArrowDown className="size-3.5" aria-hidden />
      </button>
      <Link href={`/administracion/stock/campos/${clave}`} className={`${boton.secundario} ${boton.chico}`}>
        <Pencil className="size-3.5" aria-hidden /> Editar
      </Link>
    </div>
  );
}
```

- [ ] **Step 8: Alta de un campo propio**

`src/app/(panel)/administracion/stock/campos/nuevo/FormularioCampoNuevo.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { boton, Campo, input, tarjeta } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import { ETIQUETA_TIPO, TIPOS_CAMPO, type TipoCampo } from "@/modules/campos/tipos";
import { crearCampoAccion } from "../../acciones";

export function FormularioCampoNuevo() {
  const { estado, enviar, pendiente, error } = useFormularioAccion(crearCampoAccion);
  const [tipo, setTipo] = useState<TipoCampo>("TEXTO");

  return (
    <form onSubmit={enviar} noValidate className={`${tarjeta} max-w-xl space-y-4 p-6`}>
      {estado.mensaje && !estado.ok && !estado.errores && (
        <p role="alert" className="rounded-lg border border-peligro/40 bg-peligro/10 px-3 py-2 text-sm text-peligro">{estado.mensaje}</p>
      )}

      <Campo etiqueta="Nombre del campo" htmlFor="etiqueta" error={error("etiqueta")} ayuda="Como se va a ver en el formulario y en la ficha.">
        <input id="etiqueta" name="etiqueta" autoComplete="off" className={input} aria-invalid={!!error("etiqueta")} />
      </Campo>

      <Campo etiqueta="Tipo de dato" htmlFor="tipo" error={error("tipo")}>
        <select id="tipo" name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoCampo)} className={input}>
          {TIPOS_CAMPO.map((t) => <option key={t} value={t}>{ETIQUETA_TIPO[t]}</option>)}
        </select>
      </Campo>

      {tipo === "LISTA" && (
        <Campo etiqueta="Opciones" htmlFor="opcionesTexto" error={error("opcionesTexto")} ayuda="Una opción por renglón. Después las podés renombrar, desactivar y sumar más.">
          <textarea id="opcionesTexto" name="opcionesTexto" rows={5} className={input} aria-invalid={!!error("opcionesTexto")} />
        </Campo>
      )}

      {tipo === "NUMERO" && (
        <Campo etiqueta="Unidad" htmlFor="unidad" error={error("unidad")} ayuda="Opcional. Ej. mm, kg.">
          <input id="unidad" name="unidad" className={input} />
        </Campo>
      )}

      <Campo etiqueta="Ayuda" htmlFor="ayuda" error={error("ayuda")} ayuda="Opcional. Aparece debajo del campo.">
        <input id="ayuda" name="ayuda" className={input} />
      </Campo>

      {tipo !== "SI_NO" && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="requerido" className="size-4 accent-amarillo-500" />
          Obligatorio al cargar un cristal
        </label>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={pendiente} className={boton.primario}>{pendiente ? "Guardando…" : "Crear campo"}</button>
        <Link href="/administracion/stock" className={boton.secundario}>Cancelar</Link>
      </div>
    </form>
  );
}
```

`src/app/(panel)/administracion/stock/campos/nuevo/page.tsx`:

```tsx
import { requerirRol } from "@/lib/sesion";
import { FormularioCampoNuevo } from "./FormularioCampoNuevo";

export const metadata = { title: "Administración · Nuevo campo" };

export default async function PaginaNuevoCampo() {
  await requerirRol("ADMIN");
  return <FormularioCampoNuevo />;
}
```

- [ ] **Step 9: Edición de un campo (sistema o propio)**

`src/app/(panel)/administracion/stock/campos/[clave]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { Insignia, tarjeta } from "@/components/ui";
import { requerirRol } from "@/lib/sesion";
import { obtenerCampos } from "@/modules/campos/campo.service";
import { REGISTRO } from "@/modules/campos/registro";
import { ETIQUETA_TIPO } from "@/modules/campos/tipos";
import { CambiarTipo } from "./CambiarTipo";
import { EditorOpciones } from "./EditorOpciones";
import { FormularioCampoPropio } from "./FormularioCampoPropio";
import { FormularioCampoSistema } from "./FormularioCampoSistema";
import { ZonaPeligro } from "./ZonaPeligro";

export const metadata = { title: "Administración · Editar campo" };

export default async function PaginaEditarCampo({ params }: { params: Promise<{ clave: string }> }) {
  await requerirRol("ADMIN");
  const { clave } = await params;
  const campo = (await obtenerCampos("CRISTAL")).find((c) => c.clave === clave);
  if (!campo) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold">{campo.etiqueta}</h2>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-texto-suave">
          {ETIQUETA_TIPO[campo.tipo]}
          <Insignia tono={campo.origen === "PROPIO" ? "marca" : "neutro"}>{campo.origen === "PROPIO" ? "Propio" : "Sistema"}</Insignia>
          {campo.protegido && <Insignia>Protegido: el sistema lo necesita</Insignia>}
          {campo.archivado && <Insignia tono="alerta">Archivado</Insignia>}
        </p>
      </div>

      {campo.origen === "SISTEMA" ? (
        <FormularioCampoSistema
          clave={campo.clave}
          etiqueta={campo.etiqueta}
          ayuda={campo.ayuda ?? ""}
          visible={campo.visible}
          ocultable={campo.ocultable}
          fabrica={REGISTRO.CRISTAL.find((c) => c.clave === campo.clave)?.etiqueta ?? campo.etiqueta}
        />
      ) : (
        <>
          <FormularioCampoPropio
            id={campo.id!}
            etiqueta={campo.etiqueta}
            ayuda={campo.ayuda ?? ""}
            tipo={campo.tipo}
            requerido={campo.requerido}
            unidad={campo.unidad ?? ""}
            visible={campo.visible || campo.archivado}
          />
          {campo.tipo === "LISTA" && (
            <section className={`${tarjeta} space-y-3 p-5`}>
              <h3 className="font-display font-bold">Opciones</h3>
              <EditorOpciones id={campo.id!} opciones={campo.opciones} />
            </section>
          )}
          <section className={`${tarjeta} space-y-3 p-5`}>
            <h3 className="font-display font-bold">Cambiar el tipo de dato</h3>
            <CambiarTipo id={campo.id!} tipoActual={campo.tipo} />
          </section>
          <section className={`${tarjeta} space-y-3 p-5`}>
            <h3 className="font-display font-bold">Archivar o eliminar</h3>
            <ZonaPeligro id={campo.id!} archivado={campo.archivado} />
          </section>
        </>
      )}
    </div>
  );
}
```

`FormularioCampoSistema.tsx` (misma carpeta):

```tsx
"use client";

import Link from "next/link";
import { boton, Campo, input, tarjeta } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import { guardarCampoSistemaAccion } from "../../acciones";

export function FormularioCampoSistema(props: {
  clave: string;
  etiqueta: string;
  ayuda: string;
  visible: boolean;
  ocultable: boolean;
  fabrica: string;
}) {
  const { estado, enviar, pendiente, error } = useFormularioAccion(guardarCampoSistemaAccion.bind(null, props.clave));
  return (
    <form onSubmit={enviar} noValidate className={`${tarjeta} space-y-4 p-5`}>
      {estado.mensaje && !estado.ok && !estado.errores && (
        <p role="alert" className="rounded-lg border border-peligro/40 bg-peligro/10 px-3 py-2 text-sm text-peligro">{estado.mensaje}</p>
      )}
      <Campo etiqueta="Nombre que se muestra" htmlFor="etiqueta" error={error("etiqueta")} ayuda={`De fábrica: ${props.fabrica}. Dejalo vacío para volver a ese nombre.`}>
        <input id="etiqueta" name="etiqueta" defaultValue={props.etiqueta} className={input} aria-invalid={!!error("etiqueta")} />
      </Campo>
      <Campo etiqueta="Ayuda" htmlFor="ayuda" error={error("ayuda")} ayuda="Aparece debajo del campo. Vacío = la de fábrica.">
        <input id="ayuda" name="ayuda" defaultValue={props.ayuda} className={input} />
      </Campo>
      {props.ocultable ? (
        <>
          <input type="hidden" name="puedeOcultar" value="1" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="visible" defaultChecked={props.visible} className="size-4 accent-amarillo-500" />
            Mostrar este campo en el formulario y en la ficha
          </label>
          {error("oculto") && <p className="text-xs text-peligro">{error("oculto")}</p>}
        </>
      ) : (
        <p className="text-sm text-texto-suave">Este campo es necesario para que el sistema funcione: no se puede ocultar.</p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={pendiente} className={boton.primario}>{pendiente ? "Guardando…" : "Guardar"}</button>
        <Link href="/administracion/stock" className={boton.secundario}>Cancelar</Link>
      </div>
    </form>
  );
}
```

`FormularioCampoPropio.tsx`:

```tsx
"use client";

import Link from "next/link";
import { boton, Campo, input, tarjeta } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import type { TipoCampo } from "@/modules/campos/tipos";
import { guardarCampoPropioAccion } from "../../acciones";

export function FormularioCampoPropio(props: {
  id: string;
  etiqueta: string;
  ayuda: string;
  tipo: TipoCampo;
  requerido: boolean;
  unidad: string;
  visible: boolean;
}) {
  const { estado, enviar, pendiente, error } = useFormularioAccion(guardarCampoPropioAccion.bind(null, props.id));
  return (
    <form onSubmit={enviar} noValidate className={`${tarjeta} space-y-4 p-5`}>
      {estado.mensaje && !estado.ok && !estado.errores && (
        <p role="alert" className="rounded-lg border border-peligro/40 bg-peligro/10 px-3 py-2 text-sm text-peligro">{estado.mensaje}</p>
      )}
      <Campo etiqueta="Nombre del campo" htmlFor="etiqueta" error={error("etiqueta")}>
        <input id="etiqueta" name="etiqueta" defaultValue={props.etiqueta} className={input} aria-invalid={!!error("etiqueta")} />
      </Campo>
      <Campo etiqueta="Ayuda" htmlFor="ayuda" error={error("ayuda")}>
        <input id="ayuda" name="ayuda" defaultValue={props.ayuda} className={input} />
      </Campo>
      {props.tipo === "NUMERO" && (
        <Campo etiqueta="Unidad" htmlFor="unidad" error={error("unidad")}>
          <input id="unidad" name="unidad" defaultValue={props.unidad} className={input} />
        </Campo>
      )}
      {props.tipo !== "SI_NO" && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="requerido" defaultChecked={props.requerido} className="size-4 accent-amarillo-500" />
          Obligatorio al cargar un cristal
        </label>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="visible" defaultChecked={props.visible} className="size-4 accent-amarillo-500" />
        Mostrar este campo en el formulario y en la ficha
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={pendiente} className={boton.primario}>{pendiente ? "Guardando…" : "Guardar"}</button>
        <Link href="/administracion/stock" className={boton.secundario}>Cancelar</Link>
      </div>
    </form>
  );
}
```

`EditorOpciones.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { boton, input } from "@/components/ui";
import type { OperacionOpcion } from "@/modules/campos/campo.service";
import type { OpcionCampo } from "@/modules/campos/tipos";
import { opcionAccion } from "../../acciones";

export function EditorOpciones({ id, opciones }: { id: string; opciones: OpcionCampo[] }) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string>();
  const [nueva, setNueva] = useState("");
  const [editadas, setEditadas] = useState<Record<string, string>>({});

  const ejecutar = (operacion: OperacionOpcion, despues?: () => void) =>
    iniciar(async () => {
      setError(undefined);
      const r = await opcionAccion(id, operacion);
      if (!r.ok) setError(r.mensaje);
      else despues?.();
    });

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {opciones.map((o) => {
          const texto = editadas[o.id] ?? o.etiqueta;
          return (
            <li key={o.id} className={`flex flex-wrap items-center gap-2 ${o.activo ? "" : "opacity-60"}`}>
              <input
                aria-label="Nombre de la opción"
                value={texto}
                onChange={(e) => setEditadas({ ...editadas, [o.id]: e.target.value })}
                className={`${input} max-w-64`}
              />
              {texto !== o.etiqueta && (
                <button
                  type="button"
                  disabled={pendiente}
                  onClick={() => ejecutar({ tipo: "renombrar", opcionId: o.id, etiqueta: texto }, () => setEditadas(({ [o.id]: _, ...resto }) => resto))}
                  className={`${boton.primario} ${boton.chico}`}
                >
                  Guardar nombre
                </button>
              )}
              <button
                type="button"
                disabled={pendiente}
                onClick={() => ejecutar({ tipo: "alternar", opcionId: o.id, activo: !o.activo })}
                className={`${boton.fantasma} ${boton.chico}`}
              >
                {o.activo ? "Desactivar" : "Activar"}
              </button>
              <button
                type="button"
                disabled={pendiente}
                onClick={() => ejecutar({ tipo: "quitar", opcionId: o.id })}
                aria-label="Borrar opción"
                className={`${boton.fantasma} ${boton.chico}`}
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
      {error && <p role="alert" className="text-sm text-peligro">{error}</p>}
      <div className="flex gap-2">
        <input aria-label="Nueva opción" placeholder="Nueva opción" value={nueva} onChange={(e) => setNueva(e.target.value)} className={`${input} max-w-64`} />
        <button
          type="button"
          disabled={pendiente || nueva.trim() === ""}
          onClick={() => ejecutar({ tipo: "agregar", etiqueta: nueva }, () => setNueva(""))}
          className={`${boton.secundario} ${boton.chico}`}
        >
          <Plus className="size-3.5" aria-hidden /> Agregar
        </button>
      </div>
      <p className="text-xs text-texto-suave">Una opción en uso no se puede borrar: desactivala y deja de ofrecerse, pero se sigue viendo donde ya está cargada.</p>
    </div>
  );
}
```

`CambiarTipo.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { boton, input } from "@/components/ui";
import type { EstadoConConteo } from "@/lib/formularios";
import { ETIQUETA_TIPO, TIPOS_CAMPO, type TipoCampo } from "@/modules/campos/tipos";
import { cambiarTipoAccion } from "../../acciones";

export function CambiarTipo({ id, tipoActual }: { id: string; tipoActual: TipoCampo }) {
  const [pendiente, iniciar] = useTransition();
  const [tipo, setTipo] = useState<TipoCampo>(tipoActual);
  const [opciones, setOpciones] = useState("");
  const [resultado, setResultado] = useState<EstadoConConteo>();

  const enviar = (confirmar: boolean) =>
    iniciar(async () => setResultado(await cambiarTipoAccion(id, tipo, opciones, confirmar)));
  const pideConfirmar = resultado && !resultado.ok && resultado.afectados !== undefined;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Nuevo tipo" value={tipo} onChange={(e) => { setTipo(e.target.value as TipoCampo); setResultado(undefined); }} className={`${input} max-w-56`}>
          {TIPOS_CAMPO.map((t) => <option key={t} value={t}>{ETIQUETA_TIPO[t]}</option>)}
        </select>
        <button type="button" disabled={pendiente || tipo === tipoActual} onClick={() => enviar(false)} className={boton.secundario}>
          Cambiar tipo
        </button>
      </div>
      {tipo === "LISTA" && tipo !== tipoActual && (
        <textarea aria-label="Opciones, una por renglón" placeholder="Una opción por renglón" rows={4} value={opciones} onChange={(e) => setOpciones(e.target.value)} className={input} />
      )}
      {pideConfirmar && (
        <div role="alert" className="space-y-2 rounded-lg border border-alerta/40 bg-alerta/10 p-3 text-sm">
          <p>{resultado.mensaje} Cambiar el tipo borra esos valores y no se puede deshacer.</p>
          <div className="flex gap-2">
            <button type="button" disabled={pendiente} onClick={() => enviar(true)} className={`${boton.peligro} ${boton.chico}`}>Sí, cambiar y borrar los valores</button>
            <button type="button" onClick={() => setResultado(undefined)} className={`${boton.fantasma} ${boton.chico}`}>No</button>
          </div>
        </div>
      )}
      {resultado && !resultado.ok && resultado.afectados === undefined && <p role="alert" className="text-sm text-peligro">{resultado.mensaje}</p>}
      {resultado?.ok && <p role="status" className="text-sm text-exito">{resultado.mensaje}</p>}
    </div>
  );
}
```

`ZonaPeligro.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { boton } from "@/components/ui";
import type { EstadoConConteo } from "@/lib/formularios";
import { archivarCampoAccion, eliminarCampoAccion } from "../../acciones";

export function ZonaPeligro({ id, archivado }: { id: string; archivado: boolean }) {
  const [pendiente, iniciar] = useTransition();
  const [resultado, setResultado] = useState<EstadoConConteo>();

  const eliminar = (confirmar: boolean) =>
    iniciar(async () => {
      const r = await eliminarCampoAccion(id, confirmar); // sin datos, o ya confirmado: redirige y no vuelve acá
      if (r) setResultado(r);
    });
  const pideConfirmar = resultado && !resultado.ok && resultado.afectados !== undefined;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pendiente} onClick={() => iniciar(async () => { await archivarCampoAccion(id, !archivado); })} className={boton.secundario}>
          {archivado ? "Restaurar" : "Archivar"}
        </button>
        <button type="button" disabled={pendiente} onClick={() => eliminar(false)} className={boton.peligro}>
          Eliminar
        </button>
      </div>
      <p className="text-xs text-texto-suave">Archivar oculta el campo pero conserva sus valores. Eliminar borra el campo y sus valores de todos los cristales.</p>
      {pideConfirmar && (
        <div role="alert" className="space-y-2 rounded-lg border border-peligro/40 bg-peligro/10 p-3 text-sm">
          <p>{resultado.mensaje} No se puede deshacer.</p>
          <div className="flex gap-2">
            <button type="button" disabled={pendiente} onClick={() => eliminar(true)} className={`${boton.peligro} ${boton.chico}`}>Sí, eliminar el campo y sus valores</button>
            <button type="button" onClick={() => setResultado(undefined)} className={`${boton.fantasma} ${boton.chico}`}>No</button>
          </div>
        </div>
      )}
      {resultado && !resultado.ok && resultado.afectados === undefined && <p role="alert" className="text-sm text-peligro">{resultado.mensaje}</p>}
    </div>
  );
}
```

- [ ] **Step 10: Verificar**

Run: `npm run typecheck` y `npm test`
Expected: en verde (la guardia ahora pasa completa).

Con el token firmado (Task 7, Step 10):

```bash
for ruta in /administracion/stock /administracion/stock/campos/nuevo /administracion/stock/campos/costo /administracion/stock/campos/sensor_de_lluvia /administracion/stock/campos/tonalidad /administracion/stock/campos/codigo; do curl -s -b "sesion=$TOKEN" -o "$TEMP/p.html" -w "$ruta -> %{http_code}\n" "http://localhost:3000$ruta"; done
curl -s -b "sesion=$TOKEN" -o /dev/null -w "campo inexistente -> %{http_code}\n" http://localhost:3000/administracion/stock/campos/noexiste
curl -s -b "sesion=$TOKEN" http://localhost:3000/administracion/stock/campos/tonalidad | grep -o -E "Opciones|Cambiar el tipo de dato|Archivar o eliminar|Verde|Bronce" | sort -u
curl -s -b "sesion=$TOKEN" http://localhost:3000/administracion/stock/campos/codigo | grep -o -E "no se puede ocultar|Mostrar este campo" | sort -u
```

Expected: `200` en las seis rutas y `404` en la inexistente; `tonalidad` muestra Opciones, Cambiar el tipo de dato, Archivar o eliminar, Verde y Bronce; `codigo` muestra "no se puede ocultar" y no la casilla "Mostrar este campo".

- [ ] **Step 11: Commit**

```bash
git add src/guardia-acciones.test.ts src/lib/formularios.ts src/app/\(panel\)/administracion
git commit -m "feat: administracion de campos de Stock (crear, editar, ocultar, reordenar, opciones, archivar, eliminar)" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Administración de listas de Stock

**Files:**
- Create: `src/app/(panel)/administracion/stock/listas/acciones.ts`, `listas/page.tsx`, `listas/BloqueLista.tsx`

**Interfaces:**
- Consumes: `obtenerListas`, `crearItem`, `renombrarItem`, `activarItem`, `eliminarItem`, `moverUbicacion`, `cambiarTieneLado`, `ListaError`, `ListaId` (Task 6).
- Produces (acciones, todas con `requerirRol("ADMIN")` primero): `crearItemAccion(lista, marcaId, nombre, tieneLado?)`, `renombrarItemAccion(lista, id, nombre)`, `activarItemAccion(lista, id, activo)`, `eliminarItemAccion(lista, id)`, `moverUbicacionAccion(id, direccion)`, `tieneLadoAccion(id, valor)`; `BloqueLista` (componente de cliente); ancla `#marcas`, `#tipos`, `#ubicaciones`, `#marcasVehiculo`.

- [ ] **Step 1: Crear las acciones `listas/acciones.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { esDuplicado, type EstadoFormulario } from "@/lib/formularios";
import { requerirRol } from "@/lib/sesion";
import {
  activarItem,
  cambiarTieneLado,
  crearItem,
  eliminarItem,
  ListaError,
  moverUbicacion,
  renombrarItem,
  type ListaId,
} from "@/modules/campos/lista.service";

const LISTAS = ["marcas", "tipos", "ubicaciones", "marcasVehiculo", "modelos"] as const;
const esLista = (v: string): v is ListaId => (LISTAS as readonly string[]).includes(v);

function refrescar() {
  revalidatePath("/administracion/stock/listas");
  revalidatePath("/stock", "layout");
}

/** Traduce los errores esperados a un mensaje para la pantalla; el resto se propaga. */
function aResultado(e: unknown): EstadoFormulario {
  if (e instanceof ZodError) return { ok: false, mensaje: "El nombre debe tener entre 1 y 80 caracteres." };
  if (e instanceof ListaError) return { ok: false, mensaje: e.message };
  if (esDuplicado(e)) return { ok: false, mensaje: "Ya existe un elemento con ese nombre." };
  throw e;
}

const INVALIDA: EstadoFormulario = { ok: false, mensaje: "Lista inválida." };

export async function crearItemAccion(lista: string, marcaId: string | null, nombre: string, tieneLado?: boolean): Promise<EstadoFormulario> {
  await requerirRol("ADMIN");
  if (!esLista(lista)) return INVALIDA;
  try {
    await crearItem(lista, { nombre, marcaId: marcaId ?? undefined, tieneLado });
  } catch (e) {
    return aResultado(e);
  }
  refrescar();
  return { ok: true };
}

export async function renombrarItemAccion(lista: string, id: string, nombre: string): Promise<EstadoFormulario> {
  await requerirRol("ADMIN");
  if (!esLista(lista)) return INVALIDA;
  try {
    await renombrarItem(lista, id, nombre);
  } catch (e) {
    return aResultado(e);
  }
  refrescar();
  return { ok: true };
}

export async function activarItemAccion(lista: string, id: string, activo: boolean): Promise<EstadoFormulario> {
  await requerirRol("ADMIN");
  if (!esLista(lista)) return INVALIDA;
  await activarItem(lista, id, activo === true);
  refrescar();
  return { ok: true };
}

export async function eliminarItemAccion(lista: string, id: string): Promise<EstadoFormulario> {
  await requerirRol("ADMIN");
  if (!esLista(lista)) return INVALIDA;
  try {
    await eliminarItem(lista, id);
  } catch (e) {
    return aResultado(e);
  }
  refrescar();
  return { ok: true };
}

export async function moverUbicacionAccion(id: string, direccion: "ARRIBA" | "ABAJO"): Promise<EstadoFormulario> {
  await requerirRol("ADMIN");
  if (direccion !== "ARRIBA" && direccion !== "ABAJO") return { ok: false, mensaje: "Dirección inválida." };
  await moverUbicacion(id, direccion);
  refrescar();
  return { ok: true };
}

export async function tieneLadoAccion(id: string, valor: boolean): Promise<EstadoFormulario> {
  await requerirRol("ADMIN");
  await cambiarTieneLado(id, valor === true);
  refrescar();
  return { ok: true };
}
```

- [ ] **Step 2: Crear el componente `listas/BloqueLista.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { boton, input } from "@/components/ui";
import type { EstadoFormulario } from "@/lib/formularios";
import type { ListaId } from "@/modules/campos/lista.service";
import {
  activarItemAccion,
  crearItemAccion,
  eliminarItemAccion,
  moverUbicacionAccion,
  renombrarItemAccion,
  tieneLadoAccion,
} from "./acciones";

export interface ItemVista {
  id: string;
  nombre: string;
  activo: boolean;
  enUso: number;
  tieneLado?: boolean;
}

export function BloqueLista({ lista, items, marcaId }: { lista: ListaId; items: ItemVista[]; marcaId?: string }) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string>();
  const [nuevo, setNuevo] = useState("");
  const [nuevoConLado, setNuevoConLado] = useState(false);
  const [editados, setEditados] = useState<Record<string, string>>({});

  const ejecutar = (accion: () => Promise<EstadoFormulario>, despues?: () => void) =>
    iniciar(async () => {
      setError(undefined);
      const r = await accion();
      if (!r.ok) setError(r.mensaje);
      else despues?.();
    });

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {items.length === 0 && <li className="text-sm text-texto-suave">Todavía no hay elementos.</li>}
        {items.map((it, i) => {
          const texto = editados[it.id] ?? it.nombre;
          return (
            <li key={it.id} className={`flex flex-wrap items-center gap-2 ${it.activo ? "" : "opacity-60"}`}>
              {lista === "ubicaciones" && (
                <span className="flex">
                  <button type="button" disabled={pendiente || i === 0} onClick={() => ejecutar(() => moverUbicacionAccion(it.id, "ARRIBA"))} aria-label="Subir" className={`${boton.fantasma} ${boton.chico}`}>
                    <ArrowUp className="size-3.5" aria-hidden />
                  </button>
                  <button type="button" disabled={pendiente || i === items.length - 1} onClick={() => ejecutar(() => moverUbicacionAccion(it.id, "ABAJO"))} aria-label="Bajar" className={`${boton.fantasma} ${boton.chico}`}>
                    <ArrowDown className="size-3.5" aria-hidden />
                  </button>
                </span>
              )}
              <input
                aria-label="Nombre"
                value={texto}
                onChange={(e) => setEditados({ ...editados, [it.id]: e.target.value })}
                className={`${input} max-w-64`}
              />
              {texto !== it.nombre && (
                <button
                  type="button"
                  disabled={pendiente}
                  onClick={() => ejecutar(() => renombrarItemAccion(lista, it.id, texto), () => setEditados(({ [it.id]: _, ...resto }) => resto))}
                  className={`${boton.primario} ${boton.chico}`}
                >
                  Guardar nombre
                </button>
              )}
              {lista === "ubicaciones" && (
                <label className="flex items-center gap-1.5 text-xs text-texto-suave">
                  <input
                    type="checkbox"
                    checked={it.tieneLado ?? false}
                    disabled={pendiente}
                    onChange={(e) => ejecutar(() => tieneLadoAccion(it.id, e.target.checked))}
                    className="size-4 accent-amarillo-500"
                  />
                  Tiene lado (izq./der.)
                </label>
              )}
              <span className="text-xs text-texto-suave">{it.enUso > 0 ? `En uso: ${it.enUso}` : "Sin uso"}</span>
              <button type="button" disabled={pendiente} onClick={() => ejecutar(() => activarItemAccion(lista, it.id, !it.activo))} className={`${boton.fantasma} ${boton.chico}`}>
                {it.activo ? "Desactivar" : "Activar"}
              </button>
              <button
                type="button"
                disabled={pendiente || it.enUso > 0}
                title={it.enUso > 0 ? "Está en uso: desactivalo en lugar de borrarlo" : "Borrar"}
                onClick={() => ejecutar(() => eliminarItemAccion(lista, it.id))}
                aria-label="Borrar"
                className={`${boton.fantasma} ${boton.chico}`}
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>

      {error && <p role="alert" className="text-sm text-peligro">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <input aria-label="Nuevo elemento" placeholder="Nuevo elemento" value={nuevo} onChange={(e) => setNuevo(e.target.value)} className={`${input} max-w-64`} />
        {lista === "ubicaciones" && (
          <label className="flex items-center gap-1.5 text-xs text-texto-suave">
            <input type="checkbox" checked={nuevoConLado} onChange={(e) => setNuevoConLado(e.target.checked)} className="size-4 accent-amarillo-500" />
            Tiene lado
          </label>
        )}
        <button
          type="button"
          disabled={pendiente || nuevo.trim() === ""}
          onClick={() => ejecutar(() => crearItemAccion(lista, marcaId ?? null, nuevo, nuevoConLado), () => { setNuevo(""); setNuevoConLado(false); })}
          className={`${boton.secundario} ${boton.chico}`}
        >
          <Plus className="size-3.5" aria-hidden /> Agregar
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Crear la página `listas/page.tsx`**

```tsx
import { tarjeta } from "@/components/ui";
import { requerirRol } from "@/lib/sesion";
import { obtenerListas } from "@/modules/campos/lista.service";
import { BloqueLista } from "./BloqueLista";

export const metadata = { title: "Administración · Listas de Stock" };

function Seccion({ id, titulo, descripcion, children }: { id: string; titulo: string; descripcion: string; children: React.ReactNode }) {
  return (
    <section id={id} className={`${tarjeta} scroll-mt-6 space-y-3 p-5`}>
      <div>
        <h2 className="font-display font-bold">{titulo}</h2>
        <p className="text-sm text-texto-suave">{descripcion}</p>
      </div>
      {children}
    </section>
  );
}

export default async function PaginaListasStock() {
  await requerirRol("ADMIN");
  const { marcas, tipos, ubicaciones, marcasVehiculo } = await obtenerListas();

  return (
    <div className="space-y-6">
      <Seccion id="marcas" titulo="Marcas de cristal" descripcion="Pilkington, Fuyao, Vitro… Lo desactivado deja de ofrecerse al cargar un cristal.">
        <BloqueLista lista="marcas" items={marcas.map((m) => ({ id: m.id, nombre: m.nombre, activo: m.activo, enUso: m._count.cristales }))} />
      </Seccion>

      <Seccion id="tipos" titulo="Tipos de cristal" descripcion="Laminado, templado, laminado acústico…">
        <BloqueLista lista="tipos" items={tipos.map((t) => ({ id: t.id, nombre: t.nombre, activo: t.activo, enUso: t._count.cristales }))} />
      </Seccion>

      <Seccion id="ubicaciones" titulo="Ubicaciones en el vehículo" descripcion="Parabrisas, luneta, puertas… El orden de esta lista es el orden en el que se ofrecen.">
        <BloqueLista
          lista="ubicaciones"
          items={ubicaciones.map((u) => ({ id: u.id, nombre: u.nombre, activo: u.activo, enUso: u._count.cristales, tieneLado: u.tieneLado }))}
        />
      </Seccion>

      <Seccion id="marcasVehiculo" titulo="Marcas y modelos de vehículo" descripcion="Se usan para indicar con qué vehículos es compatible cada cristal.">
        <BloqueLista
          lista="marcasVehiculo"
          items={marcasVehiculo.map((m) => ({ id: m.id, nombre: m.nombre, activo: m.activo, enUso: m.modelos.length }))}
        />
        <div className="space-y-2 pt-2">
          {marcasVehiculo.map((m) => (
            <details key={m.id} className="rounded-lg border border-borde p-3">
              <summary className="cursor-pointer text-sm font-semibold">
                Modelos de {m.nombre} <span className="font-normal text-texto-suave">({m.modelos.length})</span>
              </summary>
              <div className="pt-3">
                <BloqueLista
                  lista="modelos"
                  marcaId={m.id}
                  items={m.modelos.map((mo) => ({ id: mo.id, nombre: mo.nombre, activo: mo.activo, enUso: mo._count.compatibilidades }))}
                />
              </div>
            </details>
          ))}
        </div>
      </Seccion>
    </div>
  );
}
```

- [ ] **Step 4: Verificar**

Run: `npm run typecheck` y `npm test`
Expected: en verde (la guardia cubre también `administracion/stock/listas/acciones.ts`, que está bajo la carpeta `administracion`).

Con el token firmado:

```bash
curl -s -b "sesion=$TOKEN" -o "$TEMP/p.html" -w "/administracion/stock/listas -> %{http_code}\n" http://localhost:3000/administracion/stock/listas
curl -s -b "sesion=$TOKEN" http://localhost:3000/administracion/stock/listas | grep -o -E "Marcas de cristal|Tipos de cristal|Ubicaciones en el vehículo|Marcas y modelos de vehículo|Pilkington|Toyota|Hilux" | sort -u
```

Expected: `200` y aparecen las cuatro secciones y los datos del seed.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(panel\)/administracion/stock/listas
git commit -m "feat: administracion de listas de Stock (marcas, tipos, ubicaciones, vehiculos)" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Documentación y verificación de punta a punta

**Files:**
- Modify: `docs/ARQUITECTURA.md`, `README.md`

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: documentación al día y la verificación manual del spec completa.

- [ ] **Step 1: Actualizar `docs/ARQUITECTURA.md`**

Hacer estos cambios (cada reemplazo debe ocurrir una sola vez; si una cadena no se encuentra, ajustar el texto equivalente a mano):

a) En la sección **Estructura**, dentro de `src/modules/`, agregar una línea `    campos/              ← campos configurables: registro del sistema, combinación, valores propios, servicios` y una línea `  app/(panel)/administracion/  ← pantallas de Administración (solo Admin)`.

b) En **Modelo de datos → Inventario**: en el diagrama, reemplazar `Cristal >── CristalCaracteristica >── Caracteristica` por `Cristal  (campos propios en la columna extras)`. En la tabla, reemplazar las filas de `caracteristicas` y `cristal_caracteristicas` por:

```
| `campos_personalizados` | entidad, clave, etiqueta, ayuda, tipo (TEXTO/TEXTO_LARGO/NUMERO/SI_NO/LISTA/FECHA), requerido, unidad, opciones (JSON), orden, visible, archivado_en | Campos propios definidos desde Administración. Sus valores viven en `cristales.extras`, indexados por `clave` (que no cambia nunca). |
| `configuracion_campos` | entidad, clave, etiqueta, ayuda, oculto, orden | Ajustes del Admin sobre los campos del sistema. Sin fila, rige la configuración de fábrica (`registro.ts`). |
```

y en la fila de `cristales` agregar `extras` a la lista de campos.

c) Antes de "## Acceso y sesión", agregar la sección:

```markdown
## Administración de campos

Solo Admin. `/administracion` muestra una card por módulo (hoy solo **Stock** está habilitado; Servicios y Turnos y clientes vienen después).

- **Campos del sistema** (`src/modules/campos/registro.ts`): los trae el código. Los **protegidos** (código, descripción, marca, tipo, ubicación, stock mínimo, cantidad) no se ocultan ni cambian de tipo; a todos se les puede cambiar etiqueta, ayuda y orden, y a los demás ocultarlos. Esos ajustes se guardan en `configuracion_campos`.
- **Campos propios**: seis tipos (texto, texto largo, número, sí/no, lista, fecha). Definición en `campos_personalizados`, valores en `cristales.extras`. Se pueden archivar (conservan sus valores) o eliminar (borran sus valores, con confirmación que muestra cuántos registros se afectan). Cambiar el tipo también borra los valores.
- **Listas**: marcas, tipos, ubicaciones y marcas y modelos de vehículo siguen siendo tablas reales (integridad referencial). Se administran en `/administracion/stock/listas`: lo desactivado deja de ofrecerse pero se sigue viendo donde ya está cargado; solo se borra lo que no está en uso.
- **Formularios y ficha** de cristal se arman desde `combinarCampos()`. Editar un cristal solo cambia lo que el formulario envía: un campo oculto conserva su valor.
- Una opción de lista propia se guarda por **id**: renombrarla no toca los datos.
```

d) En **Pantallas**, agregar filas: `| \`/administracion\` | Solo Admin. Cards por módulo. |`, `| \`/administracion/stock\` | Solo Admin. Campos de Stock: ver tipos, renombrar, ocultar, reordenar y crear campos propios. |`, `| \`/administracion/stock/listas\` | Solo Admin. Listas de Stock. |`.

e) En **Pendiente**, reemplazar el punto "ABM de catálogos desde el panel (marcas, tipos, modelos de vehículo, características). Por ahora se cargan con el seed o con `npm run db:studio`." por: "Administración de campos para Servicios y para Turnos y clientes (incluye los campos del formulario público `/reservar`). El motor ya está hecho; falta la columna `extras` y las pantallas de cada módulo." y agregar: "Limpiar un campo vacío al editar un cristal (hoy un costo vacío no borra el valor guardado)."

- [ ] **Step 2: Actualizar `README.md`**

En "Puesta en marcha" agregar, debajo de la línea de `npm run db:seed`, el comentario de que el seed también crea los campos propios por defecto, y al final de la sección "Acceso al panel" agregar:

```markdown
## Administración de campos

Con el rol Administrador, el menú **Administración** permite ver el tipo de cada campo de Stock, renombrarlo, ocultarlo, reordenarlo, sumar campos propios y administrar las listas (marcas, tipos, ubicaciones, vehículos). Los campos que el sistema necesita para funcionar (código, marca, cantidad…) se pueden renombrar pero no ocultar ni borrar.
```

- [ ] **Step 3: Suite completa y typecheck**

Run: `npm test` y `npm run typecheck`
Expected: todo en verde.

- [ ] **Step 4: Verificación manual en el navegador (Claude in Chrome o el usuario)**

Con el servidor en `http://localhost:3000` y la sesión del Admin:

1. `/administracion` muestra tres cards: **Stock** habilitada, **Servicios** y **Turnos y clientes** con "Próximamente" sin enlace.
2. `/administracion/stock` lista todos los campos por sección con tipo, origen, obligatorio y estado; "Marca" muestra "Lista · ver opciones" y el enlace lleva a `/administracion/stock/listas#marcas`.
3. **Campos propios:** crear uno de cada tipo (texto, texto largo, número con unidad, sí/no, lista con opciones, fecha). Aparecen en `/stock/nuevo` (sección "Datos adicionales"), se guardan, se ven en la ficha y en `/stock/<id>/editar`. Un número inválido y un obligatorio vacío muestran error sin perder lo cargado.
4. **Campos migrados:** "Sensor de lluvia", "Tonalidad", etc. existen como campos propios y los cristales que los tenían conservan sus valores.
5. **Renombrar y ocultar:** cambiar la etiqueta de "Costo" a "Precio de compra" (se ve en el formulario y en la ficha); ocultar "Código de fabricante" (desaparece del formulario y de la ficha); intentar ocultar "Código interno" (la pantalla no ofrece la casilla). Volver a dejarlos como estaban.
6. **Ocultar no borra:** editar un cristal con "Lado" oculto y guardar; volver a mostrar "Lado" y comprobar que el valor guardado sigue ahí. Lo mismo con "Vehículos compatibles": ocultar la sección, guardar una edición y volver a mostrarla: las compatibilidades siguen.
7. **Reordenar:** subir y bajar campos de una sección; el formulario respeta el orden.
8. **Opciones de lista propia:** renombrar una opción (los cristales que la usan la muestran con el nombre nuevo), desactivarla (deja de ofrecerse pero se ve en los registros que ya la tienen), intentar borrar una en uso (mensaje "desactivala"), borrar una sin uso.
9. **Eliminar con datos:** eliminar un campo propio que tenga valores muestra cuántos registros se afectan y pide confirmar; "No" cancela; "Sí" lo borra y los valores desaparecen de las fichas. Cambiar el tipo de un campo con datos pide la misma confirmación.
10. **Archivar** oculta el campo y conserva los valores; **Restaurar** los devuelve.
11. **Etiquetas duplicadas:** crear "costo" (o "Año" cuando existe "ano") es rechazado.
12. **Listas:** agregar una marca, renombrarla, desactivarla (no aparece en `/stock/nuevo` pero sí en los filtros de `/stock`), borrarla; intentar borrar una marca en uso (botón deshabilitado y mensaje); agregar una ubicación con "tiene lado" y reordenar ubicaciones; agregar una marca de vehículo y un modelo.
13. **Permisos:** iniciar sesión como Empleado: el menú no muestra "Administración"; `/administracion`, `/administracion/stock` y `/administracion/stock/listas` lo devuelven a `/`. Invocar una acción de Administración sin sesión (por ejemplo `moverCampoAccion`, con `Next-Action` tomado de `.next/dev/server/app/(panel)/administracion/stock/page/server-reference-manifest.json`) responde `x-action-redirect: /login`.
14. `/reservar` sigue abierta al público y funcionando.

Si un punto falla, NO marcarlo: corregir en la tarea correspondiente, correr `npm test` y repetir. Al terminar, borrar los campos, marcas y usuarios de prueba que se hayan creado (y volver a dejar la base como estaba).

- [ ] **Step 5: Commit**

```bash
git add README.md docs/ARQUITECTURA.md
git commit -m "docs: administracion de campos de Stock" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```
