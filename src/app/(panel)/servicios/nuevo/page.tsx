import { EncabezadoPagina } from "@/components/ui";
import { obtenerCamposVisibles } from "@/modules/campos/campo.service";
import { FormularioServicio } from "../FormularioServicio";
import { requerirRol } from "@/lib/sesion";

export const metadata = { title: "Nuevo servicio" };

export default async function PaginaNuevoServicio() {
  await requerirRol("ADMIN");
  const campos = (await obtenerCamposVisibles("SERVICIO")).filter((c) => c.origen === "PROPIO");
  return (
    <>
      <EncabezadoPagina seccion="Servicios" titulo="Nuevo servicio" />
      <FormularioServicio campos={campos} />
    </>
  );
}
