import { notFound } from "next/navigation";
import { EncabezadoPagina } from "@/components/ui";
import { obtenerCamposVisibles } from "@/modules/campos/campo.service";
import type { Extras } from "@/modules/campos/tipos";
import { obtenerServicio } from "@/modules/turnos/servicio.service";
import { FormularioServicio } from "../FormularioServicio";
import { requerirRol } from "@/lib/sesion";

export const metadata = { title: "Editar servicio" };

export default async function PaginaEditarServicio({ params }: { params: Promise<{ id: string }> }) {
  await requerirRol("ADMIN");
  const { id } = await params;
  const servicio = await obtenerServicio(id);
  if (!servicio) notFound();
  const campos = (await obtenerCamposVisibles("SERVICIO")).filter((c) => c.origen === "PROPIO");

  return (
    <>
      <EncabezadoPagina seccion="Servicios" titulo={servicio.nombre} descripcion="Los cambios se aplican a los turnos nuevos; los ya reservados mantienen su horario." />
      <FormularioServicio
        servicio={{ ...servicio, precioBase: servicio.precioBase === null ? null : Number(servicio.precioBase), extras: servicio.extras as Extras }}
        campos={campos}
      />
    </>
  );
}
