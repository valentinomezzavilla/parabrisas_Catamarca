import { readdirSync, readFileSync } from "node:fs";
import { basename, join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { exportsQueNoSonFuncionesAsync, FUNCION_EXPORTADA } from "./guardia-acciones.util";

/**
 * Garantiza que toda Server Action del panel valide la sesión antes de hacer nada.
 * Las Server Actions se pueden invocar por POST directo, así que el proxy y el layout no alcanzan.
 * (`src/app/(publico)/reservar/acciones.ts` queda afuera a propósito: es pública.)
 */
const RAIZ_APP = join(process.cwd(), "src", "app");
const RAIZ = join(RAIZ_APP, "(panel)");
const SOLO_ADMIN = ["administracion", "servicios", "usuarios"];

const archivosDe = (raiz: string, extensiones: string[]) =>
  readdirSync(raiz, { recursive: true, encoding: "utf8" })
    .filter((f) => extensiones.some((e) => f.endsWith(e)))
    .map((f) => join(raiz, f));

const archivos = archivosDe(RAIZ, ["acciones.ts"]);

describe("exportsQueNoSonFuncionesAsync (el detector del test)", () => {
  it("marca las arrow functions, const y default exports que el regex de funciones no ve", () => {
    expect(exportsQueNoSonFuncionesAsync("export const borrarTodo = async (id: string) => {}")).toHaveLength(1);
    expect(exportsQueNoSonFuncionesAsync("export default async function f() {}")).toHaveLength(1);
    expect(exportsQueNoSonFuncionesAsync("export { a, b };")).toHaveLength(1);
    expect(exportsQueNoSonFuncionesAsync("export function sincrona() {}")).toHaveLength(1);
  });

  it("deja pasar export async function y los tipos (no existen en tiempo de ejecución)", () => {
    const ok = [
      "export async function guardar(id: string) {}",
      "export type Estado = { ok: boolean };",
      "export interface Datos { a: number }",
    ].join("\n");
    expect(exportsQueNoSonFuncionesAsync(ok)).toEqual([]);
  });

  it("detecta la arrow aunque haya una función válida al lado", () => {
    const mixto = "export async function ok() {}\nexport const mala = async () => {};";
    expect(exportsQueNoSonFuncionesAsync(mixto)).toEqual(["export const mala = async () => {};"]);
  });
});

describe("Server Actions del panel", () => {
  it("encuentra los archivos de acciones esperados", () => {
    const carpetas = archivos.map((a) => relative(RAIZ, a).split(sep)[0]).sort();
    expect([...new Set(carpetas)]).toEqual(["administracion", "servicios", "stock", "turnos", "usuarios"]);
  });

  it('no hay "use server" fuera de un archivo acciones.ts (no se podría auditar)', () => {
    const fuera = archivosDe(RAIZ_APP, [".ts", ".tsx"])
      .filter((f) => basename(f) !== "acciones.ts")
      .filter((f) => /^\s*["']use server["']/m.test(readFileSync(f, "utf8")))
      .map((f) => relative(RAIZ_APP, f));
    expect(fuera).toEqual([]);
  });

  for (const archivo of archivos) {
    const carpeta = relative(RAIZ, archivo).split(sep)[0];
    const exigeAdmin = SOLO_ADMIN.includes(carpeta);
    const codigo = readFileSync(archivo, "utf8");

    it(`${carpeta}/acciones.ts no deja TODO(auth) pendientes`, () => {
      expect(codigo).not.toMatch(/TODO\(auth\)/);
    });

    it(`${carpeta}/acciones.ts solo exporta funciones async (las demás no se auditan)`, () => {
      expect(exportsQueNoSonFuncionesAsync(codigo)).toEqual([]);
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
