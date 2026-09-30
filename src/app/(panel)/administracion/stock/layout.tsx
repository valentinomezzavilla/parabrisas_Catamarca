import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { boton, EncabezadoPagina } from "@/components/ui";
import { requerirRol } from "@/lib/sesion";
import { PestanasAdmin } from "./PestanasAdmin";

export default async function LayoutAdministracionStock({ children }: { children: React.ReactNode }) {
  await requerirRol("ADMIN");
  return (
    <>
      <Link href="/administracion" className={`${boton.fantasma} ${boton.chico} -ml-2.5`}>
        <ArrowLeft className="size-3.5" aria-hidden /> Administración
      </Link>
      <EncabezadoPagina
        seccion="Administración"
        titulo="Stock"
        descripcion="Los cambios se aplican enseguida en el alta, la edición y la ficha de cada cristal."
      />
      <PestanasAdmin />
      {children}
    </>
  );
}
