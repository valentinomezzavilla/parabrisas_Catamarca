import { NextResponse, type NextRequest } from "next/server";
import { esRutaPublica } from "@/lib/rutas";
import { NOMBRE_COOKIE, obtenerSecreto, verificarToken } from "@/lib/token";

/**
 * Chequeo optimista: si no hay una cookie de sesión con firma válida, redirige a /login.
 * No consulta la base, así que NO es la defensa real: cada página y cada Server Action
 * vuelven a validar la sesión con `verificarSesion()`.
 */
export default async function proxy(req: NextRequest) {
  if (esRutaPublica(req.nextUrl.pathname)) return NextResponse.next();

  const usuarioId = await verificarToken(req.cookies.get(NOMBRE_COOKIE)?.value, obtenerSecreto());
  if (usuarioId) return NextResponse.next();

  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  // Se excluyen los assets internos de Next y cualquier ruta con extensión (logo, favicon, etc.).
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
