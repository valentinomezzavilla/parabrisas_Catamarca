import { Router, type Request, type Response } from "express";
import { ZodError } from "zod";
import { casilla, erroresDeZod, texto, type Errores } from "@/lib/formularios";
import { pesos } from "@/lib/formato";
import { obtenerSesion } from "@/lib/sesion";
import { diaSemana, fechaLocal, formatearFecha, formatearHora, hoy, sumarDias } from "@/lib/tiempo";
import { CobroNoDisponibleError, iniciarCobro, liberarVencidos, sincronizarPago } from "@/modules/pagos/pagos.service";
import { calcularSena, medioSena, MINUTOS_RETENCION } from "@/modules/pagos/sena";
import { enlaceWhatsapp, leerDatosTransferencia, mensajeSena } from "@/modules/pagos/transferencia";
import { vistaConfirmacion } from "@/modules/pagos/vista";
import { SinCriteriosError, type RespuestaBusqueda, type RespuestaCancelacion } from "@/modules/turnos/busqueda";
import { buscarReservas, BusquedasExcedidasError, cancelarReservaCliente } from "@/modules/turnos/reservas-cliente.service";
import {
  CondicionesNoAceptadasError,
  listarServicios,
  obtenerDisponibilidad,
  obtenerServicioReservable,
  reservarTurno,
  TurnoNoDisponibleError,
} from "@/modules/turnos/servicio.service";
import { obtenerTurno } from "@/modules/turnos/turno.service";
import { param, url } from "@/web/parametros";
import { mostrar } from "@/web/vistas";

export const rutasReservar = Router();

const DIAS_A_MOSTRAR = 14;
const CAMPOS_RESERVA = ["nombre", "telefono", "email", "vehiculo", "patente", "notas"] as const;

interface EstadoFormulario {
  valores?: Record<string, string>;
  errores?: Errores;
  mensaje?: string | null;
}

/** Pasos del turnero: 1) servicio, 2) día, 3) horario, 4) datos. El paso sale de la query string. */
async function paginaReservar(req: Request, res: Response, formulario: EstadoFormulario = {}, estado = 200) {
  await liberarVencidos(); // libera los horarios cuyo pago venció antes de calcular la disponibilidad
  const slug = param(req, "servicio");
  const servicio = slug ? await obtenerServicioReservable(slug) : null;

  if (!servicio) {
    const servicios = (await listarServicios()).filter((s) => s.activo);
    return mostrar(res, "reservar/servicios", { titulo: "Reservar turno", layout: "publico", servicios });
  }

  const dias = Array.from({ length: DIAS_A_MOSTRAR }, (_, i) => sumarDias(hoy(), i));
  const libresPorDia = new Map<string, number>();
  for (const dia of dias) {
    const atiende = servicio.horarios.some((h) => h.diaSemana === diaSemana(dia));
    libresPorDia.set(dia, atiende ? (await obtenerDisponibilidad(servicio.id, dia)).length : 0);
  }
  const pedida = param(req, "fecha");
  const fecha = pedida && libresPorDia.has(pedida) ? pedida : undefined;
  const turnos = fecha ? await obtenerDisponibilidad(servicio.id, fecha) : [];
  const inicio = param(req, "inicio");
  const elegido = inicio ? turnos.find((t) => t.inicio.toISOString() === inicio) : undefined;
  const personal = (await obtenerSesion(req)) !== null;

  await mostrar(
    res,
    "reservar/agenda",
    {
      titulo: "Reservar turno",
      layout: "publico",
      servicio,
      dias,
      libresPorDia,
      fecha,
      turnos,
      elegido,
      inicioPedido: inicio,
      // Quien tiene sesión del panel carga turnos sin seña.
      sena: personal ? null : calcularSena(servicio.precioBase),
      medio: medioSena(),
      minutosRetencion: MINUTOS_RETENCION,
      urlPaso: (extra: Record<string, string>) => url("/reservar", { servicio: servicio.slug, ...extra }),
      valores: formulario.valores ?? {},
      errores: formulario.errores ?? {},
      mensaje: formulario.mensaje ?? null,
    },
    estado,
  );
}

rutasReservar.get("/", (req, res) => paginaReservar(req, res));

