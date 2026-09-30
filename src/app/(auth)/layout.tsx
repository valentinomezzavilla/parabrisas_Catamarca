import Image from "next/image";

export default function LayoutAuth({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-grafito-900 px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Image src="/brand/logo-amarillo.png" alt="Parabrisas Catamarca" width={96} height={68} className="h-16 w-auto" priority />
          <p className="font-display text-lg font-extrabold tracking-wide text-marca uppercase">Panel de gestión</p>
        </div>
        <div className="rounded-tarjeta border border-borde bg-superficie p-6 text-texto">{children}</div>
      </div>
    </div>
  );
}
