import type { EstadoTurno } from "@/generated/prisma/client";
import { fechaLocal, formatearFecha, formatearHora } from "@/lib/tiempo";
import { normalizarCodigo } from "./codigo";

// Puro. Búsqueda de reservas desde el portal: normalizar, comparar, tapar datos.

export const CAMPOS_BUSQUEDA = ["codigo", "nombre", "telefono", "email", "patente", "vehiculo", "servicioId", "fecha"] as const;
export type CampoBusqueda = (typeof CAMPOS_BUSQUEDA)[number];
export type Criterios = Partial<Record<CampoBusqueda, string>>;

/** Datos que identifican a una reserva. El servicio y el día solos no alcanzan (ver el plan). */
const IDENTIFICADORES: CampoBusqueda[] = ["codigo", "nombre", "telefono", "email", "patente", "vehiculo"];
const MIN_LETRAS = 3;
export const MIN_DIGITOS_BUSQUEDA = 6;
/** Largo de un teléfono completo con código de área (383 + 7 dígitos). */
export const MIN_DIGITOS_VERIFICACION = 10;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

/** Estados que el portal busca y deja cancelar (siempre que el turno sea futuro). */
export const ESTADOS_BUSCABLES: EstadoTurno[] = ["PENDIENTE", "CONFIRMADO", "ESPERANDO_PAGO"];

export class SinCriteriosError extends Error {
  constructor() {
    super("Completá al menos un dato de la reserva (código, nombre, teléfono, mail, patente o vehículo)");
    this.name = "SinCriteriosError";
  }
}

export const sinTildes = (t: string): string =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
export const soloDigitos = (t: string): string => t.replace(/\D/g, "");
export const normalizarPatente = (t: string): string => t.replace(/[\s-]/g, "").toUpperCase();

/** Deja solo los criterios completados, ya normalizados. Lanza `SinCriteriosError` si no hay ningún dato que identifique. */
export function normalizarCriterios(entrada: Partial<Record<CampoBusqueda, string | undefined>>): Criterios {
  const c: Criterios = {};
  const codigo = entrada.codigo ? normalizarCodigo(entrada.codigo) : "";
  if (codigo) c.codigo = codigo;
  const nombre = entrada.nombre ? sinTildes(entrada.nombre) : "";
  if (nombre) c.nombre = nombre;
  const telefono = entrada.telefono ? soloDigitos(entrada.telefono) : "";
  if (telefono) c.telefono = telefono;
  const email = entrada.email?.trim().toLowerCase() ?? "";
  if (email) c.email = email;
  const patente = entrada.patente ? normalizarPatente(entrada.patente) : "";
  if (patente) c.patente = patente;
  const vehiculo = entrada.vehiculo ? sinTildes(entrada.vehiculo) : "";
  if (vehiculo) c.vehiculo = vehiculo;
  const servicioId = entrada.servicioId?.trim() ?? "";
  if (servicioId) c.servicioId = servicioId;
  const fecha = entrada.fecha?.trim() ?? "";
  if (FECHA.test(fecha)) c.fecha = fecha;

  if (!IDENTIFICADORES.some((campo) => c[campo] !== undefined)) throw new SinCriteriosError();
  return c;
}

/**
 * Compara por dígitos y acepta que a uno de los dos le falte el prefijo (+54 9…): uno termina con el otro.
 * El más corto tiene que tener al menos `minimo` dígitos.
 */
export function telefonoCoincide(guardado: string, ingresado: string, minimo = MIN_DIGITOS_BUSQUEDA): boolean {
  const buscado = soloDigitos(ingresado);
  const propio = soloDigitos(guardado);
  if (Math.min(buscado.length, propio.length) < minimo) return false;
  return propio.endsWith(buscado) || buscado.endsWith(propio);
}

/**
 * Teléfono completo: lo ingresado contiene todo el número guardado (por ejemplo con +54 9 adelante), o es el número
 * con código de área (al menos 10 dígitos) y el guardado es más largo. Los últimos dígitos solos no alcanzan.
 */
export function telefonoCompletoCoincide(guardado: string, ingresado: string): boolean {
  const g = soloDigitos(guardado);
  const i = soloDigitos(ingresado);
  if (g.length === 0 || i.length === 0) return false;
  return i.endsWith(g) || (i.length >= MIN_DIGITOS_VERIFICACION && g.endsWith(i));
}

