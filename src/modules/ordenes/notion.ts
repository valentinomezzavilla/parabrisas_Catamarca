import type { EstadoOrden, TipoOrden } from "@/generated/prisma/client";
import { normalizarPatente } from "./schemas";

// Puro. Lee la exportación CSV de la base "Órdenes de Trabajo" de Notion y la convierte en órdenes listas para
// guardar. Las columnas se buscan por nombre, así sirve cualquiera de las dos exportaciones (con columnas en otro orden).
// Las relaciones de Notion (Cliente, Aseguradora, Pedido al Proveedor) llegan como "Título (link)"; si la página no
// tiene título, como "Sin título (link)": entonces se identifican por el link y se les pone un nombre provisorio.

export class ImportacionError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ImportacionError";
  }
}

/** Filas de un CSV (RFC 4180): comillas, comillas dobles escapadas y saltos de línea dentro de un campo. */
export function leerCsv(texto: string): string[][] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = "";
  let entreComillas = false;
  const contenido = texto.replace(/^﻿/, "");

  for (let i = 0; i < contenido.length; i++) {
    const c = contenido[i];
    if (entreComillas) {
      if (c === '"' && contenido[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') entreComillas = false;
      else campo += c;
    } else if (c === '"') entreComillas = true;
    else if (c === ",") {
      fila.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && contenido[i + 1] === "\n") i++;
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = "";
    } else campo += c;
  }
  if (campo !== "" || fila.length > 0) {
    fila.push(campo);
    filas.push(fila);
  }
  return filas.filter((f) => f.some((v) => v.trim() !== ""));
}

/** "10709-5 ENVIADA A CBA" → código "10709-5" y, como hay algo más, el texto completo como nota. */
export function separarCodigoCristal(texto: string): { codigo: string | null; nota: string | null } {
  const limpio = texto.trim();
  if (!limpio) return { codigo: null, nota: null };
  const m = /^(\d{3,6})(?:\s*-\s*(\d{1,2})(?!\d))?/.exec(limpio);
  if (!m) return { codigo: null, nota: limpio };
  const resto = limpio.slice(m[0].length).trim();
  return { codigo: m[2] ? `${m[1]}-${m[2]}` : m[1], nota: resto ? limpio : null };
}

const sinTildes = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** "20 de agosto de 2026", "2026-08-20" o "20/08/2026" → "2026-08-20"; `null` si no se entiende. */
function leerFecha(texto: string): string | null {
  const t = sinTildes(texto);
  let anio: number, mes: number, dia: number;
  let m = /^(\d{1,2}) de ([a-z]+) de (\d{4})$/.exec(t);
  if (m) [dia, mes, anio] = [Number(m[1]), MESES.indexOf(m[2] === "setiembre" ? "septiembre" : m[2]) + 1, Number(m[3])];
  else if ((m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t))) [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  else if ((m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t))) [dia, mes, anio] = [Number(m[1]), Number(m[2]), Number(m[3])];
  else return null;
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return mes >= 1 && fecha.getUTCDate() === dia && fecha.getUTCMonth() === mes - 1 ? fecha.toISOString().slice(0, 10) : null;
}

/** "Sancor (https://app.notion.com/p/abc?pvs=21)" → { clave: "abc", titulo: "Sancor" }. Sin título, `titulo` es null. */
function leerRelacion(texto: string): { clave: string; titulo: string | null } | null {
  const t = texto.trim();
  if (!t) return null;
  const m = /^(.*?)\s*\((https?:\/\/[^\s)]+)\)/.exec(t);
  if (!m) return { clave: t, titulo: t };
  const ruta = new URL(m[2]).pathname.split("/").filter(Boolean);
  const titulo = m[1].trim();
  return { clave: ruta.at(-1) ?? m[2], titulo: !titulo || /^(sin t[ií]tulo|untitled)$/i.test(titulo) ? null : titulo };
}

const ESTADOS: Record<string, EstadoOrden> = {
  "falta pedir": "FALTA_PEDIR",
  pedido: "PEDIDO",
  "turno asignado": "TURNO_ASIGNADO",
  instalada: "INSTALADA",
  facturada: "FACTURADA",
  cobrada: "COBRADA",
  cancelada: "CANCELADA",
};

/** Un siniestro de verdad: un link o un número (con guiones), a veces seguido de la palabra "SINIESTRO". */
const SINIESTRO = /^(https?:\/\/\S+|\d[\d\s\-/]*\d|\d)(?:\s+siniestro)?$/i;

export interface OrdenImportada {
  /** Número de fila en el archivo (el encabezado es la 1), para los mensajes. */
  fila: number;
  recibidaEl: string;
  tipo: TipoOrden;
  estado: EstadoOrden;
  patente: string | null;
  vehiculo: string | null;
  cliente: { nombre: string; telefono: string };
  /** Clave de la aseguradora o del proveedor en `aseguradoras` / `proveedores`. */
  aseguradora: string | null;
  proveedor: string | null;
  siniestro: string | null;
  codigoCristal: string | null;
  observaciones: string | null;
}

