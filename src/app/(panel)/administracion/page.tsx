import Link from "next/link";
import { ArrowRight, CalendarClock, Package, Wrench } from "lucide-react";
import { EncabezadoPagina, Insignia, tarjeta } from "@/components/ui";
import { requerirRol } from "@/lib/sesion";

export const metadata = { title: "Administración" };

const modulos = [
  {
    href: "/administracion/stock",
    titulo: "Stock",
    descripcion: "Campos y listas de los cristales: marcas, tipos, ubicaciones, medidas, precios y campos propios.",
    Icono: Package,
    disponible: true,
  },
  {
    href: "/administracion/servicios",
    titulo: "Servicios",
    descripcion: "Campos de los servicios: duración, capacidad, precio y campos propios.",
    Icono: Wrench,
    disponible: false,
  },
  {
    href: "/administracion/turnos",
    titulo: "Turnos y clientes",
    descripcion: "Campos del turno y del cliente, también los del formulario público de reservas.",
    Icono: CalendarClock,
    disponible: false,
  },
];

export default async function PaginaAdministracion() {
  await requerirRol("ADMIN");

  return (
    <>
      <EncabezadoPagina
        seccion="Administración"
        titulo="¿Qué querés administrar?"
        descripcion="Elegí un módulo para ver, renombrar, ocultar y sumar campos, y para administrar sus listas de opciones."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modulos.map(({ href, titulo, descripcion, Icono, disponible }) => {
          const contenido = (
            <>
              <div className="flex items-center justify-between">
                <Icono className="size-6 text-acento" aria-hidden />
                {disponible ? <ArrowRight className="size-4 text-texto-suave" aria-hidden /> : <Insignia>Próximamente</Insignia>}
              </div>
              <h2 className="mt-4 font-display text-xl font-extrabold">{titulo}</h2>
              <p className="mt-1 text-sm text-texto-suave">{descripcion}</p>
            </>
          );
          return disponible ? (
            <Link key={titulo} href={href} className={`${tarjeta} block p-5 transition-colors hover:border-amarillo-500`}>
              {contenido}
            </Link>
          ) : (
            <div key={titulo} aria-disabled="true" className={`${tarjeta} p-5 opacity-60`}>
              {contenido}
            </div>
          );
        })}
      </div>
    </>
  );
}
