"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import type { EstadoTurno } from "@/generated/prisma/client";
import { erroresDeZod, fallo, numero, texto, type EstadoFormulario } from "@/lib/formularios";
import { verificarSesion } from "@/lib/sesion";
import { fechaLocal } from "@/lib/tiempo";
import { StockInsuficienteError } from "@/modules/inventario/cristal.service";
import { marcarDevuelto } from "@/modules/pagos/pagos.service";
import { TurnoNoDisponibleError } from "@/modules/turnos/servicio.service";
import { asignarCristal, cambiarEstadoTurno, editarTurno, TurnoNoEditableError } from "@/modules/turnos/turno.service";

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

export async function editarTurnoAccion(id: string, _previo: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await verificarSesion();

  let destino: string;
  try {
    const turno = await editarTurno(id, {
      servicioId: texto(fd, "servicioId") ?? "",
      inicio: texto(fd, "inicio") ?? "",
      cliente: { nombre: texto(fd, "nombre") ?? "", telefono: texto(fd, "telefono") ?? "", email: texto(fd, "email") },
      vehiculo: texto(fd, "vehiculo"),
      patente: texto(fd, "patente"),
      cristalId: texto(fd, "cristalId"),
      precio: numero(fd, "precio"),
      notas: texto(fd, "notas"),
    });
    destino = `/turnos?fecha=${fechaLocal(turno.inicio)}`;
  } catch (e) {
    if (e instanceof ZodError) return fallo(erroresDeZod(e));
    if (e instanceof TurnoNoDisponibleError) return { ok: false, mensaje: "Ese horario ya no está disponible. Elegí otro." };
    if (e instanceof TurnoNoEditableError) return { ok: false, mensaje: e.message };
    throw e;
  }
  revalidatePath("/turnos");
  revalidatePath("/");
  redirect(destino);
}
