import type { EstadoOrden, EstadoTurno, MedioCobro, PagadorCobro, TipoOrden } from "@/generated/prisma/client";

// Puro. Recorrido de una orden de trabajo y cuentas de su cobro. Sin base ni Express.
// Falta pedir → Pedido → Turno asignado → Instalada → Facturada → Cobrada (o Cancelada).

export const ESTADOS_ORDEN: EstadoOrden[] = ["FALTA_PEDIR", "PEDIDO", "TURNO_ASIGNADO", "INSTALADA", "FACTURADA", "COBRADA", "CANCELADA"];

/** Las que siguen en curso. */
export const ESTADOS_ABIERTOS = ESTADOS_ORDEN.filter((e) => e !== "COBRADA" && e !== "CANCELADA");

/** Las que se eligen a mano: Cobrada la pone el sistema cuando se registra el último cobro. */
export const ESTADOS_MANUALES = ESTADOS_ORDEN.filter((e) => e !== "COBRADA");

/** Con el trabajo hecho: lo que falte cobrar de estas es plata que se le debe al local. */
export const ESTADOS_A_COBRAR: EstadoOrden[] = ["INSTALADA", "FACTURADA"];

const ANTES_DE_INSTALAR: EstadoOrden[] = ["FALTA_PEDIR", "PEDIDO", "TURNO_ASIGNADO"];

/** A partir de cuántos días sin cobrar se marca una orden en Cobranzas. */
export const DIAS_ALERTA_COBRO = 30;

export const ETIQUETA_TIPO: Record<TipoOrden, string> = { SEGURO: "Seguro", PARTICULAR: "Particular" };
export const ETIQUETA_PAGADOR: Record<PagadorCobro, string> = { ASEGURADORA: "Aseguradora", CLIENTE: "Cliente" };
export const ETIQUETA_MEDIO: Record<MedioCobro, string> = {
  TRANSFERENCIA: "Transferencia",
  EFECTIVO: "Efectivo",
  TARJETA: "Tarjeta",
  CHEQUE: "Cheque",
  QR: "QR",
  OTRO: "Otro",
};

// --- Plata --------------------------------------------------------------------------

/** Redondeo a centavos: evita restos como 0.000001 al restar importes. */
const centavos = (n: number) => Math.round(n * 100) / 100;

/** Lo que falta cobrar, o `null` si la orden todavía no tiene importe total. */
export function saldo(total: number | null, cobrado: number): number | null {
  return total === null ? null : centavos(total - cobrado);
}

export type SituacionCobro = "SIN_IMPORTE" | "PENDIENTE" | "PARCIAL" | "COBRADA";

export function situacionCobro(total: number | null, cobrado: number): SituacionCobro {
  if (total === null) return "SIN_IMPORTE";
  if (cobrado >= total) return "COBRADA";
  return cobrado > 0 ? "PARCIAL" : "PENDIENTE";
}

export interface CuentaOrden {
  estado: EstadoOrden;
  total: number | null;
  cobrado: number;
  facturada: boolean;
}

/**
 * El estado que corresponde a la plata. Con el trabajo hecho (Instalada o Facturada) y todo cobrado, la orden queda
 * Cobrada; antes de instalar no se cierra aunque el cliente haya pagado todo. Una Cobrada a la que le vuelve a faltar
 * plata (se borró un cobro o subió el total) vuelve a Facturada, o a Instalada si no tiene factura.
 */
export function estadoSegunCobros(o: CuentaOrden): EstadoOrden {
  const completa = o.total !== null && o.cobrado >= o.total;
  if (o.estado === "COBRADA") return completa ? "COBRADA" : o.facturada ? "FACTURADA" : "INSTALADA";
  return completa && ESTADOS_A_COBRAR.includes(o.estado) ? "COBRADA" : o.estado;
}

/** Cargar el número de factura pasa una Instalada a Facturada; borrarlo, la devuelve. */
export function estadoSegunFactura(estado: EstadoOrden, facturada: boolean): EstadoOrden {
  if (facturada && estado === "INSTALADA") return "FACTURADA";
  if (!facturada && estado === "FACTURADA") return "INSTALADA";
  return estado;
}

// --- Turno ----------------------------------------------------------------------------

const TURNO_CAIDO: EstadoTurno[] = ["CANCELADO", "AUSENTE"];

