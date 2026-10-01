import { describe, expect, it } from "vitest";
import {
  BLOQUEO_MINUTOS,
  MAX_FALLOS,
  minutosDeBloqueo,
  registrarFallo,
  type EstadoIntentos,
} from "./limite";

const MIN = 60_000;
const ahora = new Date("2026-10-01T12:00:00Z");
const hace = (minutos: number) => new Date(ahora.getTime() - minutos * MIN);
const dentro = (minutos: number) => new Date(ahora.getTime() + minutos * MIN);

describe("registrarFallo", () => {
  it("el primer fallo de un usuario arranca el contador en 1 sin bloquear", () => {
    expect(registrarFallo(null, ahora)).toEqual({ fallos: 1, ultimoFallo: ahora, bloqueadoHasta: null });
  });

  it("suma fallos seguidos dentro de la ventana", () => {
    const previo: EstadoIntentos = { fallos: 2, ultimoFallo: hace(3), bloqueadoHasta: null };
    expect(registrarFallo(previo, ahora).fallos).toBe(3);
  });

  it("el último fallo permitido bloquea por BLOQUEO_MINUTOS y reinicia el contador", () => {
    const previo: EstadoIntentos = { fallos: MAX_FALLOS - 1, ultimoFallo: hace(1), bloqueadoHasta: null };
    expect(registrarFallo(previo, ahora)).toEqual({
      fallos: 0,
      ultimoFallo: ahora,
      bloqueadoHasta: dentro(BLOQUEO_MINUTOS),
    });
  });

  it("pasada la ventana sin fallos, el contador empieza de nuevo", () => {
    const previo: EstadoIntentos = { fallos: MAX_FALLOS - 1, ultimoFallo: hace(BLOQUEO_MINUTOS + 1), bloqueadoHasta: null };
    expect(registrarFallo(previo, ahora)).toEqual({ fallos: 1, ultimoFallo: ahora, bloqueadoHasta: null });
  });
});

describe("minutosDeBloqueo", () => {
  it("sin estado o sin bloqueo devuelve 0", () => {
    expect(minutosDeBloqueo(null, ahora)).toBe(0);
    expect(minutosDeBloqueo({ fallos: 3, ultimoFallo: hace(1), bloqueadoHasta: null }, ahora)).toBe(0);
  });

  it("con bloqueo vigente devuelve los minutos que faltan, redondeados hacia arriba", () => {
    const bloqueado = (hasta: Date): EstadoIntentos => ({ fallos: 0, ultimoFallo: hace(1), bloqueadoHasta: hasta });
    expect(minutosDeBloqueo(bloqueado(dentro(10)), ahora)).toBe(10);
    expect(minutosDeBloqueo(bloqueado(new Date(ahora.getTime() + 30_000)), ahora)).toBe(1);
  });

  it("un bloqueo vencido ya no cuenta", () => {
    expect(minutosDeBloqueo({ fallos: 0, ultimoFallo: hace(20), bloqueadoHasta: hace(5) }, ahora)).toBe(0);
  });
});
