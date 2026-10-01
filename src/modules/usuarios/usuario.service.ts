import { db } from "@/lib/db";
import { hashearPassword, hashFicticio, verificarPassword } from "@/lib/password";
import { minutosDeBloqueo, registrarFallo } from "./limite";
import { motivoDeRechazo, type Cambio, type Rol } from "./reglas";
import type { CrearUsuarioInput } from "./schemas";

export interface UsuarioSesion {
  id: string;
  nombre: string;
  usuario: string;
  rol: Rol;
}

/** Un cambio de rol o de estado que las reglas no permiten, o sobre un usuario inexistente. */
export class CambioNoPermitidoError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "CambioNoPermitidoError";
  }
}

const datosDeSesion = { id: true, nombre: true, usuario: true, rol: true } as const;

export type ResultadoLogin =
  | { tipo: "ok"; usuario: UsuarioSesion }
  | { tipo: "invalido" }
  | { tipo: "bloqueado"; minutos: number };

const bloqueado = (minutos: number): ResultadoLogin => ({ tipo: "bloqueado", minutos });

/**
 * Valida usuario y contraseña (la cuenta debe estar activa) y aplica el límite de intentos:
 * tras `MAX_FALLOS` fallos seguidos el nombre de usuario queda bloqueado `BLOQUEO_MINUTOS`.
 * Los fallos se cuentan por nombre de usuario, exista o no, para que el bloqueo no revele qué cuentas existen.
 */
export async function autenticar(nombreUsuario: string, password: string): Promise<ResultadoLogin> {
  const previo = await db.intentoLogin.findUnique({ where: { usuario: nombreUsuario } });
  const espera = minutosDeBloqueo(previo, new Date());
  if (espera > 0) return bloqueado(espera);

  const usuario = await db.usuario.findUnique({ where: { usuario: nombreUsuario } });
  // Con un usuario inexistente se verifica igual contra un hash ficticio:
  // el tiempo de respuesta no revela qué cuentas existen.
  const coincide = await verificarPassword(password, usuario?.passwordHash ?? (await hashFicticio()));
  const valido = !!usuario && usuario.activo && coincide;

  // Se decide dentro de un lock por nombre de usuario: intentos en paralelo no pueden saltarse el contador
  // ni colarse una vez alcanzado el bloqueo.
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${nombreUsuario}))`;
    const ahora = new Date();
    const estado = await tx.intentoLogin.findUnique({ where: { usuario: nombreUsuario } });
    const espera = minutosDeBloqueo(estado, ahora);
    if (espera > 0) return bloqueado(espera);

    if (valido) {
      await tx.intentoLogin.deleteMany({ where: { usuario: nombreUsuario } });
      await tx.usuario.update({ where: { id: usuario.id }, data: { ultimoAcceso: ahora } });
      return { tipo: "ok", usuario: { id: usuario.id, nombre: usuario.nombre, usuario: usuario.usuario, rol: usuario.rol } };
    }

    const nuevo = registrarFallo(estado, ahora);
    await tx.intentoLogin.upsert({
      where: { usuario: nombreUsuario },
      create: { usuario: nombreUsuario, ...nuevo },
      update: nuevo,
    });
    // Limpieza: nombres inventados no deben acumularse para siempre.
    await tx.intentoLogin.deleteMany({ where: { ultimoFallo: { lt: new Date(ahora.getTime() - 24 * 60 * 60_000) } } });
    return nuevo.bloqueadoHasta ? bloqueado(minutosDeBloqueo(nuevo, ahora)) : { tipo: "invalido" };
  });
}

/** Se consulta en cada request: desactivar a alguien o cambiarle el rol surte efecto de inmediato. */
export function obtenerUsuarioActivo(id: string): Promise<UsuarioSesion | null> {
  return db.usuario.findFirst({ where: { id, activo: true }, select: datosDeSesion });
}

export function listarUsuarios() {
  return db.usuario.findMany({
    orderBy: [{ activo: "desc" }, { nombre: "asc" }],
    select: { ...datosDeSesion, activo: true, ultimoAcceso: true, creadoEn: true },
  });
}

export async function crearUsuario(datos: CrearUsuarioInput): Promise<UsuarioSesion> {
  return db.usuario.create({
    data: {
      nombre: datos.nombre,
      usuario: datos.usuario,
      rol: datos.rol,
      passwordHash: await hashearPassword(datos.password),
    },
    select: datosDeSesion,
  });
}

async function aplicarCambio(actor: { id: string }, objetivoId: string, cambio: Cambio): Promise<void> {
  await db.$transaction(async (tx) => {
    const objetivo = await tx.usuario.findUnique({
      where: { id: objetivoId },
      select: { id: true, rol: true, activo: true },
    });
    if (!objetivo) throw new CambioNoPermitidoError("El usuario no existe.");

    const adminsActivos = await tx.usuario.count({ where: { rol: "ADMIN", activo: true } });
    const motivo = motivoDeRechazo(actor, objetivo, cambio, adminsActivos);
    if (motivo) throw new CambioNoPermitidoError(motivo);

    await tx.usuario.update({
      where: { id: objetivoId },
      data: cambio.tipo === "rol" ? { rol: cambio.rol } : { activo: cambio.activo },
    });
  });
}

export const cambiarRol = (actor: { id: string }, id: string, rol: Rol) =>
  aplicarCambio(actor, id, { tipo: "rol", rol });

export const cambiarActivo = (actor: { id: string }, id: string, activo: boolean) =>
  aplicarCambio(actor, id, { tipo: "activo", activo });

export async function resetearPassword(id: string, password: string): Promise<void> {
  const { count } = await db.usuario.updateMany({
    where: { id },
    data: { passwordHash: await hashearPassword(password) },
  });
  if (count === 0) throw new CambioNoPermitidoError("El usuario no existe.");
}
