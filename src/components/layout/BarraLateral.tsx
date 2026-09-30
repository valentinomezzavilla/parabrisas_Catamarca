import Image from "next/image";
import Link from "next/link";
import { CalendarClock, LayoutDashboard, Package, Wrench } from "lucide-react";

const secciones = [
  { href: "/", etiqueta: "Panel", Icono: LayoutDashboard, disponible: true },
  { href: "/stock", etiqueta: "Stock", Icono: Package, disponible: false },
  { href: "/turnos", etiqueta: "Turnos", Icono: CalendarClock, disponible: false },
  { href: "/servicios", etiqueta: "Servicios", Icono: Wrench, disponible: false },
];

export function BarraLateral() {
  return (
    <aside className="border-b border-grafito-800 bg-grafito-900 text-grafito-100 md:sticky md:border-r md:border-b-0 md:top-0 md:flex md:h-dvh md:w-64 md:flex-col">
      <div className="flex items-center gap-3 px-5 py-4 md:py-6">
        <Image src="/brand/logo-amarillo.png" alt="Parabrisas Catamarca" width={56} height={40} priority />
        <span className="font-display text-sm leading-tight font-extrabold tracking-wide text-marca uppercase">
          Parabrisas
          <br />
          Catamarca
        </span>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
        {secciones.map(({ href, etiqueta, Icono, disponible }) =>
          disponible ? (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg bg-marca px-3 py-2 text-sm font-semibold text-sobre-marca"
            >
              <Icono className="size-4" aria-hidden />
              {etiqueta}
            </Link>
          ) : (
            <span
              key={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm whitespace-nowrap text-grafito-400"
              title="Próximamente"
            >
              <Icono className="size-4" aria-hidden />
              {etiqueta}
              <span className="ml-auto rounded bg-grafito-800 px-1.5 py-0.5 text-[10px] uppercase">pronto</span>
            </span>
          ),
        )}
      </nav>
    </aside>
  );
}
