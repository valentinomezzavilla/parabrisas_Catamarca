import { notFound } from "next/navigation";
import { Insignia, tarjeta } from "@/components/ui";
import { requerirRol } from "@/lib/sesion";
import { obtenerCampos } from "@/modules/campos/campo.service";
import { REGISTRO } from "@/modules/campos/registro";
import { ETIQUETA_TIPO } from "@/modules/campos/tipos";
import { CambiarTipo } from "./CambiarTipo";
import { EditorOpciones } from "./EditorOpciones";
import { FormularioCampoPropio } from "./FormularioCampoPropio";
import { FormularioCampoSistema } from "./FormularioCampoSistema";
import { ZonaPeligro } from "./ZonaPeligro";

export const metadata = { title: "Administración · Editar campo" };

export default async function PaginaEditarCampo({ params }: { params: Promise<{ clave: string }> }) {
  await requerirRol("ADMIN");
  const { clave } = await params;
  const campo = (await obtenerCampos("CRISTAL")).find((c) => c.clave === clave);
  if (!campo) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold">{campo.etiqueta}</h2>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-texto-suave">
          {ETIQUETA_TIPO[campo.tipo]}
          <Insignia tono={campo.origen === "PROPIO" ? "marca" : "neutro"}>{campo.origen === "PROPIO" ? "Propio" : "Sistema"}</Insignia>
          {campo.protegido && <Insignia>Protegido: el sistema lo necesita</Insignia>}
          {campo.archivado && <Insignia tono="alerta">Archivado</Insignia>}
        </p>
      </div>

      {campo.origen === "SISTEMA" ? (
        <FormularioCampoSistema
          clave={campo.clave}
          etiqueta={campo.etiqueta}
          ayuda={campo.ayuda ?? ""}
          visible={campo.visible}
          ocultable={campo.ocultable}
          fabrica={REGISTRO.CRISTAL.find((c) => c.clave === campo.clave)?.etiqueta ?? campo.etiqueta}
        />
      ) : (
        <>
          <FormularioCampoPropio
            id={campo.id!}
            etiqueta={campo.etiqueta}
            ayuda={campo.ayuda ?? ""}
            tipo={campo.tipo}
            requerido={campo.requerido}
            unidad={campo.unidad ?? ""}
            visible={campo.visible || campo.archivado}
          />
          {campo.tipo === "LISTA" && (
            <section className={`${tarjeta} space-y-3 p-5`}>
              <h3 className="font-display font-bold">Opciones</h3>
              <EditorOpciones id={campo.id!} opciones={campo.opciones} />
            </section>
          )}
          <section className={`${tarjeta} space-y-3 p-5`}>
            <h3 className="font-display font-bold">Cambiar el tipo de dato</h3>
            <CambiarTipo id={campo.id!} tipoActual={campo.tipo} />
          </section>
          <section className={`${tarjeta} space-y-3 p-5`}>
            <h3 className="font-display font-bold">Archivar o eliminar</h3>
            <ZonaPeligro id={campo.id!} archivado={campo.archivado} />
          </section>
        </>
      )}
    </div>
  );
}
