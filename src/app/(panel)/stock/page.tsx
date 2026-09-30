import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { boton, EncabezadoPagina, Insignia, input, tarjeta, Vacio } from "@/components/ui";
import { medidas, NOMBRE_LADO, pesos } from "@/lib/formato";
import { buscarCristales, obtenerCatalogos } from "@/modules/inventario/cristal.service";
import { verificarSesion } from "@/lib/sesion";

export const metadata = { title: "Stock" };

type Filtros = { texto?: string; modeloId?: string; anio?: string; ubicacionId?: string; tipoId?: string; stock?: string; bajas?: string };

export default async function PaginaStock({ searchParams }: { searchParams: Promise<Filtros> }) {
  await verificarSesion();
  const f = await searchParams;
  const anio = f.anio && /^\d{4}$/.test(f.anio) ? Number(f.anio) : undefined;
  const [catalogos, cristales] = await Promise.all([
    obtenerCatalogos(),
    buscarCristales({
      texto: f.texto || undefined,
      modeloId: f.modeloId || undefined,
      anio,
      ubicacionId: f.ubicacionId || undefined,
      tipoId: f.tipoId || undefined,
      soloConStock: f.stock === "1",
      incluirInactivos: f.bajas === "1",
    }),
  ]);
  const hayFiltros = Object.values(f).some(Boolean);
  const unidades = cristales.reduce((total, c) => total + c.cantidad, 0);

  return (
    <>
      <EncabezadoPagina
        seccion="Inventario"
        titulo="Stock de cristales"
        descripcion={`${cristales.length} ${cristales.length === 1 ? "artículo" : "artículos"} · ${unidades} ${unidades === 1 ? "unidad" : "unidades"}${hayFiltros ? " (filtrado)" : ""}`}
        acciones={
          <Link href="/stock/nuevo" className={boton.primario}>
            <Plus className="size-4" aria-hidden /> Nuevo cristal
          </Link>
        }
      />

      <form className={`${tarjeta} grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6`}>
        <input name="texto" defaultValue={f.texto} placeholder="Código o descripción" aria-label="Buscar por código o descripción" className={`${input} lg:col-span-2`} />
        <select name="modeloId" defaultValue={f.modeloId ?? ""} aria-label="Vehículo" className={input}>
          <option value="">Cualquier vehículo</option>
          {catalogos.marcasVehiculo.map((m) => (
            <optgroup key={m.id} label={m.nombre}>
              {m.modelos.map((mo) => <option key={mo.id} value={mo.id}>{m.nombre} {mo.nombre}</option>)}
            </optgroup>
          ))}
        </select>
        <input name="anio" type="number" defaultValue={f.anio} placeholder="Año" aria-label="Año del vehículo" className={input} />
        <select name="ubicacionId" defaultValue={f.ubicacionId ?? ""} aria-label="Ubicación" className={input}>
          <option value="">Toda ubicación</option>
          {catalogos.ubicaciones.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
        </select>
        <select name="tipoId" defaultValue={f.tipoId ?? ""} aria-label="Tipo" className={input}>
          <option value="">Todo tipo</option>
          {catalogos.tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
        <div className="flex flex-wrap items-center gap-4 text-sm sm:col-span-2 lg:col-span-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="stock" value="1" defaultChecked={f.stock === "1"} className="size-4 accent-amarillo-500" /> Solo con stock
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="bajas" value="1" defaultChecked={f.bajas === "1"} className="size-4 accent-amarillo-500" /> Incluir dados de baja
          </label>
        </div>
        <div className="flex gap-2 sm:col-span-2 lg:justify-end">
          {hayFiltros && <Link href="/stock" className={boton.fantasma}>Limpiar</Link>}
          <button className={boton.secundario}><Search className="size-4" aria-hidden /> Buscar</button>
        </div>
      </form>

      {cristales.length === 0 ? (
        <Vacio>{hayFiltros ? "No hay cristales que coincidan con la búsqueda." : "Todavía no hay cristales cargados."}</Vacio>
      ) : (
        <div className={`${tarjeta} overflow-x-auto`}>
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-borde text-left text-xs tracking-wide text-texto-suave uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Código</th>
                <th className="px-4 py-3 font-semibold">Descripción</th>
                <th className="px-4 py-3 font-semibold">Ubicación</th>
                <th className="px-4 py-3 font-semibold">Medidas</th>
                <th className="px-4 py-3 text-right font-semibold">Precio</th>
                <th className="px-4 py-3 text-right font-semibold">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde">
              {cristales.map((c) => {
                const bajo = c.cantidad <= c.stockMinimo;
                return (
                  <tr key={c.id} className={`hover:bg-grafito-500/5 ${c.activo ? "" : "opacity-50"}`}>
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link href={`/stock/${c.id}`} className="font-semibold hover:text-acento">{c.codigo}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/stock/${c.id}`} className="hover:underline">{c.descripcion}</Link>
                      <p className="text-xs text-texto-suave">{c.marca.nombre} · {c.tipo.nombre}{!c.activo && " · dado de baja"}</p>
                    </td>
                    <td className="px-4 py-3">{c.ubicacion.nombre} {NOMBRE_LADO[c.lado]}</td>
                    <td className="px-4 py-3 text-texto-suave">{medidas(c.anchoMm, c.altoMm, c.espesorMm)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{pesos(c.precioVenta)}</td>
                    <td className="px-4 py-3 text-right">
                      <Insignia tono={c.cantidad === 0 ? "peligro" : bajo ? "alerta" : "exito"}>{c.cantidad}</Insignia>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