/** Verificación para cancelar: el teléfono o el mail completos de la reserva. */
export function contactoCoincide(guardado: { telefono: string; email: string | null }, ingresado: string): boolean {
  const texto = ingresado.trim();
  if (texto.includes("@")) return !!guardado.email && guardado.email.trim().toLowerCase() === texto.toLowerCase();
  return telefonoCompletoCoincide(guardado.telefono, texto);
}

export interface TurnoBuscable {
  id: string;
  codigo: string;
  servicioId: string;
  servicioNombre: string;
  inicio: Date;
  estado: EstadoTurno;
  nombre: string;
  telefono: string;
  email: string | null;
  patente: string | null;
  vehiculo: string | null;
  senaPagada: boolean;
}

/** Todos los criterios completados deben coincidir (Y). */
export function coincideConCriterios(t: TurnoBuscable, c: Criterios): boolean {
  if (c.codigo !== undefined && normalizarCodigo(t.codigo) !== c.codigo) return false;
  if (c.nombre !== undefined && !(c.nombre.length >= MIN_LETRAS && sinTildes(t.nombre).includes(c.nombre))) return false;
  if (c.telefono !== undefined && !telefonoCoincide(t.telefono, c.telefono)) return false;
  if (c.email !== undefined && (t.email ?? "").trim().toLowerCase() !== c.email) return false;
  if (c.patente !== undefined && (t.patente === null || normalizarPatente(t.patente) !== c.patente)) return false;
  if (c.vehiculo !== undefined && !(c.vehiculo.length >= MIN_LETRAS && sinTildes(t.vehiculo ?? "").includes(c.vehiculo))) return false;
  if (c.servicioId !== undefined && t.servicioId !== c.servicioId) return false;
  if (c.fecha !== undefined && fechaLocal(t.inicio) !== c.fecha) return false;
  return true;
}

export type ResultadoResolucion =
  | { tipo: "ninguna" }
  | { tipo: "varias" }
  | { tipo: "una"; turno: TurnoBuscable };

export function resolverBusqueda(turnos: TurnoBuscable[], c: Criterios): ResultadoResolucion {
  const hallados = turnos.filter((t) => coincideConCriterios(t, c));
  if (hallados.length === 0) return { tipo: "ninguna" };
  if (hallados.length > 1) return { tipo: "varias" };
  return { tipo: "una", turno: hallados[0] };
}

export function tapadoNombre(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "";
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[partes.length - 1][0].toUpperCase()}.`;
}

export function tapadoPatente(patente: string | null): string | null {
  if (!patente) return null;
  const p = normalizarPatente(patente);
  if (p.length <= 2) return "**";
  return `${p[0]}${"*".repeat(p.length - 2)}${p[p.length - 1]}`;
}

export function etiquetaEstadoCliente(estado: EstadoTurno): string {
  switch (estado) {
    case "CONFIRMADO":
      return "Confirmada";
    case "ESPERANDO_PAGO":
      return "Esperando el pago";
    default:
      return "Pendiente de confirmación";
  }
}

/**
 * Lo único que el portal le muestra al cliente de una reserva. Nunca mail, precio, cristal ni notas, y ni un dígito
 * del teléfono: con unos pocos se puede adivinar el resto y cancelar el turno de otra persona.
 */
export interface ReservaVisible {
  codigo: string;
  servicio: string;
  dia: string;
  hora: string;
  estado: string;
  senaPagada: boolean;
  nombre: string;
  patente: string | null;
}

export function aReservaVisible(t: TurnoBuscable): ReservaVisible {
  return {
    codigo: t.codigo,
    servicio: t.servicioNombre,
    dia: formatearFecha(fechaLocal(t.inicio)),
    hora: formatearHora(t.inicio),
    estado: etiquetaEstadoCliente(t.estado),
    senaPagada: t.senaPagada,
    nombre: tapadoNombre(t.nombre),
    patente: tapadoPatente(t.patente),
  };
}

/** Respuestas de las acciones del portal (viajan al navegador). */
export type RespuestaBusqueda =
  | { tipo: "inicial" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "ninguna" }
  | { tipo: "varias" }
  | { tipo: "una"; reserva: ReservaVisible };

export type RespuestaCancelacion =
  | { tipo: "cancelada"; teniaSena: boolean }
  | { tipo: "contacto_incorrecto" }
  | { tipo: "bloqueada"; minutos: number }
  | { tipo: "no_encontrada" };
