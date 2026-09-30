import { connection } from "next/server";
import { EncabezadoPagina } from "@/components/ui";
import { obtenerCatalogos } from "@/modules/inventario/cristal.service";
import { FormularioCristal } from "../FormularioCristal";

export const metadata = { title: "Nuevo cristal" };

export default async function PaginaNuevoCristal() {
  await connection(); // los catálogos se leen en cada visita, no al compilar
  const catalogos = await obtenerCatalogos();
  return (
    <>
      <EncabezadoPagina seccion="Stock" titulo="Nuevo cristal" />
      <FormularioCristal catalogos={catalogos} />
    </>
  );
}
