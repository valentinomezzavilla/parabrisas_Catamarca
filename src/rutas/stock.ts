import { Router, type Request, type Response } from "express";
import { ZodError } from "zod";
import { casilla, erroresDeZod, esDuplicado, leerExtras, lista, numero, texto, type Cuerpo, type Errores } from "@/lib/formularios";
import { obtenerCampos } from "@/modules/campos/campo.service";
import { formatearValor } from "@/modules/campos/extras";
import { nombreInput, type Extras, type ValorExtra } from "@/modules/campos/tipos";
import {
  actualizarCristal,
  buscarCristales,
  cambiarEstadoCristal,
  crearCristal,
  obtenerCatalogos,
  obtenerCristal,
  registrarMovimiento,
  StockInsuficienteError,
} from "@/modules/inventario/cristal.service";
import type { CrearCristalInput } from "@/modules/inventario/schemas";
import { avisar } from "@/web/avisos";
import { param } from "@/web/parametros";
import { mostrar } from "@/web/vistas";

export const rutasStock = Router();

// --- Listado ------------------------------------------------------------------------

rutasStock.get("/", async (req, res) => {
  const f = {
    texto: param(req, "texto"),
    modeloId: param(req, "modeloId"),
    anio: param(req, "anio"),
    ubicacionId: param(req, "ubicacionId"),
    tipoId: param(req, "tipoId"),
    stock: param(req, "stock"),
    bajas: param(req, "bajas"),
  };
  const anio = f.anio && /^\d{4}$/.test(f.anio) ? Number(f.anio) : undefined;
  const [catalogos, cristales] = await Promise.all([
    obtenerCatalogos({ incluirInactivos: true }),
    buscarCristales({
      texto: f.texto,
      modeloId: f.modeloId,
      anio,
      ubicacionId: f.ubicacionId,
      tipoId: f.tipoId,
      soloConStock: f.stock === "1",
      incluirInactivos: f.bajas === "1",
    }),
  ]);
  const hayFiltros = Object.values(f).some(Boolean);
  const filtrosAvanzados = [f.modeloId, f.anio, f.ubicacionId, f.tipoId, f.stock, f.bajas].filter(Boolean).length;
  const unidades = cristales.reduce((total, c) => total + c.cantidad, 0);

  await mostrar(res, "stock/listado", { titulo: "Stock", f, catalogos, cristales, hayFiltros, filtrosAvanzados, unidades });
});

// --- Alta y edición -----------------------------------------------------------------

/** Lo que muestra el formulario: lo guardado o, si la validación falló, lo que se envió. Todo como texto. */
export interface ValoresCristal {
  campos: Record<string, string>;
  extras: Record<string, ValorExtra | undefined>;
  compatibilidades: { modeloId: string; anioDesde: string; anioHasta: string; carroceria: string }[];
}

const CAMPOS_CRISTAL = [
  "codigo",
  "codigoFabricante",
  "descripcion",
  "marcaId",
  "tipoId",
  "ubicacionId",
  "lado",
  "anchoMm",
  "altoMm",
  "espesorMm",
  "cantidadInicial",
  "stockMinimo",
  "ubicacionDeposito",
  "costo",
  "precioVenta",
] as const;

const aTexto = (v: unknown) => (v === null || v === undefined ? "" : String(v));

/** Filas de vehículos compatibles del formulario (controles `compat_*` repetidos), sin las que no tienen modelo. */
function compatibilidadesDe(cuerpo: Cuerpo): ValoresCristal["compatibilidades"] {
  const modelos = lista(cuerpo, "compat_modeloId");
  const desde = lista(cuerpo, "compat_anioDesde");
  const hasta = lista(cuerpo, "compat_anioHasta");
  const carrocerias = lista(cuerpo, "compat_carroceria");
  return modelos
    .map((modeloId, i) => ({ modeloId, anioDesde: desde[i] ?? "", anioHasta: hasta[i] ?? "", carroceria: carrocerias[i] ?? "" }))
    .filter((c) => c.modeloId !== "");
}

function valoresEnviados(cuerpo: Cuerpo): ValoresCristal {
  const extras: ValoresCristal["extras"] = {};
  for (const [clave, valor] of Object.entries(leerExtras(cuerpo))) extras[clave.slice("extra_".length)] = valor === "on" ? true : (valor as string);
  return {
    campos: Object.fromEntries(CAMPOS_CRISTAL.map((c) => [c, texto(cuerpo, c) ?? ""])),
    extras,
    compatibilidades: compatibilidadesDe(cuerpo),
  };
}

