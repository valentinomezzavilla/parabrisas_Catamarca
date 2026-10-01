import Image from "next/image";
import Link from "next/link";
import type { Rol } from "@/modules/usuarios/reglas";
import { inicialDe } from "./navegacion";

/** Barra superior de celular: marca a la izquierda y la inicial del usuario a la derecha. */
export function BarraSuperiorMovil({ usuario }: { usuario: { nombre: string; rol: Rol } }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-grafito-800 bg-grafito-900/95 px-4 py-2.5 backdrop-blur md:hidden">
      <Link href="/" aria-label="Parabrisas Catamarca, inicio" className="flex items-center gap-2.5">
        <Image src="/brand/logo-amarillo.png" alt="" width={56} height={40} className="h-8 w-auto" priority />
        <span className="font-display text-xs leading-tight font-extrabold tracking-wide text-marca uppercase">
          Parabrisas
          <br />
          Catamarca
        </span>
      </Link>
      <span
        title={usuario.nombre}
        className="flex size-9 items-center justify-center rounded-full bg-marca font-display text-sm font-extrabold text-sobre-marca"
      >
        <span aria-hidden>{inicialDe(usuario.nombre)}</span>
        <span className="sr-only">{usuario.nombre}</span>
      </span>
    </header>
  );
}
