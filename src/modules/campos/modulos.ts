import type { EntidadCampo } from "./tipos";

// Puro. Qué administra cada módulo de Administración. Las rutas reciben el módulo en la URL:
// nunca se confía en él, se valida con `esModulo` y de acá salen la entidad y las rutas.

export type ModuloAdmin = "stock" | "servicios";

export interface ConfigModulo {
  entidad: EntidadCampo;
  /** Ruta de la pantalla de campos del módulo. */
  base: string;
  titulo: string;
  /** Para frases como "Obligatorio al cargar un cristal". */
  objeto: string;
  /** Para frases como "…de todos los cristales". */
  plural: string;
  /** Texto bajo el título de la pantalla del módulo. */
  descripcion: string;
  /** Cómo se llama en la tabla el campo "especial" del módulo. */
  textoEspecial: string;
}

export const MODULOS: Record<ModuloAdmin, ConfigModulo> = {
  stock: {
    entidad: "CRISTAL",
    base: "/administracion/stock",
    titulo: "Stock",
    objeto: "un cristal",
    plural: "cristales",
    descripcion: "Los cambios se aplican enseguida en el alta, la edición y la ficha de cada cristal.",
    textoEspecial: "Sección de vehículos",
  },
  servicios: {
    entidad: "SERVICIO",
    base: "/administracion/servicios",
    titulo: "Servicios",
    objeto: "un servicio",
    plural: "servicios",
    descripcion: "Sumá datos propios a los servicios. Se completan al crear o editar un servicio y los ve solo el personal.",
    textoEspecial: "Franjas horarias por día",
  },
};

export function esModulo(valor: unknown): valor is ModuloAdmin {
  return typeof valor === "string" && Object.hasOwn(MODULOS, valor);
}
