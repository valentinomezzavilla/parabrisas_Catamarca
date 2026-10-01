import { db } from "@/lib/db";

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
