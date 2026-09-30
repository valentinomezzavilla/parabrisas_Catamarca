import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Aviso, boton, EncabezadoPagina, tarjeta } from "@/components/ui";
import { BotonConfirmar, BotonEnviar } from "@/components/ui/cliente";
import { medidas, NOMBRE_LADO, pesos } from "@/lib/formato";
import { ZONA_HORARIA } from "@/lib/tiempo";
import { obtenerCampos } from "@/modules/campos/campo.service";
import { formatearValor } from "@/modules/campos/extras";
import type { Extras } from "@/modules/campos/tipos";
import { obtenerCristal } from "@/modules/inventario/cristal.service";
import { alternarCristal } from "../acciones";
import { FormularioMovimiento } from "./FormularioMovimiento";
import { verificarSesion } from "@/lib/sesion";

export const metadata = { title: "Ficha de cristal" };

const AVISOS: Record<string, string> = { creado: "Cristal dado de alta.", actualizado: "Cambios guardados." };
const TIPO_MOVIMIENTO = { INGRESO: "Ingreso", EGRESO: "Egreso", AJUSTE: "Ajuste" } as const;

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-texto-suave">{etiqueta}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}

export default async function PaginaCristal({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aviso?: string }>;
}) {
  await verificarSesion();
  const [{ id }, { aviso }] = await Promise.all([params, searchParams]);
  const [c, campos] = await Promise.all([obtenerCristal(id), obtenerCampos("CRISTAL")]);
  if (!c) notFound();

  const bajo = c.cantidad <= c.stockMinimo;
  const campo = (clave: string) => campos.find((x) => x.clave === clave);
  const visible = (clave: string) => campo(clave)?.visible ?? true;
  const etiqueta = (clave: string) => campo(clave)?.etiqueta ?? clave;
  const extras = c.extras as Extras;
  const adicionales = campos
    .filter((x) => x.origen === "PROPIO" && x.visible && extras[x.clave] !== undefined)
    .map((x) => ({ clave: x.clave, etiqueta: x.etiqueta, texto: formatearValor(x, extras[x.clave]) }));

  return (
    <>
      <Link href="/stock" className={`${boton.fantasma} ${boton.chico} -ml-2.5`}>
        <ArrowLeft className="size-3.5" aria-hidden /> Stock
      </Link>
      <EncabezadoPagina
        seccion={c.codigo}
        titulo={c.descripcion}
        descripcion={`${c.marca.nombre} · ${c.tipo.nombre} · ${c.ubicacion.nombre} ${visible("lado") ? NOMBRE_LADO[c.lado] : ""}`.trim()}
        acciones={
          <>
            <Link href={`/stock/${c.id}/editar`} className={boton.secundario}>
              <Pencil className="size-4" aria-hidden /> Editar
            </Link>
            {c.activo ? (
              <BotonConfirmar accion={alternarCristal.bind(null, c.id, false)} pregunta="Se ocultará de búsquedas" confirmar="Dar de baja">
                Dar de baja
              </BotonConfirmar>
            ) : (
              <form action={alternarCristal.bind(null, c.id, true)}>
                <BotonEnviar variante="secundario">Reactivar</BotonEnviar>
              </form>
            )}
          </>
        }
      />
      {aviso && AVISOS[aviso] && <Aviso>{AVISOS[aviso]}</Aviso>}
      {!c.activo && <Aviso tono="alerta">Este cristal está dado de baja: no aparece en las búsquedas.</Aviso>}

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <section className={`${tarjeta} p-5 text-center`}>
            <p className="text-sm text-texto-suave">Stock disponible</p>
            <p className={`font-display text-6xl font-extrabold tabular-nums ${c.cantidad === 0 ? "text-peligro" : bajo ? "text-alerta" : ""}`}>{c.cantidad}</p>
            <p className="mt-1 text-xs text-texto-suave">
              Mínimo {c.stockMinimo}
              {bajo && <> · <span className="font-semibold text-alerta">reponer</span></>}
            </p>
          </section>

          <section className={`${tarjeta} p-5`}>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {(visible("anchoMm") || visible("altoMm") || visible("espesorMm")) && (
                <Dato etiqueta="Medidas">{medidas(visible("anchoMm") ? c.anchoMm : null, visible("altoMm") ? c.altoMm : null, visible("espesorMm") ? c.espesorMm : null)}</Dato>
              )}
              {visible("ubicacionDeposito") && <Dato etiqueta={etiqueta("ubicacionDeposito")}>{c.ubicacionDeposito ?? "—"}</Dato>}
              {visible("costo") && <Dato etiqueta={etiqueta("costo")}>{pesos(c.costo)}</Dato>}
              {visible("precioVenta") && <Dato etiqueta={etiqueta("precioVenta")}>{pesos(c.precioVenta)}</Dato>}
              {visible("codigoFabricante") && <Dato etiqueta={etiqueta("codigoFabricante")}>{c.codigoFabricante ?? "—"}</Dato>}
              {adicionales.map((a) => (
                <Dato key={a.clave} etiqueta={a.etiqueta}>{a.texto}</Dato>
              ))}
            </dl>
          </section>

          {visible("compatibilidades") && (
          <section className={`${tarjeta} p-5`}>
            <h2 className="mb-3 font-display font-bold">{etiqueta("compatibilidades")}</h2>
            {c.compatibilidades.length === 0 ? (
              <p className="text-sm text-texto-suave">Sin vehículos cargados.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {c.compatibilidades.map((v) => (
                  <li key={v.id}>
                    <span className="font-medium">{v.modelo.marca.nombre} {v.modelo.nombre}</span>{" "}
                    <span className="text-texto-suave">
                      {v.anioDesde ?? "…"}–{v.anioHasta ?? "actual"}
                      {v.carroceria && ` · ${v.carroceria}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          )}
        </div>

        <div className="space-y-6">
          <section className={`${tarjeta} p-5`}>
            <h2 className="mb-4 font-display font-bold">Registrar movimiento</h2>
            <FormularioMovimiento cristalId={c.id} />
          </section>

          <section className={`${tarjeta} overflow-hidden`}>
            <h2 className="px-5 pt-5 pb-3 font-display font-bold">Historial</h2>
            {c.movimientos.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-texto-suave">Sin movimientos.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead className="border-y border-borde text-left text-xs text-texto-suave uppercase">
                    <tr>
                      <th className="px-5 py-2 font-semibold">Fecha</th>
                      <th className="px-5 py-2 font-semibold">Tipo</th>
                      <th className="px-5 py-2 font-semibold">Motivo</th>
                      <th className="px-5 py-2 text-right font-semibold">Cant.</th>
                      <th className="px-5 py-2 text-right font-semibold">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borde">
                    {c.movimientos.map((m) => (
                      <tr key={m.id}>
                        <td className="px-5 py-2 whitespace-nowrap text-texto-suave">
                          {m.creadoEn.toLocaleString("es-AR", { timeZone: ZONA_HORARIA, dateStyle: "short", timeStyle: "short" })}
                        </td>
                        <td className="px-5 py-2">{TIPO_MOVIMIENTO[m.tipo]}</td>
                        <td className="px-5 py-2">{m.motivo ?? (m.turno ? "Turno de colocación" : "—")}</td>
                        <td className={`px-5 py-2 text-right font-semibold tabular-nums ${m.cantidad > 0 ? "text-exito" : "text-peligro"}`}>
                          {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                        </td>
                        <td className="px-5 py-2 text-right tabular-nums">{m.saldo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
