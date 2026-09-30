import { EncabezadoPagina } from "@/components/ui";
import { requerirRol } from "@/lib/sesion";
import { FormularioUsuario } from "../FormularioUsuario";

export const metadata = { title: "Nuevo usuario" };

export default async function PaginaNuevoUsuario() {
  await requerirRol("ADMIN");
  return (
    <>
      <EncabezadoPagina seccion="Usuarios" titulo="Nuevo usuario" />
      <FormularioUsuario />
    </>
  );
}
