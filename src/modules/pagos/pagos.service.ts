import { db } from "@/lib/db";
import { buscarPagosPorReferencia, crearPreferencia } from "@/lib/mercadopago";
import { fechaLocal } from "@/lib/tiempo";
import { disponibilidadDelDia } from "@/modules/turnos/servicio.service";
import { decidirPago, type MotivoDevolucion, type PagoMp } from "./decision";

export class CobroNoDisponibleError extends Error {
  constructor() {
    super("No se pudo iniciar el cobro de la seña");
  }
}

/**
 * Crea la preferencia de pago en Mercado Pago y guarda su link. Si Mercado Pago no responde, cancela el turno
 * recién creado (el horario queda libre) y lanza `CobroNoDisponibleError`.
 */
export async function iniciarCobro(pagoId: string): Promise<{ urlPago: string }> {
  const pago = await db.pago.findUniqueOrThrow({
    where: { id: pagoId },
    include: { turno: { include: { servicio: true, cliente: true } } },
  });

  try {
    const urlApp = process.env.APP_URL;
    if (!urlApp) throw new Error("Falta APP_URL en .env");
    if (!pago.turno.venceEn) throw new Error("El turno no tiene vencimiento");

    const preferencia = await crearPreferencia({
      pagoId: pago.id,
      turnoId: pago.turnoId,
      titulo: `Seña · ${pago.turno.servicio.nombre}`,
      monto: Number(pago.monto),
      nombreCliente: pago.turno.cliente.nombre,
      emailCliente: pago.turno.cliente.email ?? undefined,
      venceEn: pago.turno.venceEn,
      ahora: new Date(),
      urlApp,
    });
    await db.pago.update({ where: { id: pago.id }, data: { mpPreferenciaId: preferencia.id, mpInitPoint: preferencia.initPoint } });
    return { urlPago: preferencia.initPoint };
  } catch (error) {
    console.error("No se pudo crear la preferencia de Mercado Pago:", error);
    await db.$transaction([
      db.turno.update({ where: { id: pago.turnoId }, data: { estado: "CANCELADO" } }),
      db.pago.update({ where: { id: pago.id }, data: { estado: "VENCIDO" } }),
    ]);
    throw new CobroNoDisponibleError();
  }
}

/**
 * Cancela los turnos que esperaban el pago y ya vencieron, y marca sus pagos como vencidos, en una sola
 * transacción. La disponibilidad ya los ignora por la fecha; esto evita que se acumulen en la agenda.
 * Si el pago llega después, `aplicarPagoMp` lo trata como "pago tardío".
 */
export async function liberarVencidos(ahora: Date = new Date()): Promise<number> {
  return db.$transaction(async (tx) => {
    const vencidos = await tx.turno.findMany({
      where: { estado: "ESPERANDO_PAGO", venceEn: { lte: ahora } },
      select: { id: true },
    });
    if (vencidos.length === 0) return 0;

    const ids = vencidos.map((t) => t.id);
    await tx.turno.updateMany({ where: { id: { in: ids } }, data: { estado: "CANCELADO" } });
    await tx.pago.updateMany({
      where: { turnoId: { in: ids }, estado: { in: ["PENDIENTE", "RECHAZADO"] } },
      data: { estado: "VENCIDO" },
    });
    return ids.length;
  });
}

const TEXTO_MOTIVO: Record<MotivoDevolucion, string> = {
  monto_distinto: "El monto cobrado no coincide con la seña",
  horario_tomado: "Pagó después de que venciera y el horario ya lo tomó otro",
  turno_cancelado: "Pagó un turno que ya estaba cancelado",
  pago_duplicado: "Pago duplicado",
};

export interface ResultadoAplicacion {
  tipo: "confirmado" | "rechazado" | "a_devolver" | "ignorado" | "no_encontrado";
}

/**
 * Aplica a nuestros datos un pago que Mercado Pago informó (ya consultado a su API). Lo usan el webhook y la
 * página de retorno. Es idempotente: se ejecuta dentro del lock del servicio, así que avisos repetidos o
 * simultáneos no confirman dos veces ni se saltan el vencimiento.
 */
