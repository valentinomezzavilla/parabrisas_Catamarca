import { notFound } from "next/navigation";
import { EncabezadoPagina } from "@/components/ui";
import { obtenerCatalogos, obtenerCristal } from "@/modules/inventario/cristal.service";
import { FormularioCristal } from "../../FormularioCristal";
import { verificarSesion } from "@/lib/sesion";

export const metadata = { title: "Editar cristal" };

const aNumero = (v: { toString(): string } | null) => (v === null ? null : Number(v));

export default async function PaginaEditarCristal({ params }: { params: Promise<{ id: string }> }) {
  await verificarSesion();
  const { id } = await params;
  const [cristal, catalogos] = await Promise.all([obtenerCristal(id), obtenerCatalogos()]);
  if (!cristal) notFound();

  return (
    <>
      <EncabezadoPagina seccion="Stock" titulo={`Editar ${cristal.codigo}`} descripcion={cristal.descripcion} />
      <FormularioCristal
        catalogos={catalogos}
        cristal={{
          ...cristal,
          // Los Decimal de Prisma no se pueden pasar a un componente de cliente.
          espesorMm: aNumero(cristal.espesorMm),
          costo: aNumero(cristal.costo),
          precioVenta: aNumero(cristal.precioVenta),
          caracteristicas: cristal.caracteristicas.map(({ caracteristicaId, valor }) => ({ caracteristicaId, valor })),
          compatibilidades: cristal.compatibilidades.map(({ modeloId, anioDesde, anioHasta, carroceria }) => ({
            modeloId,
            anioDesde,
            anioHasta,
            carroceria,
          })),
        }}
      />
    </>
  );
}
