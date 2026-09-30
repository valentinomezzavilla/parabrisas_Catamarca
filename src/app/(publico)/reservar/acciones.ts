"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { erroresDeZod, fallo, texto, type EstadoFormulario } from "@/lib/formularios";
import { reservarTurno, TurnoNoDisponibleError } from "@/modules/turnos/servicio.service";

export async function reservar(_previo: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  let turnoId: string;
  try {
    const turno = await reservarTurno({
      servicioId: texto(fd, "servicioId") ?? "",
      inicio: texto(fd, "inicio") ?? "",
      cliente: { nombre: texto(fd, "nombre") ?? "", telefono: texto(fd, "telefono") ?? "", email: texto(fd, "email") },
      vehiculo: texto(fd, "vehiculo"),
      patente: texto(fd, "patente"),
      notas: texto(fd, "notas"),
    });
    turnoId = turno.id;
  } catch (e) {
    if (e instanceof ZodError) return fallo(erroresDeZod(e));
    if (e instanceof TurnoNoDisponibleError)
      return { ok: false, mensaje: "Ese horario se acaba de ocupar. Volvé atrás y elegí otro, por favor." };
    throw e;
  }
  revalidatePath("/turnos");
  redirect(`/reservar/confirmado?turno=${turnoId}`);
}