export interface Importacion {
  ordenes: OrdenImportada[];
  /** Una por página de Notion: con su nombre, o "Aseguradora N" si la página no tiene título. */
  aseguradoras: { clave: string; nombre: string }[];
  proveedores: { clave: string; nombre: string }[];
}

/** Asigna nombres a las relaciones: el título de Notion o "<base> N", salteando los nombres que ya existen. */
function nombrar(relaciones: Map<string, string | null>, base: string, existentes: string[]) {
  const usados = new Set(existentes.map(sinTildes));
  let n = 0;
  return [...relaciones].map(([clave, titulo]) => {
    if (titulo) return { clave, nombre: titulo };
    let nombre: string;
    do nombre = `${base} ${++n}`;
    while (usados.has(sinTildes(nombre)));
    usados.add(sinTildes(nombre));
    return { clave, nombre };
  });
}

const COLUMNAS_OBLIGATORIAS = ["Fecha de recepción", "Patente", "Estado"];

export function prepararImportacion(texto: string, existentes: { aseguradoras: string[]; proveedores: string[] }): Importacion {
  const [encabezado, ...filas] = leerCsv(texto);
  const columnas = new Map((encabezado ?? []).map((nombre, i) => [sinTildes(nombre), i]));
  const faltan = COLUMNAS_OBLIGATORIAS.filter((c) => !columnas.has(sinTildes(c)));
  if (faltan.length > 0) {
    throw new ImportacionError(`El archivo no parece la exportación de Órdenes de Trabajo: le falta ${faltan.map((c) => `"${c}"`).join(", ")}.`);
  }
  if (filas.length === 0) throw new ImportacionError("El archivo no tiene órdenes.");

  const aseguradoras = new Map<string, string | null>();
  const proveedores = new Map<string, string | null>();

  const ordenes = filas.map((valores, i): OrdenImportada => {
    const fila = i + 2;
    const celda = (columna: string) => (valores[columnas.get(sinTildes(columna)) ?? -1] ?? "").trim();
    const notas: string[] = [];

    const recibidaEl = leerFecha(celda("Fecha de recepción"));
    if (!recibidaEl) throw new ImportacionError(`La fila ${fila} tiene una fecha que no se entiende: "${celda("Fecha de recepción")}".`);

    const aseguradora = leerRelacion(celda("Aseguradora"));
    if (aseguradora && !aseguradoras.has(aseguradora.clave)) aseguradoras.set(aseguradora.clave, aseguradora.titulo);
    const proveedor = leerRelacion(celda("Pedido al Proveedor"));
    if (proveedor && !proveedores.has(proveedor.clave)) proveedores.set(proveedor.clave, proveedor.titulo);

    const tipoTexto = sinTildes(celda("Tipo"));
    const tipo: TipoOrden = tipoTexto === "seguro" ? "SEGURO" : tipoTexto === "particular" ? "PARTICULAR" : aseguradora ? "SEGURO" : "PARTICULAR";

    const estadoTexto = celda("Estado");
    const estado = ESTADOS[sinTildes(estadoTexto)] ?? "FALTA_PEDIR";
    if (estadoTexto && !ESTADOS[sinTildes(estadoTexto)]) notas.push(`Estado en Notion: ${estadoTexto}`);

    const { codigo, nota } = separarCodigoCristal(celda("Observaciones"));
    if (nota) notas.push(nota);

    let siniestro: string | null = null;
    const textoSiniestro = celda("Siniestro");
    const esSiniestro = SINIESTRO.exec(textoSiniestro);
    if (tipo === "SEGURO" && esSiniestro) siniestro = esSiniestro[1].trim();
    else if (textoSiniestro) notas.push(`${tipo === "PARTICULAR" ? "Pago" : "Nota"}: ${textoSiniestro}`);

    if (celda("Facturas")) notas.push(`Facturas: ${celda("Facturas")}`);
    if (celda("Cliente Seguro")) notas.push(`Cliente seguro: ${celda("Cliente Seguro")}`);

    // En la planilla, a veces en "Teléfono" anotaban un nombre ("RODRI"): entonces es el nombre del cliente.
    const telefono = celda("Teléfono");
    const tieneDigitos = /\d/.test(telefono);
    const titulo = leerRelacion(celda("Cliente"))?.titulo ?? null;
    const nombre = (titulo ?? (!tieneDigitos && telefono ? telefono : "Sin nombre")).slice(0, 100);

    return {
      fila,
      recibidaEl,
      tipo,
      estado,
      patente: normalizarPatente(celda("Patente")) || null,
      vehiculo: celda("Vehículo") || null,
      cliente: { nombre, telefono: tieneDigitos ? telefono : "" },
      aseguradora: aseguradora?.clave ?? null,
      proveedor: proveedor?.clave ?? null,
      siniestro,
      codigoCristal: codigo,
      observaciones: notas.length > 0 ? notas.join("\n") : null,
    };
  });

  return {
    ordenes,
    aseguradoras: nombrar(aseguradoras, "Aseguradora", existentes.aseguradoras),
    proveedores: nombrar(proveedores, "Proveedor", existentes.proveedores),
  };
}
