import type { CampoFinal } from "@/modules/campos/combinar";
import { nombreInput, type ValorExtra } from "@/modules/campos/tipos";
import { attrs, esc, type ValorAtributo } from "./html";
import { icono, type NombreIcono } from "./iconos";
import { ui, type Tono, type VarianteBoton } from "./ui";

// Piezas de interfaz que se repiten en las vistas. Devuelven HTML: en EJS van con `<%- ... %>`.
// Todo texto que reciben se escapa; los parámetros que se llaman `html` ya son HTML armado por otra pieza.

export interface Opcion {
  valor: string;
  texto: string;
  deshabilitada?: boolean;
  datos?: Record<string, ValorAtributo>;
}

export interface GrupoOpciones {
  etiqueta: string;
  opciones: Opcion[];
}

export interface Control {
  nombre: string;
  id?: string;
  tipo?: "text" | "number" | "email" | "tel" | "password" | "date" | "time" | "color" | "textarea" | "select";
  valor?: unknown;
  error?: string;
  clase?: string;
  opciones?: Opcion[];
  grupos?: GrupoOpciones[];
  /** Atributos extra del control (min, step, placeholder, autocomplete…). */
  atributos?: Record<string, ValorAtributo>;
}

const comoTexto = (v: unknown) => (v === undefined || v === null ? "" : String(v));

function opcionHtml(o: Opcion, elegido: string): string {
  const datos = Object.fromEntries(Object.entries(o.datos ?? {}).map(([k, v]) => [`data-${k}`, v]));
  return `<option${attrs({ value: o.valor, selected: o.valor === elegido, disabled: o.deshabilitada, ...datos })}>${esc(o.texto)}</option>`;
}

/** Control de formulario solo (sin etiqueta). */
export function control(c: Control): string {
  const tipo = c.tipo ?? "text";
  const comunes = {
    id: c.id ?? c.nombre,
    name: c.nombre,
    class: c.clase ?? ui.input,
    "aria-invalid": c.error ? "true" : undefined,
    ...c.atributos,
  };
  const valor = comoTexto(c.valor);

  if (tipo === "textarea") return `<textarea${attrs(comunes)}>${esc(valor)}</textarea>`;
  if (tipo === "select") {
    const opciones = (c.opciones ?? []).map((o) => opcionHtml(o, valor)).join("");
    const grupos = (c.grupos ?? [])
      .map((g) => `<optgroup${attrs({ label: g.etiqueta })}>${g.opciones.map((o) => opcionHtml(o, valor)).join("")}</optgroup>`)
      .join("");
    return `<select${attrs(comunes)}>${opciones}${grupos}</select>`;
  }
  return `<input${attrs({ type: tipo, value: valor, ...comunes })}>`;
}

export interface Campo extends Control {
  etiqueta: string;
  ayuda?: string | null;
  /** Clases del contenedor (por ejemplo, `sm:col-span-2`). */
  claseContenedor?: string;
}

/** Etiqueta + control + error (o ayuda). El control apunta al pie con `aria-describedby`: el lector de pantalla lo lee al enfocarlo. */
export function campo(c: Campo): string {
  const id = c.id ?? c.nombre;
  const idPie = c.error || c.ayuda ? `${id}-pie` : undefined;
  const pie = c.error
    ? `<p id="${esc(idPie)}" class="text-xs text-peligro">${esc(c.error)}</p>`
    : c.ayuda
      ? `<p id="${esc(idPie)}" class="text-xs text-texto-suave">${esc(c.ayuda)}</p>`
      : "";
  const atributos = idPie ? { "aria-describedby": idPie, ...c.atributos } : c.atributos;
  return `<div class="space-y-1.5 ${esc(c.claseContenedor ?? "")}"><label for="${esc(id)}" class="block text-sm font-medium">${esc(c.etiqueta)}</label>${control({ ...c, id, atributos })}${pie}</div>`;
}

/** Casilla con su texto al lado. */
export function casilla(c: { nombre: string; etiqueta: string; marcada?: boolean; ayuda?: string | null; valor?: string; clase?: string }): string {
  const ayuda = c.ayuda ? `<span class="text-xs text-texto-suave"> · ${esc(c.ayuda)}</span>` : "";
  return `<label class="flex items-center gap-2 text-sm ${esc(c.clase ?? "")}"><input${attrs({ type: "checkbox", name: c.nombre, value: c.valor, checked: c.marcada, class: ui.casilla })}>${esc(c.etiqueta)}${ayuda}</label>`;
}

