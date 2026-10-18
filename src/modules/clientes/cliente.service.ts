import { db } from "@/lib/db";
import { diaAFecha, fechaADia } from "@/lib/tiempo";
import { cobradoDe, saldo } from "@/modules/ordenes/estados";
import type { Prisma } from "@/generated/prisma/client";
import { normalizarPatente } from "@/modules/ordenes/schemas";
import { estaVigente, textoOferta } from "./beneficio";
import { cumpleanosProximos } from "./cumpleanos";
import { armarHistorial } from "./historial";
import { coincideNombre } from "./reglas";
import { beneficioSchema, clienteSchema, type BeneficioInput, type ClienteInput } from "./schemas";

/** Una operación que las reglas del módulo no permiten. El mensaje es para el usuario. */
export class ClienteError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ClienteError";
  }
}

/** Un cliente con ese teléfono ya existe: se lo ofrece en vez de crear un duplicado. */
export class TelefonoRepetidoError extends ClienteError {
  constructor(readonly existente: { id: string; nombre: string }) {
    super(`Ya hay un cliente con ese teléfono: ${existente.nombre}.`);
    this.name = "TelefonoRepetidoError";
  }
}

/** Con al menos 6 dígitos el teléfono identifica a alguien (mismo criterio que al reservar). */
const telefonoUtil = (t?: string | null) => (t?.match(/\d/g)?.length ?? 0) >= 6;

// --- Lista ---------------------------------------------------------------------------------

/** Tope de la lista: sobra para un local; para encontrar a otros se usa el buscador. */
export const LIMITE_CLIENTES = 2000;

/** Los que coinciden con el texto en el teléfono, el mail o la patente de algún turno u orden. El nombre se busca aparte. */
function filtroSinNombre(texto: string): Prisma.ClienteWhereInput {
  const parecido = { contains: texto, mode: "insensitive" as const };
  const patente = normalizarPatente(texto);
  return {
    OR: [
      { email: parecido },
      ...(/\d{3,}/.test(texto) ? [{ telefono: { contains: texto } }] : []),
      ...(patente.length >= 2 ? [{ ordenes: { some: { patente: { contains: patente } } } }, { turnos: { some: { patente: { contains: patente, mode: "insensitive" as const } } } }] : []),
    ],
  };
}

/** Clientes con lo justo para la lista. El orden alfabético se arma después (`agruparAlfabetico`). */
export async function listarClientes(texto: string | undefined, hoy: string) {
  // La base distingue tildes ("alvaro" no encuentra a "Álvaro"): los nombres se comparan acá, sin tildes.
  let ids: string[] | undefined;
  if (texto) {
    const [porOtros, nombres] = await Promise.all([
      db.cliente.findMany({ where: filtroSinNombre(texto), select: { id: true }, take: LIMITE_CLIENTES }),
      db.cliente.findMany({ select: { id: true, nombre: true }, take: LIMITE_CLIENTES }),
    ]);
    ids = [...new Set([...porOtros.map((c) => c.id), ...nombres.filter((c) => coincideNombre(c.nombre, texto)).map((c) => c.id)])];
  }
  const clientes = await db.cliente.findMany({
    where: ids ? { id: { in: ids } } : undefined,
    select: {
      id: true,
      nombre: true,
      telefono: true,
      email: true,
      fechaNacimiento: true,
      _count: { select: { turnos: true, ordenes: true } },
      beneficios: { where: { estado: "VIGENTE" }, select: { estado: true, vigenteHasta: true } },
    },
    take: LIMITE_CLIENTES,
  });
  return clientes.map(({ beneficios, ...c }) => ({
    ...c,
    beneficiosVigentes: beneficios.filter((b) => estaVigente({ estado: b.estado, vigenteHasta: b.vigenteHasta ? diaAFecha(b.vigenteHasta) : null }, hoy)).length,
  }));
}

export function contarClientes() {
  return db.cliente.count();
}

// --- Ficha ---------------------------------------------------------------------------------

export function obtenerCliente(id: string) {
  return db.cliente.findUnique({
    where: { id },
    include: {
      beneficios: { orderBy: [{ creadoEn: "desc" }] },
      saludos: { orderBy: { anio: "desc" }, take: 1 },
    },
  });
}

/** Turnos y órdenes del cliente, mezclados por fecha (lo más reciente primero). */
export async function historialDe(clienteId: string) {
  const [turnos, ordenes] = await Promise.all([
    db.turno.findMany({
      where: { clienteId },
      select: {
        id: true,
        inicio: true,
        estado: true,
        codigo: true,
        vehiculo: true,
        patente: true,
        servicio: { select: { nombre: true } },
        orden: { select: { id: true } },
      },
    }),
    db.ordenTrabajo.findMany({
      where: { clienteId },
      select: {
        id: true,
        numero: true,
        tipo: true,
        estado: true,
        recibidaEl: true,
        vehiculo: true,
        patente: true,
        importeTotal: true,
        senaMonto: true,
        senaAbonada: true,
        aseguradora: { select: { nombre: true } },
        turno: { select: { inicio: true, estado: true } },
        cobros: { select: { monto: true } },
      },
    }),
  ]);
  return armarHistorial(
      turnos.map((t) => ({ ...t, servicio: t.servicio.nombre, ordenId: t.orden?.id ?? null })),
      ordenes.map((o) => {
        const total = o.importeTotal === null ? null : Number(o.importeTotal);
        const cobrado = cobradoDe(o);
        return { ...o, aseguradora: o.aseguradora?.nombre ?? null, cuenta: { total, cobrado, saldo: saldo(total, cobrado) } };
      }),
  );
}

// --- Alta y edición ------------------------------------------------------------------------

