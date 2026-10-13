// Seña por transferencia: datos de la cuenta y mensaje de WhatsApp para mandar el comprobante. Puras: se prueban solas.

export interface DatosTransferencia {
  alias: string | null;
  cbu: string | null;
  titular: string | null;
  /** Número de WhatsApp del local, solo dígitos y con código de país (5493834123456), o `null` si no está cargado. */
  whatsapp: string | null;
}

const valor = (v: string | undefined) => v?.trim() || null;

/** Lee los datos de la cuenta del local de `TRANSFERENCIA_*` y `WHATSAPP_LOCAL`. */
export function leerDatosTransferencia(env: Record<string, string | undefined> = process.env): DatosTransferencia {
  const whatsapp = (env.WHATSAPP_LOCAL ?? "").replace(/\D/g, "");
  return {
    alias: valor(env.TRANSFERENCIA_ALIAS),
    cbu: valor(env.TRANSFERENCIA_CBU),
    titular: valor(env.TRANSFERENCIA_TITULAR),
    whatsapp: whatsapp || null,
  };
}

export interface DatosMensaje {
  nombre: string;
  servicio: string;
  /** Día ya formateado: "lunes 5 de octubre". */
  dia: string;
  /** Hora ya formateada: "09:30". */
  hora: string;
  codigo: string;
  /** Seña ya formateada: "$ 2.000". */
  sena: string;
}

/** Mensaje que el cliente le manda al local junto con el comprobante. */
export function mensajeSena(d: DatosMensaje): string {
  return [
    `Hola! Soy ${d.nombre}. Reservé un turno de ${d.servicio} para el ${d.dia} a las ${d.hora} hs.`,
    `Código de reserva: ${d.codigo}`,
    `Te envío el comprobante de la transferencia de la seña de ${d.sena}.`,
  ].join("\n");
}

/** Enlace que abre un chat de WhatsApp con el número y el mensaje cargados. */
export function enlaceWhatsapp(numero: string, mensaje: string): string {
  return `https://wa.me/${numero.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}`;
}
