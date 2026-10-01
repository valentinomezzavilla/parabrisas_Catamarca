import { requerirRol } from "@/lib/sesion";
import { TablaCampos } from "../_campos/TablaCampos";

export const metadata = { title: "Administración · Campos de Stock" };

export default async function PaginaCamposStock({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  await requerirRol("ADMIN");
  const { aviso } = await searchParams;
  return <TablaCampos modulo="stock" aviso={aviso} />;
}
