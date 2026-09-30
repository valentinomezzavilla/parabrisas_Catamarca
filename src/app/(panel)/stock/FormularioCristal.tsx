"use client";

import Link from "next/link";
import { Fragment, useState, type ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { CampoPersonalizado } from "@/components/campos/CampoPersonalizado";
import { Aviso, boton, Campo, input, tarjeta } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import type { CampoFinal } from "@/modules/campos/combinar";
import { SECCIONES, type SeccionCampo } from "@/modules/campos/registro";
import { nombreInput, type Extras } from "@/modules/campos/tipos";
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
  extras: Extras;
  compatibilidades: Compatibilidad[];
}

interface Compatibilidad {
  modeloId: string;
  anioDesde: number | null;
  anioHasta: number | null;
  carroceria: string | null;
}

const COMPATIBILIDAD_VACIA: Compatibilidad = { modeloId: "", anioDesde: null, anioHasta: null, carroceria: null };
const ANCHO: Record<string, string> = { descripcion: "sm:col-span-2" };

export function FormularioCristal({
  catalogos,
  campos,
  cristal,
}: {
  catalogos: Catalogos;
  campos: CampoFinal[];
  cristal?: CristalEditable;
}) {
  const { estado, enviar, pendiente, error } = useFormularioAccion(guardarCristal.bind(null, cristal?.id ?? null));
  const [ubicacionId, setUbicacionId] = useState(cristal?.ubicacionId ?? catalogos.ubicaciones[0]?.id ?? "");
  const [compat, setCompat] = useState<Compatibilidad[]>(cristal?.compatibilidades ?? []);
  const tieneLado = catalogos.ubicaciones.find((u) => u.id === ubicacionId)?.tieneLado ?? false;

  const visibles = campos.filter((c) => c.visible && !c.archivado);
  const deSeccion = (s: SeccionCampo) => visibles.filter((c) => c.seccion === s);
  const titulo = (s: SeccionCampo) => SECCIONES.find((x) => x.id === s)!.etiqueta;

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

  /** Control de un campo del sistema. La etiqueta, la ayuda, el orden y la visibilidad vienen de `campos`. */
  const sistema = (c: CampoFinal): ReactNode => {
    const base = { etiqueta: c.etiqueta, ayuda: c.ayuda ?? undefined, className: ANCHO[c.clave] };
    const numerico = (clave: "anchoMm" | "altoMm" | "espesorMm" | "costo" | "precioVenta", extra: object) => (
      <Campo {...base} htmlFor={clave} error={error(clave)}>
        <input id={clave} name={clave} type="number" defaultValue={cristal?.[clave] ?? ""} className={input} {...extra} />
      </Campo>
    );
    switch (c.clave) {
      case "codigo":
        return (
          <Campo {...base} htmlFor="codigo" error={error("codigo")}>
            <input id="codigo" name="codigo" defaultValue={cristal?.codigo} className={`${input} uppercase`} aria-invalid={!!error("codigo")} />
          </Campo>
        );
      case "codigoFabricante":
        return (
          <Campo {...base} htmlFor="codigoFabricante" error={error("codigoFabricante")}>
            <input id="codigoFabricante" name="codigoFabricante" defaultValue={cristal?.codigoFabricante ?? ""} className={input} />
          </Campo>
        );
      case "descripcion":
        return (
          <Campo {...base} htmlFor="descripcion" error={error("descripcion")}>
            <input id="descripcion" name="descripcion" defaultValue={cristal?.descripcion} placeholder="Parabrisas Hilux 2016+ con sensor" className={input} aria-invalid={!!error("descripcion")} />
          </Campo>
        );
      case "marcaId":
        return (
          <Campo {...base} htmlFor="marcaId" error={error("marcaId")}>
            <select id="marcaId" name="marcaId" defaultValue={cristal?.marcaId ?? ""} className={input}>
              <option value="" disabled>Elegir…</option>
              {catalogos.marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </Campo>
        );
      case "tipoId":
        return (
          <Campo {...base} htmlFor="tipoId" error={error("tipoId")}>
            <select id="tipoId" name="tipoId" defaultValue={cristal?.tipoId ?? ""} className={input}>
              <option value="" disabled>Elegir…</option>
              {catalogos.tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </Campo>
        );
      case "ubicacionId":
        return (
          <Campo {...base} htmlFor="ubicacionId" error={error("ubicacionId")}>
            <select id="ubicacionId" name="ubicacionId" value={ubicacionId} onChange={(e) => setUbicacionId(e.target.value)} className={input}>
              {catalogos.ubicaciones.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </Campo>
        );
      case "lado":
        return (
          <Campo {...base} htmlFor="lado" error={error("lado")}>
            <select id="lado" name="lado" defaultValue={cristal?.lado ?? "NO_APLICA"} disabled={!tieneLado} className={input}>
              <option value="NO_APLICA">No aplica</option>
              <option value="IZQUIERDO">Izquierdo</option>
              <option value="DERECHO">Derecho</option>
            </select>
          </Campo>
        );
      case "anchoMm":
      case "altoMm":
        return numerico(c.clave, { min: 1 });
      case "espesorMm":
        return numerico("espesorMm", { min: 0, step: "0.1" });
      case "cantidad":
        return cristal ? (
          <p className="self-end text-xs text-texto-suave lg:col-span-1">La cantidad se modifica con movimientos de stock, desde la ficha.</p>
        ) : (
          <Campo {...base} etiqueta={`${c.etiqueta} inicial`} htmlFor="cantidadInicial" error={error("cantidadInicial")}>
            <input id="cantidadInicial" name="cantidadInicial" type="number" min={0} defaultValue={0} className={input} />
          </Campo>
        );
      case "stockMinimo":
        return (
          <Campo {...base} htmlFor="stockMinimo" error={error("stockMinimo")}>
            <input id="stockMinimo" name="stockMinimo" type="number" min={0} defaultValue={cristal?.stockMinimo ?? 1} className={input} />
          </Campo>
        );
      case "ubicacionDeposito":
        return (
          <Campo {...base} htmlFor="ubicacionDeposito" error={error("ubicacionDeposito")}>
            <input id="ubicacionDeposito" name="ubicacionDeposito" placeholder="Rack A-3" defaultValue={cristal?.ubicacionDeposito ?? ""} className={input} />
          </Campo>
        );
      case "costo":
      case "precioVenta":
        return numerico(c.clave, { min: 0, step: "0.01" });
      default:
        return null;
    }
  };

  const seccion = (s: SeccionCampo, columnas: string, ancho: string) => {
    const items = deSeccion(s);
    if (items.length === 0) return null;
    return (
      <section className={`${tarjeta} grid gap-5 p-5 ${columnas}`}>
        <h2 className={`font-display font-bold ${ancho}`}>{titulo(s)}</h2>
        {items.map((c) => <Fragment key={c.clave}>{sistema(c)}</Fragment>)}
      </section>
    );
  };

  const compatibilidades = deSeccion("compatibilidades")[0];
  const adicionales = deSeccion("adicionales");

  return (
    <form onSubmit={enviar} className="space-y-6" noValidate>
      {estado.mensaje && !estado.ok && <Aviso tono="peligro">{estado.mensaje}</Aviso>}
      <input type="hidden" name="camposDibujados" value={JSON.stringify(visibles.map((c) => c.clave))} />
      {compatibilidades && <input type="hidden" name="compatibilidades" value={JSON.stringify(compatParaEnviar)} />}

      {seccion("identificacion", "sm:grid-cols-2 lg:grid-cols-4", "sm:col-span-2 lg:col-span-4")}
      {seccion("principales", "sm:grid-cols-2 lg:grid-cols-4", "sm:col-span-2 lg:col-span-4")}

      {compatibilidades && (
        <section className={`${tarjeta} space-y-4 p-5`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-bold">{compatibilidades.etiqueta}</h2>
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
      )}

      {seccion("stock", "sm:grid-cols-2 lg:grid-cols-5", "sm:col-span-2 lg:col-span-5")}

      {adicionales.length > 0 && (
        <section className={`${tarjeta} space-y-4 p-5`}>
          <h2 className="font-display font-bold">{titulo("adicionales")}</h2>
          <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {adicionales.map((c) => (
              <CampoPersonalizado key={c.clave} campo={c} valor={cristal?.extras[c.clave]} error={error(nombreInput(c.clave))} />
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-end gap-2">
        <Link href={cristal ? `/stock/${cristal.id}` : "/stock"} className={boton.secundario}>Cancelar</Link>
        <button type="submit" disabled={pendiente} className={boton.primario}>
          {pendiente ? "Guardando…" : cristal ? "Guardar cambios" : "Dar de alta"}
        </button>
      </div>
    </form>
  );
}
