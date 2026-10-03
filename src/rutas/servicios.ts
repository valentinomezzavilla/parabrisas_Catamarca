import { Router, type Request, type Response } from "express";
import { ZodError } from "zod";
import { casilla, erroresDeZod, esDuplicado, leerExtras, lista, numero, texto, type Cuerpo, type Errores } from "@/lib/formularios";
import { DIAS_CORTOS, minutosAHora, SEMANA } from "@/lib/tiempo";
import { obtenerCampos, obtenerCamposVisibles } from "@/modules/campos/campo.service";
import { formatearValor } from "@/modules/campos/extras";
import { nombreInput, type Extras, type ValorExtra } from "@/modules/campos/tipos";
import { calcularSena } from "@/modules/pagos/sena";
import type { ServicioInput } from "@/modules/turnos/schemas";
import {
  actualizarServicio,
  cambiarEstadoServicio,
  crearServicio,
  eliminarServicio,
  listarServicios,
  obtenerServicio,
} from "@/modules/turnos/servicio.service";
import { avisar } from "@/web/avisos";
import { mostrar } from "@/web/vistas";

export const rutasServicios = Router();

/** Resume las franjas: "Lun a Vie 08:30–12:30 y 16:30–20:00 · Sáb 09:00–13:00". */
export function resumenHorario(horarios: { diaSemana: number; horaInicio: number; horaFin: number }[]): string[] {
  const porDia = new Map<number, string>();
  for (const d of SEMANA) {
    const franjas = horarios.filter((h) => h.diaSemana === d).map((h) => `${minutosAHora(h.horaInicio)}–${minutosAHora(h.horaFin)}`);
    if (franjas.length) porDia.set(d, franjas.join(" y "));
  }
  const grupos: { dias: number[]; franjas: string }[] = [];
  for (const [dia, franjas] of porDia) {
    const ultimo = grupos.at(-1);
    const anterior = ultimo?.dias.at(-1);
    const consecutivo = anterior !== undefined && SEMANA.indexOf(dia) === SEMANA.indexOf(anterior) + 1;
    if (ultimo && consecutivo && ultimo.franjas === franjas) ultimo.dias.push(dia);
    else grupos.push({ dias: [dia], franjas });
  }
  return grupos.map(({ dias, franjas }) => {
    const nombre = dias.length > 1 ? `${DIAS_CORTOS[dias[0]]} a ${DIAS_CORTOS[dias.at(-1)!]}` : DIAS_CORTOS[dias[0]];
    return `${nombre} ${franjas}`;
  });
}

rutasServicios.get("/", async (_req, res) => {
  const [servicios, campos] = await Promise.all([listarServicios(), obtenerCampos("SERVICIO")]);
  const propios = campos.filter((c) => c.origen === "PROPIO" && c.visible);
  await mostrar(res, "servicios/listado", {
    titulo: "Servicios",
    servicios: servicios.map((s) => {
      const extras = s.extras as Extras;
      return {
        ...s,
        sena: calcularSena(s.precioBase),
        resumen: resumenHorario(s.horarios),
        datos: propios.filter((c) => extras[c.clave] !== undefined).map((c) => ({ etiqueta: c.etiqueta, texto: formatearValor(c, extras[c.clave]) })),
      };
    }),
  });
});

// --- Alta y edición -----------------------------------------------------------------

interface Franja {
  diaSemana: number;
  desde: string;
  hasta: string;
}

interface ValoresServicio {
  campos: Record<string, string>;
  activo: boolean;
  requiereCristal: boolean;
  franjas: Franja[];
  extras: Record<string, ValorExtra | undefined>;
}

const CAMPOS_SERVICIO = [
  "nombre",
  "precioBase",
  "descripcion",
  "color",
  "duracionMinutos",
  "intervaloMinutos",
  "margenMinutos",
  "capacidad",
  "anticipacionMinutos",
] as const;

/** Franjas del formulario: controles `franja_dia`, `franja_desde` y `franja_hasta` repetidos, en orden. */
function franjasDe(cuerpo: Cuerpo): Franja[] {
  const desde = lista(cuerpo, "franja_desde");
  const hasta = lista(cuerpo, "franja_hasta");
  return lista(cuerpo, "franja_dia").map((dia, i) => ({ diaSemana: Number(dia), desde: desde[i] ?? "", hasta: hasta[i] ?? "" }));
}

interface EstadoFormulario {
  valores?: ValoresServicio;
  errores?: Errores;
  mensaje?: string | null;
}

