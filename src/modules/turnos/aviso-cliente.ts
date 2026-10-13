// Aviso por WhatsApp del local al cliente desde el panel: número y mensaje. Puras: se prueban solas.

/** Código de área que se asume cuando el cliente cargó el teléfono sin él (el local atiende en Catamarca). */
const AREA_LOCAL = "383";

/**
 * Teléfono argentino cargado a mano ("383 15-412345", "0383 4123456", "+54 9 383 4123456"…) a los dígitos que
 * pide `wa.me` (5493834123456). Un número con prefijo de otro país ("+52 1 55…") se deja como está. `null` si no se
 * puede interpretar.
 */
export function numeroWhatsappCliente(telefono: string): string | null {
  let d = telefono.replace(/\D/g, "");
  const conPrefijo = /^\s*(\+|00)/.test(telefono);
  if (d.startsWith("00")) d = d.slice(2);
  if (conPrefijo && !d.startsWith("54")) return d.length >= 8 && d.length <= 15 ? d : null;
  if (d.startsWith("54")) {
    d = d.slice(2);
    // Ningún código de área argentino empieza con 9: ese 9 es el de los celulares.
    if (d.startsWith("9")) d = d.slice(1);
  }
  d = d.replace(/^0/, "");

  // Formato viejo "área + 15 + abonado" (12 dígitos): el 15 sobra.
  if (d.length === 12) {
    const largoArea = [2, 3, 4].find((n) => d.slice(n, n + 2) === "15");
    if (largoArea) d = d.slice(0, largoArea) + d.slice(largoArea + 2);
  }
  // Sin código de área: "4123456" o "15 4123456".
  if (d.length === 9 && d.startsWith("15")) d = d.slice(2);
  if (d.length === 7) d = AREA_LOCAL + d;

  return d.length === 10 ? `549${d}` : null;
}

export interface DatosAviso {
  nombre: string;
  servicio: string;
  /** Día ya formateado: "lunes 5 de octubre". */
  dia: string;
  /** Hora ya formateada: "09:30". */
  hora: string;
  codigo: string;
  /** Seña pendiente ya formateada ("$ 2.000"), o `null` si no hay. */
  senaPendiente: string | null;
}

/** Mensaje para el cliente según cómo está su turno. `null` si en ese estado no hay nada que avisarle. */
export function mensajeAvisoTurno(estado: string, d: DatosAviso): string | null {
  const nombre = d.nombre.split(" ")[0];
  const turno = `tu turno de ${d.servicio} del ${d.dia} a las ${d.hora} hs (código ${d.codigo})`;
  switch (estado) {
    case "CONFIRMADO":
      return [`Hola ${nombre}! Te escribimos de Parabrisas Catamarca.`, `Tu turno de ${d.servicio} quedó confirmado para el ${d.dia} a las ${d.hora} hs.`, "Te esperamos! Si necesitás cambiarlo, avisanos por acá."].join("\n");
    case "ESPERANDO_PAGO":
      return [
        `Hola ${nombre}! Te escribimos de Parabrisas Catamarca por ${turno}.`,
        d.senaPendiente ? `Para confirmarlo necesitamos la seña de ${d.senaPendiente}. Nos mandás el comprobante de la transferencia?` : "Para confirmarlo necesitamos la seña. Nos mandás el comprobante de la transferencia?",
      ].join("\n");
    case "PENDIENTE":
      return [`Hola ${nombre}! Te escribimos de Parabrisas Catamarca por ${turno}.`, "Nos confirmás que vas a venir?"].join("\n");
    default:
      return null;
  }
}
