import { notFound } from "next/navigation";
import { EncabezadoPagina } from "@/components/ui";
import { obtenerServicio } from "@/modules/turnos/servicio.service";
import { FormularioServicio } from "../FormularioServicio";

export const metadata = { title: "Editar servicio" };

export default async function PaginaEditarServicio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const servicio = await obtenerServicio(id);
  if (!servicio) notFound();

  return (
    <>
      <EncabezadoPagina seccion="Servicios" titulo={servicio.nombre} descripcion="Los cambios se aplican a los turnos nuevos; los ya reservados mantienen su horario." />
      <FormularioServicio servicio={{ ...servicio, precioBase: servicio.precioBase === null ? null : Number(servicio.precioBase) }} />
    </>
  );
}