interface EstadoFormulario {
  valores?: ValoresCristal;
  errores?: Errores;
  mensaje?: string | null;
}

async function paginaFormulario(res: Response, id: string | null, formulario: EstadoFormulario = {}, estado = 200) {
  const cristal = id ? await obtenerCristal(id) : null;
  if (id && !cristal) return mostrar(res, "errores/404", { titulo: "No encontrado" }, 404);

  // Lo que el cristal ya tiene guardado se ofrece aunque esté desactivado en las listas.
  const conservar = cristal
    ? [cristal.marcaId, cristal.tipoId, cristal.ubicacionId, ...cristal.compatibilidades.flatMap((v) => [v.modeloId, v.modelo.marcaId])]
    : [];
  const [catalogos, campos] = await Promise.all([obtenerCatalogos({ conservar }), obtenerCampos("CRISTAL")]);

  const guardados: ValoresCristal = cristal
    ? {
        campos: { ...Object.fromEntries(CAMPOS_CRISTAL.map((c) => [c, aTexto((cristal as Record<string, unknown>)[c])])), cantidadInicial: "0" },
        extras: cristal.extras as Extras,
        compatibilidades: cristal.compatibilidades.map((c) => ({
          modeloId: c.modeloId,
          anioDesde: aTexto(c.anioDesde),
          anioHasta: aTexto(c.anioHasta),
          carroceria: aTexto(c.carroceria),
        })),
      }
    : {
        campos: { ...Object.fromEntries(CAMPOS_CRISTAL.map((c) => [c, ""])), lado: "NO_APLICA", cantidadInicial: "0", stockMinimo: "1" },
        extras: {},
        compatibilidades: [],
      };

  await mostrar(
    res,
    "stock/formulario",
    {
      titulo: cristal ? "Editar cristal" : "Nuevo cristal",
      cristal,
      catalogos,
      campos,
      visibles: campos.filter((c) => c.visible && !c.archivado),
      valores: formulario.valores ?? guardados,
      errores: formulario.errores ?? {},
      mensaje: formulario.mensaje ?? null,
      nombreInput,
    },
    estado,
  );
}

async function guardarCristal(req: Request, res: Response, id: string | null) {
  const cuerpo: Cuerpo = req.body;
  // Un campo del sistema oculto no viaja en el formulario: queda sin valor al crear y sin tocar al editar.
  // Además, solo se toca lo que el formulario realmente mostró (`dibujado`): si un campo pasó a visible
  // mientras la persona tenía el formulario abierto, no viaja y no debe pisarse con un valor vacío.
  const campos = await obtenerCampos("CRISTAL");
  const dibujados = "dibujados" in cuerpo ? new Set(lista(cuerpo, "dibujado")) : null;
  const visible = (clave: string) =>
    (campos.find((c) => c.clave === clave)?.visible ?? true) && (dibujados ? dibujados.has(clave) : true);
  const siVisible = <T>(clave: string, leer: () => T): T | undefined => (visible(clave) ? leer() : undefined);
  const anio = (v: string) => (v === "" ? undefined : Number(v));

  // Los tipos se validan en el servicio (crearCristalSchema); acá solo se leen los campos.
  const entrada = {
    codigo: texto(cuerpo, "codigo"),
    codigoFabricante: siVisible("codigoFabricante", () => texto(cuerpo, "codigoFabricante")),
    descripcion: texto(cuerpo, "descripcion"),
    marcaId: texto(cuerpo, "marcaId"),
    tipoId: texto(cuerpo, "tipoId"),
    ubicacionId: texto(cuerpo, "ubicacionId"),
    lado: siVisible("lado", () => texto(cuerpo, "lado") ?? "NO_APLICA"),
    anchoMm: siVisible("anchoMm", () => numero(cuerpo, "anchoMm")),
    altoMm: siVisible("altoMm", () => numero(cuerpo, "altoMm")),
    espesorMm: siVisible("espesorMm", () => numero(cuerpo, "espesorMm")),
    cantidadInicial: numero(cuerpo, "cantidadInicial") ?? 0,
    stockMinimo: numero(cuerpo, "stockMinimo") ?? 0,
    ubicacionDeposito: siVisible("ubicacionDeposito", () => texto(cuerpo, "ubicacionDeposito")),
    costo: siVisible("costo", () => numero(cuerpo, "costo")),
    precioVenta: siVisible("precioVenta", () => numero(cuerpo, "precioVenta")),
    extrasEntrada: leerExtras(cuerpo),
    extrasDibujados: dibujados ? [...dibujados] : undefined,
    compatibilidades: siVisible("compatibilidades", () =>
      compatibilidadesDe(cuerpo).map((c) => ({
        modeloId: c.modeloId,
        anioDesde: anio(c.anioDesde),
        anioHasta: anio(c.anioHasta),
        carroceria: c.carroceria || undefined,
      })),
    ),
  } as CrearCristalInput;

  const fallo = (errores: Errores) =>
    paginaFormulario(res, id, { valores: valoresEnviados(cuerpo), errores, mensaje: "Revisá los datos marcados" }, 422);

  let destino: string;
  try {
    if (id) {
      const { cantidadInicial: _, ...cambios } = entrada;
      await actualizarCristal(id, cambios);
      avisar(res, "Cambios guardados.");
      destino = `/stock/${id}`;
    } else {
      const creado = await crearCristal(entrada);
      avisar(res, "Cristal dado de alta.");
      destino = `/stock/${creado.id}`;
    }
  } catch (e) {
    if (e instanceof ZodError) return fallo(erroresDeZod(e));
    if (esDuplicado(e)) return fallo({ codigo: "Ya existe un cristal con ese código" });
    throw e;
  }
  res.redirect(303, destino);
}