async function paginaFormulario(res: Response, id: string | null, formulario: EstadoFormulario = {}, estado = 200) {
  const servicio = id ? await obtenerServicio(id) : null;
  if (id && !servicio) return mostrar(res, "errores/404", { titulo: "No encontrado" }, 404);
  const campos = (await obtenerCamposVisibles("SERVICIO")).filter((c) => c.origen === "PROPIO");

  const guardados: ValoresServicio = servicio
    ? {
        campos: {
          nombre: servicio.nombre,
          precioBase: servicio.precioBase === null ? "" : String(Number(servicio.precioBase)),
          descripcion: servicio.descripcion ?? "",
          color: servicio.color,
          duracionMinutos: String(servicio.duracionMinutos),
          intervaloMinutos: String(servicio.intervaloMinutos),
          margenMinutos: String(servicio.margenMinutos),
          capacidad: String(servicio.capacidad),
          anticipacionMinutos: String(servicio.anticipacionMinutos),
        },
        activo: servicio.activo,
        requiereCristal: servicio.requiereCristal,
        franjas: servicio.horarios.map((h) => ({ diaSemana: h.diaSemana, desde: minutosAHora(h.horaInicio), hasta: minutosAHora(h.horaFin) })),
        extras: servicio.extras as Extras,
      }
    : {
        campos: {
          nombre: "",
          precioBase: "",
          descripcion: "",
          color: "#FDDD3D",
          duracionMinutos: "60",
          intervaloMinutos: "30",
          margenMinutos: "0",
          capacidad: "1",
          anticipacionMinutos: "60",
        },
        activo: true,
        requiereCristal: false,
        franjas: [1, 2, 3, 4, 5].map((diaSemana) => ({ diaSemana, desde: "08:30", hasta: "12:30" })),
        extras: {},
      };

  await mostrar(
    res,
    "servicios/formulario",
    {
      titulo: servicio ? "Editar servicio" : "Nuevo servicio",
      servicio,
      campos,
      valores: formulario.valores ?? guardados,
      errores: formulario.errores ?? {},
      mensaje: formulario.mensaje ?? null,
      nombreInput,
    },
    estado,
  );
}

async function guardarServicio(req: Request, res: Response, id: string | null) {
  const cuerpo: Cuerpo = req.body;
  // Los tipos se validan en el servicio (servicioSchema); acá solo se leen los campos.
  const entrada = {
    nombre: texto(cuerpo, "nombre"),
    slug: texto(cuerpo, "slug"),
    descripcion: texto(cuerpo, "descripcion"),
    duracionMinutos: numero(cuerpo, "duracionMinutos"),
    intervaloMinutos: numero(cuerpo, "intervaloMinutos"),
    margenMinutos: numero(cuerpo, "margenMinutos") ?? 0,
    capacidad: numero(cuerpo, "capacidad"),
    anticipacionMinutos: numero(cuerpo, "anticipacionMinutos"),
    precioBase: numero(cuerpo, "precioBase"),
    color: texto(cuerpo, "color"),
    requiereCristal: casilla(cuerpo, "requiereCristal"),
    activo: casilla(cuerpo, "activo"),
    orden: numero(cuerpo, "orden"),
    horarios: franjasDe(cuerpo),
    extrasEntrada: leerExtras(cuerpo),
    extrasDibujados: "dibujados" in cuerpo ? lista(cuerpo, "dibujado") : undefined,
  } as ServicioInput;

  const fallo = (errores: Errores) => {
    const extras: ValoresServicio["extras"] = {};
    for (const [clave, valor] of Object.entries(leerExtras(cuerpo))) extras[clave.slice("extra_".length)] = valor === "on" ? true : (valor as string);
    const valores: ValoresServicio = {
      campos: Object.fromEntries(CAMPOS_SERVICIO.map((c) => [c, texto(cuerpo, c) ?? ""])),
      activo: casilla(cuerpo, "activo"),
      requiereCristal: casilla(cuerpo, "requiereCristal"),
      franjas: franjasDe(cuerpo),
      extras,
    };
    return paginaFormulario(res, id, { valores, errores, mensaje: "Revisá los datos marcados" }, 422);
  };

  try {
    if (id) await actualizarServicio(id, entrada);
    else await crearServicio(entrada);
  } catch (e) {
    if (e instanceof ZodError) return fallo(erroresDeZod(e));
    if (esDuplicado(e)) return fallo({ nombre: "Ya existe un servicio con ese nombre" });
    throw e;
  }
  avisar(res, id ? "Cambios guardados." : "Servicio creado.");
  res.redirect(303, "/servicios");
}

rutasServicios.get("/nuevo", (_req, res) => paginaFormulario(res, null));
rutasServicios.post("/nuevo", (req, res) => guardarServicio(req, res, null));

rutasServicios.get("/:id", (req, res) => paginaFormulario(res, req.params.id));
rutasServicios.post("/:id", (req, res) => guardarServicio(req, res, req.params.id));

rutasServicios.post("/:id/estado", async (req, res) => {
  await cambiarEstadoServicio(req.params.id, casilla(req.body, "activo"));
  res.redirect(303, "/servicios");
});

rutasServicios.post("/:id/eliminar", async (req, res) => {
  const { resultado } = await eliminarServicio(req.params.id);
  if (resultado === "eliminado") avisar(res, "Servicio eliminado.");
  else avisar(res, "El servicio tenía turnos, así que se archivó: ya no se ofrece, pero su historial se conserva.", { tono: "alerta" });
  res.redirect(303, "/servicios");
});
