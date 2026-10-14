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

export const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const DIAS_LARGOS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
/** Orden de la semana laboral argentina: lunes primero. */
export const SEMANA = [1, 2, 3, 4, 5, 6, 0];

/** "14:30" en hora de Catamarca. */
export function formatearHora(instante: Date): string {
  return instante.toLocaleTimeString("es-AR", { timeZone: ZONA_HORARIA, hour: "2-digit", minute: "2-digit", hour12: false });
}

/** "lunes 5 de octubre" a partir de "2026-10-05". */
export function formatearFecha(fecha: string, opciones: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }): string {
  return instanteLocal(fecha, 12 * 60).toLocaleDateString("es-AR", { timeZone: ZONA_HORARIA, ...opciones });
}

/** Suma días a una fecha local "YYYY-MM-DD". */
export function sumarDias(fecha: string, dias: number): string {
  return fechaLocal(sumarMinutos(instanteLocal(fecha, 12 * 60), dias * 24 * 60));
}

export function hoy(): string {
  return fechaLocal(new Date());
}

export function sumarMinutos(fecha: Date, minutos: number): Date {
  return new Date(fecha.getTime() + minutos * 60_000);
}

// Columnas DATE (un día, sin hora; por ejemplo la fecha de una factura). Prisma las lee como un Date a las 00:00 UTC,
// así que se convierten sin pasar por la zona horaria.

/** "2026-10-14" → Date para una columna DATE. */
export const fechaADia = (fecha: string): Date => new Date(`${fecha}T00:00:00Z`);

/** Date leído de una columna DATE → "2026-10-14". */
export const diaAFecha = (dia: Date): string => dia.toISOString().slice(0, 10);
