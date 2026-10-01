import { db } from "@/lib/db";
import { fechaLocal, formatearHora } from "@/lib/tiempo";
import { minutosDeBloqueo, registrarFallo } from "@/modules/usuarios/limite";
import {
  aReservaVisible,
  contactoCoincide,
  ESTADOS_BUSCABLES,
  normalizarCriterios,
  resolverBusqueda,
  type CampoBusqueda,
  type RespuestaBusqueda,
  type RespuestaCancelacion,
  type TurnoBuscable,
} from "./busqueda";
import { esCodigoValido, normalizarCodigo } from "./codigo";
import { claveBusqueda, superaTope } from "./tope";

export class BusquedasExcedidasError extends Error {
  constructor() {
    super("Hay muchas búsquedas en este momento");
    this.name = "BusquedasExcedidasError";
  }
}

const MAXIMO_TURNOS_A_REVISAR = 2000;

/** Cuenta esta búsqueda en el minuto actual (en todo el sitio) y corta si se pasó del tope. */
async function contarBusqueda(ahora: Date): Promise<void> {
  const clave = claveBusqueda(ahora);
  const fila = await db.intentoLogin.upsert({
    where: { usuario: clave },
    create: { usuario: clave, fallos: 1, ultimoFallo: ahora },
    update: { fallos: { increment: 1 }, ultimoFallo: ahora },
  });
  // Los contadores de minutos viejos no sirven para nada: se limpian.
  await db.intentoLogin.deleteMany({
    where: { usuario: { startsWith: "busqueda:" }, ultimoFallo: { lt: new Date(ahora.getTime() - 60 * 60_000) } },
  });
  if (superaTope(fila.fallos)) throw new BusquedasExcedidasError();
}

const desdeBase = (t: {
  id: string;
  codigo: string;
  servicioId: string;
  inicio: Date;
  estado: TurnoBuscable["estado"];
  patente: string | null;
  vehiculo: string | null;
  servicio: { nombre: string };
  cliente: { nombre: string; telefono: string; email: string | null };
  pagos: { id: string }[];
}): TurnoBuscable => ({
  id: t.id,
  codigo: t.codigo,
  servicioId: t.servicioId,
  servicioNombre: t.servicio.nombre,
  inicio: t.inicio,
  estado: t.estado,
  nombre: t.cliente.nombre,
  telefono: t.cliente.telefono,
  email: t.cliente.email,
  patente: t.patente,
  vehiculo: t.vehiculo,
  senaPagada: t.pagos.length > 0,
});

/** Busca entre las reservas vigentes y futuras. Lanza `SinCriteriosError` o `BusquedasExcedidasError`. */
export async function buscarReservas(
  entrada: Partial<Record<CampoBusqueda, string | undefined>>,
  ahora: Date = new Date(),
): Promise<Exclude<RespuestaBusqueda, { tipo: "inicial" } | { tipo: "error" }>> {
  const criterios = normalizarCriterios(entrada);
  await contarBusqueda(ahora);

  const turnos = await db.turno.findMany({
    where: {
      estado: { in: ESTADOS_BUSCABLES },
      inicio: { gt: ahora },
      NOT: { estado: "ESPERANDO_PAGO", venceEn: { lte: ahora } },
    },
    include: {
      servicio: { select: { nombre: true } },
      cliente: { select: { nombre: true, telefono: true, email: true } },
      pagos: { where: { estado: "APROBADO" }, select: { id: true } },
    },
    take: MAXIMO_TURNOS_A_REVISAR,
  });

  const r = resolverBusqueda(turnos.map(desdeBase), criterios);
  if (r.tipo === "una") return { tipo: "una", reserva: aReservaVisible(r.turno) };
  return r;
}

function notaDeCancelacion(ahora: Date): string {
  const [, mes, dia] = fechaLocal(ahora).split("-");
  return `Cancelado por el cliente el ${dia}/${mes} ${formatearHora(ahora)}`;
}

/**
 * Cancela una reserva por pedido del cliente. Hay que escribir el teléfono o el mail completos; tras 5 fallos
 * para el mismo turno se bloquea 15 minutos. El mensaje de fallo no dice cuál de los datos estaba bien.
 */
export async function cancelarReservaCliente(
  codigoEntrada: string,
  contacto: string,
  ahora: Date = new Date(),
): Promise<RespuestaCancelacion> {
  const codigo = normalizarCodigo(codigoEntrada);
  if (!esCodigoValido(codigo)) return { tipo: "no_encontrada" };

  const turno = await db.turno.findUnique({
    where: { codigo },
    include: { cliente: true, pagos: { where: { estado: "APROBADO" }, select: { id: true } } },
  });
  if (!turno || !ESTADOS_BUSCABLES.includes(turno.estado) || turno.inicio <= ahora) return { tipo: "no_encontrada" };

  const clave = `cancelar:${turno.id}`;
  return db.$transaction(async (tx): Promise<RespuestaCancelacion> => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${clave}))`;

    // Otro pedido pudo cancelarlo mientras tanto.
    const vigente = await tx.turno.findUnique({ where: { id: turno.id }, select: { estado: true, notas: true } });
    if (!vigente || !ESTADOS_BUSCABLES.includes(vigente.estado)) return { tipo: "no_encontrada" };

    const previo = await tx.intentoLogin.findUnique({ where: { usuario: clave } });
    const espera = minutosDeBloqueo(previo, ahora);
    if (espera > 0) return { tipo: "bloqueada", minutos: espera };

    if (!contactoCoincide(turno.cliente, contacto)) {
      const nuevo = registrarFallo(previo, ahora);
      await tx.intentoLogin.upsert({ where: { usuario: clave }, create: { usuario: clave, ...nuevo }, update: nuevo });
      return nuevo.bloqueadoHasta ? { tipo: "bloqueada", minutos: minutosDeBloqueo(nuevo, ahora) } : { tipo: "contacto_incorrecto" };
    }

    await tx.intentoLogin.deleteMany({ where: { usuario: clave } });
    await tx.turno.update({
      where: { id: turno.id },
      data: { estado: "CANCELADO", notas: [vigente.notas, notaDeCancelacion(ahora)].filter(Boolean).join("\n") },
    });
    await tx.pago.updateMany({ where: { turnoId: turno.id, estado: { in: ["PENDIENTE", "RECHAZADO"] } }, data: { estado: "VENCIDO" } });
    return { tipo: "cancelada", teniaSena: turno.pagos.length > 0 };
  });
}
