import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { claveUnica, normalizarTexto } from "./clave";
import { camposVisibles, combinarCampos, moverCampo, type CampoFinal } from "./combinar";
import {
  agregarOpcion,
  alternarOpcion,
  crearOpciones,
  etiquetasDeTexto,
  quitarOpcion,
  renombrarOpcion,
  validarOpciones,
} from "./opciones";
import { clavesProhibidas, REGISTRO } from "./registro";
import {
  crearCampoSchema,
  editarCampoPropioSchema,
  editarCampoSistemaSchema,
  tipoCampoSchema,
  type CrearCampoInput,
  type EditarCampoPropioInput,
  type EditarCampoSistemaInput,
} from "./schemas";
import type { CampoPropio, EntidadCampo, OpcionCampo, TipoCampo } from "./tipos";

/** Un pedido inválido (duplicado, lista sin opciones, campo protegido…). `campo` dice a qué control del formulario apunta. */
export class CampoInvalidoError extends Error {
  constructor(
    mensaje: string,
    public campo?: string,
  ) {
    super(mensaje);
    this.name = "CampoInvalidoError";
  }
}

/** La operación borra datos y hace falta que el Admin la confirme. */
export class ConfirmacionRequeridaError extends Error {
  constructor(public afectados: number) {
    super(`Se borrarán los valores de ${afectados} ${afectados === 1 ? "registro" : "registros"}.`);
    this.name = "ConfirmacionRequeridaError";
  }
}

// Tablas con columna `extras`. El nombre de tabla sale de este mapa, nunca de la entrada.
const TABLAS: Partial<Record<EntidadCampo, string>> = { CRISTAL: "cristales", SERVICIO: "servicios" };

function tabla(entidad: EntidadCampo): Prisma.Sql {
  const nombre = TABLAS[entidad];
  if (!nombre) throw new CampoInvalidoError("Este módulo todavía no admite campos propios.");
  return Prisma.raw(nombre);
}

type Fila = Awaited<ReturnType<typeof db.campoPersonalizado.findMany>>[number];

const aCampoPropio = (f: Fila): CampoPropio => ({
  id: f.id,
  entidad: f.entidad,
  clave: f.clave,
  etiqueta: f.etiqueta,
  ayuda: f.ayuda,
  tipo: f.tipo,
  requerido: f.requerido,
  unidad: f.unidad,
  opciones: (f.opciones as unknown as OpcionCampo[]) ?? [],
  orden: f.orden,
  visible: f.visible,
  archivado: f.archivadoEn !== null,
});

const json = (opciones: OpcionCampo[]) => opciones as unknown as Prisma.InputJsonArray;

export async function listarCamposPropios(entidad: EntidadCampo): Promise<CampoPropio[]> {
  const filas = await db.campoPersonalizado.findMany({
    where: { entidad },
    orderBy: [{ orden: "asc" }, { creadoEn: "asc" }],
  });
  return filas.map(aCampoPropio);
}

/** Todos los campos del módulo (del sistema y propios, incluidos ocultos y archivados), ya combinados. */
export async function obtenerCampos(entidad: EntidadCampo): Promise<CampoFinal[]> {
  const [ajustes, propios] = await Promise.all([
    db.configuracionCampo.findMany({ where: { entidad } }),
    listarCamposPropios(entidad),
  ]);
  return combinarCampos(
    entidad,
    ajustes.map((a) => ({ clave: a.clave, etiqueta: a.etiqueta, ayuda: a.ayuda, oculto: a.oculto, orden: a.orden })),
    propios,
  );
}

export async function obtenerCamposVisibles(entidad: EntidadCampo): Promise<CampoFinal[]> {
  return camposVisibles(await obtenerCampos(entidad));
}

const etiquetaEnUso = (campos: CampoFinal[], etiqueta: string, excluirClave?: string) =>
  campos.some((c) => c.clave !== excluirClave && normalizarTexto(c.etiqueta) === normalizarTexto(etiqueta));

