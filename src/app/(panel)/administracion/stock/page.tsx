import Link from "next/link";
import { Fragment } from "react";
import { Aviso, Insignia, tarjeta } from "@/components/ui";
import { requerirRol } from "@/lib/sesion";
import { obtenerCampos } from "@/modules/campos/campo.service";
import type { CampoFinal } from "@/modules/campos/combinar";
import { SECCIONES } from "@/modules/campos/registro";
import { ETIQUETA_TIPO } from "@/modules/campos/tipos";

export const metadata = { title: "Administración · Campos de Stock" };

const AVISOS: Record<string, string> = {
  creado: "Campo creado.",
  guardado: "Cambios guardados.",
  eliminado: "Campo eliminado.",
};

const ANCLA_LISTA = { marcas: "marcas", tipos: "tipos", ubicaciones: "ubicaciones" } as const;

function Tipo({ c }: { c: CampoFinal }) {
  if (c.especial) return <>Sección de vehículos</>;
  if (c.lista === "lado") return <>Lista fija (No aplica, Izquierdo, Derecho)</>;
  if (c.lista) {
    return (
      <>
        Lista ·{" "}
        <Link href={`/administracion/stock/listas#${ANCLA_LISTA[c.lista]}`} className="font-medium text-acento underline">
          ver opciones
        </Link>
      </>
    );
  }
  if (c.tipo === "LISTA") {
    const activas = c.opciones.filter((o) => o.activo).length;
    return <>Lista · {activas} {activas === 1 ? "opción activa" : "opciones activas"}</>;
  }
  return <>{ETIQUETA_TIPO[c.tipo]}{c.unidad ? ` (${c.unidad})` : ""}</>;
}

export default async function PaginaCamposStock({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  await requerirRol("ADMIN");
  const { aviso } = await searchParams;
  const campos = await obtenerCampos("CRISTAL");

  return (
    <>
      {aviso && AVISOS[aviso] && <Aviso>{AVISOS[aviso]}</Aviso>}

      <div className={`${tarjeta} overflow-x-auto`}>
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-borde text-left text-xs text-texto-suave uppercase">
            <tr>
              <th className="px-4 py-2 font-semibold">Campo</th>
              <th className="px-4 py-2 font-semibold">Tipo</th>
              <th className="px-4 py-2 font-semibold">Origen</th>
              <th className="px-4 py-2 font-semibold">Obligatorio</th>
              <th className="px-4 py-2 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {SECCIONES.map((s) => {
              const deSeccion = campos.filter((c) => c.seccion === s.id);
              if (deSeccion.length === 0) return null;
              return (
                <Fragment key={s.id}>
                  <tr className="bg-grafito-500/10">
                    <th colSpan={5} className="px-4 py-1.5 text-left text-xs font-semibold tracking-wide text-texto-suave uppercase">
                      {s.etiqueta}
                    </th>
                  </tr>
                  {deSeccion.map((c) => (
                    <tr key={c.clave} className={c.visible ? "" : "opacity-60"}>
                      <td className="px-4 py-2.5">
                        <p className="font-medium">{c.etiqueta}</p>
                        {c.ayuda && <p className="text-xs text-texto-suave">{c.ayuda}</p>}
                      </td>
                      <td className="px-4 py-2.5 text-texto-suave">
                        <Tipo c={c} />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          <Insignia tono={c.origen === "PROPIO" ? "marca" : "neutro"}>{c.origen === "PROPIO" ? "Propio" : "Sistema"}</Insignia>
                          {c.protegido && <Insignia>Protegido</Insignia>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">{c.soloLectura || c.especial ? "—" : c.requerido ? "Sí" : "No"}</td>
                      <td className="px-4 py-2.5">
                        {c.archivado ? <Insignia tono="alerta">Archivado</Insignia> : c.visible ? "Visible" : <Insignia tono="alerta">Oculto</Insignia>}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
