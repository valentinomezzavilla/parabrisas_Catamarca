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
