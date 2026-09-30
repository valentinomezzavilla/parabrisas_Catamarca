import { BarraLateral } from "@/components/layout/BarraLateral";
import { verificarSesion } from "@/lib/sesion";

export default async function LayoutPanel({ children }: { children: React.ReactNode }) {
  const usuario = await verificarSesion();

  return (
    <div className="min-h-dvh md:flex">
      <BarraLateral usuario={{ nombre: usuario.nombre, rol: usuario.rol }} />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-8">
        <div className="mx-auto max-w-6xl space-y-8">{children}</div>
      </main>
    </div>
  );
}
