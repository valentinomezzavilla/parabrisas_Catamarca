"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { casilla, erroresDeZod, fallo, texto, type EstadoFormulario } from "@/lib/formularios";
import { obtenerSesion } from "@/lib/sesion";
import { CobroNoDisponibleError, iniciarCobro } from "@/modules/pagos/pagos.service";
import { CondicionesNoAceptadasError, reservarTurno, TurnoNoDisponibleError } from "@/modules/turnos/servicio.service";

export async function reservar(_previo: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  // Si quien reserva tiene sesión del panel (carga un turno desde "Nuevo turno"), no se le cobra seña.
  const personal = (await obtenerSesion()) !== null;

  let destino: string;
  try {
    const { turno, pagoId } = await reservarTurno(
      {
        servicioId: texto(fd, "servicioId") ?? "",
        inicio: texto(fd, "inicio") ?? "",
        cliente: { nombre: texto(fd, "nombre") ?? "", telefono: texto(fd, "telefono") ?? "", email: texto(fd, "email") },
        vehiculo: texto(fd, "vehiculo"),
        patente: texto(fd, "patente"),
        notas: texto(fd, "notas"),
      },
      { omitirSena: personal, aceptoCondiciones: casilla(fd, "aceptaCondiciones") },
    );
    destino = pagoId ? (await iniciarCobro(pagoId)).urlPago : `/reservar/confirmado?turno=${turno.id}`;
  } catch (e) {
    if (e instanceof ZodError) return fallo(erroresDeZod(e));
    if (e instanceof CondicionesNoAceptadasError)
      return fallo({ aceptaCondiciones: "Tenés que aceptar las condiciones de la seña para reservar" });
    if (e instanceof TurnoNoDisponibleError)
      return { ok: false, mensaje: "Ese horario se acaba de ocupar. Volvé atrás y elegí otro, por favor." };
    if (e instanceof CobroNoDisponibleError)
      return { ok: false, mensaje: "No pudimos iniciar el pago. Probá de nuevo en unos minutos." };
    throw e;
  }
  revalidatePath("/turnos");
  redirect(destino);
}
