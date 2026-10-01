import { requerirRol } from "@/lib/sesion";
import { EditarCampo } from "../../../_campos/EditarCampo";

export const metadata = { title: "Administración · Editar campo" };

export default async function PaginaEditarCampo({ params }: { params: Promise<{ clave: string }> }) {
  await requerirRol("ADMIN");
  const { clave } = await params;
  return <EditarCampo modulo="stock" clave={clave} />;
}
