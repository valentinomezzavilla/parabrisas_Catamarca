import { BarraInferior } from "@/components/layout/BarraInferior";
import { BarraLateral } from "@/components/layout/BarraLateral";
import { BarraSuperiorMovil } from "@/components/layout/BarraSuperiorMovil";
import { verificarSesion } from "@/lib/sesion";

export default async function LayoutPanel({ children }: { children: React.ReactNode }) {
  const usuario = await verificarSesion();
  const datos = { nombre: usuario.nombre, rol: usuario.rol };

  return (
    <div className="min-h-dvh md:flex">
      <BarraLateral usuario={datos} />
      <div className="flex min-w-0 flex-1 flex-col">
        <BarraSuperiorMovil usuario={datos} />
        {/* En celular, espacio extra abajo para que la barra fija no tape el final de la página. */}
        <main className="flex-1 px-4 pt-5 pb-28 md:px-8 md:py-8 lg:px-10">
          <div className="mx-auto max-w-6xl space-y-6 md:space-y-8">{children}</div>
        </main>
      </div>
      <BarraInferior usuario={datos} />
    </div>
  );
}
