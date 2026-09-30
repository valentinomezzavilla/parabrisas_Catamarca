"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LISTAS = "/administracion/stock/listas";

export function PestanasAdmin() {
  const ruta = usePathname();
  // "Campos" cubre también /campos/nuevo y /campos/[clave].
  const pestanas = [
    { href: "/administracion/stock", etiqueta: "Campos", activa: !ruta.startsWith(LISTAS) },
    { href: LISTAS, etiqueta: "Listas", activa: ruta.startsWith(LISTAS) },
  ];
  return (
    <nav aria-label="Secciones de Stock" className="flex gap-1 border-b border-borde">
      {pestanas.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          aria-current={p.activa ? "page" : undefined}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
            p.activa ? "border-amarillo-500 text-texto" : "border-transparent text-texto-suave hover:text-texto"
          }`}
        >
          {p.etiqueta}
        </Link>
      ))}
    </nav>
  );
}
