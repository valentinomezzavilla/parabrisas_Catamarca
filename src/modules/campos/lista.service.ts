import { db } from "@/lib/db";
import { z } from "@/lib/zod";

export type ListaId = "marcas" | "tipos" | "ubicaciones" | "marcasVehiculo" | "modelos";

/** Una operación no permitida sobre un elemento de lista (en uso, inexistente…). */
export class ListaError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ListaError";
  }
}

const nombreSchema = z.string().trim().min(1).max(80);

/** Todo lo que muestra la pantalla de listas, con cuántos registros usa cada elemento. */
export async function obtenerListas() {
  const [marcas, tipos, ubicaciones, marcasVehiculo] = await Promise.all([
    db.marcaCristal.findMany({ orderBy: { nombre: "asc" }, include: { _count: { select: { cristales: true } } } }),
    db.tipoCristal.findMany({ orderBy: { nombre: "asc" }, include: { _count: { select: { cristales: true } } } }),
    db.ubicacionVehiculo.findMany({ orderBy: { orden: "asc" }, include: { _count: { select: { cristales: true } } } }),
    db.marcaVehiculo.findMany({
      orderBy: { nombre: "asc" },
      include: {
        modelos: { orderBy: { nombre: "asc" }, include: { _count: { select: { compatibilidades: true } } } },
      },
    }),
  ]);
  return { marcas, tipos, ubicaciones, marcasVehiculo };
}
export type Listas = Awaited<ReturnType<typeof obtenerListas>>;

export async function crearItem(lista: ListaId, datos: { nombre: string; marcaId?: string; tieneLado?: boolean }) {
  const nombre = nombreSchema.parse(datos.nombre);
  switch (lista) {
    case "marcas":
      return db.marcaCristal.create({ data: { nombre } });
    case "tipos":
      return db.tipoCristal.create({ data: { nombre } });
    case "ubicaciones": {
      const { _max } = await db.ubicacionVehiculo.aggregate({ _max: { orden: true } });
      return db.ubicacionVehiculo.create({ data: { nombre, tieneLado: datos.tieneLado ?? false, orden: (_max.orden ?? 0) + 10 } });
    }
    case "marcasVehiculo":
      return db.marcaVehiculo.create({ data: { nombre } });
    case "modelos": {
      if (!datos.marcaId) throw new ListaError("Elegí la marca del modelo.");
      return db.modeloVehiculo.create({ data: { nombre, marcaId: datos.marcaId } });
    }
  }
}

export async function renombrarItem(lista: ListaId, id: string, nombreNuevo: string) {
  const nombre = nombreSchema.parse(nombreNuevo);
  switch (lista) {
    case "marcas":
      return db.marcaCristal.update({ where: { id }, data: { nombre } });
    case "tipos":
      return db.tipoCristal.update({ where: { id }, data: { nombre } });
    case "ubicaciones":
      return db.ubicacionVehiculo.update({ where: { id }, data: { nombre } });
    case "marcasVehiculo":
      return db.marcaVehiculo.update({ where: { id }, data: { nombre } });
    case "modelos":
      return db.modeloVehiculo.update({ where: { id }, data: { nombre } });
  }
}

export async function activarItem(lista: ListaId, id: string, activo: boolean) {
  switch (lista) {
    case "marcas":
      return db.marcaCristal.update({ where: { id }, data: { activo } });
    case "tipos":
      return db.tipoCristal.update({ where: { id }, data: { activo } });
    case "ubicaciones":
      return db.ubicacionVehiculo.update({ where: { id }, data: { activo } });
    case "marcasVehiculo":
      return db.marcaVehiculo.update({ where: { id }, data: { activo } });
    case "modelos":
      return db.modeloVehiculo.update({ where: { id }, data: { activo } });
  }
}

async function contarUso(lista: ListaId, id: string): Promise<number> {
  switch (lista) {
    case "marcas":
      return db.cristal.count({ where: { marcaId: id } });
    case "tipos":
      return db.cristal.count({ where: { tipoId: id } });
    case "ubicaciones":
      return db.cristal.count({ where: { ubicacionId: id } });
    case "marcasVehiculo":
      return db.modeloVehiculo.count({ where: { marcaId: id } });
    case "modelos":
      return db.compatibilidadVehiculo.count({ where: { modeloId: id } });
  }
}

/** Solo se borra lo que no está en uso; si lo está, hay que desactivarlo. */
export async function eliminarItem(lista: ListaId, id: string): Promise<void> {
  const uso = await contarUso(lista, id);
  if (uso > 0) {
    throw new ListaError(
      lista === "marcasVehiculo"
        ? `Tiene ${uso} ${uso === 1 ? "modelo" : "modelos"}: borralos primero o desactivala.`
        : `Está en uso en ${uso} ${uso === 1 ? "registro" : "registros"}: desactivalo en lugar de borrarlo.`,
    );
  }
  switch (lista) {
    case "marcas":
      await db.marcaCristal.delete({ where: { id } });
      return;
    case "tipos":
      await db.tipoCristal.delete({ where: { id } });
      return;
    case "ubicaciones":
      await db.ubicacionVehiculo.delete({ where: { id } });
      return;
    case "marcasVehiculo":
      await db.marcaVehiculo.delete({ where: { id } });
      return;
    case "modelos":
      await db.modeloVehiculo.delete({ where: { id } });
      return;
  }
}

export async function cambiarTieneLado(id: string, tieneLado: boolean) {
  return db.ubicacionVehiculo.update({ where: { id }, data: { tieneLado } });
}

export async function moverUbicacion(id: string, direccion: "ARRIBA" | "ABAJO"): Promise<void> {
  const ubicaciones = await db.ubicacionVehiculo.findMany({ orderBy: { orden: "asc" }, select: { id: true } });
  const i = ubicaciones.findIndex((u) => u.id === id);
  const j = direccion === "ARRIBA" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ubicaciones.length) return;
  const reordenadas = [...ubicaciones];
  [reordenadas[i], reordenadas[j]] = [reordenadas[j], reordenadas[i]];
  await db.$transaction(
    reordenadas.map((u, n) => db.ubicacionVehiculo.update({ where: { id: u.id }, data: { orden: (n + 1) * 10 } })),
  );
}
