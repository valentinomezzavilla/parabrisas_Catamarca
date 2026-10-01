import { REGISTRO, SECCIONES, type ListaSistema, type SeccionCampo } from "./registro";
import type { CampoPropio, EntidadCampo, OpcionCampo, TipoCampo } from "./tipos";

// Puro. Única fuente para el formulario, la ficha y la pantalla de Administración.

export interface ConfigCampo {
  clave: string;
  etiqueta: string | null;
  ayuda: string | null;
  oculto: boolean;
  orden: number | null;
}

export interface CampoFinal {
  clave: string;
  etiqueta: string;
  ayuda: string | null;
  tipo: TipoCampo;
  origen: "SISTEMA" | "PROPIO";
  seccion: SeccionCampo;
  requerido: boolean;
  protegido: boolean;
  /** Se muestra pero no se puede ajustar desde Administración. */
  fijo: boolean;
  ocultable: boolean;
  visible: boolean;
  archivado: boolean;
  orden: number;
  unidad: string | null;
  lista: ListaSistema | null;
  soloLectura: boolean;
  especial: boolean;
  opciones: OpcionCampo[];
  id: string | null;
}

const PASO = 10;
const enBlanco = (t: string | null | undefined) => (t ?? "").trim();

export function combinarCampos(
  entidad: EntidadCampo,
  configuraciones: ConfigCampo[],
  propios: CampoPropio[],
): CampoFinal[] {
  const ajustes = new Map(configuraciones.map((c) => [c.clave, c]));

  const sistema = REGISTRO[entidad].map((c, i): CampoFinal => {
    const ajuste = ajustes.get(c.clave);
    return {
      clave: c.clave,
      etiqueta: enBlanco(ajuste?.etiqueta) || c.etiqueta,
      ayuda: enBlanco(ajuste?.ayuda) || c.ayuda || null,
      tipo: c.tipo,
      origen: "SISTEMA",
      seccion: c.seccion,
      requerido: c.requerido,
      protegido: c.protegido,
      fijo: c.fijo ?? false,
      ocultable: c.ocultable,
      visible: c.ocultable ? !ajuste?.oculto : true,
      archivado: false,
      orden: ajuste?.orden ?? (i + 1) * PASO,
      unidad: c.unidad ?? null,
      lista: c.lista ?? null,
      soloLectura: c.soloLectura ?? false,
      especial: c.especial ?? false,
      opciones: [],
      id: null,
    };
  });

  const adicionales = propios
    .filter((p) => p.entidad === entidad)
    .map(
      (p): CampoFinal => ({
        clave: p.clave,
        etiqueta: p.etiqueta,
        ayuda: p.ayuda,
        tipo: p.tipo,
        origen: "PROPIO",
        seccion: "adicionales",
        requerido: p.requerido,
        protegido: false,
        fijo: false,
        ocultable: true,
        visible: p.visible && !p.archivado,
        archivado: p.archivado,
        orden: p.orden,
        unidad: p.unidad,
        lista: null,
        soloLectura: false,
        especial: false,
        opciones: p.opciones,
        id: p.id,
      }),
    );

  const ordenSeccion = new Map(SECCIONES.map((s, i) => [s.id, i]));
  return [...sistema, ...adicionales].sort(
    (a, b) => ordenSeccion.get(a.seccion)! - ordenSeccion.get(b.seccion)! || a.orden - b.orden,
  );
}

export const camposVisibles = (campos: CampoFinal[]): CampoFinal[] => campos.filter((c) => c.visible && !c.archivado);

/**
 * Sube o baja un campo dentro de su sección. Devuelve el nuevo `orden` (10, 20, 30…) de TODOS los campos
 * de esa sección, o una lista vacía si no hay nada que mover (borde de la sección o clave inexistente).
 */
export function moverCampo(
  campos: CampoFinal[],
  clave: string,
  direccion: "ARRIBA" | "ABAJO",
): { clave: string; orden: number }[] {
  const campo = campos.find((c) => c.clave === clave);
  if (!campo) return [];
  const seccion = campos.filter((c) => c.seccion === campo.seccion);
  const i = seccion.findIndex((c) => c.clave === clave);
  const j = direccion === "ARRIBA" ? i - 1 : i + 1;
  if (j < 0 || j >= seccion.length) return [];
  const reordenada = [...seccion];
  [reordenada[i], reordenada[j]] = [reordenada[j], reordenada[i]];
  return reordenada.map((c, n) => ({ clave: c.clave, orden: (n + 1) * PASO }));
}
