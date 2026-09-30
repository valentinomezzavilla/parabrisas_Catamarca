"use server";

import { revalidatePath } from "next/cache";
import type { EstadoTurno } from "@/generated/prisma/client";
import type { EstadoFormulario } from "@/lib/formularios";
import { StockInsuficienteError } from "@/modules/inventario/cristal.service";
import { asignarCristal, cambiarEstadoTurno } from "@/modules/turnos/turno.service";

// TODO(auth): validar la sesión del administrador en cada acción cuando se agregue el login.

export async function actualizarEstadoTurno(id: string, estado: EstadoTurno): Promise<EstadoFormulario> {
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
  const cristalId = fd.get("cristalId");
  await asignarCristal(turnoId, typeof cristalId === "string" && cristalId ? cristalId : null);
  revalidatePath("/turnos");
}
