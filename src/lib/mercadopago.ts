import { z } from "@/lib/zod";
import type { PagoMp } from "@/modules/pagos/decision";

// Cliente mínimo de la API de Mercado Pago (Checkout Pro). Solo servidor: usa MP_ACCESS_TOKEN.

const API = "https://api.mercadopago.com";
const TIEMPO_MAXIMO_MS = 10_000;

export class ErrorMercadoPago extends Error {
  constructor(
    public readonly status: number,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = "ErrorMercadoPago";
  }
}

export interface DatosPreferencia {
  pagoId: string;
  turnoId: string;
  titulo: string;
  monto: number;
  nombreCliente: string;
  emailCliente?: string;
  venceEn: Date;
  ahora: Date;
  urlApp: string;
}

/** Catamarca está en UTC-3 todo el año, y Mercado Pago pide la fecha con su desfase. */
function conDesfase(fecha: Date): string {
  return new Date(fecha.getTime() - 3 * 60 * 60_000).toISOString().replace("Z", "-03:00");
}

/** Cuerpo de la preferencia de pago. Pura: se prueba sin red. */
export function armarPreferencia(d: DatosPreferencia) {
  const urlApp = d.urlApp.replace(/\/+$/, "");
  const volver = `${urlApp}/reservar/confirmado?turno=${d.turnoId}`;
  // Mercado Pago rechaza el aviso y el regreso automático con direcciones que no son públicas (https).
  const publica = urlApp.startsWith("https://");

  return {
    items: [{ id: d.turnoId, title: d.titulo, quantity: 1, unit_price: d.monto, currency_id: "ARS" }],
    payer: { name: d.nombreCliente, ...(d.emailCliente ? { email: d.emailCliente } : {}) },
    external_reference: d.pagoId,
    back_urls: { success: volver, failure: volver, pending: volver },
    expires: true,
    expiration_date_from: conDesfase(d.ahora),
    expiration_date_to: conDesfase(d.venceEn),
    // La reserva dura 8 minutos: un pago en efectivo no llega a tiempo.
    payment_methods: { excluded_payment_types: [{ id: "ticket" }, { id: "atm" }] },
    ...(publica ? { auto_return: "approved", notification_url: `${urlApp}/api/mercadopago/webhook` } : {}),
  };
}

function configuracion() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("Falta MP_ACCESS_TOKEN en .env (credencial de Mercado Pago).");
  return { token };
}

async function pedir(ruta: string, init: RequestInit = {}): Promise<unknown> {
  const { token } = configuracion();
  const respuesta = await fetch(`${API}${ruta}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
    signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
  });
  if (!respuesta.ok) {
    // El detalle puede ser largo; se recorta. Nunca se incluye el token.
    const detalle = (await respuesta.text().catch(() => "")).slice(0, 300);
    throw new ErrorMercadoPago(respuesta.status, `Mercado Pago respondió ${respuesta.status} en ${ruta}: ${detalle}`);
  }
  return respuesta.json();
}

const preferenciaSchema = z.object({ id: z.string(), init_point: z.string() });

export async function crearPreferencia(d: DatosPreferencia): Promise<{ id: string; initPoint: string }> {
  const datos = preferenciaSchema.parse(
    await pedir("/checkout/preferences", { method: "POST", body: JSON.stringify(armarPreferencia(d)) }),
  );
  return { id: datos.id, initPoint: datos.init_point };
}

const pagoSchema = z.object({
  id: z.union([z.number(), z.string()]),
  status: z.string(),
  transaction_amount: z.number(),
  currency_id: z.string().optional(),
  external_reference: z.string().nullish(),
});

function aPagoMp(datos: z.infer<typeof pagoSchema>): PagoMp {
  return {
    id: String(datos.id),
    estado: datos.status,
    monto: datos.transaction_amount,
    moneda: datos.currency_id ?? "ARS",
    referencia: datos.external_reference ?? null,
  };
}

/** Consulta un pago por su id. Lanza `ErrorMercadoPago` (status 404) si no existe. */
export async function obtenerPago(id: string): Promise<PagoMp> {
  return aPagoMp(pagoSchema.parse(await pedir(`/v1/payments/${encodeURIComponent(id)}`)));
}

/** Pagos asociados a una referencia externa (el id de nuestro Pago), del más nuevo al más viejo. */
export async function buscarPagosPorReferencia(pagoId: string): Promise<PagoMp[]> {
  const ruta = `/v1/payments/search?external_reference=${encodeURIComponent(pagoId)}&sort=date_created&criteria=desc`;
  const { results } = z.object({ results: z.array(pagoSchema) }).parse(await pedir(ruta));
  return results.map(aPagoMp);
}
