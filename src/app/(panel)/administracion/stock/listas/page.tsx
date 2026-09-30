import { tarjeta } from "@/components/ui";
import { requerirRol } from "@/lib/sesion";
import { obtenerListas } from "@/modules/campos/lista.service";
import { BloqueLista } from "./BloqueLista";

export const metadata = { title: "Administración · Listas de Stock" };

function Seccion({ id, titulo, descripcion, children }: { id: string; titulo: string; descripcion: string; children: React.ReactNode }) {
  return (
    <section id={id} className={`${tarjeta} scroll-mt-6 space-y-3 p-5`}>
      <div>
        <h2 className="font-display font-bold">{titulo}</h2>
        <p className="text-sm text-texto-suave">{descripcion}</p>
      </div>
      {children}
    </section>
  );
}

export default async function PaginaListasStock() {
  await requerirRol("ADMIN");
  const { marcas, tipos, ubicaciones, marcasVehiculo } = await obtenerListas();

  return (
    <div className="space-y-6">
      <Seccion id="marcas" titulo="Marcas de cristal" descripcion="Pilkington, Fuyao, Vitro… Lo desactivado deja de ofrecerse al cargar un cristal.">
        <BloqueLista lista="marcas" items={marcas.map((m) => ({ id: m.id, nombre: m.nombre, activo: m.activo, enUso: m._count.cristales }))} />
      </Seccion>

      <Seccion id="tipos" titulo="Tipos de cristal" descripcion="Laminado, templado, laminado acústico…">
        <BloqueLista lista="tipos" items={tipos.map((t) => ({ id: t.id, nombre: t.nombre, activo: t.activo, enUso: t._count.cristales }))} />
      </Seccion>

      <Seccion id="ubicaciones" titulo="Ubicaciones en el vehículo" descripcion="Parabrisas, luneta, puertas… El orden de esta lista es el orden en el que se ofrecen.">
        <BloqueLista
          lista="ubicaciones"
          items={ubicaciones.map((u) => ({ id: u.id, nombre: u.nombre, activo: u.activo, enUso: u._count.cristales, tieneLado: u.tieneLado }))}
        />
      </Seccion>

      <Seccion id="marcasVehiculo" titulo="Marcas y modelos de vehículo" descripcion="Se usan para indicar con qué vehículos es compatible cada cristal.">
        <BloqueLista
          lista="marcasVehiculo"
          items={marcasVehiculo.map((m) => ({ id: m.id, nombre: m.nombre, activo: m.activo, enUso: m.modelos.length }))}
        />
        <div className="space-y-2 pt-2">
          {marcasVehiculo.map((m) => (
            <details key={m.id} className="rounded-lg border border-borde p-3">
              <summary className="cursor-pointer text-sm font-semibold">
                Modelos de {m.nombre} <span className="font-normal text-texto-suave">({m.modelos.length})</span>
              </summary>
              <div className="pt-3">
                <BloqueLista
                  lista="modelos"
                  marcaId={m.id}
                  items={m.modelos.map((mo) => ({ id: mo.id, nombre: mo.nombre, activo: mo.activo, enUso: mo._count.compatibilidades }))}
                />
              </div>
            </details>
          ))}
        </div>
      </Seccion>
    </div>
  );
}
