import Link from "next/link";
import { Fragment } from "react";
import { Plus } from "lucide-react";
import { Aviso, boton, Insignia, tarjeta } from "@/components/ui";
import { obtenerCampos } from "@/modules/campos/campo.service";
import type { CampoFinal } from "@/modules/campos/combinar";
import { MODULOS, type ModuloAdmin } from "@/modules/campos/modulos";
import { SECCIONES } from "@/modules/campos/registro";
import { ETIQUETA_TIPO } from "@/modules/campos/tipos";
import { AccionesFila } from "./AccionesFila";

const AVISOS: Record<string, string> = {
  creado: "Campo creado.",
  guardado: "Cambios guardados.",
  eliminado: "Campo eliminado.",
};

const ANCLA_LISTA = { marcas: "marcas", tipos: "tipos", ubicaciones: "ubicaciones" } as const;

function Tipo({ c, modulo }: { c: CampoFinal; modulo: ModuloAdmin }) {
  const { base, textoEspecial } = MODULOS[modulo];
  if (c.especial) return <>{textoEspecial}</>;
  if (c.lista === "lado") return <>Lista fija (No aplica, Izquierdo, Derecho)</>;
  if (c.lista) {
    return (
      <>
        Lista ·{" "}
        <Link href={`${base}/listas#${ANCLA_LISTA[c.lista]}`} className="font-medium text-acento underline">
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

function Etiquetas({ c }: { c: CampoFinal }) {
  return (
    <>
      <Insignia tono={c.origen === "PROPIO" ? "marca" : "neutro"}>{c.origen === "PROPIO" ? "Propio" : "Sistema"}</Insignia>
      {c.fijo ? <Insignia>Fijo</Insignia> : c.protegido && <Insignia>Protegido</Insignia>}
    </>
  );
}

const Acciones = ({ c, modulo }: { c: CampoFinal; modulo: ModuloAdmin }) =>
  c.fijo ? <span className="block text-right text-xs text-texto-suave">—</span> : <AccionesFila modulo={modulo} clave={c.clave} />;

export async function TablaCampos({ modulo, aviso }: { modulo: ModuloAdmin; aviso?: string }) {
  const { base, entidad } = MODULOS[modulo];
  const campos = await obtenerCampos(entidad);

  return (
    <>
      {aviso && AVISOS[aviso] && <Aviso>{AVISOS[aviso]}</Aviso>}

      <div className="flex justify-end">
        <Link href={`${base}/campos/nuevo`} className={boton.primario}>
          <Plus className="size-4" aria-hidden /> Nuevo campo
        </Link>
      </div>

      {/* Celular: una tarjeta por campo, sin scroll horizontal. */}
      <div className="space-y-5 lg:hidden">
        {SECCIONES.map((s) => {
          const deSeccion = campos.filter((c) => c.seccion === s.id);
          if (deSeccion.length === 0) return null;
          return (
            <section key={s.id} className="space-y-2">
              <h2 className="text-xs font-semibold tracking-widest text-texto-suave uppercase">{s.etiqueta}</h2>
              <ul className="space-y-2">
                {deSeccion.map((c) => (
                  <li key={c.clave} className={`${tarjeta} space-y-3 p-4 ${c.visible ? "" : "opacity-60"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{c.etiqueta}</p>
                        <p className="mt-0.5 text-xs text-texto-suave">
                          <Tipo c={c} modulo={modulo} />
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-1">
                        <Etiquetas c={c} />
                        {c.archivado ? <Insignia tono="alerta">Archivado</Insignia> : !c.visible && <Insignia tono="alerta">Oculto</Insignia>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-borde pt-3 text-xs text-texto-suave">
                      <span>{c.soloLectura || c.especial ? "" : c.requerido ? "Obligatorio" : "Opcional"}</span>
                      <Acciones c={c} modulo={modulo} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div className={`${tarjeta} hidden overflow-x-auto lg:block`}>
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b border-borde text-left text-xs text-texto-suave uppercase">
            <tr>
              <th className="px-4 py-2 font-semibold">Campo</th>
              <th className="px-4 py-2 font-semibold">Tipo</th>
              <th className="px-4 py-2 font-semibold">Origen</th>
              <th className="px-4 py-2 font-semibold">Obligatorio</th>
              <th className="px-4 py-2 font-semibold">Estado</th>
              <th className="px-4 py-2 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {SECCIONES.map((s) => {
              const deSeccion = campos.filter((c) => c.seccion === s.id);
              if (deSeccion.length === 0) return null;
              return (
                <Fragment key={s.id}>
                  <tr className="bg-grafito-500/10">
                    <th colSpan={6} className="px-4 py-1.5 text-left text-xs font-semibold tracking-wide text-texto-suave uppercase">
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
                        <Tipo c={c} modulo={modulo} />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          <Etiquetas c={c} />
                        </div>
                      </td>
                      <td className="px-4 py-2.5">{c.soloLectura || c.especial ? "—" : c.requerido ? "Sí" : "No"}</td>
                      <td className="px-4 py-2.5">
                        {c.archivado ? <Insignia tono="alerta">Archivado</Insignia> : c.visible ? "Visible" : <Insignia tono="alerta">Oculto</Insignia>}
                      </td>
                      <td className="px-4 py-2.5">
                        <Acciones c={c} modulo={modulo} />
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
