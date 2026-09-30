"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { erroresDeZod, esDuplicado, fallo, json, numero, texto, type EstadoFormulario } from "@/lib/formularios";
import { verificarSesion } from "@/lib/sesion";
import { obtenerCampos } from "@/modules/campos/campo.service";
import {
  actualizarCristal,
  cambiarEstadoCristal,
  crearCristal,
  registrarMovimiento,
  StockInsuficienteError,
} from "@/modules/inventario/cristal.service";
import type { CrearCristalInput } from "@/modules/inventario/schemas";

/** Campos propios: cada control `extra_<clave>` del formulario. Las casillas sin tildar no llegan. */
function leerExtras(fd: FormData): Record<string, unknown> {
  const extras: Record<string, unknown> = {};
  for (const [clave, valor] of fd.entries()) {
    if (clave.startsWith("extra_") && typeof valor === "string") extras[clave] = valor;
  }
  return extras;
}

export async function guardarCristal(
  id: string | null,
  _previo: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  await verificarSesion();

  // Un campo del sistema oculto no viaja en el formulario: queda sin valor al crear y sin tocar al editar.
  const campos = await obtenerCampos("CRISTAL");
  const visible = (clave: string) => campos.find((c) => c.clave === clave)?.visible ?? true;
  const siVisible = <T,>(clave: string, leer: () => T): T | undefined => (visible(clave) ? leer() : undefined);

  // Los tipos se validan en el servicio (crearCristalSchema); acá solo se leen los campos.
  const entrada = {
    codigo: texto(fd, "codigo"),
    codigoFabricante: siVisible("codigoFabricante", () => texto(fd, "codigoFabricante")),
    descripcion: texto(fd, "descripcion"),
    marcaId: texto(fd, "marcaId"),
    tipoId: texto(fd, "tipoId"),
    ubicacionId: texto(fd, "ubicacionId"),
    lado: siVisible("lado", () => texto(fd, "lado") ?? "NO_APLICA"),
    anchoMm: siVisible("anchoMm", () => numero(fd, "anchoMm")),
    altoMm: siVisible("altoMm", () => numero(fd, "altoMm")),
    espesorMm: siVisible("espesorMm", () => numero(fd, "espesorMm")),
    cantidadInicial: numero(fd, "cantidadInicial") ?? 0,
    stockMinimo: numero(fd, "stockMinimo") ?? 0,
    ubicacionDeposito: siVisible("ubicacionDeposito", () => texto(fd, "ubicacionDeposito")),
    costo: siVisible("costo", () => numero(fd, "costo")),
    precioVenta: siVisible("precioVenta", () => numero(fd, "precioVenta")),
    extrasEntrada: leerExtras(fd),
    compatibilidades: siVisible("compatibilidades", () => json(fd, "compatibilidades", [])),
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
  await verificarSesion();
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
  await verificarSesion();
  await cambiarEstadoCristal(id, activo);
  revalidatePath(`/stock/${id}`);
  revalidatePath("/stock");
}
