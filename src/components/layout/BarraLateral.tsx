"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, ExternalLink, LayoutDashboard, LogOut, Package, SlidersHorizontal, UserCog, Wrench } from "lucide-react";
import { salir } from "@/app/(auth)/login/acciones";
import type { Rol } from "@/modules/usuarios/reglas";

const secciones = [
  { href: "/", etiqueta: "Panel", Icono: LayoutDashboard },
  { href: "/turnos", etiqueta: "Turnos", Icono: CalendarClock },
  { href: "/stock", etiqueta: "Stock", Icono: Package },
  { href: "/servicios", etiqueta: "Servicios", Icono: Wrench, soloAdmin: true },
  { href: "/usuarios", etiqueta: "Usuarios", Icono: UserCog, soloAdmin: true },
  { href: "/administracion", etiqueta: "Administración", Icono: SlidersHorizontal, soloAdmin: true },
];

export function BarraLateral({ usuario }: { usuario: { nombre: string; rol: Rol } }) {
  const ruta = usePathname();
  const activa = (href: string) => (href === "/" ? ruta === "/" : ruta.startsWith(href));
  const visibles = secciones.filter((s) => !s.soloAdmin || usuario.rol === "ADMIN");

  return (
    <aside className="border-b border-grafito-800 bg-grafito-900 text-grafito-100 md:sticky md:top-0 md:flex md:h-dvh md:w-60 md:shrink-0 md:flex-col md:border-r md:border-b-0">
      <Link href="/" className="flex items-center gap-3 px-5 py-4 md:py-6">
        <Image src="/brand/logo-amarillo.png" alt="" width={56} height={40} className="h-10 w-auto" priority />
        <span className="font-display text-sm leading-tight font-extrabold tracking-wide text-marca uppercase">
          Parabrisas
          <br />
          Catamarca
        </span>
      </Link>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:pb-0">
        {visibles.map(({ href, etiqueta, Icono }) => (
          <Link
            key={href}
            href={href}
            aria-current={activa(href) ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
              activa(href) ? "bg-marca text-sobre-marca" : "text-grafito-300 hover:bg-grafito-800 hover:text-white"
            }`}
          >
            <Icono className="size-4" aria-hidden />
            {etiqueta}
          </Link>
        ))}
      </nav>

      <Link
        href="/reservar"
        target="_blank"
        className="m-3 hidden items-center gap-2 rounded-lg border border-grafito-700 px-3 py-2 text-xs text-grafito-300 hover:border-marca hover:text-marca md:flex"
      >
        <ExternalLink className="size-3.5" aria-hidden />
        Página pública de turnos
      </Link>

      <div className="flex items-center justify-between gap-3 border-t border-grafito-800 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{usuario.nombre}</p>
          <p className="text-xs text-grafito-400">{usuario.rol === "ADMIN" ? "Administrador" : "Empleado"}</p>
        </div>
        <form action={salir}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-grafito-300 hover:bg-grafito-800 hover:text-white"
          >
            <LogOut className="size-3.5" aria-hidden />
            Salir
          </button>
        </form>
      </div>
    </aside>
  );
}
