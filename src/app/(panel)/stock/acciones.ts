"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { erroresDeZod, esDuplicado, fallo, json, numero, texto, type EstadoFormulario } from "@/lib/formularios";
import {
  actualizarCristal,
  cambiarEstadoCristal,
  crearCristal,
  registrarMovimiento,
  StockInsuficienteError,
} from "@/modules/inventario/cristal.service";
import type { CrearCristalInput } from "@/modules/inventario/schemas";

// TODO(auth): validar la sesión del administrador en cada acción cuando se agregue el login.

/** Características: cada campo "car_<id>" del formulario. Las casillas sin tildar no llegan. */
function leerCaracteristicas(fd: FormData) {
  const valores: { caracteristicaId: string; valor: string }[] = [];
  for (const [clave, valor] of fd.entries()) {
    if (!clave.startsWith("car_") || typeof valor !== "string" || valor.trim() === "") continue;
    valores.push({ caracteristicaId: clave.slice(4), valor: valor === "on" ? "true" : valor.trim() });
  }
  return valores;
}

export async function guardarCristal(
  id: string | null,
  _previo: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  // Los tipos se validan en el servicio (crearCristalSchema); acá solo se leen los campos.
  const entrada = {
    codigo: texto(fd, "codigo"),
    codigoFabricante: texto(fd, "codigoFabricante"),
    descripcion: texto(fd, "descripcion"),
    marcaId: texto(fd, "marcaId"),
    tipoId: texto(fd, "tipoId"),
    ubicacionId: texto(fd, "ubicacionId"),
    lado: texto(fd, "lado") ?? "NO_APLICA",
    anchoMm: numero(fd, "anchoMm"),
    altoMm: numero(fd, "altoMm"),
    espesorMm: numero(fd, "espesorMm"),
    cantidadInicial: numero(fd, "cantidadInicial") ?? 0,
    stockMinimo: numero(fd, "stockMinimo") ?? 0,
    ubicacionDeposito: texto(fd, "ubicacionDeposito"),
    costo: numero(fd, "costo"),
    precioVenta: numero(fd, "precioVenta"),
    caracteristicas: leerCaracteristicas(fd),
    compatibilidades: json(fd, "compatibilidades", []),
  } as CrearCristalInput;

  let destino: string;
  try {
    if (id) {
      const { cantidadInicial: _, ...cambios } = entrada;
      await actualizarCristal(id, cambios);
      destino = `/stock/${id}?aviso=actualizado`;
    } else {
      const creado = await crearCristal(entrada);
      destino = `/stock/${creado.id}?aviso=creado`;
    }
  } catch (e) {
    if (e instanceof ZodError) return fallo(erroresDeZod(e));
    if (esDuplicado(e)) return fallo({ codigo: "Ya existe un cristal con ese código" });
    throw e;
  }

  revalidatePath("/stock");
  redirect(destino);
}

export async function guardarMovimiento(
  cristalId: string,
  _previo: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const tipo = texto(fd, "tipo") as "INGRESO" | "EGRESO" | "AJUSTE";
  try {
    const mov = await registrarMovimiento({ cristalId, tipo, cantidad: numero(fd, "cantidad") as number, motivo: texto(fd, "motivo") });
    revalidatePath(`/stock/${cristalId}`);
    revalidatePath("/stock");
    return { ok: true, mensaje: `Movimiento registrado. Stock actual: ${mov.saldo}` };
  } catch (e) {
    if (e instanceof ZodError) return fallo(erroresDeZod(e));
    if (e instanceof StockInsuficienteError) return fallo({ cantidad: e.message }, e.message);
    throw e;
  }
}

export async function alternarCristal(id: string, activo: boolean) {
  await cambiarEstadoCristal(id, activo);
  revalidatePath(`/stock/${id}`);
  revalidatePath("/stock");
}
