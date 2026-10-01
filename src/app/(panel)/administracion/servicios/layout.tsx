import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { boton, EncabezadoPagina } from "@/components/ui";
import { requerirRol } from "@/lib/sesion";

export default async function LayoutAdministracionServicios({ children }: { children: React.ReactNode }) {
  await requerirRol("ADMIN");
  return (
    <>
      <Link href="/administracion" className={`${boton.fantasma} ${boton.chico} -ml-2.5`}>
        <ArrowLeft className="size-3.5" aria-hidden /> Administración
      </Link>
      <EncabezadoPagina
        seccion="Administración"
        titulo="Servicios"
        descripcion="Sumá datos propios a los servicios. Se completan al crear o editar un servicio y los ve solo el personal."
      />
      {children}
    </>
  );
}
