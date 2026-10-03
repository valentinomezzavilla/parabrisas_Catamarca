import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { firmarToken, NOMBRE_COOKIE, obtenerSecreto } from "@/lib/token";

/**
 * Garantiza que el panel exige sesión y que Servicios, Usuarios y Administración exigen el rol Admin,
 * para cualquier ruta (también las que no existen todavía) y para GET y POST por igual.
 * Las guardias corren antes que los handlers: estos tests no tocan la base.
 */

process.env.SESSION_SECRET = "secreto-de-prueba-para-los-tests-0123456789";

const USUARIOS = {
  admin: { id: "admin", nombre: "Admin", usuario: "admin", rol: "ADMIN" as const },
  empleado: { id: "empleado", nombre: "Empleado", usuario: "empleado", rol: "EMPLEADO" as const },
};

vi.mock("@/modules/usuarios/usuario.service", async (original) => ({
  ...(await original<object>()),
  obtenerUsuarioActivo: async (id: string) => USUARIOS[id as keyof typeof USUARIOS] ?? null,
}));

let servidor: Server;
let base: string;

beforeAll(async () => {
  const { crearApp } = await import("@/app");
  servidor = crearApp().listen(0);
  await new Promise((ok) => servidor.once("listening", ok));
  base = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`;
});

afterAll(() => servidor?.close());

async function pedir(ruta: string, { metodo = "GET", usuario, origen }: { metodo?: string; usuario?: string; origen?: string } = {}) {
  const headers: Record<string, string> = { "content-type": "application/x-www-form-urlencoded" };
  if (usuario) headers.cookie = `${NOMBRE_COOKIE}=${await firmarToken(usuario, obtenerSecreto())}`;
  if (origen) headers.origin = origen;
  return fetch(`${base}${ruta}`, { method: metodo, headers, redirect: "manual", body: metodo === "POST" ? "x=1" : undefined });
}

const PANEL = [
  "/",
  "/turnos",
  "/turnos/abc/editar",
  "/turnos/abc/estado",
  "/stock",
  "/stock/nuevo",
  "/stock/abc/movimientos",
  "/pagos/abc/devuelto",
  "/una-ruta-que-no-existe",
];
const SOLO_ADMIN = [
  "/servicios",
  "/servicios/nuevo",
  "/servicios/abc/eliminar",
  "/usuarios",
  "/usuarios/abc/rol",
  "/usuarios/abc/password",
  "/administracion",
  "/administracion/stock/campos/codigo/tipo",
  "/administracion/stock/listas/marcas/abc/eliminar",
  "/administracion/otra-cosa",
];

describe("sin sesión", () => {
  for (const ruta of [...PANEL, ...SOLO_ADMIN]) {
    for (const metodo of ["GET", "POST"]) {
      it(`${metodo} ${ruta} redirige a /login`, async () => {
        const r = await pedir(ruta, { metodo });
        expect(r.status).toBe(303);
        expect(r.headers.get("location")).toBe("/login");
      });
    }
  }

  it("con una cookie de un usuario inexistente o desactivado, también", async () => {
    const r = await pedir("/stock", { usuario: "dado-de-baja" });
    expect(r.headers.get("location")).toBe("/login");
  });

  it("el login y el turnero público no piden sesión", async () => {
    expect((await pedir("/login")).status).toBe(200);
    expect((await pedir("/reservar/nada")).status).toBe(404);
  });
});

describe("con rol Empleado", () => {
  for (const ruta of SOLO_ADMIN) {
    for (const metodo of ["GET", "POST"]) {
      it(`${metodo} ${ruta} redirige al inicio sin ejecutar nada`, async () => {
        const r = await pedir(ruta, { metodo, usuario: "empleado" });
        expect(r.status).toBe(303);
        expect(r.headers.get("location")).toBe("/");
      });
    }
  }
});

describe("protección CSRF", () => {
  it("rechaza un POST que viene de otro sitio, aun con sesión", async () => {
    const r = await pedir("/usuarios/abc/rol", { metodo: "POST", usuario: "admin", origen: "https://otro-sitio.com" });
    expect(r.status).toBe(403);
  });

  it("rechaza un POST público (reservar) que viene de otro sitio", async () => {
    const r = await pedir("/reservar/cancelar", { metodo: "POST", origen: "https://otro-sitio.com" });
    expect(r.status).toBe(403);
  });

  it("deja pasar un POST del mismo sitio hasta la guardia de sesión", async () => {
    const r = await pedir("/stock/nuevo", { metodo: "POST", origen: base });
    expect(r.status).toBe(303);
    expect(r.headers.get("location")).toBe("/login");
  });

  it("el webhook de Mercado Pago no exige Origin (lo valida la firma)", async () => {
    delete process.env.MP_WEBHOOK_SECRET;
    const r = await pedir("/api/mercadopago/webhook", { metodo: "POST", origen: "https://api.mercadopago.com" });
    expect(r.status).toBe(500); // sin MP_WEBHOOK_SECRET responde "no configurado", pero pasó la protección
  });
});
