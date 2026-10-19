import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { crearUrlRecurso } from "./recursos";

describe("crearUrlRecurso", () => {
  const carpeta = mkdtempSync(join(tmpdir(), "recursos-"));

  it("agrega una huella que cambia con el contenido", () => {
    writeFileSync(join(carpeta, "app.css"), ".a{}");
    const url = crearUrlRecurso(carpeta, false);
    const antes = url("/app.css");
    expect(antes).toMatch(/^\/app\.css\?v=[0-9a-f]{10}$/);

    writeFileSync(join(carpeta, "app.css"), ".a{}.b{}");
    expect(url("/app.css")).not.toBe(antes);
  });

  it("con `recordar` conserva la primera huella", () => {
    writeFileSync(join(carpeta, "fijo.css"), ".a{}");
    const url = crearUrlRecurso(carpeta, true);
    const antes = url("/fijo.css");
    writeFileSync(join(carpeta, "fijo.css"), ".b{}");
    expect(url("/fijo.css")).toBe(antes);
  });

  it("si el archivo no existe, devuelve la ruta sin huella", () => {
    expect(crearUrlRecurso(carpeta, false)("/no-existe.js")).toBe("/no-existe.js");
  });
});
