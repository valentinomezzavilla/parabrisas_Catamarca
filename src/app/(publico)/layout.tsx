import Image from "next/image";
import Link from "next/link";

export default function LayoutPublico({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b-4 border-marca bg-grafito-900">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-5">
          <Link href="/reservar" aria-label="Parabrisas Catamarca, inicio de reservas">
            <Image src="/brand/logo-amarillo.png" alt="Parabrisas Catamarca" width={96} height={68} className="h-16 w-auto" priority />
          </Link>
          <div>
            <p className="font-display text-xl font-extrabold text-marca uppercase">Sacá tu turno</p>
            <p className="text-sm text-grafito-300">Elegí el servicio, el día y el horario que te quede cómodo.</p>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8">{children}</main>
      <footer className="border-t border-borde py-6 text-center text-xs text-texto-suave">Parabrisas Catamarca</footer>
    </div>
  );
}
