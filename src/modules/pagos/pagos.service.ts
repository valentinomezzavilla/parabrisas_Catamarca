import { db } from "@/lib/db";
import { crearPreferencia } from "@/lib/mercadopago";

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
