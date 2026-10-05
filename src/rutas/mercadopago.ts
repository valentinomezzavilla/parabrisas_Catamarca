import { Router } from "express";
import { ErrorMercadoPago, obtenerPago } from "@/lib/mercadopago";
import { firmaValida } from "@/modules/pagos/firma";
import { aplicarPagoMp } from "@/modules/pagos/pagos.service";
import { param } from "@/web/parametros";

export const rutasMercadoPago = Router();

/**
 * Aviso de Mercado Pago. Ruta pública (no hay sesión): se protege validando la firma, y aun así nunca se
 * confía en lo que trae el aviso: el pago se vuelve a consultar a la API de Mercado Pago.
 */
rutasMercadoPago.post("/webhook", async (req, res) => {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto) {
    console.error("Falta MP_WEBHOOK_SECRET en .env: no se pueden validar los avisos de Mercado Pago.");
    return res.status(500).json({ error: "no configurado" });
  }

  const dataId = param(req, "data.id") ?? null;
  const valida = firmaValida({
    xSignature: req.get("x-signature") ?? null,
    xRequestId: req.get("x-request-id") ?? null,
    dataId,
    secreto,
  });
  if (!valida) return res.status(401).json({ error: "firma inválida" });

  // Solo interesan los avisos de pagos.
  if (param(req, "type") !== "payment" || !dataId) return res.json({ ok: true });

  try {
    const resultado = await aplicarPagoMp(await obtenerPago(dataId));
    res.json({ ok: true, resultado: resultado.tipo });
  } catch (error) {
    // Una notificación de prueba trae un id que no existe: no tiene sentido que Mercado Pago la reintente.
    if (error instanceof ErrorMercadoPago && error.status === 404) return res.json({ ok: true, resultado: "ignorado" });
    console.error("No se pudo procesar el aviso de Mercado Pago:", error);
    res.status(500).json({ error: "reintentar" });
  }
});
