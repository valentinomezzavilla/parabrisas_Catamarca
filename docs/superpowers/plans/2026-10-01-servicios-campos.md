# Campos propios de Servicios Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Habilitar Administración > Servicios para que el Admin cree campos propios del servicio, los complete al crear o editar un servicio y los vea en el panel.

**Architecture:** Se reutiliza el motor de campos de Stock (`src/modules/campos`) agregando la entidad `SERVICIO`: columna `servicios.extras`, campos del sistema solo de referencia (`fijo`) y el mismo `procesarExtras`. Las pantallas de Administración de Stock se parametrizan por **módulo** (`"stock" | "servicios"`), con una configuración pura (`MODULOS`) que fija entidad y rutas; las Server Actions validan el módulo contra esa lista.

**Tech Stack:** Next.js 16 (App Router, Server Actions), Prisma 7 + PostgreSQL, Zod, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-01-servicios-campos-design.md`

## Global Constraints

- Solo campos propios en Servicios. Los campos del sistema del servicio son `fijo`: se muestran sin acciones y el servidor rechaza renombrarlos, ocultarlos o moverlos. No se muestran al cliente en `/reservar`.
- Tipos de campo: los de Stock (`TEXTO`, `TEXTO_LARGO`, `NUMERO`, `SI_NO`, `LISTA`, `FECHA`).
- El comportamiento de Administración de Stock no cambia (misma pantalla, mismas rutas `/administracion/stock/**`).
- Todo es solo Admin: cada página y cada Server Action empieza con `requerirRol("ADMIN")`. `src/guardia-acciones.test.ts` debe seguir verde. Las Server Actions viven en archivos llamados `acciones.ts` y solo exportan funciones `async`.
- Una Server Action recibe el módulo desde el cliente: nunca se confía en él, se valida con `esModulo` y la entidad y las rutas salen de `MODULOS`.
- Textos de interfaz en español rioplatense (voseo).
- Antes de usar APIs de Next que no estén ya usadas en el repo, leer `node_modules/next/dist/docs/`.
- El repo no tiene tests de integración con base de datos: lo puro se prueba con Vitest y lo que toca Prisma con typecheck más el script de la Tarea 6.
- Migraciones: `npx prisma migrate dev` no funciona con la base embebida de `prisma dev`. Generar con `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`, aplicar con `npx prisma migrate deploy` y luego `npx prisma generate`. La base embebida se levanta con `npx prisma dev --name local --detach`.
- Rama `feature/servicios-campos` (sale de `main`). Antes de empezar, el árbol de trabajo tiene que estar limpio. Un commit por tarea, cada uno terminado con la línea `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Aviso de integración: la rama `feature/sena-mercadopago` (sin mergear) también edita `src/app/(panel)/servicios/page.tsx`. Si se mergean las dos, puede haber un conflicto de texto menor en esa página; se resuelve conservando ambos bloques.

## Review Focus

Condiciones que la especificación implica pero que ninguna tarea ejercita por sí sola. Cada una tiene su prueba en la tarea indicada.

1. Un servicio ya existente y un campo propio **obligatorio** nuevo: la lista de servicios sigue cargando y el valor se pide recién al editar ese servicio. Prueba: script de la Tarea 6 (paso 1, caso 1).
2. Un servicio **sin campos propios**: el formulario no muestra la sección ni escribe extras; guardar funciona igual. Prueba: script de la Tarea 6 (caso 2).
3. Una acción invocada a mano con un `modulo` inválido (`"__proto__"`, `"constructor"`, vacío) no hace nada. Prueba: Tarea 1 (`esModulo`).
4. Ajustar o mover un campo **fijo** del sistema de Servicios con un pedido armado a mano se rechaza. Prueba: script de la Tarea 6 (caso 4).
5. Eliminar un campo propio con valores pide confirmar y cuenta **servicios**, no cristales. Prueba: script de la Tarea 6 (caso 5).
6. Un campo propio de Servicios no aparece en Stock ni al revés. Prueba: script de la Tarea 6 (caso 6).
7. Regresión: la Administración de Stock se ve y funciona igual tras parametrizarla. Prueba: revisión manual de la Tarea 3 (paso 7).

---

### Task 1: Módulos, registro de campos de Servicios y marca `fijo` (lógica pura)

**Files:**
- Create: `src/modules/campos/modulos.ts`
- Create: `src/modules/campos/modulos.test.ts`
- Modify: `src/modules/campos/registro.ts`
- Modify: `src/modules/campos/combinar.ts`
- Modify: `src/modules/campos/combinar.test.ts`

**Interfaces:**
- Produces:
  - `type ModuloAdmin = "stock" | "servicios"`
  - `interface ConfigModulo { entidad: EntidadCampo; base: string; titulo: string; objeto: string; plural: string; revalidar: string[]; textoEspecial: string }`
  - `MODULOS: Record<ModuloAdmin, ConfigModulo>` y `esModulo(valor: unknown): valor is ModuloAdmin`
  - `CampoSistema.fijo?: boolean`, `CampoFinal.fijo: boolean`
  - `SeccionCampo` suma `"servicio" | "agenda" | "precio"`; `REGISTRO.SERVICIO` con 12 campos (todos `fijo`)

- [ ] **Step 1: Escribir el test de módulos, que falla**

`src/modules/campos/modulos.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { esModulo, MODULOS } from "./modulos";

describe("MODULOS", () => {
  it("Stock administra cristales y Servicios administra servicios", () => {
    expect(MODULOS.stock.entidad).toBe("CRISTAL");
    expect(MODULOS.servicios.entidad).toBe("SERVICIO");
  });

  it("cada módulo tiene su ruta base bajo /administracion", () => {
    expect(MODULOS.stock.base).toBe("/administracion/stock");
    expect(MODULOS.servicios.base).toBe("/administracion/servicios");
  });
});

describe("esModulo", () => {
  it("acepta los módulos que existen", () => {
    expect(esModulo("stock")).toBe(true);
    expect(esModulo("servicios")).toBe(true);
  });

  it("rechaza lo que no es un módulo, incluidas las propiedades heredadas de Object", () => {
    for (const valor of ["", "otro", "Stock", "__proto__", "constructor", "toString", "hasOwnProperty", undefined, null, 5, {}]) {
      expect(esModulo(valor), String(valor)).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Verlo fallar**

Run: `npx vitest run src/modules/campos/modulos.test.ts`
Expected: FAIL (no se puede resolver `./modulos`).

- [ ] **Step 3: Implementar `modulos.ts`**

```ts
import type { EntidadCampo } from "./tipos";

// Puro. Qué administra cada módulo de Administración. Las Server Actions reciben el módulo desde el cliente:
// nunca se confía en él, se valida con `esModulo` y de acá salen la entidad y las rutas.

export type ModuloAdmin = "stock" | "servicios";

export interface ConfigModulo {
  entidad: EntidadCampo;
  /** Ruta de la pantalla de campos del módulo. */
  base: string;
  titulo: string;
  /** Para frases como "Obligatorio al cargar un cristal". */
  objeto: string;
  /** Para frases como "…de todos los cristales". */
  plural: string;
  /** Rutas del panel (con sus subrutas) que hay que refrescar cuando cambian los campos. */
  revalidar: string[];
  /** Cómo se llama en la tabla el campo "especial" del módulo. */
  textoEspecial: string;
}

