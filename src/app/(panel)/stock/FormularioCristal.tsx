"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Aviso, boton, Campo, input, tarjeta } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import type { Catalogos } from "@/modules/inventario/cristal.service";
import { guardarCristal } from "./acciones";

export interface CristalEditable {
  id: string;
  codigo: string;
  codigoFabricante: string | null;
  descripcion: string;
  marcaId: string;
  tipoId: string;
  ubicacionId: string;
  lado: "NO_APLICA" | "IZQUIERDO" | "DERECHO";
  anchoMm: number | null;
  altoMm: number | null;
  espesorMm: number | null;
  stockMinimo: number;
  ubicacionDeposito: string | null;
  costo: number | null;
  precioVenta: number | null;
  caracteristicas: { caracteristicaId: string; valor: string }[];
  compatibilidades: Compatibilidad[];
}

interface Compatibilidad {
  modeloId: string;
  anioDesde: number | null;
  anioHasta: number | null;
  carroceria: string | null;
}

const COMPATIBILIDAD_VACIA: Compatibilidad = { modeloId: "", anioDesde: null, anioHasta: null, carroceria: null };

export function FormularioCristal({ catalogos, cristal }: { catalogos: Catalogos; cristal?: CristalEditable }) {
  const { estado, enviar, pendiente, error } = useFormularioAccion(guardarCristal.bind(null, cristal?.id ?? null));
  const [ubicacionId, setUbicacionId] = useState(cristal?.ubicacionId ?? catalogos.ubicaciones[0]?.id ?? "");
  const [compat, setCompat] = useState<Compatibilidad[]>(cristal?.compatibilidades ?? []);
  const tieneLado = catalogos.ubicaciones.find((u) => u.id === ubicacionId)?.tieneLado ?? false;

  const valorCaracteristica = (id: string) => cristal?.caracteristicas.find((c) => c.caracteristicaId === id)?.valor;
  const editarCompat = (i: number, cambios: Partial<Compatibilidad>) =>
    setCompat(compat.map((c, j) => (j === i ? { ...c, ...cambios } : c)));
  const anio = (v: string) => (v === "" ? null : Number(v));

  // Solo se envían las filas con modelo elegido; los años vacíos viajan como undefined.
  const compatParaEnviar = compat
    .filter((c) => c.modeloId)
    .map((c) => ({
      modeloId: c.modeloId,
      anioDesde: c.anioDesde ?? undefined,
      anioHasta: c.anioHasta ?? undefined,
      carroceria: c.carroceria || undefined,
    }));

  return (
    <form onSubmit={enviar} className="space-y-6" noValidate>
      {estado.mensaje && !estado.ok && <Aviso tono="peligro">{estado.mensaje}</Aviso>}
      <input type="hidden" name="compatibilidades" value={JSON.stringify(compatParaEnviar)} />

      <section className={`${tarjeta} grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4`}>
        <h2 className="font-display font-bold sm:col-span-2 lg:col-span-4">Identificación</h2>
        <Campo etiqueta="Código interno" htmlFor="codigo" error={error("codigo")} ayuda="Ej. PB-HIL-16">
          <input id="codigo" name="codigo" defaultValue={cristal?.codigo} className={`${input} uppercase`} aria-invalid={!!error("codigo")} />
        </Campo>
        <Campo etiqueta="Código de fabricante" htmlFor="codigoFabricante" error={error("codigoFabricante")} ayuda="Eurocode o catálogo">
          <input id="codigoFabricante" name="codigoFabricante" defaultValue={cristal?.codigoFabricante ?? ""} className={input} />
        </Campo>
        <Campo etiqueta="Descripción" htmlFor="descripcion" error={error("descripcion")} className="sm:col-span-2">
          <input id="descripcion" name="descripcion" defaultValue={cristal?.descripcion} placeholder="Parabrisas Hilux 2016+ con sensor" className={input} aria-invalid={!!error("descripcion")} />
        </Campo>
      </section>

      <section className={`${tarjeta} grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4`}>
        <h2 className="font-display font-bold sm:col-span-2 lg:col-span-4">Características principales</h2>
        <Campo etiqueta="Marca" htmlFor="marcaId" error={error("marcaId")}>
          <select id="marcaId" name="marcaId" defaultValue={cristal?.marcaId ?? ""} className={input}>
            <option value="" disabled>Elegir…</option>
            {catalogos.marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Tipo de cristal" htmlFor="tipoId" error={error("tipoId")}>
          <select id="tipoId" name="tipoId" defaultValue={cristal?.tipoId ?? ""} className={input}>
            <option value="" disabled>Elegir…</option>
            {catalogos.tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Ubicación en el vehículo" htmlFor="ubicacionId" error={error("ubicacionId")}>
          <select id="ubicacionId" name="ubicacionId" value={ubicacionId} onChange={(e) => setUbicacionId(e.target.value)} className={input}>
            {catalogos.ubicaciones.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Lado" htmlFor="lado" error={error("lado")}>
          <select id="lado" name="lado" defaultValue={cristal?.lado ?? "NO_APLICA"} disabled={!tieneLado} className={input}>
            <option value="NO_APLICA">No aplica</option>
            <option value="IZQUIERDO">Izquierdo</option>
            <option value="DERECHO">Derecho</option>
          </select>
        </Campo>
        <Campo etiqueta="Ancho (mm)" htmlFor="anchoMm" error={error("anchoMm")}>
          <input id="anchoMm" name="anchoMm" type="number" min={1} defaultValue={cristal?.anchoMm ?? ""} className={input} />
        </Campo>
        <Campo etiqueta="Alto (mm)" htmlFor="altoMm" error={error("altoMm")}>
          <input id="altoMm" name="altoMm" type="number" min={1} defaultValue={cristal?.altoMm ?? ""} className={input} />
        </Campo>
        <Campo etiqueta="Espesor (mm)" htmlFor="espesorMm" error={error("espesorMm")}>
          <input id="espesorMm" name="espesorMm" type="number" min={0} step="0.1" defaultValue={cristal?.espesorMm ?? ""} className={input} />
        </Campo>
      </section>

      {catalogos.caracteristicas.length > 0 && (
        <section className={`${tarjeta} space-y-4 p-5`}>
          <h2 className="font-display font-bold">Características adicionales</h2>
          <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {catalogos.caracteristicas.map((c) => {
              const valor = valorCaracteristica(c.id);
              const nombre = `car_${c.id}`;
              if (c.tipoDato === "BOOLEANO")
                return (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name={nombre} defaultChecked={valor === "true"} className="size-4 accent-amarillo-500" />
                    {c.nombre}
                  </label>
                );
              return (
                <Campo key={c.id} etiqueta={c.unidad ? `${c.nombre} (${c.unidad})` : c.nombre} htmlFor={nombre}>
                  {c.tipoDato === "OPCION" ? (
                    <select id={nombre} name={nombre} defaultValue={valor ?? ""} className={input}>
                      <option value="">—</option>
                      {c.opciones.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input id={nombre} name={nombre} type={c.tipoDato === "NUMERO" ? "number" : "text"} defaultValue={valor ?? ""} className={input} />
                  )}
                </Campo>
              );
            })}
          </div>
        </section>
      )}

      <section className={`${tarjeta} space-y-4 p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display font-bold">Vehículos compatibles</h2>
            <p className="text-sm text-texto-suave">Dejá “hasta” vacío si el modelo sigue vigente.</p>
          </div>
          <button type="button" onClick={() => setCompat([...compat, COMPATIBILIDAD_VACIA])} className={`${boton.secundario} ${boton.chico}`}>
            <Plus className="size-3.5" aria-hidden /> Agregar vehículo
          </button>
        </div>
        {error("compatibilidades") && <p className="text-sm text-peligro">{error("compatibilidades")}</p>}
        {compat.length === 0 && <p className="text-sm text-texto-suave">Sin vehículos cargados.</p>}
        <div className="space-y-3">
          {compat.map((c, i) => {
            const fallo = error(`compatibilidades.${i}.anioHasta`) ?? error(`compatibilidades.${i}.anioDesde`) ?? error(`compatibilidades.${i}.modeloId`);
            return (
              <div key={i} className="space-y-1">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-[2fr_1fr_1fr_2fr_auto]">
                  <select aria-label="Modelo" value={c.modeloId} onChange={(e) => editarCompat(i, { modeloId: e.target.value })} className={`${input} col-span-2 sm:col-span-1`}>
                    <option value="">Elegir modelo…</option>
                    {catalogos.marcasVehiculo.map((m) => (
                      <optgroup key={m.id} label={m.nombre}>
                        {m.modelos.map((mo) => <option key={mo.id} value={mo.id}>{m.nombre} {mo.nombre}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <input aria-label="Año desde" type="number" placeholder="Desde" value={c.anioDesde ?? ""} onChange={(e) => editarCompat(i, { anioDesde: anio(e.target.value) })} className={input} />
                  <input aria-label="Año hasta" type="number" placeholder="Hasta" value={c.anioHasta ?? ""} onChange={(e) => editarCompat(i, { anioHasta: anio(e.target.value) })} className={input} />
                  <input aria-label="Carrocería o versión" placeholder="Carrocería / versión" value={c.carroceria ?? ""} onChange={(e) => editarCompat(i, { carroceria: e.target.value })} className={input} />
                  <button type="button" onClick={() => setCompat(compat.filter((_, j) => j !== i))} aria-label="Quitar vehículo" className={`${boton.fantasma} ${boton.chico}`}>
                    <X className="size-4" />
                  </button>
                </div>
                {fallo && <p className="text-xs text-peligro">{fallo}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section className={`${tarjeta} grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-5`}>
        <h2 className="font-display font-bold sm:col-span-2 lg:col-span-5">Stock y precios</h2>
        {!cristal && (
          <Campo etiqueta="Cantidad inicial" htmlFor="cantidadInicial" error={error("cantidadInicial")}>
            <input id="cantidadInicial" name="cantidadInicial" type="number" min={0} defaultValue={0} className={input} />
          </Campo>
        )}
        <Campo etiqueta="Stock mínimo" htmlFor="stockMinimo" error={error("stockMinimo")} ayuda="Avisa cuando hay que reponer">
          <input id="stockMinimo" name="stockMinimo" type="number" min={0} defaultValue={cristal?.stockMinimo ?? 1} className={input} />
        </Campo>
        <Campo etiqueta="Ubicación en depósito" htmlFor="ubicacionDeposito" error={error("ubicacionDeposito")}>
          <input id="ubicacionDeposito" name="ubicacionDeposito" placeholder="Rack A-3" defaultValue={cristal?.ubicacionDeposito ?? ""} className={input} />
        </Campo>
        <Campo etiqueta="Costo" htmlFor="costo" error={error("costo")}>
          <input id="costo" name="costo" type="number" min={0} step="0.01" defaultValue={cristal?.costo ?? ""} className={input} />
        </Campo>
        <Campo etiqueta="Precio de venta" htmlFor="precioVenta" error={error("precioVenta")}>
          <input id="precioVenta" name="precioVenta" type="number" min={0} step="0.01" defaultValue={cristal?.precioVenta ?? ""} className={input} />
        </Campo>
        {cristal && <p className="self-end text-xs text-texto-suave lg:col-span-1">La cantidad se modifica con movimientos de stock, desde la ficha.</p>}
      </section>

      <div className="flex justify-end gap-2">
        <Link href={cristal ? `/stock/${cristal.id}` : "/stock"} className={boton.secundario}>Cancelar</Link>
        <button type="submit" disabled={pendiente} className={boton.primario}>
          {pendiente ? "Guardando…" : cristal ? "Guardar cambios" : "Dar de alta"}
        </button>
      </div>
    </form>
  );
}
