import { requerirRol } from "@/lib/sesion";
import { FormularioCampoNuevo } from "../../../_campos/FormularioCampoNuevo";

export const metadata = { title: "Administración · Nuevo campo" };

export default async function PaginaNuevoCampo() {
  await requerirRol("ADMIN");
  return <FormularioCampoNuevo modulo="stock" />;
}
