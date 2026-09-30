/**
 * Utilidades de fecha/hora para la agenda.
 *
 * Catamarca usa UTC-3 todo el año (Argentina no aplica horario de verano desde
 * 2009). Las fechas se guardan en UTC y las franjas horarias como "minutos desde
 * las 00:00" en hora local. Si algún día vuelve el horario de verano, este es el
 * único archivo a cambiar.
 */
export const ZONA_HORARIA = "America/Argentina/Catamarca";
const OFFSET_LOCAL = "-03:00";

/** "08:30" -> 510 */
export function horaAMinutos(hhmm: string): number {
  const coincidencia = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm);
  if (!coincidencia) throw new Error(`Hora inválida: "${hhmm}" (formato esperado HH:MM)`);
  return Number(coincidencia[1]) * 60 + Number(coincidencia[2]);
}

/** 510 -> "08:30" */
export function minutosAHora(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Día de la semana (0 = domingo) de una fecha local "YYYY-MM-DD". */
export function diaSemana(fecha: string): number {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
}

/** Instante UTC que corresponde a `fecha` local a los `minutos` desde las 00:00. */
export function instanteLocal(fecha: string, minutos: number): Date {
  return new Date(`${fecha}T${minutosAHora(minutos)}:00${OFFSET_LOCAL}`);
}

/** Fecha local "YYYY-MM-DD" de un instante. */
export function fechaLocal(instante: Date): string {
  return new Date(instante.getTime() - 3 * 60 * 60_000).toISOString().slice(0, 10);
}

export function sumarMinutos(fecha: Date, minutos: number): Date {
  return new Date(fecha.getTime() + minutos * 60_000);
}
