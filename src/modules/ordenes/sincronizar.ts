import type { EstadoTurno, Prisma } from "@/generated/prisma/client";
import { cobradoDe, estadoSegunCobros, estadoTrasTurno } from "./estados";

/**
 * Lleva a la orden el cambio de estado de su turno: completado → Instalada (y Cobrada si ya estaba todo pagado);
 * cancelado o ausente → vuelve a Pedido. Se llama dentro de la transacción que cambia el turno.
 */
export async function sincronizarOrdenConTurno(tx: Prisma.TransactionClient, turnoId: string, estadoTurno: EstadoTurno) {
  const orden = await tx.ordenTrabajo.findUnique({ where: { turnoId }, include: { cobros: { select: { monto: true } } } });
  if (!orden) return;
  const estado = estadoSegunCobros({
    estado: estadoTrasTurno(orden.estado, estadoTurno),
    total: orden.importeTotal === null ? null : Number(orden.importeTotal),
    cobrado: cobradoDe(orden),
    facturada: !!orden.facturaNumero,
  });
  if (estado !== orden.estado) await tx.ordenTrabajo.update({ where: { id: orden.id }, data: { estado } });
}