/** Control de un campo propio (Administración), según su tipo. El nombre del control es `extra_<clave>`. */
export function campoPersonalizado(c: CampoFinal, valor: ValorExtra | undefined, error?: string): string {
  const nombre = nombreInput(c.clave);
  if (c.tipo === "SI_NO") return casilla({ nombre, etiqueta: c.etiqueta, marcada: valor === true, ayuda: c.ayuda });

  const base = { nombre, etiqueta: c.unidad ? `${c.etiqueta} (${c.unidad})` : c.etiqueta, error, ayuda: c.ayuda };
  const texto = typeof valor === "string" ? valor : "";
  switch (c.tipo) {
    case "LISTA":
      return campo({
        ...base,
        tipo: "select",
        valor: texto,
        opciones: [
          { valor: "", texto: "—" },
          ...c.opciones
            .filter((o) => o.activo || o.id === valor)
            .map((o) => ({ valor: o.id, texto: `${o.etiqueta}${o.activo ? "" : " (desactivada)"}` })),
        ],
      });
    case "TEXTO_LARGO":
      return campo({ ...base, tipo: "textarea", valor: texto, atributos: { rows: 3 } });
    case "NUMERO":
      return campo({ ...base, tipo: "number", valor: typeof valor === "boolean" ? "" : valor, atributos: { step: "any" } });
    case "FECHA":
      return campo({ ...base, tipo: "date", valor: texto });
    default:
      return campo({ ...base, valor: typeof valor === "boolean" ? "" : valor });
  }
}

export function insignia(tono: Tono, texto: string): string {
  return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${ui.insignia[tono]}">${esc(texto)}</span>`;
}

const ICONO_AVISO = { exito: "CheckCircle2", alerta: "AlertTriangle", peligro: "XCircle" } as const;
const COLOR_AVISO = { exito: "text-exito", alerta: "text-alerta", peligro: "text-peligro" } as const;

export function aviso(tono: "exito" | "alerta" | "peligro", mensaje: string, id?: string): string {
  return `<div${attrs({ id, role: tono === "peligro" ? "alert" : "status" })} class="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-tarjeta ${ui.aviso[tono]}">${icono(ICONO_AVISO[tono], `mt-0.5 size-[1.1rem] shrink-0 ${COLOR_AVISO[tono]}`)}<span class="min-w-0">${esc(mensaje)}</span></div>`;
}

export function chipIcono(nombre: NombreIcono, tono: Tono = "marca", clase = ""): string {
  return `<span class="flex size-9 shrink-0 items-center justify-center rounded-lg ${ui.chip[tono]} ${esc(clase)}">${icono(nombre, "size-[1.15rem]")}</span>`;
}

export function vacio(mensaje: string, nombreIcono?: NombreIcono): string {
  return `<div class="flex flex-col items-center gap-3 rounded-tarjeta border border-dashed border-grafito-300 bg-superficie/50 p-10 text-center text-sm text-texto-suave dark:border-grafito-700">${
    nombreIcono ? chipIcono(nombreIcono, "neutro") : ""
  }<div>${esc(mensaje)}</div></div>`;
}

/**
 * Tarjeta de resumen: franja de color arriba, icono, número grande y etiqueta corta.
 * Con `href` es un enlace y se eleva al pasar el mouse; sin él queda quieta (no sugiere un clic que no hace nada).
 */
export function estadistica(
  etiqueta: string,
  valor: number | string,
  nombreIcono: NombreIcono,
  tono: "marca" | "alerta" | "peligro" | "exito" = "marca",
  href?: string,
): string {
  const etiquetaHtml = href ? "a" : "div";
  return `<${etiquetaHtml}${attrs({ href, class: `${href ? ui.tarjetaEnlace : ui.tarjeta} relative block overflow-hidden p-3 sm:p-5` })}>
  <span aria-hidden="true" class="absolute inset-x-0 top-0 h-1 ${ui.estadistica.franja[tono]}"></span>
  <span aria-hidden="true" class="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full opacity-[0.14] blur-2xl ${ui.estadistica.franja[tono]}"></span>
  <div class="flex items-start justify-between gap-2">
    <p class="text-xs leading-snug text-texto-suave sm:text-sm">${esc(etiqueta)}</p>
    ${chipIcono(nombreIcono, tono, "hidden sm:flex")}
  </div>
  <p class="mt-1 font-display text-3xl font-extrabold tabular-nums sm:mt-3 sm:text-4xl ${ui.estadistica.numero[tono]}">${esc(valor)}</p>
</${etiquetaHtml}>`;
}

