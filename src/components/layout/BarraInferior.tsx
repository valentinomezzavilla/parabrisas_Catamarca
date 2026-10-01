"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink, LogOut, MoreHorizontal } from "lucide-react";
import { salir } from "@/app/(auth)/login/acciones";
import type { Rol } from "@/modules/usuarios/reglas";
import { esActiva, gruposVisibles, inicialDe, nombreDeRol } from "./navegacion";

/**
 * Navegación de celular (< 768 px): barra fija abajo con los tres accesos de todos los días y "Más",
 * que abre una hoja con el resto (Servicios, Usuarios, Administración), la página pública y "Salir".
 * Áreas táctiles de 64 px de alto y margen para el área segura de iOS.
 */
export function BarraInferior({ usuario }: { usuario: { nombre: string; rol: Rol } }) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [principal, ...resto] = gruposVisibles(usuario.rol);
  const secundarios = resto.flatMap((g) => g.items);
  const masActivo = secundarios.some((i) => esActiva(i.href, ruta));

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierto]);

  const estiloItem = (activo: boolean) =>
    `relative flex min-h-16 flex-col items-center justify-center gap-1 px-2 text-[11px] font-semibold transition-colors ${
      activo ? "text-marca" : "text-grafito-400 hover:text-white"
    }`;

  return (
    <>
      {abierto && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setAbierto(false)} aria-hidden />}

      {abierto && (
        <div
          id="menu-mas"
          role="dialog"
          aria-label="Más opciones"
          className="fixed inset-x-3 bottom-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)] z-50 rounded-2xl border border-grafito-700 bg-grafito-900 p-2 text-grafito-100 shadow-2xl md:hidden"
        >
          <ul className="space-y-1">
            {secundarios.map(({ href, etiqueta, Icono }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setAbierto(false)}
                  aria-current={esActiva(href, ruta) ? "page" : undefined}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${
                    esActiva(href, ruta) ? "bg-grafito-800 text-marca" : "hover:bg-grafito-800"
                  }`}
                >
                  <Icono className="size-5 shrink-0" />
                  {etiqueta}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/reservar"
                target="_blank"
                onClick={() => setAbierto(false)}
                className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold hover:bg-grafito-800"
              >
                <ExternalLink className="size-5 shrink-0" aria-hidden />
                Página pública de turnos
              </Link>
            </li>
          </ul>
          <div className="mt-2 flex items-center gap-3 border-t border-grafito-800 px-3 pt-3 pb-1">
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-marca font-display text-sm font-extrabold text-sobre-marca"
            >
              {inicialDe(usuario.nombre)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{usuario.nombre}</p>
              <p className="text-xs text-grafito-400">{nombreDeRol(usuario.rol)}</p>
            </div>
            <form action={salir}>
              <button type="submit" className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold hover:bg-grafito-800">
                <LogOut className="size-4" aria-hidden /> Salir
              </button>
            </form>
          </div>
        </div>
      )}

      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-grafito-800 bg-grafito-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-4">
          {principal.items.map(({ href, etiqueta, Icono }) => {
            const activa = esActiva(href, ruta);
            return (
              <li key={href}>
                <Link href={href} aria-current={activa ? "page" : undefined} onClick={() => setAbierto(false)} className={estiloItem(activa)}>
                  {activa && <span aria-hidden className="absolute inset-x-5 top-0 h-0.5 rounded-b-full bg-marca" />}
                  <Icono className="size-6" />
                  {etiqueta}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              aria-expanded={abierto}
              aria-controls="menu-mas"
              onClick={() => setAbierto((v) => !v)}
              className={`${estiloItem(masActivo || abierto)} w-full`}
            >
              {(masActivo || abierto) && <span aria-hidden className="absolute inset-x-5 top-0 h-0.5 rounded-b-full bg-marca" />}
              <MoreHorizontal className="size-6" />
              Más
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
