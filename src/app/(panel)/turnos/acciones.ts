"use server";

import { revalidatePath } from "next/cache";
import type { EstadoTurno } from "@/generated/prisma/client";
import type { EstadoFormulario } from "@/lib/formularios";
import { verificarSesion } from "@/lib/sesion";
import { StockInsuficienteError } from "@/modules/inventario/cristal.service";
import { marcarDevuelto } from "@/modules/pagos/pagos.service";
import { asignarCristal, cambiarEstadoTurno } from "@/modules/turnos/turno.service";

export async function actualizarEstadoTurno(id: string, estado: EstadoTurno): Promise<EstadoFormulario> {
  await verificarSesion();
  try {
    await cambiarEstadoTurno(id, estado);
  } catch (e) {
    if (e instanceof StockInsuficienteError)
      return { ok: false, mensaje: "No hay stock del cristal asignado: registrá el ingreso o asigná otro antes de completar." };
    throw e;
  }
  revalidatePath("/turnos");
  revalidatePath("/stock");
  revalidatePath("/");
  return { ok: true };
}

export async function actualizarCristalTurno(turnoId: string, fd: FormData) {
  await verificarSesion();
  const cristalId = fd.get("cristalId");
  await asignarCristal(turnoId, typeof cristalId === "string" && cristalId ? cristalId : null);
  revalidatePath("/turnos");
}

export async function marcarPagoDevuelto(pagoId: string) {
  await verificarSesion();
  await marcarDevuelto(pagoId);
  revalidatePath("/");
}