export const MODULOS: Record<ModuloAdmin, ConfigModulo> = {
  stock: {
    entidad: "CRISTAL",
    base: "/administracion/stock",
    titulo: "Stock",
    objeto: "un cristal",
    plural: "cristales",
    revalidar: ["/stock"],
    textoEspecial: "Sección de vehículos",
  },
  servicios: {
    entidad: "SERVICIO",
    base: "/administracion/servicios",
    titulo: "Servicios",
    objeto: "un servicio",
    plural: "servicios",
    revalidar: ["/servicios"],
    textoEspecial: "Franjas horarias por día",
  },
};

export function esModulo(valor: unknown): valor is ModuloAdmin {
  return typeof valor === "string" && Object.hasOwn(MODULOS, valor);
}
```

- [ ] **Step 4: Verlo pasar**

Run: `npx vitest run src/modules/campos/modulos.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Agregar los tests de registro y combinador, que fallan**

En `src/modules/campos/combinar.test.ts`, dentro de `describe("registro", …)` agregar:

```ts
  it("todos los campos del sistema de Servicios son fijos, no ocultables y de una sección conocida", () => {
    expect(REGISTRO.SERVICIO.length).toBe(12);
    const secciones = new Set(SECCIONES.map((s) => s.id));
    for (const c of REGISTRO.SERVICIO) {
      expect(c.fijo, c.clave).toBe(true);
      expect(c.ocultable, c.clave).toBe(false);
      expect(secciones.has(c.seccion), c.clave).toBe(true);
    }
  });

  it("las claves del sistema de Servicios no se repiten y están reservadas", () => {
    const claves = REGISTRO.SERVICIO.map((c) => c.clave);
    expect(new Set(claves).size).toBe(claves.length);
    expect(clavesReservadas("SERVICIO")).toEqual(expect.arrayContaining(["nombre", "precioBase", "horarios", "capacidad"]));
    expect(clavesProhibidas("SERVICIO")).toContain("nuevo");
  });

  it("los campos de Stock no son fijos", () => {
    expect(REGISTRO.CRISTAL.some((c) => c.fijo)).toBe(false);
  });
```

y al final del archivo:

```ts
describe("combinarCampos para Servicios", () => {
  const propioServicio = (cambios: Partial<CampoPropio> = {}): CampoPropio =>
    propio({ id: "s1", entidad: "SERVICIO", clave: "garantia", etiqueta: "Garantía", tipo: "TEXTO", ...cambios });

  it("pone los campos del sistema primero (fijos) y los propios al final, en 'Datos adicionales'", () => {
    const campos = combinarCampos("SERVICIO", [], [propioServicio()]);
    const sistema = campos.filter((c) => c.origen === "SISTEMA");
    expect(sistema.every((c) => c.fijo && !c.ocultable)).toBe(true);
    expect(campos.at(-1)).toMatchObject({ clave: "garantia", origen: "PROPIO", seccion: "adicionales", fijo: false });
  });

  it("ignora los campos propios de otra entidad", () => {
    const deCristal = propio({ clave: "sensor", entidad: "CRISTAL" });
    expect(claves(combinarCampos("SERVICIO", [], [deCristal]))).not.toContain("sensor");
  });

  it("ordena los propios por `orden` y permite subir uno", () => {
    const campos = combinarCampos("SERVICIO", [], [
      propioServicio({ id: "a", clave: "a", etiqueta: "A", orden: 10 }),
      propioServicio({ id: "b", clave: "b", etiqueta: "B", orden: 20 }),
    ]);
    expect(moverCampo(campos, "b", "ARRIBA")).toEqual([
      { clave: "b", orden: 10 },
      { clave: "a", orden: 20 },
    ]);
  });
});
```

Y cambiar el import de registro a: `import { clavesProhibidas, clavesReservadas, REGISTRO, SECCIONES } from "./registro";`

- [ ] **Step 6: Verlos fallar**

Run: `npx vitest run src/modules/campos/combinar.test.ts`
Expected: FAIL (`REGISTRO.SERVICIO.length` es 0 y `fijo` no existe).

- [ ] **Step 7: Implementar en `registro.ts`**

Reemplazar `SeccionCampo` y `SECCIONES`:

```ts
export type SeccionCampo =
  | "identificacion"
  | "principales"
  | "compatibilidades"
  | "stock"
  | "servicio"
  | "agenda"
  | "precio"
  | "adicionales";

export const SECCIONES: { id: SeccionCampo; etiqueta: string }[] = [
  { id: "identificacion", etiqueta: "Identificación" },
  { id: "principales", etiqueta: "Características principales" },
  { id: "compatibilidades", etiqueta: "Vehículos compatibles" },
  { id: "stock", etiqueta: "Stock y precios" },
  { id: "servicio", etiqueta: "Datos del servicio" },
  { id: "agenda", etiqueta: "Agenda y capacidad" },
  { id: "precio", etiqueta: "Precio" },
  { id: "adicionales", etiqueta: "Datos adicionales" },
];
```

En `CampoSistema` agregar después de `especial`:

```ts
  /** Se muestra en Administración pero no se puede ajustar (ni renombrar, ni ocultar, ni mover). */
  fijo?: boolean;
```

Debajo del helper `cristal(...)` agregar:

```ts
/** Campo de referencia del servicio: lo usa el formulario existente y Administración solo lo muestra. */
const servicio = (
  clave: string,
  etiqueta: string,
  tipo: TipoCampo,
  seccion: SeccionCampo,
  extra: Partial<CampoSistema> = {},
): CampoSistema => ({ clave, etiqueta, tipo, seccion, requerido: false, protegido: true, ocultable: false, fijo: true, ...extra });
```

y reemplazar la línea `SERVICIO: [],` por:

```ts
  SERVICIO: [
    servicio("nombre", "Nombre", "TEXTO", "servicio", { requerido: true }),
    servicio("descripcion", "Descripción", "TEXTO_LARGO", "servicio"),
    servicio("color", "Color en la agenda", "TEXTO", "servicio"),
    servicio("activo", "Activo (se ofrece en el turnero)", "SI_NO", "servicio"),
    servicio("duracionMinutos", "Duración (min)", "NUMERO", "agenda", { requerido: true, unidad: "min" }),
    servicio("intervaloMinutos", "Turnos cada (min)", "NUMERO", "agenda", { requerido: true, unidad: "min" }),
    servicio("margenMinutos", "Margen entre trabajos (min)", "NUMERO", "agenda", { unidad: "min" }),
    servicio("capacidad", "Vehículos a la vez", "NUMERO", "agenda", { requerido: true }),
    servicio("anticipacionMinutos", "Anticipación mínima", "NUMERO", "agenda", { requerido: true, unidad: "min" }),
    servicio("requiereCristal", "Usa un cristal del stock", "SI_NO", "agenda"),
    servicio("horarios", "Días y horarios de atención", "LISTA", "agenda", { requerido: true, especial: true }),
    servicio("precioBase", "Precio base", "NUMERO", "precio"),
  ],
```

- [ ] **Step 8: Implementar en `combinar.ts`**

En `interface CampoFinal` agregar `fijo: boolean;` después de `protegido: boolean;`. En el campo del sistema agregar `fijo: c.fijo ?? false,` después de `protegido: c.protegido,`. En el campo propio agregar `fijo: false,` después de `protegido: false,`.

- [ ] **Step 9: Verlos pasar**

Run: `npx vitest run src/modules/campos && npm run typecheck`
Expected: todos los tests de `campos` pasan y el typecheck no tiene errores. Si algún otro archivo construye un `CampoFinal` a mano y falla por la propiedad `fijo`, agregar `fijo: false` ahí.

