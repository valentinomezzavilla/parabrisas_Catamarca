import type { EstadoBeneficio, TipoBeneficio } from "@/generated/prisma/client";
import { pesos } from "@/lib/formato";
import { primerNombre } from "./reglas";

// Puro. Estado y texto de un beneficio, y el mensaje de WhatsApp de cumpleaños.

/** VENCIDO no se guarda: es un beneficio vigente al que se le pasó la fecha. */
export type EstadoVisible = EstadoBeneficio | "VENCIDO";

export interface DatosBeneficio {
  titulo: string;
  tipo: TipoBeneficio;
  valor: { toString(): string } | null;
  estado: EstadoBeneficio;
  /** "YYYY-MM-DD" o `null` (sin vencimiento). */
  vigenteHasta: string | null;
}

export function estadoVisible(b: Pick<DatosBeneficio, "estado" | "vigenteHasta">, hoy: string): EstadoVisible {
  if (b.estado !== "VIGENTE") return b.estado;
  return b.vigenteHasta !== null && b.vigenteHasta < hoy ? "VENCIDO" : "VIGENTE";
}

/** Se puede ofrecer y aplicar: vigente y dentro de la fecha. */
export const estaVigente = (b: Pick<DatosBeneficio, "estado" | "vigenteHasta">, hoy: string) => estadoVisible(b, hoy) === "VIGENTE";

/** Lo que se le dice al cliente: "Polarizado (10% de descuento)", "Lavado ($5.000 de descuento)" o solo el título. */
export function textoOferta(b: Pick<DatosBeneficio, "titulo" | "tipo" | "valor">): string {
  const valor = b.valor === null ? null : Number(b.valor);
  if (b.tipo === "PORCENTAJE" && valor !== null) return `${b.titulo} (${valor}% de descuento)`;
  if (b.tipo === "MONTO" && valor !== null) return `${b.titulo} (${pesos(valor)} de descuento)`;
  return b.titulo;
}

/** Saludo de cumpleaños para WhatsApp, con el beneficio que se eligió ofrecer (o sin ninguno). */
export function mensajeCumple(nombre: string, oferta: string | null): string {
  const saludo = `¡Feliz cumpleaños${primerNombre(nombre) ? `, ${primerNombre(nombre)}` : ""}! 🎂 De parte de todo el equipo de Parabrisas Catamarca te deseamos un día muy especial.`;
  return oferta ? `${saludo} Para festejarlo queremos ofrecerte: ${oferta}. ¡Te esperamos!` : saludo;
}
