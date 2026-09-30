import { notFound } from "next/navigation";
import { EncabezadoPagina } from "@/components/ui";
import { verificarSesion } from "@/lib/sesion";
import { obtenerCampos } from "@/modules/campos/campo.service";
import type { Extras } from "@/modules/campos/tipos";
import { obtenerCatalogos, obtenerCristal } from "@/modules/inventario/cristal.service";
import { FormularioCristal } from "../../FormularioCristal";

export const metadata = { title: "Editar cristal" };

const aNumero = (v: { toString(): string } | null) => (v === null ? null : Number(v));

export default async function PaginaEditarCristal({ params }: { params: Promise<{ id: string }> }) {
  await verificarSesion();
  const { id } = await params;
  const cristal = await obtenerCristal(id);
  if (!cristal) notFound();

  // Lo que el cristal ya tiene guardado se ofrece aunque esté desactivado en las listas.
  const conservar = [
    cristal.marcaId,
    cristal.tipoId,
    cristal.ubicacionId,
    ...cristal.compatibilidades.flatMap((v) => [v.modeloId, v.modelo.marcaId]),
  ];
  const [catalogos, campos] = await Promise.all([obtenerCatalogos({ conservar }), obtenerCampos("CRISTAL")]);

  return (
    <>
      <EncabezadoPagina seccion="Stock" titulo={`Editar ${cristal.codigo}`} descripcion={cristal.descripcion} />
      <FormularioCristal
        catalogos={catalogos}
        campos={campos}
        cristal={{
          ...cristal,
          // Los Decimal de Prisma no se pueden pasar a un componente de cliente.
          espesorMm: aNumero(cristal.espesorMm),
          costo: aNumero(cristal.costo),
          precioVenta: aNumero(cristal.precioVenta),
          extras: cristal.extras as Extras,
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
