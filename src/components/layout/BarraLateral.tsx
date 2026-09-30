"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, ExternalLink, LayoutDashboard, Package, Wrench } from "lucide-react";

const secciones = [
  { href: "/", etiqueta: "Panel", Icono: LayoutDashboard },
  { href: "/turnos", etiqueta: "Turnos", Icono: CalendarClock },
  { href: "/stock", etiqueta: "Stock", Icono: Package },
  { href: "/servicios", etiqueta: "Servicios", Icono: Wrench },
];

export function BarraLateral() {
  const ruta = usePathname();
  const activa = (href: string) => (href === "/" ? ruta === "/" : ruta.startsWith(href));

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
        {secciones.map(({ href, etiqueta, Icono }) => (
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
    </aside>
  );
}
