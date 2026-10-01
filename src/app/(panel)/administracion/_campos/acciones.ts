"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { casilla, erroresDeZod, esDuplicado, fallo, texto, type EstadoConConteo, type EstadoFormulario } from "@/lib/formularios";
import { requerirRol } from "@/lib/sesion";
import {
  actualizarCampoPropio,
  actualizarCampoSistema,
  archivarCampoPropio,
  cambiarTipoCampo,
  CampoInvalidoError,
  ConfirmacionRequeridaError,
  crearCampoPropio,
  eliminarCampoPropio,
  modificarOpciones,
  moverCampoAdmin,
  type OperacionOpcion,
} from "@/modules/campos/campo.service";
import { esModulo, MODULOS, type ModuloAdmin } from "@/modules/campos/modulos";
import type { TipoCampo } from "@/modules/campos/tipos";

const MODULO_INVALIDO: EstadoConConteo = { ok: false, mensaje: "Módulo inválido." };

function refrescar(modulo: ModuloAdmin) {
  revalidatePath(MODULOS[modulo].base);
  for (const ruta of MODULOS[modulo].revalidar) revalidatePath(ruta, "layout");
}

/** Traduce los errores esperados del servicio a un resultado para el formulario; el resto se propaga. */
function aResultado(e: unknown): EstadoConConteo {
  if (e instanceof ZodError) return fallo(erroresDeZod(e));
  if (e instanceof CampoInvalidoError) return e.campo ? fallo({ [e.campo]: e.message }, e.message) : { ok: false, mensaje: e.message };
  if (e instanceof ConfirmacionRequeridaError) return { ok: false, mensaje: e.message, afectados: e.afectados };
  if (esDuplicado(e)) return fallo({ etiqueta: "Ya hay un campo con ese nombre." });
  throw e;
}

const textoLargo = (fd: FormData, campo: string) => {
  const v = fd.get(campo);
  return typeof v === "string" ? v : "";
};

export async function crearCampoAccion(modulo: string, _previo: EstadoFormulario, fd: FormData): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  if (!esModulo(modulo)) return MODULO_INVALIDO;
  try {
    await crearCampoPropio(MODULOS[modulo].entidad, {
      etiqueta: texto(fd, "etiqueta") as string,
      ayuda: texto(fd, "ayuda"),
      tipo: texto(fd, "tipo") as TipoCampo,
      requerido: casilla(fd, "requerido"),
      unidad: texto(fd, "unidad"),
      opcionesTexto: textoLargo(fd, "opcionesTexto"),
    });
  } catch (e) {
    return aResultado(e);
  }
  refrescar(modulo);
  redirect(`${MODULOS[modulo].base}?aviso=creado`);
}

export async function guardarCampoSistemaAccion(
  modulo: string,
  clave: string,
  _previo: EstadoFormulario,
  fd: FormData,
): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  if (!esModulo(modulo)) return MODULO_INVALIDO;
  // Los campos protegidos no muestran la casilla "visible": sin la marca `puedeOcultar` nunca se ocultan.
  const oculto = fd.get("puedeOcultar") === "1" ? !casilla(fd, "visible") : false;
  try {
    await actualizarCampoSistema(MODULOS[modulo].entidad, clave, { etiqueta: texto(fd, "etiqueta"), ayuda: texto(fd, "ayuda"), oculto });
  } catch (e) {
    return aResultado(e);
  }
  refrescar(modulo);
  redirect(`${MODULOS[modulo].base}?aviso=guardado`);
}

export async function guardarCampoPropioAccion(
  modulo: string,
  id: string,
  _previo: EstadoFormulario,
  fd: FormData,
): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  if (!esModulo(modulo)) return MODULO_INVALIDO;
  try {
    await actualizarCampoPropio(id, {
      etiqueta: texto(fd, "etiqueta") as string,
      ayuda: texto(fd, "ayuda"),
      requerido: casilla(fd, "requerido"),
      unidad: texto(fd, "unidad"),
      visible: casilla(fd, "visible"),
    });
  } catch (e) {
    return aResultado(e);
  }
  refrescar(modulo);
  redirect(`${MODULOS[modulo].base}?aviso=guardado`);
}

export async function moverCampoAccion(modulo: string, clave: string, direccion: "ARRIBA" | "ABAJO"): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  if (!esModulo(modulo)) return MODULO_INVALIDO;
  if (direccion !== "ARRIBA" && direccion !== "ABAJO") return { ok: false, mensaje: "Dirección inválida." };
  try {
    await moverCampoAdmin(MODULOS[modulo].entidad, clave, direccion);
  } catch (e) {
    return aResultado(e);
  }
  refrescar(modulo);
  return { ok: true };
}

export async function archivarCampoAccion(modulo: string, id: string, archivar: boolean): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  if (!esModulo(modulo)) return MODULO_INVALIDO;
  await archivarCampoPropio(id, archivar === true);
  refrescar(modulo);
  return { ok: true };
}

/** Sin datos se elimina directo; con datos devuelve `afectados` y espera una segunda llamada con `confirmar = true`. */
export async function eliminarCampoAccion(modulo: string, id: string, confirmar: boolean): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  if (!esModulo(modulo)) return MODULO_INVALIDO;
  try {
    await eliminarCampoPropio(id, { confirmar: confirmar === true });
  } catch (e) {
    return aResultado(e);
  }
  refrescar(modulo);
  redirect(`${MODULOS[modulo].base}?aviso=eliminado`);
}

export async function cambiarTipoAccion(
  modulo: string,
  id: string,
  tipo: string,
  opcionesTexto: string,
  confirmar: boolean,
): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  if (!esModulo(modulo)) return MODULO_INVALIDO;
  try {
    await cambiarTipoCampo(id, tipo as TipoCampo, { opcionesTexto, confirmar: confirmar === true });
  } catch (e) {
    return aResultado(e);
  }
  refrescar(modulo);
  return { ok: true, mensaje: "Tipo cambiado." };
}

export async function opcionAccion(modulo: string, id: string, operacion: OperacionOpcion): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  if (!esModulo(modulo)) return MODULO_INVALIDO;
  try {
    await modificarOpciones(id, operacion);
  } catch (e) {
    return aResultado(e);
  }
  refrescar(modulo);
  return { ok: true };
}
