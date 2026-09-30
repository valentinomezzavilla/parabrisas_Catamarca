// Tipos compartidos del motor de campos. Sin Prisma ni Next: los usan módulos puros y componentes de cliente.

export const ENTIDADES_CAMPO = ["CRISTAL", "SERVICIO", "TURNO", "CLIENTE"] as const;
export type EntidadCampo = (typeof ENTIDADES_CAMPO)[number];

export const TIPOS_CAMPO = ["TEXTO", "TEXTO_LARGO", "NUMERO", "SI_NO", "LISTA", "FECHA"] as const;
export type TipoCampo = (typeof TIPOS_CAMPO)[number];

export const ETIQUETA_TIPO: Record<TipoCampo, string> = {
  TEXTO: "Texto",
  TEXTO_LARGO: "Texto largo",
  NUMERO: "Número",
  SI_NO: "Sí / No",
  LISTA: "Lista de opciones",
  FECHA: "Fecha",
};

export interface OpcionCampo {
  id: string;
  etiqueta: string;
  activo: boolean;
}

export type ValorExtra = string | number | boolean;
export type Extras = Record<string, ValorExtra>;

/** Nombre del control de formulario de un campo propio. */
export const nombreInput = (clave: string) => `extra_${clave}`;

/** Campo propio tal como lo usa la lógica (ya sin detalles de Prisma). */
export interface CampoPropio {
  id: string;
  entidad: EntidadCampo;
  clave: string;
  etiqueta: string;
  ayuda: string | null;
  tipo: TipoCampo;
  requerido: boolean;
  unidad: string | null;
  opciones: OpcionCampo[];
  orden: number;
  visible: boolean;
  archivado: boolean;
}
