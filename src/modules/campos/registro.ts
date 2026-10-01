import type { EntidadCampo, TipoCampo } from "./tipos";

// Puro. Campos que el sistema trae de fábrica; lo que el Admin ajusta se guarda aparte (configuracion_campos).

export type SeccionCampo =
  | "identificacion"
  | "principales"
  | "compatibilidades"
  | "stock"
  | "servicio"
  | "agenda"
  | "precio"
  | "adicionales";

export const SECCIONES: { id: SeccionCampo; etiqueta: string }[] = [
  { id: "identificacion", etiqueta: "Identificación" },
  { id: "principales", etiqueta: "Características principales" },
  { id: "compatibilidades", etiqueta: "Vehículos compatibles" },
  { id: "stock", etiqueta: "Stock y precios" },
  { id: "servicio", etiqueta: "Datos del servicio" },
  { id: "agenda", etiqueta: "Agenda y capacidad" },
  { id: "precio", etiqueta: "Precio" },
  { id: "adicionales", etiqueta: "Datos adicionales" },
];

export type ListaSistema = "marcas" | "tipos" | "ubicaciones" | "lado";

export interface CampoSistema {
  clave: string;
  etiqueta: string;
  ayuda?: string;
  tipo: TipoCampo;
  seccion: SeccionCampo;
  /** La base o la lógica lo exigen: es obligatorio siempre. */
  requerido: boolean;
  /** No se oculta, no cambia de tipo y su obligatoriedad no se edita. */
  protegido: boolean;
  ocultable: boolean;
  unidad?: string;
  lista?: ListaSistema;
  soloLectura?: boolean;
  /** Sección con diseño propio (vehículos compatibles). */
  especial?: boolean;
  /** Se muestra en Administración pero no se puede ajustar (ni renombrar, ni ocultar, ni mover). */
  fijo?: boolean;
}

const cristal = (
  clave: string,
  etiqueta: string,
  tipo: TipoCampo,
  seccion: SeccionCampo,
  extra: Partial<CampoSistema> & { protegido?: boolean } = {},
): CampoSistema => {
  const protegido = extra.protegido ?? false;
  return { clave, etiqueta, tipo, seccion, requerido: protegido && clave !== "cantidad", protegido, ocultable: !protegido, ...extra };
};

/** Campo de referencia del servicio: lo usa el formulario existente y Administración solo lo muestra. */
const servicio = (
  clave: string,
  etiqueta: string,
  tipo: TipoCampo,
  seccion: SeccionCampo,
  extra: Partial<CampoSistema> = {},
): CampoSistema => ({ clave, etiqueta, tipo, seccion, requerido: false, protegido: true, ocultable: false, fijo: true, ...extra });

export const REGISTRO: Record<EntidadCampo, CampoSistema[]> = {
  CRISTAL: [
    cristal("codigo", "Código interno", "TEXTO", "identificacion", { protegido: true, ayuda: "Ej. PB-HIL-16" }),
    cristal("codigoFabricante", "Código de fabricante", "TEXTO", "identificacion", { ayuda: "Eurocode o catálogo" }),
    cristal("descripcion", "Descripción", "TEXTO", "identificacion", { protegido: true }),
    cristal("marcaId", "Marca", "LISTA", "principales", { protegido: true, lista: "marcas" }),
    cristal("tipoId", "Tipo de cristal", "LISTA", "principales", { protegido: true, lista: "tipos" }),
    cristal("ubicacionId", "Ubicación en el vehículo", "LISTA", "principales", { protegido: true, lista: "ubicaciones" }),
    cristal("lado", "Lado", "LISTA", "principales", { lista: "lado" }),
    cristal("anchoMm", "Ancho (mm)", "NUMERO", "principales", { unidad: "mm" }),
    cristal("altoMm", "Alto (mm)", "NUMERO", "principales", { unidad: "mm" }),
    cristal("espesorMm", "Espesor (mm)", "NUMERO", "principales", { unidad: "mm" }),
    cristal("compatibilidades", "Vehículos compatibles", "LISTA", "compatibilidades", { especial: true }),
    cristal("cantidad", "Cantidad", "NUMERO", "stock", { protegido: true, soloLectura: true }),
    cristal("stockMinimo", "Stock mínimo", "NUMERO", "stock", { protegido: true, ayuda: "Avisa cuando hay que reponer" }),
    cristal("ubicacionDeposito", "Ubicación en depósito", "TEXTO", "stock"),
    cristal("costo", "Costo", "NUMERO", "stock"),
    cristal("precioVenta", "Precio de venta", "NUMERO", "stock"),
  ],
  SERVICIO: [
    servicio("nombre", "Nombre", "TEXTO", "servicio", { requerido: true }),
    servicio("descripcion", "Descripción", "TEXTO_LARGO", "servicio"),
    servicio("color", "Color en la agenda", "TEXTO", "servicio"),
    servicio("activo", "Activo (se ofrece en el turnero)", "SI_NO", "servicio"),
    servicio("duracionMinutos", "Duración (min)", "NUMERO", "agenda", { requerido: true, unidad: "min" }),
    servicio("intervaloMinutos", "Turnos cada (min)", "NUMERO", "agenda", { requerido: true, unidad: "min" }),
    servicio("margenMinutos", "Margen entre trabajos (min)", "NUMERO", "agenda", { unidad: "min" }),
    servicio("capacidad", "Vehículos a la vez", "NUMERO", "agenda", { requerido: true }),
    servicio("anticipacionMinutos", "Anticipación mínima", "NUMERO", "agenda", { requerido: true, unidad: "min" }),
    servicio("requiereCristal", "Usa un cristal del stock", "SI_NO", "agenda"),
    servicio("horarios", "Días y horarios de atención", "LISTA", "agenda", { requerido: true, especial: true }),
    servicio("precioBase", "Precio base", "NUMERO", "precio"),
  ],
  TURNO: [],
  CLIENTE: [],
};

export const clavesReservadas = (entidad: EntidadCampo): string[] => REGISTRO[entidad].map((c) => c.clave);

/** Segmentos fijos de la ruta /campos/[clave]: un campo propio con esa clave no se podría editar. */
const CLAVES_DE_RUTA = ["nuevo"];

/** Claves que un campo propio no puede usar: las del sistema y las que chocan con rutas. */
export const clavesProhibidas = (entidad: EntidadCampo): string[] => [...clavesReservadas(entidad), ...CLAVES_DE_RUTA];