export async function aplicarPagoMp(mp: PagoMp): Promise<ResultadoAplicacion> {
  if (!mp.referencia) return { tipo: "no_encontrado" };
  const previo = await db.pago.findUnique({
    where: { id: mp.referencia },
    select: { id: true, turno: { select: { servicioId: true } } },
  });
  if (!previo) return { tipo: "no_encontrado" };

  return db.$transaction(async (tx): Promise<ResultadoAplicacion> => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${previo.turno.servicioId}))`;
    const pago = await tx.pago.findUniqueOrThrow({ where: { id: previo.id }, include: { turno: true } });
    const turno = pago.turno;

    let horarioLibre = false;
    if (mp.estado === "approved") {
      const libres = await disponibilidadDelDia(tx, turno.servicioId, fechaLocal(turno.inicio));
      horarioLibre = libres.some((t) => t.inicio.getTime() === turno.inicio.getTime());
    }

    const decision = decidirPago(mp, {
      montoEsperado: Number(pago.monto),
      pagoEstado: pago.estado,
      yaAplicado: pago.mpPagoId === mp.id || (pago.motivoDevolucion ?? "").includes(`#${mp.id}`),
      turnoEstado: turno.estado,
      venceEnPasado: !!turno.venceEn && turno.venceEn <= new Date(),
      horarioLibre,
    });

    switch (decision.accion) {
      case "confirmar":
        await tx.pago.update({ where: { id: pago.id }, data: { estado: "APROBADO", mpPagoId: mp.id } });
        await tx.turno.update({ where: { id: turno.id }, data: { estado: "CONFIRMADO", venceEn: null } });
        return { tipo: "confirmado" };

      case "rechazar":
        await tx.pago.update({ where: { id: pago.id }, data: { estado: "RECHAZADO" } });
        return { tipo: "rechazado" };

      case "devolver": {
        const detalle = `${TEXTO_MOTIVO[decision.motivo]} (Mercado Pago #${mp.id})`;
        if (decision.motivo === "pago_duplicado") {
          // El primer pago sigue siendo el válido: solo se anota el duplicado para devolverlo.
          await tx.pago.update({
            where: { id: pago.id },
            data: {
              requiereDevolucion: true,
              devueltoEn: null,
              motivoDevolucion: [pago.motivoDevolucion, detalle].filter(Boolean).join(" · "),
            },
          });
        } else {
          await tx.pago.update({
            where: { id: pago.id },
            data: { estado: "APROBADO", mpPagoId: mp.id, requiereDevolucion: true, motivoDevolucion: detalle },
          });
          if (turno.estado === "ESPERANDO_PAGO") {
            await tx.turno.update({ where: { id: turno.id }, data: { estado: "CANCELADO" } });
          }
        }
        return { tipo: "a_devolver" };
      }

      default:
        return { tipo: "ignorado" };
    }
  });
}

/**
 * Al volver el cliente de Mercado Pago, consulta sus pagos y los aplica. No lanza: si la consulta falla,
 * la página muestra "esperando confirmación" y el webhook lo resuelve después.
 */
export async function sincronizarPago(turnoId: string): Promise<void> {
  const pago = await db.pago.findFirst({
    where: { turnoId, estado: { not: "APROBADO" } },
    orderBy: { creadoEn: "desc" },
    select: { id: true },
  });
  if (!pago) return;
  try {
    for (const p of await buscarPagosPorReferencia(pago.id)) await aplicarPagoMp(p);
  } catch (error) {
    console.error("No se pudo sincronizar el pago con Mercado Pago:", error);
  }
}

/** Pagos que el local tiene que devolver a mano desde Mercado Pago. */
export function listarPagosParaDevolver() {
  return db.pago.findMany({
    where: { requiereDevolucion: true, devueltoEn: null },
    include: { turno: { include: { cliente: true, servicio: { select: { nombre: true } } } } },
    orderBy: { actualizadoEn: "desc" },
  });
}

export async function marcarDevuelto(pagoId: string): Promise<void> {
  await db.pago.update({ where: { id: pagoId }, data: { devueltoEn: new Date() } });
}
