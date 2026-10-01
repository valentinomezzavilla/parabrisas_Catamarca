// Reglas puras del límite de intentos de login. Sin base de datos: se prueban solas.

/** Fallos seguidos que se toleran; el último los bloquea. */
export const MAX_FALLOS = 5;
/** Duración del bloqueo. También es la ventana: sin fallos durante este tiempo, el contador vuelve a cero. */
export const BLOQUEO_MINUTOS = 15;

const MINUTO = 60_000;

export interface EstadoIntentos {
  fallos: number;
  ultimoFallo: Date | null;
  bloqueadoHasta: Date | null;
}

/** Minutos que faltan para poder reintentar, o 0 si no hay bloqueo vigente. */
export function minutosDeBloqueo(estado: EstadoIntentos | null, ahora: Date): number {
  if (!estado?.bloqueadoHasta || estado.bloqueadoHasta <= ahora) return 0;
  return Math.ceil((estado.bloqueadoHasta.getTime() - ahora.getTime()) / MINUTO);
}

/** Estado que queda después de un fallo. Al llegar a MAX_FALLOS bloquea y reinicia el contador. */
export function registrarFallo(previo: EstadoIntentos | null, ahora: Date): EstadoIntentos {
  const vigente =
    previo?.ultimoFallo && ahora.getTime() - previo.ultimoFallo.getTime() <= BLOQUEO_MINUTOS * MINUTO;
  const fallos = (vigente ? previo.fallos : 0) + 1;

  if (fallos >= MAX_FALLOS) {
    return { fallos: 0, ultimoFallo: ahora, bloqueadoHasta: new Date(ahora.getTime() + BLOQUEO_MINUTOS * MINUTO) };
  }
  return { fallos, ultimoFallo: ahora, bloqueadoHasta: null };
}
