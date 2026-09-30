"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { esDuplicado, type EstadoFormulario } from "@/lib/formularios";
import { requerirRol } from "@/lib/sesion";
import {
  activarItem,
  cambiarTieneLado,
  crearItem,
  eliminarItem,
  ListaError,
  moverUbicacion,
  renombrarItem,
  type ListaId,
} from "@/modules/campos/lista.service";

const LISTAS = ["marcas", "tipos", "ubicaciones", "marcasVehiculo", "modelos"] as const;
const esLista = (v: string): v is ListaId => (LISTAS as readonly string[]).includes(v);

function refrescar() {
  revalidatePath("/administracion/stock/listas");
  revalidatePath("/stock", "layout");
}

/** Traduce los errores esperados a un mensaje para la pantalla; el resto se propaga. */
function aResultado(e: unknown): EstadoFormulario {
  if (e instanceof ZodError) return { ok: false, mensaje: "El nombre debe tener entre 1 y 80 caracteres." };
  if (e instanceof ListaError) return { ok: false, mensaje: e.message };
  if (esDuplicado(e)) return { ok: false, mensaje: "Ya existe un elemento con ese nombre." };
  throw e;
}

const INVALIDA: EstadoFormulario = { ok: false, mensaje: "Lista inválida." };

export async function crearItemAccion(lista: string, marcaId: string | null, nombre: string, tieneLado?: boolean): Promise<EstadoFormulario> {
  await requerirRol("ADMIN");
  if (!esLista(lista)) return INVALIDA;
  try {
    await crearItem(lista, { nombre, marcaId: marcaId ?? undefined, tieneLado });
  } catch (e) {
    return aResultado(e);
  }
  refrescar();
  return { ok: true };
}

export async function renombrarItemAccion(lista: string, id: string, nombre: string): Promise<EstadoFormulario> {
  await requerirRol("ADMIN");
  if (!esLista(lista)) return INVALIDA;
  try {
    await renombrarItem(lista, id, nombre);
  } catch (e) {
    return aResultado(e);
  }
  refrescar();
  return { ok: true };
}

export async function activarItemAccion(lista: string, id: string, activo: boolean): Promise<EstadoFormulario> {
  await requerirRol("ADMIN");
  if (!esLista(lista)) return INVALIDA;
  await activarItem(lista, id, activo === true);
  refrescar();
  return { ok: true };
}

export async function eliminarItemAccion(lista: string, id: string): Promise<EstadoFormulario> {
  await requerirRol("ADMIN");
  if (!esLista(lista)) return INVALIDA;
  try {
    await eliminarItem(lista, id);
  } catch (e) {
    return aResultado(e);
  }
  refrescar();
  return { ok: true };
}

export async function moverUbicacionAccion(id: string, direccion: "ARRIBA" | "ABAJO"): Promise<EstadoFormulario> {
  await requerirRol("ADMIN");
  if (direccion !== "ARRIBA" && direccion !== "ABAJO") return { ok: false, mensaje: "Dirección inválida." };
  await moverUbicacion(id, direccion);
  refrescar();
  return { ok: true };
}

export async function tieneLadoAccion(id: string, valor: boolean): Promise<EstadoFormulario> {
  await requerirRol("ADMIN");
  await cambiarTieneLado(id, valor === true);
  refrescar();
  return { ok: true };
}
