import { EncabezadoPagina } from "@/components/ui";
import { FormularioServicio } from "../FormularioServicio";

export const metadata = { title: "Nuevo servicio" };

export default function PaginaNuevoServicio() {
  return (
    <>
      <EncabezadoPagina seccion="Servicios" titulo="Nuevo servicio" />
      <FormularioServicio />
    </>
  );
}
