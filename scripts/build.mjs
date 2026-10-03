// Compila el servidor (TypeScript) a un solo archivo: dist/server.js.
// Las dependencias de producción quedan afuera (se cargan de node_modules); el resto se incluye.
import { readFileSync } from "node:fs";
import { build } from "esbuild";

const { dependencies } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

await build({
  entryPoints: ["src/server.ts"],
  outfile: "dist/server.js",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  sourcemap: true,
  external: Object.keys(dependencies),
  // ESM primero: así los iconos de lucide-static se incluyen de a uno (tree shaking) y no el paquete entero.
  mainFields: ["module", "main"],
  banner: {
    js: [
      'process.env.NODE_ENV ??= "production";',
      'import { createRequire as __crearRequire } from "node:module";',
      "const require = __crearRequire(import.meta.url);",
    ].join("\n"),
  },
  logLevel: "info",
});
