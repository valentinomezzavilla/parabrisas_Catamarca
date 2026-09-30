import { diaSemana, instanteLocal, sumarMinutos } from "@/lib/tiempo";

/**
 * Cálculo de turnos disponibles. Es una función pura (sin base de datos) para
 * poder testearla y reutilizarla tanto al listar horarios como al confirmar
 * una reserva.
 */

export interface Franja {
  diaSemana: number; // 0 = domingo
  horaInicio: number; // minutos desde 00:00
  horaFin: number;
}

export interface ConfigAgenda {
  duracionMinutos: number;
  intervaloMinutos: number;
  margenMinutos: number;
  capacidad: number;
  anticipacionMinutos: number;
  horarios: Franja[];
}

export interface Intervalo {
  inicio: Date;
  fin: Date;
}

export interface TurnoDisponible extends Intervalo {
  cuposLibres: number;
}

export interface ParametrosDisponibilidad {
  fecha: string; // día local "YYYY-MM-DD"
  servicio: ConfigAgenda;
  turnos?: Intervalo[]; // turnos activos del servicio (sin cancelados/ausentes)
  bloqueos?: Intervalo[];
  ahora?: Date;
}

const seSuperponen = (a: Intervalo, b: Intervalo) => a.inicio < b.fin && b.inicio < a.fin;

/** Máxima cantidad de intervalos simultáneos dentro de `ventana`. */
function maximoSimultaneo(intervalos: Intervalo[], ventana: Intervalo): number {
  const eventos: [number, number][] = [];
  for (const i of intervalos) {
    if (!seSuperponen(i, ventana)) continue;
    eventos.push([Math.max(i.inicio.getTime(), ventana.inicio.getTime()), +1]);
    eventos.push([Math.min(i.fin.getTime(), ventana.fin.getTime()), -1]);
  }
  // Ante empate, primero los cierres: un turno que termina 10:00 libera el box para otro que empieza 10:00.
  eventos.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  let actual = 0;
  let maximo = 0;
  for (const [, delta] of eventos) {
    actual += delta;
    maximo = Math.max(maximo, actual);
  }
  return maximo;
}

export function calcularDisponibilidad({
  fecha,
  servicio,
  turnos = [],
  bloqueos = [],
  ahora = new Date(),
}: ParametrosDisponibilidad): TurnoDisponible[] {
  const { duracionMinutos, intervaloMinutos, margenMinutos, capacidad } = servicio;
  const dia = diaSemana(fecha);
  const inicioMinimo = sumarMinutos(ahora, servicio.anticipacionMinutos);

  // Cada trabajo ocupa su duración más el margen de preparación posterior.
  const ocupados = turnos.map((t) => ({ inicio: t.inicio, fin: sumarMinutos(t.fin, margenMinutos) }));

  const resultado: TurnoDisponible[] = [];
  const franjas = servicio.horarios
    .filter((f) => f.diaSemana === dia)
    .sort((a, b) => a.horaInicio - b.horaInicio);

  for (const franja of franjas) {
    for (let m = franja.horaInicio; m + duracionMinutos <= franja.horaFin; m += intervaloMinutos) {
      const inicio = instanteLocal(fecha, m);
      const fin = sumarMinutos(inicio, duracionMinutos);
      if (inicio < inicioMinimo) continue;
      if (bloqueos.some((b) => seSuperponen(b, { inicio, fin }))) continue;

      const ventana = { inicio, fin: sumarMinutos(fin, margenMinutos) };
      const cuposLibres = capacidad - maximoSimultaneo(ocupados, ventana);
      if (cuposLibres > 0) resultado.push({ inicio, fin, cuposLibres });
    }
  }
  return resultado;
}