export async function crearCampoPropio(entidad: EntidadCampo, entrada: CrearCampoInput): Promise<CampoPropio> {
  tabla(entidad);
  const datos = crearCampoSchema.parse(entrada);
  const existentes = await obtenerCampos(entidad);
  if (etiquetaEnUso(existentes, datos.etiqueta)) throw new CampoInvalidoError("Ya hay un campo con ese nombre.", "etiqueta");

  const opciones = datos.tipo === "LISTA" ? crearOpciones(etiquetasDeTexto(datos.opcionesTexto)) : [];
  const error = datos.tipo === "LISTA" ? validarOpciones(opciones) : null;
  if (error) throw new CampoInvalidoError(error, "opcionesTexto");

  const clave = claveUnica(datos.etiqueta, [...clavesProhibidas(entidad), ...existentes.map((c) => c.clave)]);
  const orden = Math.max(0, ...existentes.filter((c) => c.seccion === "adicionales").map((c) => c.orden)) + 10;

  const fila = await db.campoPersonalizado.create({
    data: {
      entidad,
      clave,
      etiqueta: datos.etiqueta,
      ayuda: datos.ayuda || null,
      tipo: datos.tipo,
      requerido: datos.requerido,
      unidad: datos.tipo === "NUMERO" ? datos.unidad || null : null,
      opciones: json(opciones),
      orden,
    },
  });
  return aCampoPropio(fila);
}

export async function actualizarCampoPropio(id: string, entrada: EditarCampoPropioInput): Promise<void> {
  const datos = editarCampoPropioSchema.parse(entrada);
  const fila = await db.campoPersonalizado.findUniqueOrThrow({ where: { id } });
  const existentes = await obtenerCampos(fila.entidad);
  if (etiquetaEnUso(existentes, datos.etiqueta, fila.clave)) throw new CampoInvalidoError("Ya hay un campo con ese nombre.", "etiqueta");

  await db.campoPersonalizado.update({
    where: { id },
    data: {
      etiqueta: datos.etiqueta,
      ayuda: datos.ayuda || null,
      requerido: datos.requerido,
      visible: datos.visible,
      unidad: fila.tipo === "NUMERO" ? datos.unidad || null : null,
    },
  });
}

export async function actualizarCampoSistema(
  entidad: EntidadCampo,
  clave: string,
  entrada: EditarCampoSistemaInput,
): Promise<void> {
  const definicion = REGISTRO[entidad].find((c) => c.clave === clave);
  if (!definicion) throw new CampoInvalidoError("Ese campo no existe.");
  if (definicion.fijo) throw new CampoInvalidoError("Este campo no se puede ajustar desde Administración.");
  const datos = editarCampoSistemaSchema.parse(entrada);
  if (datos.oculto && !definicion.ocultable) {
    throw new CampoInvalidoError("Este campo es necesario para que el sistema funcione y no se puede ocultar.", "oculto");
  }
  const etiqueta = datos.etiqueta || null;
  if (etiqueta && etiquetaEnUso(await obtenerCampos(entidad), etiqueta, clave)) {
    throw new CampoInvalidoError("Ya hay un campo con ese nombre.", "etiqueta");
  }
  const valores = { etiqueta, ayuda: datos.ayuda || null, oculto: datos.oculto };
  await db.configuracionCampo.upsert({
    where: { entidad_clave: { entidad, clave } },
    create: { entidad, clave, ...valores },
    update: valores,
  });
}

export async function moverCampoAdmin(entidad: EntidadCampo, clave: string, direccion: "ARRIBA" | "ABAJO"): Promise<void> {
  const campos = await obtenerCampos(entidad);
  if (campos.find((c) => c.clave === clave)?.fijo) throw new CampoInvalidoError("Este campo no se puede mover.");
  const cambios = moverCampo(campos, clave, direccion);
  if (cambios.length === 0) return;
  await db.$transaction(async (tx) => {
    for (const { clave: k, orden } of cambios) {
      if (campos.find((c) => c.clave === k)?.origen === "PROPIO") {
        await tx.campoPersonalizado.update({ where: { entidad_clave: { entidad, clave: k } }, data: { orden } });
      } else {
        await tx.configuracionCampo.upsert({
          where: { entidad_clave: { entidad, clave: k } },
          create: { entidad, clave: k, orden },
          update: { orden },
        });
      }
    }
  });
}

export async function archivarCampoPropio(id: string, archivar: boolean): Promise<void> {
  await db.campoPersonalizado.update({ where: { id }, data: { archivadoEn: archivar ? new Date() : null } });
}

async function contarValores(entidad: EntidadCampo, clave: string): Promise<number> {
  const [{ n }] = await db.$queryRaw<{ n: number }[]>(
    Prisma.sql`SELECT count(*)::int AS n FROM ${tabla(entidad)} WHERE jsonb_exists(extras, ${clave})`,
  );
  return n;
}