- [ ] **Step 10: Commit**

```bash
git add src/modules/campos
git commit -m "feat: modulos de Administracion, campos del sistema de Servicios y marca fijo"
```

---

### Task 2: Columna `servicios.extras` y reglas del servicio de campos

**Files:**
- Modify: `prisma/schema.prisma` (modelo `Servicio`)
- Create: `prisma/migrations/20261001140000_servicios_extras/migration.sql`
- Modify: `src/modules/campos/campo.service.ts`

**Interfaces:**
- Consumes: `CampoSistema.fijo`, `CampoFinal.fijo` (Tarea 1).
- Produces: `Servicio.extras: Prisma.JsonValue` (`db.servicio.extras`); `crearCampoPropio("SERVICIO", …)`, `eliminarCampoPropio` y `cambiarTipoCampo` funcionan sobre `servicios`; `actualizarCampoSistema` y `moverCampoAdmin` lanzan `CampoInvalidoError` para un campo `fijo`.

- [ ] **Step 1: Agregar la columna al modelo `Servicio` en `prisma/schema.prisma`**

Junto a `archivadoEn` del modelo `Servicio` agregar:

```prisma
  extras              Json              @default("{}") // valores de campos propios: { [clave]: valor }
```

- [ ] **Step 2: Generar y aplicar la migración**

```bash
npx prisma dev --name local --detach
D=prisma/migrations/20261001140000_servicios_extras
mkdir -p $D
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script > $D/migration.sql
cat $D/migration.sql
npx prisma migrate deploy
npx prisma generate
```

Expected: el SQL contiene solo `ALTER TABLE "servicios" ADD COLUMN "extras" JSONB NOT NULL DEFAULT '{}'`; `migrate deploy` termina con "All migrations have been successfully applied".

- [ ] **Step 3: Habilitar la tabla en `campo.service.ts`**

Reemplazar el comentario y el mapa `TABLAS` por:

```ts
// Tablas con columna `extras`. El nombre de tabla sale de este mapa, nunca de la entrada.
const TABLAS: Partial<Record<EntidadCampo, string>> = { CRISTAL: "cristales", SERVICIO: "servicios" };
```

- [ ] **Step 4: Rechazar los campos fijos en el servidor**

En `actualizarCampoSistema`, justo después de `if (!definicion) throw new CampoInvalidoError("Ese campo no existe.");`, agregar:

```ts
  if (definicion.fijo) throw new CampoInvalidoError("Este campo no se puede ajustar desde Administración.");
```

En `moverCampoAdmin`, después de `const campos = await obtenerCampos(entidad);`, agregar:

```ts
  if (campos.find((c) => c.clave === clave)?.fijo) throw new CampoInvalidoError("Este campo no se puede mover.");
```

- [ ] **Step 5: Verificar**

Run: `npm run typecheck && npm test`
Expected: sin errores y todos los tests pasan.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/20261001140000_servicios_extras src/modules/campos/campo.service.ts
git commit -m "feat: columna extras en servicios y rechazo de campos fijos en el servidor"
```

---

### Task 3: Parametrizar la Administración de Stock por módulo

Mueve las piezas de `administracion/stock` que no dependen de Stock a una carpeta compartida `administracion/_campos` y las hace recibir el módulo. Stock queda como una instancia más; su pantalla y sus rutas no cambian.

**Files:**
- Move: `administracion/stock/acciones.ts` → `administracion/_campos/acciones.ts`
- Move: `administracion/stock/AccionesFila.tsx` → `administracion/_campos/AccionesFila.tsx`
- Move: `administracion/stock/campos/nuevo/FormularioCampoNuevo.tsx` → `administracion/_campos/FormularioCampoNuevo.tsx`
- Move: `administracion/stock/campos/[clave]/{CambiarTipo,EditorOpciones,FormularioCampoPropio,FormularioCampoSistema,ZonaPeligro}.tsx` → `administracion/_campos/`
- Create: `administracion/_campos/TablaCampos.tsx`, `administracion/_campos/EditarCampo.tsx`
- Modify: `administracion/stock/page.tsx`, `administracion/stock/campos/nuevo/page.tsx`, `administracion/stock/campos/[clave]/page.tsx`

(Todas las rutas son relativas a `src/app/(panel)/`.)

**Interfaces:**
- Consumes: `MODULOS`, `esModulo`, `ModuloAdmin` (Tarea 1); `CampoFinal.fijo` (Tarea 1).
- Produces (componentes de cliente, todos con la prop `modulo: ModuloAdmin`): `AccionesFila({ modulo, clave })`, `FormularioCampoNuevo({ modulo })`, `FormularioCampoSistema({ modulo, clave, etiqueta, ayuda, visible, ocultable, fabrica })`, `FormularioCampoPropio({ modulo, id, etiqueta, ayuda, tipo, requerido, unidad, visible })`, `CambiarTipo({ modulo, id, tipoActual })`, `EditorOpciones({ modulo, id, opciones })`, `ZonaPeligro({ modulo, id, archivado })`. Server components: `TablaCampos({ modulo, aviso? })`, `EditarCampo({ modulo, clave })`. Server Actions: todas reciben `modulo: string` como **primer** argumento.

- [ ] **Step 1: Mover los archivos con git**

```bash
A="src/app/(panel)/administracion"
mkdir -p "$A/_campos"
git mv "$A/stock/acciones.ts" "$A/_campos/acciones.ts"
git mv "$A/stock/AccionesFila.tsx" "$A/_campos/AccionesFila.tsx"
git mv "$A/stock/campos/nuevo/FormularioCampoNuevo.tsx" "$A/_campos/FormularioCampoNuevo.tsx"
for f in CambiarTipo EditorOpciones FormularioCampoPropio FormularioCampoSistema ZonaPeligro; do git mv "$A/stock/campos/[clave]/$f.tsx" "$A/_campos/$f.tsx"; done
git grep -n "administracion/stock/acciones\|from \"\.\./\.\./acciones\"\|from \"\./acciones\"" -- "$A" | cut -c1-140
```

Expected: el `grep` lista los imports que se corrigen en los pasos siguientes (los de `listas/` apuntan a su propio `acciones.ts` y no se tocan).

- [ ] **Step 2: Reescribir `_campos/acciones.ts` con el módulo como primer argumento**

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
import { esModulo, MODULOS, type ModuloAdmin } from "@/modules/campos/modulos";
import type { TipoCampo } from "@/modules/campos/tipos";

const MODULO_INVALIDO: EstadoConConteo = { ok: false, mensaje: "Módulo inválido." };

function refrescar(modulo: ModuloAdmin) {
  revalidatePath(MODULOS[modulo].base);
  for (const ruta of MODULOS[modulo].revalidar) revalidatePath(ruta, "layout");
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

export async function crearCampoAccion(modulo: string, _previo: EstadoFormulario, fd: FormData): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  if (!esModulo(modulo)) return MODULO_INVALIDO;
  try {
    await crearCampoPropio(MODULOS[modulo].entidad, {
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
  refrescar(modulo);
  redirect(`${MODULOS[modulo].base}?aviso=creado`);
}

export async function guardarCampoSistemaAccion(
  modulo: string,
  clave: string,
  _previo: EstadoFormulario,
  fd: FormData,
): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  if (!esModulo(modulo)) return MODULO_INVALIDO;
  // Los campos protegidos no muestran la casilla "visible": sin la marca `puedeOcultar` nunca se ocultan.
  const oculto = fd.get("puedeOcultar") === "1" ? !casilla(fd, "visible") : false;
  try {
    await actualizarCampoSistema(MODULOS[modulo].entidad, clave, { etiqueta: texto(fd, "etiqueta"), ayuda: texto(fd, "ayuda"), oculto });
  } catch (e) {
    return aResultado(e);
  }
  refrescar(modulo);
  redirect(`${MODULOS[modulo].base}?aviso=guardado`);
}

export async function guardarCampoPropioAccion(
  modulo: string,
  id: string,
  _previo: EstadoFormulario,
  fd: FormData,
): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  if (!esModulo(modulo)) return MODULO_INVALIDO;
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
  refrescar(modulo);
  redirect(`${MODULOS[modulo].base}?aviso=guardado`);
}

export async function moverCampoAccion(modulo: string, clave: string, direccion: "ARRIBA" | "ABAJO"): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  if (!esModulo(modulo)) return MODULO_INVALIDO;
  if (direccion !== "ARRIBA" && direccion !== "ABAJO") return { ok: false, mensaje: "Dirección inválida." };
  try {
    await moverCampoAdmin(MODULOS[modulo].entidad, clave, direccion);
  } catch (e) {
    return aResultado(e);
  }
  refrescar(modulo);
  return { ok: true };
}

export async function archivarCampoAccion(modulo: string, id: string, archivar: boolean): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  if (!esModulo(modulo)) return MODULO_INVALIDO;
  await archivarCampoPropio(id, archivar === true);
  refrescar(modulo);
  return { ok: true };
}

/** Sin datos se elimina directo; con datos devuelve `afectados` y espera una segunda llamada con `confirmar = true`. */
export async function eliminarCampoAccion(modulo: string, id: string, confirmar: boolean): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  if (!esModulo(modulo)) return MODULO_INVALIDO;
  try {
    await eliminarCampoPropio(id, { confirmar: confirmar === true });
  } catch (e) {
    return aResultado(e);
  }
  refrescar(modulo);
  redirect(`${MODULOS[modulo].base}?aviso=eliminado`);
}

export async function cambiarTipoAccion(
  modulo: string,
  id: string,
  tipo: string,
  opcionesTexto: string,
  confirmar: boolean,
): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  if (!esModulo(modulo)) return MODULO_INVALIDO;
  try {
    await cambiarTipoCampo(id, tipo as TipoCampo, { opcionesTexto, confirmar: confirmar === true });
  } catch (e) {
    return aResultado(e);
  }
  refrescar(modulo);
  return { ok: true, mensaje: "Tipo cambiado." };
}

export async function opcionAccion(modulo: string, id: string, operacion: OperacionOpcion): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  if (!esModulo(modulo)) return MODULO_INVALIDO;
  try {
    await modificarOpciones(id, operacion);
  } catch (e) {
    return aResultado(e);
  }
  refrescar(modulo);
  return { ok: true };
}
```