export interface EnlaceBoton {
  href: string;
  texto: string;
  variante?: VarianteBoton;
  icono?: NombreIcono;
  chico?: boolean;
  clase?: string;
  nuevaPestana?: boolean;
}

export function enlaceBoton(e: EnlaceBoton): string {
  const clase = `${ui.boton[e.variante ?? "secundario"]} ${e.chico ? ui.boton.chico : ""} ${e.clase ?? ""}`;
  const extra = e.nuevaPestana ? { target: "_blank", rel: "noopener" } : {};
  return `<a${attrs({ href: e.href, class: clase, ...extra })}>${e.icono ? icono(e.icono, e.chico ? "size-3.5" : "size-4") : ""}${esc(e.texto)}</a>`;
}

/** Enlace "← Volver" chico arriba de la página. */
export function volver(href: string, texto: string): string {
  return enlaceBoton({ href, texto, variante: "fantasma", icono: "ArrowLeft", chico: true, clase: "-ml-2.5" });
}

export function encabezado(e: { seccion: string; titulo: string; descripcion?: string | null; acciones?: string }): string {
  return `<header class="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
  <div class="flex min-w-0 gap-3">
    <span aria-hidden="true" class="mt-1 hidden h-12 w-1.5 shrink-0 rounded-full bg-linear-to-b from-amarillo-300 to-amarillo-500 shadow-[0_0_14px_rgb(253_221_61/0.55)] sm:block"></span>
    <div class="min-w-0">
      <p class="text-xs font-bold tracking-[0.18em] text-acento uppercase sm:text-[0.8rem]">${esc(e.seccion)}</p>
      <h1 class="font-display text-2xl leading-tight font-extrabold tracking-tight sm:text-4xl">${esc(e.titulo)}</h1>
      ${e.descripcion ? `<p class="mt-1 text-sm text-texto-suave">${esc(e.descripcion)}</p>` : ""}
    </div>
  </div>
  ${e.acciones ? `<div class="flex flex-wrap gap-2">${e.acciones}</div>` : ""}
</header>`;
}

/**
 * Formulario de un solo botón (POST). `campos` viajan ocultos. Con `pregunta`, la acción pide confirmación
 * en dos pasos sin diálogos del navegador: el primer clic despliega la pregunta y el segundo envía.
 */
export function botonAccion(b: {
  accion: string;
  texto: string;
  variante?: VarianteBoton;
  chico?: boolean;
  campos?: Record<string, string>;
  pregunta?: string;
  confirmar?: string;
  /** Texto extra que se muestra junto a la pregunta (por ejemplo, la seña que no se devuelve). */
  advertencia?: string;
  deshabilitado?: boolean;
  titulo?: string;
  etiquetaAccesible?: string;
  /** HTML (un icono) que va antes del texto. */
  html?: string;
}): string {
  const chico = b.chico ? ui.boton.chico : "";
  const ocultos = Object.entries(b.campos ?? {})
    .map(([nombre, valor]) => `<input${attrs({ type: "hidden", name: nombre, value: valor })}>`)
    .join("");
  const contenido = `${b.html ?? ""}${esc(b.texto)}`;
  const accesible = { title: b.titulo, "aria-label": b.etiquetaAccesible };

  if (!b.pregunta) {
    return `<form method="post"${attrs({ action: b.accion })} class="inline-flex">${ocultos}<button${attrs({
      type: "submit",
      disabled: b.deshabilitado,
      class: `${ui.boton[b.variante ?? "secundario"]} ${chico}`,
      ...accesible,
    })}>${contenido}</button></form>`;
  }

  return `<details class="group inline-block" data-confirmar>
  <summary${attrs({ class: `${ui.boton[b.variante ?? "fantasma"]} ${chico} cursor-pointer list-none group-open:hidden [&::-webkit-details-marker]:hidden`, ...accesible })}>${contenido}</summary>
  <form method="post"${attrs({ action: b.accion })} class="inline-flex flex-wrap items-center gap-2">${ocultos}
    <span class="text-xs text-texto-suave">${esc(b.pregunta)}</span>
    ${b.advertencia ? `<span class="basis-full text-xs text-alerta">${esc(b.advertencia)}</span>` : ""}
    <button type="submit" class="${ui.boton.peligro} ${chico}">${esc(b.confirmar ?? "Sí, confirmar")}</button>
    <button type="button" data-cerrar class="${ui.boton.fantasma} ${chico}">No</button>
  </form>
</details>`;
}
