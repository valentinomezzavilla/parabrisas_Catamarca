"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { salir } from "@/app/(auth)/login/acciones";
import type { Rol } from "@/modules/usuarios/reglas";
import { esActiva, gruposVisibles, inicialDe, nombreDeRol } from "./navegacion";

/**
 * Menú lateral. Desde 1024 px se muestra completo; en tablet (768–1023 px) es un riel de iconos
 * (con el nombre en `title` y `aria-label`); en celular no se usa: ahí están la barra superior y la inferior.
 */
export function BarraLateral({ usuario }: { usuario: { nombre: string; rol: Rol } }) {
  const ruta = usePathname();
  const grupos = gruposVisibles(usuario.rol);

  return (
    <aside className="hidden border-r border-grafito-800 bg-grafito-900 text-grafito-100 md:sticky md:top-0 md:flex md:h-dvh md:w-16 md:shrink-0 md:flex-col lg:w-64">
      <Link
        href="/"
        aria-label="Parabrisas Catamarca, inicio"
        className="flex items-center justify-center gap-3 px-3 py-5 lg:justify-start lg:px-5 lg:py-6"
      >
        <Image src="/brand/logo-amarillo.png" alt="" width={56} height={40} className="h-9 w-auto lg:h-11" priority />
        <span className="hidden font-display text-sm leading-tight font-extrabold tracking-wide text-marca uppercase lg:block">
          Parabrisas
          <br />
          Catamarca
        </span>
      </Link>

      <nav aria-label="Principal" className="flex-1 space-y-5 overflow-y-auto px-2 py-2 lg:px-3">
        {grupos.map((g) => (
          <div key={g.titulo}>
            <p className="mb-1.5 hidden px-3 text-[11px] font-semibold tracking-widest text-grafito-500 uppercase lg:block">
              {g.titulo}
            </p>
            <ul className="space-y-1">
              {g.items.map(({ href, etiqueta, Icono }) => {
                const activa = esActiva(href, ruta);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      title={etiqueta}
                      aria-label={etiqueta}
                      aria-current={activa ? "page" : undefined}
                      className={`relative flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors lg:justify-start ${
                        activa ? "bg-grafito-800 text-white" : "text-grafito-300 hover:bg-grafito-800/70 hover:text-white"
                      }`}
                    >
                      {activa && <span aria-hidden className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-marca" />}
                      <Icono className={`size-[1.15rem] shrink-0 ${activa ? "text-marca" : ""}`} />
                      <span className="hidden lg:inline">{etiqueta}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <Link
        href="/reservar"
        target="_blank"
        title="Página pública de turnos"
        aria-label="Página pública de turnos (se abre en una pestaña nueva)"
        className="mx-2 mb-2 flex items-center justify-center gap-2 rounded-lg border border-grafito-700 px-3 py-2 text-xs text-grafito-300 hover:border-marca hover:text-marca lg:mx-3 lg:justify-start"
      >
        <ExternalLink className="size-3.5 shrink-0" aria-hidden />
        <span className="hidden lg:inline">Página pública de turnos</span>
      </Link>

      <div className="flex flex-col items-center gap-2 border-t border-grafito-800 p-2 lg:flex-row lg:gap-3 lg:p-3">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-marca font-display text-sm font-extrabold text-sobre-marca"
        >
          {inicialDe(usuario.nombre)}
        </span>
        <div className="hidden min-w-0 flex-1 lg:block">
          <p className="truncate text-sm font-semibold text-white">{usuario.nombre}</p>
          <p className="text-xs text-grafito-400">{nombreDeRol(usuario.rol)}</p>
        </div>
        <form action={salir}>
          <button
            type="submit"
            title="Salir"
            aria-label="Salir"
            className="flex size-9 items-center justify-center rounded-lg text-grafito-300 hover:bg-grafito-800 hover:text-white lg:size-auto lg:gap-1.5 lg:px-2.5 lg:py-1.5 lg:text-xs lg:font-semibold"
          >
            <LogOut className="size-4 shrink-0" aria-hidden />
            <span className="hidden lg:inline">Salir</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