- [ ] **Step 3: Reescribir `_campos/AccionesFila.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ArrowDown, ArrowUp, Pencil } from "lucide-react";
import { boton } from "@/components/ui";
import { MODULOS, type ModuloAdmin } from "@/modules/campos/modulos";
import { moverCampoAccion } from "./acciones";

export function AccionesFila({ modulo, clave }: { modulo: ModuloAdmin; clave: string }) {
  const [pendiente, iniciar] = useTransition();
  const mover = (direccion: "ARRIBA" | "ABAJO") =>
    iniciar(async () => {
      await moverCampoAccion(modulo, clave, direccion);
    });

  return (
    <div className="flex justify-end gap-1">
      <button type="button" disabled={pendiente} onClick={() => mover("ARRIBA")} aria-label="Subir" className={`${boton.fantasma} ${boton.chico}`}>
        <ArrowUp className="size-3.5" aria-hidden />
      </button>
      <button type="button" disabled={pendiente} onClick={() => mover("ABAJO")} aria-label="Bajar" className={`${boton.fantasma} ${boton.chico}`}>
        <ArrowDown className="size-3.5" aria-hidden />
      </button>
      <Link href={`${MODULOS[modulo].base}/campos/${clave}`} className={`${boton.secundario} ${boton.chico}`}>
        <Pencil className="size-3.5" aria-hidden /> Editar
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Ajustar los formularios y editores movidos**

En cada archivo, agregar `import { MODULOS, type ModuloAdmin } from "@/modules/campos/modulos";`, cambiar el import de acciones de `"../../acciones"` a `"./acciones"`, recibir `modulo: ModuloAdmin` y aplicar los cambios indicados:

`_campos/FormularioCampoNuevo.tsx`
- firma: `export function FormularioCampoNuevo({ modulo }: { modulo: ModuloAdmin })`
- `useFormularioAccion(crearCampoAccion.bind(null, modulo))`
- etiqueta de la casilla: `Obligatorio al cargar {MODULOS[modulo].objeto}`
- botón Cancelar: `<Link href={MODULOS[modulo].base} …>`

`_campos/FormularioCampoSistema.tsx`
- `props` suma `modulo: ModuloAdmin`
- `useFormularioAccion(guardarCampoSistemaAccion.bind(null, props.modulo, props.clave))`
- botón Cancelar: `<Link href={MODULOS[props.modulo].base} …>`

`_campos/FormularioCampoPropio.tsx`
- `props` suma `modulo: ModuloAdmin`
- `useFormularioAccion(guardarCampoPropioAccion.bind(null, props.modulo, props.id))`
- casilla: `Obligatorio al cargar {MODULOS[props.modulo].objeto}`
- botón Cancelar: `<Link href={MODULOS[props.modulo].base} …>`

`_campos/CambiarTipo.tsx`
- firma: `export function CambiarTipo({ modulo, id, tipoActual }: { modulo: ModuloAdmin; id: string; tipoActual: TipoCampo })`
- llamada: `await cambiarTipoAccion(modulo, id, tipo, opciones, confirmar)`

`_campos/EditorOpciones.tsx`
- firma: `export function EditorOpciones({ modulo, id, opciones }: { modulo: ModuloAdmin; id: string; opciones: OpcionCampo[] })`
- llamada: `await opcionAccion(modulo, id, operacion)`

`_campos/ZonaPeligro.tsx`
- firma: `export function ZonaPeligro({ modulo, id, archivado }: { modulo: ModuloAdmin; id: string; archivado: boolean })`
- llamadas: `await eliminarCampoAccion(modulo, id, confirmar)` y `await archivarCampoAccion(modulo, id, !archivado)`
- texto: `Eliminar borra el campo y sus valores de todos los {MODULOS[modulo].plural}.`

- [ ] **Step 5: Crear `_campos/TablaCampos.tsx` (extraído de la página de Stock)**

```tsx
import Link from "next/link";
import { Fragment } from "react";
import { Plus } from "lucide-react";
import { Aviso, boton, Insignia, tarjeta } from "@/components/ui";
import { obtenerCampos } from "@/modules/campos/campo.service";
import type { CampoFinal } from "@/modules/campos/combinar";
import { MODULOS, type ModuloAdmin } from "@/modules/campos/modulos";
import { SECCIONES } from "@/modules/campos/registro";
import { ETIQUETA_TIPO } from "@/modules/campos/tipos";
import { AccionesFila } from "./AccionesFila";