rutasStock.get("/nuevo", (_req, res) => paginaFormulario(res, null));
rutasStock.post("/nuevo", (req, res) => guardarCristal(req, res, null));

// --- Ficha --------------------------------------------------------------------------

const TIPOS_MOVIMIENTO = ["INGRESO", "EGRESO", "AJUSTE"] as const;

interface EstadoMovimiento {
  valores?: { tipo: string; cantidad: string; motivo: string };
  errores?: Errores;
  mensaje?: string | null;
}

async function paginaFicha(res: Response, id: string, movimiento: EstadoMovimiento = {}, estado = 200) {
  const [c, campos] = await Promise.all([obtenerCristal(id), obtenerCampos("CRISTAL")]);
  if (!c) return mostrar(res, "errores/404", { titulo: "No encontrado" }, 404);

  const campo = (clave: string) => campos.find((x) => x.clave === clave);
  const extras = c.extras as Extras;
  const adicionales = campos
    .filter((x) => x.origen === "PROPIO" && x.visible && extras[x.clave] !== undefined)
    .map((x) => ({ clave: x.clave, etiqueta: x.etiqueta, texto: formatearValor(x, extras[x.clave]) }));

  await mostrar(
    res,
    "stock/ficha",
    {
      titulo: "Ficha de cristal",
      c,
      adicionales,
      visible: (clave: string) => campo(clave)?.visible ?? true,
      etiqueta: (clave: string) => campo(clave)?.etiqueta ?? clave,
      movimiento: {
        valores: movimiento.valores ?? { tipo: "INGRESO", cantidad: "", motivo: "" },
        errores: movimiento.errores ?? {},
        mensaje: movimiento.mensaje ?? null,
      },
    },
    estado,
  );
}

rutasStock.get("/:id", (req, res) => paginaFicha(res, req.params.id));

rutasStock.post("/:id/movimientos", async (req, res) => {
  const cristalId = req.params.id;
  const tipo = texto(req.body, "tipo") ?? "";
  const valores = { tipo, cantidad: texto(req.body, "cantidad") ?? "", motivo: texto(req.body, "motivo") ?? "" };
  try {
    const mov = await registrarMovimiento({
      cristalId,
      tipo: tipo as (typeof TIPOS_MOVIMIENTO)[number],
      cantidad: numero(req.body, "cantidad") as number,
      motivo: texto(req.body, "motivo"),
    });
    // Tras registrar un movimiento el formulario queda limpio para cargar el siguiente.
    avisar(res, `Movimiento registrado. Stock actual: ${mov.saldo}`, { ancla: "movimiento" });
    res.redirect(303, `/stock/${cristalId}#movimiento`);
  } catch (e) {
    if (e instanceof ZodError) return paginaFicha(res, cristalId, { valores, errores: erroresDeZod(e), mensaje: "Revisá los datos marcados" }, 422);
    if (e instanceof StockInsuficienteError) return paginaFicha(res, cristalId, { valores, errores: { cantidad: e.message }, mensaje: e.message }, 422);
    throw e;
  }
});

rutasStock.post("/:id/estado", async (req, res) => {
  await cambiarEstadoCristal(req.params.id, casilla(req.body, "activo"));
  res.redirect(303, `/stock/${req.params.id}`);
});

rutasStock.get("/:id/editar", (req, res) => paginaFormulario(res, req.params.id));
rutasStock.post("/:id/editar", (req, res) => guardarCristal(req, res, req.params.id));
