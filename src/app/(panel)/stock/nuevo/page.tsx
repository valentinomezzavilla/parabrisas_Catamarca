import { connection } from "next/server";
import { EncabezadoPagina } from "@/components/ui";
import { verificarSesion } from "@/lib/sesion";
import { obtenerCampos } from "@/modules/campos/campo.service";
import { obtenerCatalogos } from "@/modules/inventario/cristal.service";
import { FormularioCristal } from "../FormularioCristal";

export const metadata = { title: "Nuevo cristal" };

export default async function PaginaNuevoCristal() {
  await verificarSesion();
  await connection(); // los catálogos y los campos se leen en cada visita, no al compilar
  const [catalogos, campos] = await Promise.all([obtenerCatalogos(), obtenerCampos("CRISTAL")]);
  return (
    <>
      <EncabezadoPagina seccion="Stock" titulo="Nuevo cristal" />
      <FormularioCristal catalogos={catalogos} campos={campos} />
    </>
  );
}