rutasReservar.post("/", async (req, res) => {
  const personal = (await obtenerSesion(req)) !== null;
  const valores = Object.fromEntries(CAMPOS_RESERVA.map((c) => [c, texto(req.body, c) ?? ""]));
  const fallo = (errores: Errores, mensaje: string | null = "Revisá los datos marcados") =>
    paginaReservar(req, res, { valores, errores, mensaje }, 422);

  let destino: string;
  try {
    const { turno, pagoId } = await reservarTurno(
      {
        servicioId: texto(req.body, "servicioId") ?? "",
        inicio: texto(req.body, "inicio") ?? "",
        cliente: { nombre: valores.nombre, telefono: valores.telefono, email: texto(req.body, "email") },
        vehiculo: texto(req.body, "vehiculo"),
        patente: texto(req.body, "patente"),
        notas: texto(req.body, "notas"),
      },
      { omitirSena: personal, aceptoCondiciones: casilla(req.body, "aceptaCondiciones") },
    );
    // Por transferencia, la página de confirmación le da al cliente los datos y el mensaje de WhatsApp.
    destino =
      pagoId && medioSena() === "mercadopago"
        ? (await iniciarCobro(pagoId)).urlPago
        : url("/reservar/confirmado", { turno: turno.id });
  } catch (e) {
    if (e instanceof ZodError) return fallo(erroresDeZod(e));
    if (e instanceof CondicionesNoAceptadasError)
      return fallo({ aceptaCondiciones: "Tenés que aceptar las condiciones de la seña para reservar" });
    if (e instanceof TurnoNoDisponibleError) return fallo({}, "Ese horario se acaba de ocupar. Volvé atrás y elegí otro, por favor.");
    if (e instanceof CobroNoDisponibleError) return fallo({}, "No pudimos iniciar el pago. Probá de nuevo en unos minutos.");
    throw e;
  }
  res.redirect(303, destino);
});

// --- Buscar y cancelar una reserva --------------------------------------------

const CAMPOS_BUSQUEDA = ["codigo", "nombre", "telefono", "email", "patente", "vehiculo", "servicioId", "fecha"] as const;

async function paginaBuscar(
  res: Response,
  datos: { valores?: Record<string, string>; respuesta?: RespuestaBusqueda; cancelacion?: RespuestaCancelacion; codigo?: string } = {},
  estado = 200,
) {
  const servicios = (await listarServicios()).filter((s) => s.activo);
  await mostrar(
    res,
    "reservar/buscar",
    {
      titulo: "Buscar tu reserva",
      layout: "publico",
      servicios,
      valores: datos.valores ?? {},
      respuesta: datos.respuesta ?? { tipo: "inicial" },
      cancelacion: datos.cancelacion ?? null,
      codigo: datos.codigo ?? null,
    },
    estado,
  );
}

rutasReservar.get("/buscar", (_req, res) => paginaBuscar(res));

/** Pública: busca una reserva con los datos que complete el cliente. Todo se valida en el servidor. */
rutasReservar.post("/buscar", async (req, res) => {
  const valores = Object.fromEntries(CAMPOS_BUSQUEDA.map((c) => [c, texto(req.body, c) ?? ""]));
  let respuesta: RespuestaBusqueda;
  try {
    respuesta = await buscarReservas(Object.fromEntries(CAMPOS_BUSQUEDA.map((c) => [c, texto(req.body, c)])));
  } catch (e) {
    if (e instanceof SinCriteriosError) respuesta = { tipo: "error", mensaje: e.message };
    else if (e instanceof BusquedasExcedidasError)
      respuesta = { tipo: "error", mensaje: "Hay muchas búsquedas en este momento. Probá de nuevo en un minuto." };
    else throw e;
  }
  await paginaBuscar(res, { valores, respuesta });
});

/** Pública: cancela la reserva si el teléfono o el mail coinciden con los de la reserva. */
rutasReservar.post("/cancelar", async (req, res) => {
  const codigo = texto(req.body, "codigo") ?? "";
  const cancelacion = await cancelarReservaCliente(codigo, texto(req.body, "contacto") ?? "");
  await paginaBuscar(res, { cancelacion, codigo });
});

// --- Después de reservar (o al volver de Mercado Pago) ---------------------------

rutasReservar.get("/confirmado", async (req, res, next) => {
  const id = param(req, "turno");
  if (!id) return next();

  // Nada de lo que diga la URL sobre el pago se toma como cierto: se consulta a Mercado Pago.
  if (medioSena() === "mercadopago") await sincronizarPago(id);
  await liberarVencidos();
  const turno = await obtenerTurno(id);
  if (!turno) return next();

  const pago = turno.pagos[0] ?? null;
  const vista = vistaConfirmacion({
    turnoEstado: turno.estado,
    venceEn: turno.venceEn,
    pago: pago ? { estado: pago.estado, requiereDevolucion: pago.requiereDevolucion, devuelto: !!pago.devueltoEn } : null,
    ahora: new Date(),
  });

  const transferencia = leerDatosTransferencia();
  const whatsapp =
    vista.tipo === "esperando_transferencia" && pago && transferencia.whatsapp
      ? enlaceWhatsapp(
          transferencia.whatsapp,
          mensajeSena({
            nombre: turno.cliente.nombre,
            servicio: turno.servicio.nombre,
            dia: formatearFecha(fechaLocal(turno.inicio)),
            hora: formatearHora(turno.inicio),
            codigo: turno.codigo,
            sena: pesos(pago.monto),
          }),
        )
      : null;

  await mostrar(res, "reservar/confirmado", { titulo: "Tu turno", layout: "publico", turno, pago, vista, transferencia, whatsapp });
});
