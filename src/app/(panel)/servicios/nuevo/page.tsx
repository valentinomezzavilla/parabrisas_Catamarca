import { EncabezadoPagina } from "@/components/ui";
import { FormularioServicio } from "../FormularioServicio";
import { requerirRol } from "@/lib/sesion";

export const metadata = { title: "Nuevo servicio" };

export default async function PaginaNuevoServicio() {
  await requerirRol("ADMIN");
  return (
    <>
      <EncabezadoPagina seccion="Servicios" titulo="Nuevo servicio" />
      <FormularioServicio />
    </>
  );
}
