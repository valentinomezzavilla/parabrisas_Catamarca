"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import {
  casilla,
  erroresDeZod,
  esDuplicado,
  fallo,
  json,
  numero,
  texto,
  type EstadoFormulario,
} from "@/lib/formularios";
import { requerirRol } from "@/lib/sesion";
import type { ServicioInput } from "@/modules/turnos/schemas";
import {
  actualizarServicio,
  cambiarEstadoServicio,
  crearServicio,
  eliminarServicio,
} from "@/modules/turnos/servicio.service";

/** Campos propios: cada control `extra_<clave>` del formulario. Las casillas sin tildar no llegan. */
function leerExtras(fd: FormData): Record<string, unknown> {
  const extras: Record<string, unknown> = {};
  for (const [clave, valor] of fd.entries()) {
    if (clave.startsWith("extra_") && typeof valor === "string") extras[clave] = valor;
  }
  return extras;
}

export async function guardarServicio(
  id: string | null,
  _previo: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  await requerirRol("ADMIN");
  // Los tipos se validan en el servicio (servicioSchema); acá solo se leen los campos.
  const entrada = {
    nombre: texto(fd, "nombre"),
    slug: texto(fd, "slug"),
    descripcion: texto(fd, "descripcion"),
    duracionMinutos: numero(fd, "duracionMinutos"),
    intervaloMinutos: numero(fd, "intervaloMinutos"),
    margenMinutos: numero(fd, "margenMinutos") ?? 0,
    capacidad: numero(fd, "capacidad"),
    anticipacionMinutos: numero(fd, "anticipacionMinutos"),
    precioBase: numero(fd, "precioBase"),
    color: texto(fd, "color"),
    requiereCristal: casilla(fd, "requiereCristal"),
    activo: casilla(fd, "activo"),
    orden: numero(fd, "orden"),
    horarios: json(fd, "horarios", []),
    extrasEntrada: leerExtras(fd),
    extrasDibujados: json<string[] | undefined>(fd, "camposDibujados", undefined),
  } as ServicioInput;

  try {
    if (id) await actualizarServicio(id, entrada);
    else await crearServicio(entrada);
  } catch (e) {
    if (e instanceof ZodError) return fallo(erroresDeZod(e));
    if (esDuplicado(e)) return fallo({ nombre: "Ya existe un servicio con ese nombre" });
    throw e;
  }

  revalidatePath("/servicios");
  redirect(`/servicios?aviso=${id ? "actualizado" : "creado"}`);
}

export async function alternarServicio(id: string, activo: boolean) {
  await requerirRol("ADMIN");
  await cambiarEstadoServicio(id, activo);
  revalidatePath("/servicios");
}

export async function borrarServicio(id: string) {
  await requerirRol("ADMIN");
  const { resultado } = await eliminarServicio(id);
  revalidatePath("/servicios");
  redirect(`/servicios?aviso=${resultado}`);
}
