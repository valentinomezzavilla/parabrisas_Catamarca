import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { FormularioLogin } from "./FormularioLogin";

export const metadata = { title: "Ingresar" };

export default async function PaginaLogin() {
  // Con sesión válida no tiene sentido ver el login. Se usa `obtenerSesion` (no redirige)
  // para que una cookie vencida o de un usuario desactivado muestre el formulario.
  if (await obtenerSesion()) redirect("/");
  return <FormularioLogin />;
}
