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
import type { TipoCampo } from "@/modules/campos/tipos";

function refrescar() {
  revalidatePath("/administracion/stock");
  revalidatePath("/stock", "layout");
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

export async function crearCampoAccion(_previo: EstadoFormulario, fd: FormData): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  try {
    await crearCampoPropio("CRISTAL", {
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
  refrescar();
  redirect("/administracion/stock?aviso=creado");
}

export async function guardarCampoSistemaAccion(clave: string, _previo: EstadoFormulario, fd: FormData): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  // Los campos protegidos no muestran la casilla "visible": sin la marca `puedeOcultar` nunca se ocultan.
  const oculto = fd.get("puedeOcultar") === "1" ? !casilla(fd, "visible") : false;
  try {
    await actualizarCampoSistema("CRISTAL", clave, { etiqueta: texto(fd, "etiqueta"), ayuda: texto(fd, "ayuda"), oculto });
  } catch (e) {
    return aResultado(e);
  }
  refrescar();
  redirect("/administracion/stock?aviso=guardado");
}

export async function guardarCampoPropioAccion(id: string, _previo: EstadoFormulario, fd: FormData): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
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
  refrescar();
  redirect("/administracion/stock?aviso=guardado");
}

export async function moverCampoAccion(clave: string, direccion: "ARRIBA" | "ABAJO"): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  if (direccion !== "ARRIBA" && direccion !== "ABAJO") return { ok: false, mensaje: "Dirección inválida." };
  await moverCampoAdmin("CRISTAL", clave, direccion);
  refrescar();
  return { ok: true };
}

export async function archivarCampoAccion(id: string, archivar: boolean): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  await archivarCampoPropio(id, archivar === true);
  refrescar();
  return { ok: true };
}

/** Sin datos se elimina directo; con datos devuelve `afectados` y espera una segunda llamada con `confirmar = true`. */
export async function eliminarCampoAccion(id: string, confirmar: boolean): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  try {
    await eliminarCampoPropio(id, { confirmar: confirmar === true });
  } catch (e) {
    return aResultado(e);
  }
  refrescar();
  redirect("/administracion/stock?aviso=eliminado");
}

export async function cambiarTipoAccion(id: string, tipo: string, opcionesTexto: string, confirmar: boolean): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  try {
    await cambiarTipoCampo(id, tipo as TipoCampo, { opcionesTexto, confirmar: confirmar === true });
  } catch (e) {
    return aResultado(e);
  }
  refrescar();
  return { ok: true, mensaje: "Tipo cambiado." };
}

export async function opcionAccion(id: string, operacion: OperacionOpcion): Promise<EstadoConConteo> {
  await requerirRol("ADMIN");
  try {
    await modificarOpciones(id, operacion);
  } catch (e) {
    return aResultado(e);
  }
  refrescar();
  return { ok: true };
}