/** Completar el turno instala; si se cae, la orden vuelve a Pedido. Una orden que ya avanzó no retrocede. */
export function estadoTrasTurno(estado: EstadoOrden, turno: EstadoTurno): EstadoOrden {
  if (turno === "COMPLETADO" && ANTES_DE_INSTALAR.includes(estado)) return "INSTALADA";
  if (TURNO_CAIDO.includes(turno) && estado === "TURNO_ASIGNADO") return "PEDIDO";
  return estado;
}

export function estadoAlDarTurno(estado: EstadoOrden): EstadoOrden {
  return ANTES_DE_INSTALAR.includes(estado) ? "TURNO_ASIGNADO" : estado;
}

/** Hay turno vigente si existe y no se canceló ni faltó el cliente. */
export const turnoVigente = (turno: EstadoTurno | null) => turno !== null && !TURNO_CAIDO.includes(turno);

/** Se da turno antes de instalar y si la orden no tiene ya uno vigente. */
export function puedeDarTurno(estado: EstadoOrden, turnoActual: EstadoTurno | null): boolean {
  return ANTES_DE_INSTALAR.includes(estado) && !turnoVigente(turnoActual);
}

// --- Cambio de estado a mano --------------------------------------------------------

/** Por qué no se permite pasar de `actual` a `nuevo` a mano, o `null` si se puede. */
export function motivoCambioNoPermitido(actual: EstadoOrden, nuevo: EstadoOrden): string | null {
  if (actual === "COBRADA") return "Una orden cobrada no cambia de estado. Para corregirla, borrá el cobro que corresponda.";
  if (nuevo === "COBRADA") return "La orden pasa a Cobrada sola cuando se registra el último cobro.";
  return null;
}

// --- Cobranzas ------------------------------------------------------------------------

/** Días corridos entre dos fechas "YYYY-MM-DD". */
export function diasEntre(desde: string, hasta: string): number {
  return Math.round((Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / 86_400_000);
}

export interface OrdenACobrar {
  id: string;
  numero: number;
  tipo: TipoOrden;
  aseguradora: { id: string; nombre: string } | null;
  patente: string | null;
  siniestro: string | null;
  total: number | null;
  cobrado: number;
  facturaNumero: string | null;
  facturaFecha: string | null;
  recibidaEl: string;
}

export interface OrdenEnCobranza extends OrdenACobrar {
  saldo: number;
  /** Días desde la factura o, si no hay, desde que se recibió la orden. */
  dias: number;
  desdeFactura: boolean;
}

export interface GrupoCobranza {
  clave: string;
  /** Quién debe: la aseguradora, "Particulares" o "Seguro sin aseguradora". */
  nombre: string;
  ordenes: OrdenEnCobranza[];
  saldo: number;
  masAntigua: number;
}

/**
 * Lo que falta cobrar, agrupado por quién lo debe. Los grupos van de mayor a menor deuda y, dentro de cada uno, las
 * órdenes de la más vieja a la más nueva. Las órdenes sin importe total no se pueden sumar: van aparte.
 */
export function agruparCobranzas(ordenes: OrdenACobrar[], hoy: string): { grupos: GrupoCobranza[]; sinImporte: OrdenACobrar[] } {
  const sinImporte: OrdenACobrar[] = [];
  const grupos = new Map<string, GrupoCobranza>();

  for (const o of ordenes) {
    const resta = saldo(o.total, o.cobrado);
    if (resta === null) {
      sinImporte.push(o);
      continue;
    }
    if (resta <= 0) continue;

    const [clave, nombre] =
      o.tipo === "PARTICULAR"
        ? ["particulares", "Particulares"]
        : o.aseguradora
          ? [o.aseguradora.id, o.aseguradora.nombre]
          : ["sin-aseguradora", "Seguro sin aseguradora"];
    const grupo = grupos.get(clave) ?? { clave, nombre, ordenes: [], saldo: 0, masAntigua: 0 };
    const dias = diasEntre(o.facturaFecha ?? o.recibidaEl, hoy);
    grupo.ordenes.push({ ...o, saldo: resta, dias, desdeFactura: o.facturaFecha !== null });
    grupo.saldo = centavos(grupo.saldo + resta);
    grupo.masAntigua = Math.max(grupo.masAntigua, dias);
    grupos.set(clave, grupo);
  }

  for (const g of grupos.values()) g.ordenes.sort((a, b) => b.dias - a.dias || a.numero - b.numero);
  return { grupos: [...grupos.values()].sort((a, b) => b.saldo - a.saldo), sinImporte };
}
