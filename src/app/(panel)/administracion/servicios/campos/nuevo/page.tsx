import { requerirRol } from "@/lib/sesion";
import { FormularioCampoNuevo } from "../../../_campos/FormularioCampoNuevo";

export const metadata = { title: "Administración · Nuevo campo" };

export default async function PaginaNuevoCampoServicio() {
  await requerirRol("ADMIN");
  return <FormularioCampoNuevo modulo="servicios" />;
}