async function contarUsoOpcion(entidad: EntidadCampo, clave: string, opcionId: string): Promise<number> {
  const [{ n }] = await db.$queryRaw<{ n: number }[]>(
    Prisma.sql`SELECT count(*)::int AS n FROM ${tabla(entidad)} WHERE extras ->> ${clave} = ${opcionId}`,
  );
  return n;
}

/** Elimina el campo y sus valores. Devuelve cuántos registros tenían valor. Con datos, exige `confirmar`. */
export async function eliminarCampoPropio(id: string, { confirmar }: { confirmar: boolean }): Promise<number> {
  const fila = await db.campoPersonalizado.findUniqueOrThrow({ where: { id } });
  const afectados = await contarValores(fila.entidad, fila.clave);
  if (afectados > 0 && !confirmar) throw new ConfirmacionRequeridaError(afectados);
  await db.$transaction(async (tx) => {
    if (afectados > 0) await tx.$executeRaw(Prisma.sql`UPDATE ${tabla(fila.entidad)} SET extras = extras - ${fila.clave}::text`);
    await tx.campoPersonalizado.delete({ where: { id } });
  });
  return afectados;
}

/** Cambia el tipo de un campo propio. Sus valores anteriores se borran (con datos, exige `confirmar`). */
export async function cambiarTipoCampo(
  id: string,
  tipo: TipoCampo,
  { opcionesTexto = "", confirmar }: { opcionesTexto?: string; confirmar: boolean },
): Promise<number> {
  const nuevoTipo = tipoCampoSchema.parse(tipo);
  const fila = await db.campoPersonalizado.findUniqueOrThrow({ where: { id } });
  if (fila.tipo === nuevoTipo) return 0;

  const opciones = nuevoTipo === "LISTA" ? crearOpciones(etiquetasDeTexto(opcionesTexto)) : [];
  const error = nuevoTipo === "LISTA" ? validarOpciones(opciones) : null;
  if (error) throw new CampoInvalidoError(error, "opcionesTexto");

  const afectados = await contarValores(fila.entidad, fila.clave);
  if (afectados > 0 && !confirmar) throw new ConfirmacionRequeridaError(afectados);
  await db.$transaction(async (tx) => {
    if (afectados > 0) await tx.$executeRaw(Prisma.sql`UPDATE ${tabla(fila.entidad)} SET extras = extras - ${fila.clave}::text`);
    await tx.campoPersonalizado.update({
      where: { id },
      data: { tipo: nuevoTipo, opciones: json(opciones), unidad: nuevoTipo === "NUMERO" ? fila.unidad : null },
    });
  });
  return afectados;
}

export type OperacionOpcion =
  | { tipo: "agregar"; etiqueta: string }
  | { tipo: "renombrar"; opcionId: string; etiqueta: string }
  | { tipo: "alternar"; opcionId: string; activo: boolean }
  | { tipo: "quitar"; opcionId: string };

/** Agrega, renombra, desactiva o quita una opción de un campo de tipo lista. */
export async function modificarOpciones(id: string, operacion: OperacionOpcion): Promise<void> {
  const fila = await db.campoPersonalizado.findUniqueOrThrow({ where: { id } });
  if (fila.tipo !== "LISTA") throw new CampoInvalidoError("Este campo no es una lista.");
  let opciones = aCampoPropio(fila).opciones;

  switch (operacion.tipo) {
    case "agregar":
      opciones = agregarOpcion(opciones, operacion.etiqueta);
      break;
    case "renombrar":
      opciones = renombrarOpcion(opciones, operacion.opcionId, operacion.etiqueta);
      break;
    case "alternar":
      opciones = alternarOpcion(opciones, operacion.opcionId, operacion.activo);
      break;
    case "quitar": {
      const enUso = await contarUsoOpcion(fila.entidad, fila.clave, operacion.opcionId);
      if (enUso > 0) {
        throw new CampoInvalidoError(
          `La opción está en uso en ${enUso} ${enUso === 1 ? "registro" : "registros"}: desactivala en lugar de borrarla.`,
          "opciones",
        );
      }
      opciones = quitarOpcion(opciones, operacion.opcionId);
    }
  }

  const error = validarOpciones(opciones);
  if (error) throw new CampoInvalidoError(error, "opciones");
  await db.campoPersonalizado.update({ where: { id }, data: { opciones: json(opciones) } });
}
