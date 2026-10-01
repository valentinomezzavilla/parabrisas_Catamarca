import { randomInt } from "node:crypto";

// Código corto y legible para que el cliente busque o cancele su reserva. Sin 0, O, 1 ni I para no confundir.
export const ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const LARGO_CODIGO = 6;

/** `azar(max)` devuelve un entero en [0, max): se inyecta para poder probarlo. */
export function generarCodigo(azar: (max: number) => number = (max) => randomInt(max)): string {
  let codigo = "";
  for (let i = 0; i < LARGO_CODIGO; i++) codigo += ALFABETO_CODIGO[azar(ALFABETO_CODIGO.length)];
  return codigo;
}

export const normalizarCodigo = (texto: string): string => texto.trim().toUpperCase().replace(/\s+/g, "");

/** Acepta los códigos nuevos y los hexadecimales con que se completaron los turnos que ya existían. */
export const esCodigoValido = (codigo: string): boolean => /^[A-Z0-9]{6}$/.test(codigo);
