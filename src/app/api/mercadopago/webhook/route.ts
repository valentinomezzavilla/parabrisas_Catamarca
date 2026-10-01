import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { ErrorMercadoPago, obtenerPago } from "@/lib/mercadopago";
import { firmaValida } from "@/modules/pagos/firma";
import { aplicarPagoMp } from "@/modules/pagos/pagos.service";

/**
 * Aviso de Mercado Pago. Ruta pública (no hay sesión): se protege validando la firma, y aun así nunca se
 * confía en lo que trae el aviso: el pago se vuelve a consultar a la API de Mercado Pago.
 */
export async function POST(request: NextRequest) {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto) {
    console.error("Falta MP_WEBHOOK_SECRET en .env: no se pueden validar los avisos de Mercado Pago.");
    return NextResponse.json({ error: "no configurado" }, { status: 500 });
  }

  const { searchParams } = request.nextUrl;
  const dataId = searchParams.get("data.id");
  const valida = firmaValida({
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId,
    secreto,
  });
  if (!valida) return NextResponse.json({ error: "firma inválida" }, { status: 401 });

  // Solo interesan los avisos de pagos.
  if (searchParams.get("type") !== "payment" || !dataId) return NextResponse.json({ ok: true });

  try {
    const resultado = await aplicarPagoMp(await obtenerPago(dataId));
    revalidatePath("/turnos");
    revalidatePath("/");
    return NextResponse.json({ ok: true, resultado: resultado.tipo });
  } catch (error) {
    // Una notificación de prueba trae un id que no existe: no tiene sentido que Mercado Pago la reintente.
    if (error instanceof ErrorMercadoPago && error.status === 404) return NextResponse.json({ ok: true, resultado: "ignorado" });
    console.error("No se pudo procesar el aviso de Mercado Pago:", error);
    return NextResponse.json({ error: "reintentar" }, { status: 500 });
  }
}
