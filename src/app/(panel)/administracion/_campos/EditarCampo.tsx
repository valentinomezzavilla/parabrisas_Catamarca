import { notFound } from "next/navigation";
import { Insignia, tarjeta } from "@/components/ui";
import { obtenerCampos } from "@/modules/campos/campo.service";
import { MODULOS, type ModuloAdmin } from "@/modules/campos/modulos";
import { REGISTRO } from "@/modules/campos/registro";
import { ETIQUETA_TIPO } from "@/modules/campos/tipos";
import { CambiarTipo } from "./CambiarTipo";
import { EditorOpciones } from "./EditorOpciones";
import { FormularioCampoPropio } from "./FormularioCampoPropio";
import { FormularioCampoSistema } from "./FormularioCampoSistema";
import { ZonaPeligro } from "./ZonaPeligro";

export async function EditarCampo({ modulo, clave }: { modulo: ModuloAdmin; clave: string }) {
  const { entidad } = MODULOS[modulo];
  const campo = (await obtenerCampos(entidad)).find((c) => c.clave === clave);
  // Los campos fijos no se pueden ajustar: no hay pantalla de edición para ellos.
  if (!campo || campo.fijo) notFound();

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
          modulo={modulo}
          clave={campo.clave}
          etiqueta={campo.etiqueta}
          ayuda={campo.ayuda ?? ""}
          visible={campo.visible}
          ocultable={campo.ocultable}
          fabrica={REGISTRO[entidad].find((c) => c.clave === campo.clave)?.etiqueta ?? campo.etiqueta}
        />
      ) : (
        <>
          <FormularioCampoPropio
            modulo={modulo}
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
              <EditorOpciones modulo={modulo} id={campo.id!} opciones={campo.opciones} />
            </section>
          )}
          <section className={`${tarjeta} space-y-3 p-5`}>
            <h3 className="font-display font-bold">Cambiar el tipo de dato</h3>
            <CambiarTipo modulo={modulo} id={campo.id!} tipoActual={campo.tipo} />
          </section>
          <section className={`${tarjeta} space-y-3 p-5`}>
            <h3 className="font-display font-bold">Archivar o eliminar</h3>
            <ZonaPeligro modulo={modulo} id={campo.id!} archivado={campo.archivado} />
          </section>
        </>
      )}
    </div>
  );
}
