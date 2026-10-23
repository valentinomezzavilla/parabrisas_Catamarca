import type { Application, Response } from "express";
import { medidas, NOMBRE_LADO, pesos } from "@/lib/formato";
import {
  DIAS_CORTOS,
  DIAS_LARGOS,
  diaSemana,
  fechaLocal,
  formatearFecha,
  formatearHora,
  hoy,
  minutosAHora,
  SEMANA,
  ZONA_HORARIA,
  diaAFecha,
} from "@/lib/tiempo";
import { ETIQUETA_MEDIO, ETIQUETA_PAGADOR, ETIQUETA_TIPO } from "@/modules/ordenes/estados";
import * as componentes from "./componentes";
import { attrs, esc } from "./html";
import { icono } from "./iconos";
import { esActiva, gruposVisibles, inicialDe, nombreDeRol } from "./navegacion";
import { jsonLdNegocio, urlBase } from "./seo";
import { ESTADOS_ORDEN, ESTADOS_TURNO, SITUACION_COBRO, ui } from "./ui";

export type Layout = "panel" | "publico" | "auth";

export interface DatosVista {
  /** Título de la pestaña (se le agrega " · Parabrisas Catamarca"). */
  titulo?: string;
  layout?: Layout;
  [clave: string]: unknown;
}

/** "lunes 5 de octubre" → "Lunes 5 de octubre". */
const mayuscula = (t: string) => t.replace(/^./, (c) => c.toUpperCase());

/** "05/10/26 14:30" en hora de Catamarca. */
const fechaHora = (fecha: Date) => fecha.toLocaleString("es-AR", { timeZone: ZONA_HORARIA, dateStyle: "short", timeStyle: "short" });

/** "14/10/26" a partir de una columna DATE (un día sin hora), o "—". */
const diaCorto = (dia: Date | null | undefined) =>
  dia ? formatearFecha(diaAFecha(dia), { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—";

/** "1 artículo" / "3 artículos". */
const plural = (n: number, singular: string, plural: string) => `${n} ${n === 1 ? singular : plural}`;

/** Lo que todas las plantillas tienen a mano (se registra en `app.locals`). */
export const ayudas = {
  ui,
  icono,
  esc,
  attrs,
  ...componentes,
  ESTADOS_TURNO,
  ESTADOS_ORDEN,
  SITUACION_COBRO,
  TIPO_ORDEN: ETIQUETA_TIPO,
  PAGADOR_COBRO: ETIQUETA_PAGADOR,
  MEDIO_COBRO: ETIQUETA_MEDIO,
  pesos,
  medidas,
  NOMBRE_LADO,
  DIAS_CORTOS,
  DIAS_LARGOS,
  SEMANA,
  diaSemana,
  fechaLocal,
  formatearFecha,
  formatearHora,
  minutosAHora,
  hoy,
  mayuscula,
  fechaHora,
  diaCorto,
  diaAFecha,
  plural,
  esActiva,
  gruposVisibles,
  inicialDe,
  nombreDeRol,
  urlBase,
  jsonLdNegocio,
};

export function renderizar(app: Application, vista: string, datos: object): Promise<string> {
  return new Promise((ok, mal) => app.render(vista, datos, (error, html) => (error ? mal(error) : ok(html))));
}

/**
 * Renderiza `vista` dentro de su layout (por defecto, el del panel) y la envía.
 * Las plantillas reciben `res.locals` (usuario, aviso, ruta) más `datos`.
 */
export async function mostrar(res: Response, vista: string, datos: DatosVista = {}, estado = 200): Promise<void> {
  const locales = { titulo: undefined, ...res.locals, ...datos };
  const contenido = await renderizar(res.app, vista, locales);
  const html = await renderizar(res.app, `layouts/${datos.layout ?? "panel"}`, { ...locales, contenido });
  res.status(estado).type("html").send(html);
}
