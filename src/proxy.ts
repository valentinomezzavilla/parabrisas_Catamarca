import { NextResponse, type NextRequest } from "next/server";
import { esRutaPublica, esServerAction } from "@/lib/rutas";
import { NOMBRE_COOKIE, obtenerSecreto, verificarToken } from "@/lib/token";

/**
 * Chequeo optimista: si no hay una cookie de sesión con firma válida, redirige a /login.
 * No consulta la base, así que NO es la defensa real: cada página y cada Server Action
 * vuelven a validar la sesión con `verificarSesion()`.
 */
export default async function proxy(req: NextRequest) {
  if (esRutaPublica(req.nextUrl.pathname)) return NextResponse.next();

  // Una Server Action con la sesión vencida no se redirige acá: el navegador reenviaría el POST a
  // /login, que no conoce la acción, y la pantalla se rompería. Cada acción valida la sesión por su
  // cuenta (verificarSesion) y su redirect a /login lo maneja bien el cliente de Next.
  if (esServerAction(req.method, req.headers.has("next-action"))) return NextResponse.next();

  const usuarioId = await verificarToken(req.cookies.get(NOMBRE_COOKIE)?.value, obtenerSecreto());
  if (usuarioId) return NextResponse.next();

  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  // Se excluyen los assets internos de Next y cualquier ruta con extensión (logo, favicon, etc.).
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