function datosDeCliente(r: ReturnType<typeof clienteSchema.parse>) {
  return {
    nombre: r.nombre,
    telefono: r.telefono ?? "",
    email: r.email ?? null,
    fechaNacimiento: r.fechaNacimiento ? fechaADia(r.fechaNacimiento) : null,
    notas: r.notas ?? null,
  };
}

/** Otro cliente con el mismo teléfono (sin contar a `excluirId`), si el teléfono sirve para identificar. */
async function conTelefonoRepetido(telefono: string | undefined, excluirId?: string) {
  if (!telefonoUtil(telefono)) return null;
  return db.cliente.findFirst({
    where: { telefono, ...(excluirId && { id: { not: excluirId } }) },
    select: { id: true, nombre: true },
  });
}

export async function crearCliente(input: ClienteInput) {
  const r = clienteSchema.parse(input);
  const repetido = await conTelefonoRepetido(r.telefono);
  if (repetido) throw new TelefonoRepetidoError(repetido);
  return db.cliente.create({ data: datosDeCliente(r) });
}

export async function editarCliente(id: string, input: ClienteInput) {
  const r = clienteSchema.parse(input);
  const repetido = await conTelefonoRepetido(r.telefono, id);
  if (repetido) throw new TelefonoRepetidoError(repetido);
  return db.cliente.update({ where: { id }, data: datosDeCliente(r) });
}

// --- Beneficios (solo Admin) --------------------------------------------------------------

export async function crearBeneficio(clienteId: string, input: BeneficioInput) {
  const r = beneficioSchema.parse(input);
  return db.beneficioCliente.create({
    data: {
      clienteId,
      titulo: r.titulo,
      tipo: r.tipo,
      valor: r.valor ?? null,
      descripcion: r.descripcion ?? null,
      vigenteHasta: r.vigenteHasta ? fechaADia(r.vigenteHasta) : null,
    },
  });
}

/** Marca un beneficio vigente como usado o anulado. Uno que ya se cerró no vuelve a cambiar. */
export async function cerrarBeneficio(clienteId: string, beneficioId: string, estado: "USADO" | "ANULADO") {
  const { count } = await db.beneficioCliente.updateMany({
    where: { id: beneficioId, clienteId, estado: "VIGENTE" },
    data: { estado, usadoEl: estado === "USADO" ? new Date() : null },
  });
  if (count === 0) throw new ClienteError("Ese beneficio ya no está vigente.");
}

// --- Cumpleaños -----------------------------------------------------------------------------

/**
 * Quiénes cumplen años hoy o en los próximos días, con si ya se los saludó este año y sus beneficios vigentes
 * (para ofrecerles uno al saludar).
 */
export async function cumpleanosDelPanel(hoy: string, dias = 7) {
  const conNacimiento = await db.cliente.findMany({
    where: { fechaNacimiento: { not: null } },
    select: {
      id: true,
      nombre: true,
      telefono: true,
      fechaNacimiento: true,
      beneficios: { where: { estado: "VIGENTE" }, orderBy: { creadoEn: "desc" } },
      saludos: true,
    },
  });
  return cumpleanosProximos(
    conNacimiento.map((c) => ({ ...c, fechaNacimiento: diaAFecha(c.fechaNacimiento!) })),
    hoy,
    dias,
  ).map(({ saludos, beneficios, ...c }) => ({
    ...c,
    // El saludo que corresponde es el del año en que se festeja (al cruzar el año, el que viene).
    saludado: saludos.some((s) => s.anio === Number(c.fecha.slice(0, 4))),
    beneficios: beneficios
      .filter((b) => estaVigente({ estado: b.estado, vigenteHasta: b.vigenteHasta ? diaAFecha(b.vigenteHasta) : null }, hoy))
      .map((b) => ({ id: b.id, titulo: b.titulo, oferta: textoOferta(b) })),
  }));
}

/**
 * Deja asentado el saludo de este año con lo que se ofreció, y devuelve el cliente para armar el mensaje.
 * `beneficioId` elige uno de sus beneficios vigentes; `ofertaLibre` es un texto propio (tiene prioridad si se escribe).
 */
export async function registrarSaludo(clienteId: string, hoy: string, { beneficioId, ofertaLibre }: { beneficioId?: string; ofertaLibre?: string }) {
  const cliente = await db.cliente.findUniqueOrThrow({
    where: { id: clienteId },
    select: { id: true, nombre: true, telefono: true, fechaNacimiento: true, beneficios: { where: { estado: "VIGENTE" } } },
  });
  if (!cliente.fechaNacimiento) throw new ClienteError("Este cliente no tiene fecha de nacimiento cargada.");

  let oferta: string | null = ofertaLibre?.trim().slice(0, 200) || null;
  if (!oferta && beneficioId) {
    const elegido = cliente.beneficios.find((b) => b.id === beneficioId);
    if (elegido && estaVigente({ estado: elegido.estado, vigenteHasta: elegido.vigenteHasta ? diaAFecha(elegido.vigenteHasta) : null }, hoy)) {
      oferta = textoOferta(elegido);
    }
  }

  // El año del festejo: el 28 de diciembre se saluda por un cumpleaños de enero, que es del año que viene.
  const [proximo] = cumpleanosProximos([{ nombre: cliente.nombre, fechaNacimiento: diaAFecha(cliente.fechaNacimiento) }], hoy, 7);
  const anio = Number((proximo?.fecha ?? hoy).slice(0, 4));
  await db.saludoCumple.upsert({
    where: { clienteId_anio: { clienteId, anio } },
    update: { oferta, saludadoEn: new Date() },
    create: { clienteId, anio, oferta },
  });
  return { cliente, oferta };
}
