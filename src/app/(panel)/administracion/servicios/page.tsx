import { requerirRol } from "@/lib/sesion";
import { TablaCampos } from "../_campos/TablaCampos";

export const metadata = { title: "Administración · Campos de Servicios" };

export default async function PaginaCamposServicios({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  await requerirRol("ADMIN");
  const { aviso } = await searchParams;
  return <TablaCampos modulo="servicios" aviso={aviso} />;
}