const AVISOS: Record<string, string> = {
  creado: "Campo creado.",
  guardado: "Cambios guardados.",
  eliminado: "Campo eliminado.",
};

const ANCLA_LISTA = { marcas: "marcas", tipos: "tipos", ubicaciones: "ubicaciones" } as const;

function Tipo({ c, modulo }: { c: CampoFinal; modulo: ModuloAdmin }) {
  const { base, textoEspecial } = MODULOS[modulo];
  if (c.especial) return <>{textoEspecial}</>;
  if (c.lista === "lado") return <>Lista fija (No aplica, Izquierdo, Derecho)</>;
  if (c.lista) {
    return (
      <>
        Lista ·{" "}
        <Link href={`${base}/listas#${ANCLA_LISTA[c.lista]}`} className="font-medium text-acento underline">
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

function Etiquetas({ c }: { c: CampoFinal }) {
  return (
    <>
      <Insignia tono={c.origen === "PROPIO" ? "marca" : "neutro"}>{c.origen === "PROPIO" ? "Propio" : "Sistema"}</Insignia>
      {c.fijo ? <Insignia>Fijo</Insignia> : c.protegido && <Insignia>Protegido</Insignia>}
    </>
  );
}

const Acciones = ({ c, modulo }: { c: CampoFinal; modulo: ModuloAdmin }) =>
  c.fijo ? <span className="block text-right text-xs text-texto-suave">—</span> : <AccionesFila modulo={modulo} clave={c.clave} />;

export async function TablaCampos({ modulo, aviso }: { modulo: ModuloAdmin; aviso?: string }) {
  const { base, entidad } = MODULOS[modulo];
  const campos = await obtenerCampos(entidad);

  return (
    <>
      {aviso && AVISOS[aviso] && <Aviso>{AVISOS[aviso]}</Aviso>}

      <div className="flex justify-end">
        <Link href={`${base}/campos/nuevo`} className={boton.primario}>
          <Plus className="size-4" aria-hidden /> Nuevo campo
        </Link>
      </div>

      {/* Celular: una tarjeta por campo, sin scroll horizontal. */}
      <div className="space-y-5 lg:hidden">
        {SECCIONES.map((s) => {
          const deSeccion = campos.filter((c) => c.seccion === s.id);
          if (deSeccion.length === 0) return null;
          return (
            <section key={s.id} className="space-y-2">
              <h2 className="text-xs font-semibold tracking-widest text-texto-suave uppercase">{s.etiqueta}</h2>
              <ul className="space-y-2">
                {deSeccion.map((c) => (
                  <li key={c.clave} className={`${tarjeta} space-y-3 p-4 ${c.visible ? "" : "opacity-60"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{c.etiqueta}</p>
                        <p className="mt-0.5 text-xs text-texto-suave">
                          <Tipo c={c} modulo={modulo} />
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-1">
                        <Etiquetas c={c} />
                        {c.archivado ? <Insignia tono="alerta">Archivado</Insignia> : !c.visible && <Insignia tono="alerta">Oculto</Insignia>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-borde pt-3 text-xs text-texto-suave">
                      <span>{c.soloLectura || c.especial ? "" : c.requerido ? "Obligatorio" : "Opcional"}</span>
                      <Acciones c={c} modulo={modulo} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div className={`${tarjeta} hidden overflow-x-auto lg:block`}>
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
                        <Tipo c={c} modulo={modulo} />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          <Etiquetas c={c} />
                        </div>
                      </td>
                      <td className="px-4 py-2.5">{c.soloLectura || c.especial ? "—" : c.requerido ? "Sí" : "No"}</td>
                      <td className="px-4 py-2.5">
                        {c.archivado ? <Insignia tono="alerta">Archivado</Insignia> : c.visible ? "Visible" : <Insignia tono="alerta">Oculto</Insignia>}
                      </td>
                      <td className="px-4 py-2.5">
                        <Acciones c={c} modulo={modulo} />
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

- [ ] **Step 6: Crear `_campos/EditarCampo.tsx` y hacer delgadas las páginas de Stock**

`_campos/EditarCampo.tsx`:

```tsx
import { notFound } from "next/navigation";
import { Insignia, tarjeta } from "@/components/ui";
import { obtenerCampos } from "@/modules/campos/campo.service";
import { MODULOS, type ModuloAdmin } from "@/modules/campos/modulos";
import { REGISTRO } from "@/modules/campos/registro";
import { ETIQUETA_TIPO } from "@/modules/campos/tipos";
import { CambiarTipo } from "./CambiarTipo";
import { EditorOpciones } from "./EditorOpciones";
import { FormularioCampoPropio } from "./FormularioCampoPropio";
import { FormularioCampoSistema } from "./FormularioCampoSistema";
import { ZonaPeligro } from "./ZonaPeligro";

export async function EditarCampo({ modulo, clave }: { modulo: ModuloAdmin; clave: string }) {
  const { entidad } = MODULOS[modulo];
  const campo = (await obtenerCampos(entidad)).find((c) => c.clave === clave);
  // Los campos fijos no se pueden ajustar: no hay pantalla de edición para ellos.
  if (!campo || campo.fijo) notFound();

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
          modulo={modulo}
          clave={campo.clave}
          etiqueta={campo.etiqueta}
          ayuda={campo.ayuda ?? ""}
          visible={campo.visible}
          ocultable={campo.ocultable}
          fabrica={REGISTRO[entidad].find((c) => c.clave === campo.clave)?.etiqueta ?? campo.etiqueta}
        />
      ) : (
        <>
          <FormularioCampoPropio
            modulo={modulo}
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
              <EditorOpciones modulo={modulo} id={campo.id!} opciones={campo.opciones} />
            </section>
          )}
          <section className={`${tarjeta} space-y-3 p-5`}>
            <h3 className="font-display font-bold">Cambiar el tipo de dato</h3>
            <CambiarTipo modulo={modulo} id={campo.id!} tipoActual={campo.tipo} />
          </section>
          <section className={`${tarjeta} space-y-3 p-5`}>
            <h3 className="font-display font-bold">Archivar o eliminar</h3>
            <ZonaPeligro modulo={modulo} id={campo.id!} archivado={campo.archivado} />
          </section>
        </>
      )}
    </div>
  );
}
```

`stock/page.tsx` (reemplazar todo el contenido):

```tsx
import { requerirRol } from "@/lib/sesion";
import { TablaCampos } from "../_campos/TablaCampos";

export const metadata = { title: "Administración · Campos de Stock" };

export default async function PaginaCamposStock({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  await requerirRol("ADMIN");
  const { aviso } = await searchParams;
  return <TablaCampos modulo="stock" aviso={aviso} />;
}
```

`stock/campos/nuevo/page.tsx` (reemplazar todo el contenido):

```tsx
import { requerirRol } from "@/lib/sesion";
import { FormularioCampoNuevo } from "../../../_campos/FormularioCampoNuevo";

export const metadata = { title: "Administración · Nuevo campo" };

export default async function PaginaNuevoCampo() {
  await requerirRol("ADMIN");
  return <FormularioCampoNuevo modulo="stock" />;
}
```

`stock/campos/[clave]/page.tsx` (reemplazar todo el contenido):

```tsx
import { requerirRol } from "@/lib/sesion";
import { EditarCampo } from "../../../_campos/EditarCampo";

export const metadata = { title: "Administración · Editar campo" };

export default async function PaginaEditarCampo({ params }: { params: Promise<{ clave: string }> }) {
  await requerirRol("ADMIN");
  const { clave } = await params;
  return <EditarCampo modulo="stock" clave={clave} />;
}
```

- [ ] **Step 7: Verificar y revisar Stock a mano**

Run: `npm run typecheck && npm test`
Expected: sin errores y todos los tests pasan (incluido `guardia-acciones`: `_campos/acciones.ts` está dentro de `administracion`, cuyas acciones deben empezar con `await requerirRol("ADMIN")`).

Revisión manual con la app corriendo (`npm run dev`, sesión de Admin): en `/administracion/stock` se ve la misma tabla y, en celular, las mismas tarjetas; "Nuevo campo" crea un campo de prueba y vuelve con el aviso "Campo creado."; editarlo, subirlo/bajarlo, archivarlo y eliminarlo funcionan; la pestaña "Listas" sigue andando. Borrar el campo de prueba al terminar.

- [ ] **Step 8: Commit**

```bash
git add "src/app/(panel)/administracion"
git commit -m "refactor: la Administracion de campos se parametriza por modulo (Stock sigue igual)"
```

---

### Task 4: Pantallas de Administración > Servicios

**Files:**
- Create: `src/app/(panel)/administracion/servicios/layout.tsx`
- Create: `src/app/(panel)/administracion/servicios/page.tsx`
- Create: `src/app/(panel)/administracion/servicios/campos/nuevo/page.tsx`
- Create: `src/app/(panel)/administracion/servicios/campos/[clave]/page.tsx`
- Modify: `src/app/(panel)/administracion/page.tsx`

**Interfaces:**
- Consumes: `TablaCampos`, `EditarCampo`, `FormularioCampoNuevo` (Tarea 3).
- Produces: las rutas `/administracion/servicios`, `/administracion/servicios/campos/nuevo` y `/administracion/servicios/campos/[clave]`.

- [ ] **Step 1: Crear el layout de Servicios**

`servicios/layout.tsx`:

```tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { boton, EncabezadoPagina } from "@/components/ui";
import { requerirRol } from "@/lib/sesion";

export default async function LayoutAdministracionServicios({ children }: { children: React.ReactNode }) {
  await requerirRol("ADMIN");
  return (
    <>
      <Link href="/administracion" className={`${boton.fantasma} ${boton.chico} -ml-2.5`}>
        <ArrowLeft className="size-3.5" aria-hidden /> Administración
      </Link>
      <EncabezadoPagina
        seccion="Administración"
        titulo="Servicios"
        descripcion="Sumá datos propios a los servicios. Se completan al crear o editar un servicio y los ve solo el personal."
      />
      {children}
    </>
  );
}
```

- [ ] **Step 2: Crear las tres páginas**

`servicios/page.tsx`:

```tsx
import { requerirRol } from "@/lib/sesion";
import { TablaCampos } from "../_campos/TablaCampos";

export const metadata = { title: "Administración · Campos de Servicios" };

export default async function PaginaCamposServicios({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  await requerirRol("ADMIN");
  const { aviso } = await searchParams;
  return <TablaCampos modulo="servicios" aviso={aviso} />;
}
```

`servicios/campos/nuevo/page.tsx`:

```tsx
import { requerirRol } from "@/lib/sesion";
import { FormularioCampoNuevo } from "../../../_campos/FormularioCampoNuevo";

export const metadata = { title: "Administración · Nuevo campo" };

export default async function PaginaNuevoCampoServicio() {
  await requerirRol("ADMIN");
  return <FormularioCampoNuevo modulo="servicios" />;
}
```

`servicios/campos/[clave]/page.tsx`:

```tsx
import { requerirRol } from "@/lib/sesion";
import { EditarCampo } from "../../../_campos/EditarCampo";

export const metadata = { title: "Administración · Editar campo" };

export default async function PaginaEditarCampoServicio({ params }: { params: Promise<{ clave: string }> }) {
  await requerirRol("ADMIN");
  const { clave } = await params;
  return <EditarCampo modulo="servicios" clave={clave} />;
}
```

- [ ] **Step 3: Habilitar la card en `administracion/page.tsx`**

En el módulo `Servicios` cambiar `disponible: false,` por `disponible: true,` y ajustar la descripción:

```ts
    descripcion: "Datos propios de los servicios, además de duración, capacidad y precio.",
```

- [ ] **Step 4: Verificar**

Run: `npm run typecheck && npm test`
Expected: sin errores y todos los tests pasan.

Revisión manual (`npm run dev`, sesión de Admin): `/administracion` muestra la card Servicios habilitada; `/administracion/servicios` lista los 12 campos del sistema con la insignia "Fijo" y sin botones, y deja crear un campo propio ("Nuevo campo"); `/administracion/servicios/campos/nombre` da 404; el campo propio creado se puede editar, mover, archivar y eliminar.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(panel)/administracion"
git commit -m "feat: Administracion de campos propios de Servicios"
```

---

### Task 5: Guardar y mostrar los campos propios en el servicio

**Files:**
- Modify: `src/modules/turnos/schemas.ts` (`servicioSchema`)
- Modify: `src/modules/turnos/servicio.service.ts` (`crearServicio`, `actualizarServicio`)
- Modify: `src/app/(panel)/servicios/acciones.ts`
- Modify: `src/app/(panel)/servicios/FormularioServicio.tsx`
- Modify: `src/app/(panel)/servicios/nuevo/page.tsx`, `src/app/(panel)/servicios/[id]/page.tsx`
- Modify: `src/app/(panel)/servicios/page.tsx`

**Interfaces:**
- Consumes: `procesarExtras`, `formatearValor` (`src/modules/campos/extras`), `listarCamposPropios`, `obtenerCampos`, `obtenerCamposVisibles` (`campo.service`), `CampoPersonalizado`, `nombreInput`, `Extras`.
- Produces: `ServicioInput` acepta `extrasEntrada?: Record<string, unknown>` y `extrasDibujados?: string[]`; `ServicioEditable` suma `extras: Extras`; `FormularioServicio({ servicio?, campos })` con `campos: CampoFinal[]` (propios visibles).

- [ ] **Step 1: Aceptar los extras en `servicioSchema`**

En el `z.object({ … })` de `servicioSchema`, después de `horarios`, agregar:

```ts
    extrasEntrada: z.record(z.string(), z.unknown()).optional(),
    extrasDibujados: z.array(z.string()).optional(),
```

- [ ] **Step 2: Guardarlos en `servicio.service.ts`**

Agregar los imports:

```ts
import { listarCamposPropios } from "@/modules/campos/campo.service";
import { procesarExtras } from "@/modules/campos/extras";
import type { Extras } from "@/modules/campos/tipos";
```

Reemplazar `crearServicio` y `actualizarServicio` por:

```ts
export async function crearServicio(input: ServicioInput) {
  const { horarios, extrasEntrada, extrasDibujados, ...datos } = servicioSchema.parse(input);
  // Sin entrada de extras (otro origen que el formulario) no se validan los campos propios.
  const extras: Extras = extrasEntrada
    ? procesarExtras(await listarCamposPropios("SERVICIO"), extrasEntrada, {}, extrasDibujados)
    : {};
  // Si no se indica un orden, el servicio nuevo va al final del listado.
  const { _max } = await db.servicio.aggregate({ _max: { orden: true } });
  return db.servicio.create({
    data: { ...datos, extras, orden: input.orden ?? (_max.orden ?? 0) + 1, horarios: { create: horarios } },
    include: { horarios: true },
  });
}

/** Reemplaza la configuración completa del servicio (datos + franjas horarias). Los extras solo se tocan si llegan. */
export async function actualizarServicio(id: string, input: ServicioInput) {
  const { horarios, extrasEntrada, extrasDibujados, ...datos } = servicioSchema.parse(input);

  let extras: Extras | undefined;
  if (extrasEntrada) {
    const actual = await db.servicio.findUniqueOrThrow({ where: { id }, select: { extras: true } });
    extras = procesarExtras(await listarCamposPropios("SERVICIO"), extrasEntrada, actual.extras as Extras, extrasDibujados);
  }

  return db.servicio.update({
    where: { id },
    data: { ...datos, ...(extras && { extras }), horarios: { deleteMany: {}, create: horarios } },
    include: { horarios: true },
  });
}
```

(si la rama tiene ya un comentario de `actualizarServicio`, conservar solo el nuevo.)

- [ ] **Step 3: Leer los extras en `servicios/acciones.ts`**

Agregar el helper arriba de `guardarServicio` y las dos claves a `entrada`:

```ts
/** Campos propios: cada control `extra_<clave>` del formulario. Las casillas sin tildar no llegan. */
function leerExtras(fd: FormData): Record<string, unknown> {
  const extras: Record<string, unknown> = {};
  for (const [clave, valor] of fd.entries()) {
    if (clave.startsWith("extra_") && typeof valor === "string") extras[clave] = valor;
  }
  return extras;
}
```

En el objeto `entrada`, después de `horarios: json(fd, "horarios", []),`:

```ts
    extrasEntrada: leerExtras(fd),
    extrasDibujados: json<string[] | undefined>(fd, "camposDibujados", undefined),
```

- [ ] **Step 4: Dibujar la sección en `FormularioServicio.tsx`**

Agregar los imports:

```ts
import { CampoPersonalizado } from "@/components/campos/CampoPersonalizado";
import type { CampoFinal } from "@/modules/campos/combinar";
import { nombreInput, type Extras } from "@/modules/campos/tipos";
```

En `ServicioEditable` agregar `extras: Extras;` después de `orden: number;`. Cambiar la firma a:

```tsx
export function FormularioServicio({ servicio, campos = [] }: { servicio?: ServicioEditable; campos?: CampoFinal[] }) {
```

Después del campo oculto `horarios`, agregar:

```tsx
      <input type="hidden" name="camposDibujados" value={JSON.stringify(campos.map((c) => c.clave))} />
```

y justo antes del `<div className="flex justify-end gap-2">` final, la sección:

```tsx
      {campos.length > 0 && (
        <section className={`${tarjeta} space-y-4 p-5`}>
          <h2 className="font-display font-bold">Datos adicionales</h2>
          <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {campos.map((c) => (
              <CampoPersonalizado key={c.clave} campo={c} valor={servicio?.extras[c.clave]} error={error(nombreInput(c.clave))} />
            ))}
          </div>
        </section>
      )}
```

- [ ] **Step 5: Pasar los campos desde las páginas de alta y edición**

`servicios/nuevo/page.tsx`:

```tsx
import { EncabezadoPagina } from "@/components/ui";
import { obtenerCamposVisibles } from "@/modules/campos/campo.service";
import { FormularioServicio } from "../FormularioServicio";
import { requerirRol } from "@/lib/sesion";

export const metadata = { title: "Nuevo servicio" };

export default async function PaginaNuevoServicio() {
  await requerirRol("ADMIN");
  const campos = (await obtenerCamposVisibles("SERVICIO")).filter((c) => c.origen === "PROPIO");
  return (
    <>
      <EncabezadoPagina seccion="Servicios" titulo="Nuevo servicio" />
      <FormularioServicio campos={campos} />
    </>
  );
}
```

`servicios/[id]/page.tsx`: agregar los imports `import { obtenerCamposVisibles } from "@/modules/campos/campo.service";` y `import type { Extras } from "@/modules/campos/tipos";`, y reemplazar el cuerpo por:

```tsx
export default async function PaginaEditarServicio({ params }: { params: Promise<{ id: string }> }) {
  await requerirRol("ADMIN");
  const { id } = await params;
  const servicio = await obtenerServicio(id);
  if (!servicio) notFound();
  const campos = (await obtenerCamposVisibles("SERVICIO")).filter((c) => c.origen === "PROPIO");

  return (
    <>
      <EncabezadoPagina seccion="Servicios" titulo={servicio.nombre} descripcion="Los cambios se aplican a los turnos nuevos; los ya reservados mantienen su horario." />
      <FormularioServicio
        servicio={{ ...servicio, precioBase: servicio.precioBase === null ? null : Number(servicio.precioBase), extras: servicio.extras as Extras }}
        campos={campos}
      />
    </>
  );
}
```

- [ ] **Step 6: Mostrar los datos adicionales en la lista de `/servicios`**

En `servicios/page.tsx` agregar los imports:

```ts
import { obtenerCampos } from "@/modules/campos/campo.service";
import { formatearValor } from "@/modules/campos/extras";
import type { Extras } from "@/modules/campos/tipos";
```

En `PaginaServicios`, reemplazar la carga de datos por:

```ts
  const [{ aviso }, servicios, campos] = await Promise.all([searchParams, listarServicios(), obtenerCampos("SERVICIO")]);
  const propios = campos.filter((c) => c.origen === "PROPIO" && c.visible);
```

y después del `</ul>` que cierra la lista de horarios de cada servicio (el de `className="space-y-0.5 text-xs text-texto-suave"`), agregar:

```tsx
                {(() => {
                  const extras = s.extras as Extras;
                  const cargados = propios.filter((c) => extras[c.clave] !== undefined);
                  if (cargados.length === 0) return null;
                  return (
                    <dl className="grid gap-x-4 gap-y-0.5 border-t border-borde pt-3 text-xs sm:grid-cols-2">
                      {cargados.map((c) => (
                        <div key={c.clave} className="flex gap-1">
                          <dt className="text-texto-suave">{c.etiqueta}:</dt>
                          <dd className="font-medium">{formatearValor(c, extras[c.clave])}</dd>
                        </div>
                      ))}
                    </dl>
                  );
                })()}
```

- [ ] **Step 7: Verificar**

Run: `npm run typecheck && npm test`
Expected: sin errores y todos los tests pasan.

Revisión manual (`npm run dev`, sesión de Admin): con un campo propio de prueba creado en la Tarea 4, `/servicios/nuevo` y `/servicios/[id]` muestran la sección "Datos adicionales"; guardar un valor lo deja visible en la lista de `/servicios`; sin campos propios la sección no aparece.

- [ ] **Step 8: Commit**

```bash
git add src "src/app/(panel)/servicios"
git commit -m "feat: los servicios guardan y muestran sus campos propios"
```

---

### Task 6: Verificación contra la base y documentación

**Files:**
- Create (temporal, se borra al final): `verificar-servicios.tmp.ts`
- Modify: `docs/ARQUITECTURA.md`

- [ ] **Step 1: Escribir el script de verificación (temporal)**

`verificar-servicios.tmp.ts` en la raíz. Crea un servicio y campos de prueba, recorre los casos y limpia todo:

```ts
import { db } from "@/lib/db";
import {
  actualizarCampoSistema,
  archivarCampoPropio,
  CampoInvalidoError,
  ConfirmacionRequeridaError,
  crearCampoPropio,
  eliminarCampoPropio,
  listarCamposPropios,
  moverCampoAdmin,
  obtenerCampos,
} from "@/modules/campos/campo.service";
import { actualizarServicio, crearServicio } from "@/modules/turnos/servicio.service";

const horarios = [{ diaSemana: 1, desde: "08:00", hasta: "12:00" }];
const base = { nombre: "ZZ prueba campos", slug: "zz-prueba-campos", duracionMinutos: 60, horarios };

async function main() {
  const salida: string[] = [];
  const campo = await crearCampoPropio("SERVICIO", { etiqueta: "ZZ Garantía", tipo: "TEXTO", requerido: false });
  const obligatorio = await crearCampoPropio("SERVICIO", { etiqueta: "ZZ Obligatorio", tipo: "TEXTO", requerido: true });
  const deCristal = await crearCampoPropio("CRISTAL", { etiqueta: "ZZ Solo cristales", tipo: "TEXTO", requerido: false });
  let servicioId = "";
  try {
    // 1. Un servicio existente (creado sin extras) sigue legible aunque haya un campo obligatorio nuevo
    const creado = await crearServicio(base as never);
    servicioId = creado.id;
    salida.push(`1. servicio creado sin extras con un campo obligatorio nuevo -> extras ${JSON.stringify(creado.extras)} | y al editar sin completarlo: ${await actualizarServicio(servicioId, { ...base, extrasEntrada: {} } as never).then(() => "ERROR: guardó", (e) => (e.name === "ZodError" ? "pide el valor (ok)" : "ERROR " + e))}`);

    // 2. Con el valor obligatorio y uno opcional, se guarda; sin campos dibujados no se toca lo no enviado
    await actualizarServicio(servicioId, { ...base, extrasEntrada: { extra_zz_obligatorio: "sí", extra_zz_garantia: "6 meses" } } as never);
    const guardado = await db.servicio.findUniqueOrThrow({ where: { id: servicioId } });
    salida.push(`2. valores guardados -> ${JSON.stringify(guardado.extras)}`);

    // 3. Actualizar sin entrada de extras no pisa los valores
    await actualizarServicio(servicioId, base as never);
    salida.push(`3. actualizar sin extras conserva -> ${JSON.stringify((await db.servicio.findUniqueOrThrow({ where: { id: servicioId } })).extras)}`);

    // 4. Un campo fijo del sistema no se ajusta ni se mueve, aunque el pedido se arme a mano
    const r4a = await actualizarCampoSistema("SERVICIO", "nombre", { etiqueta: "Otro", ayuda: "", oculto: false }).then(() => "ERROR: lo ajustó", (e) => (e instanceof CampoInvalidoError ? "rechazado (ok)" : "ERROR " + e));
    const r4b = await moverCampoAdmin("SERVICIO", "capacidad", "ARRIBA").then(() => "ERROR: lo movió", (e) => (e instanceof CampoInvalidoError ? "rechazado (ok)" : "ERROR " + e));
    salida.push(`4. ajustar fijo -> ${r4a} | mover fijo -> ${r4b}`);

    // 5. Eliminar un campo con valores pide confirmar y cuenta servicios
    const r5 = await eliminarCampoPropio(campo.id, { confirmar: false }).then(() => "ERROR: borró sin confirmar", (e) => (e instanceof ConfirmacionRequeridaError ? `pide confirmar, afectados ${e.afectados}` : "ERROR " + e));
    salida.push(`5. eliminar con valores -> ${r5}`);

    // 6. Los campos propios de una entidad no aparecen en la otra
    const claves = (await obtenerCampos("SERVICIO")).map((c) => c.clave);
    salida.push(`6. 'zz_solo_cristales' en Servicios: ${claves.includes("zz_solo_cristales")} | 'zz_garantia' en Cristal: ${(await listarCamposPropios("CRISTAL")).some((c) => c.clave === "zz_garantia")}`);

    // 7. Archivar conserva los valores
    await archivarCampoPropio(campo.id, true);
    salida.push(`7. archivado conserva valor -> ${JSON.stringify((await db.servicio.findUniqueOrThrow({ where: { id: servicioId } })).extras)}`);

    // 8. Eliminar confirmado borra el campo y sus valores
    const n = await eliminarCampoPropio(campo.id, { confirmar: true });
    salida.push(`8. eliminar confirmado -> afectados ${n} | extras ahora ${JSON.stringify((await db.servicio.findUniqueOrThrow({ where: { id: servicioId } })).extras)}`);

    console.log(salida.join("\n"));
  } finally {
    if (servicioId) await db.servicio.deleteMany({ where: { id: servicioId } });
    await db.campoPersonalizado.deleteMany({ where: { id: { in: [campo.id, obligatorio.id, deCristal.id] } } });
    await db.$disconnect();
  }
}
main();
```

- [ ] **Step 2: Correrlo**

Run: `npx tsx --env-file=.env verificar-servicios.tmp.ts`
Expected (cada línea):
- `1. … extras {} | y al editar sin completarlo: pide el valor (ok)`
- `2. valores guardados -> {"zz_obligatorio":"sí","zz_garantia":"6 meses"}`
- `3. actualizar sin extras conserva -> {"zz_obligatorio":"sí","zz_garantia":"6 meses"}`
- `4. ajustar fijo -> rechazado (ok) | mover fijo -> rechazado (ok)`
- `5. eliminar con valores -> pide confirmar, afectados 1`
- `6. 'zz_solo_cristales' en Servicios: false | 'zz_garantia' en Cristal: false`
- `7. archivado conserva valor -> {"zz_obligatorio":"sí","zz_garantia":"6 meses"}`
- `8. eliminar confirmado -> afectados 1 | extras ahora {"zz_obligatorio":"sí"}`

Si algo difiere, corregir el código de la tarea que corresponda (no el script) y repetir. Al terminar: `rm verificar-servicios.tmp.ts` y comprobar con `git status` que no quedan archivos temporales ni campos "ZZ …" en Administración.

- [ ] **Step 3: Documentar en `docs/ARQUITECTURA.md`**

En la sección "Administración de campos" agregar un párrafo: Servicios ya tiene campos propios (columna `servicios.extras`; los campos del sistema del servicio se muestran como `fijo` y no se pueden renombrar, ocultar ni mover; los propios se completan en "Datos adicionales" al crear o editar un servicio y se ven en la lista de `/servicios`; no se muestran al cliente). Documentar que las pantallas de campos están parametrizadas por módulo (`MODULOS` en `src/modules/campos/modulos.ts`, componentes y Server Actions en `src/app/(panel)/administracion/_campos`). En la tabla de pantallas agregar `/administracion/servicios`, `/administracion/servicios/campos/nuevo` y `/administracion/servicios/campos/[clave]` (solo Admin). En "Pendiente", en el punto de Administración de campos, dejar solo "Turnos y clientes" (incluye los campos del formulario público `/reservar`) y anotar que pasar a renombrar/ocultar/reordenar los campos del sistema de Servicios requiere reconstruir `FormularioServicio` sobre el motor.

- [ ] **Step 4: Verificación final**

Run: `npm run typecheck && npm test`
Expected: typecheck limpio y todos los tests pasan (los anteriores más los de `modulos` y los nuevos de `combinar`).

- [ ] **Step 5: Commit**

```bash
git add docs/ARQUITECTURA.md
git commit -m "docs: campos propios de Servicios en Administracion"
```
