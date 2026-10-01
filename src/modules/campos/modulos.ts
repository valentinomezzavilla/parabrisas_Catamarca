import type { EntidadCampo } from "./tipos";

// Puro. Qué administra cada módulo de Administración. Las Server Actions reciben el módulo desde el cliente:
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
  /** Rutas del panel (con sus subrutas) que hay que refrescar cuando cambian los campos. */
  revalidar: string[];
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
    revalidar: ["/stock"],
    textoEspecial: "Sección de vehículos",
  },
  servicios: {
    entidad: "SERVICIO",
    base: "/administracion/servicios",
    titulo: "Servicios",
    objeto: "un servicio",
    plural: "servicios",
    revalidar: ["/servicios"],
    textoEspecial: "Franjas horarias por día",
  },
};

export function esModulo(valor: unknown): valor is ModuloAdmin {
  return typeof valor === "string" && Object.hasOwn(MODULOS, valor);
}
