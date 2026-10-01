"use client";

import { startTransition, useActionState, useRef, useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { Aviso, boton, Campo, input } from "@/components/ui";
import type { RespuestaBusqueda, RespuestaCancelacion } from "@/modules/turnos/busqueda";
import { buscarReservaAccion, cancelarReservaAccion } from "./acciones";

const INICIAL: RespuestaBusqueda = { tipo: "inicial" };

function MensajeCancelacion({ r }: { r: RespuestaCancelacion }) {
  switch (r.tipo) {
    case "cancelada":
      return (
        <Aviso tono="exito">
          Tu reserva fue cancelada.{r.teniaSena ? " La seña no se devuelve." : ""}
        </Aviso>
      );
    case "contacto_incorrecto":
      return <Aviso tono="peligro">Ese dato no coincide con el de la reserva. Revisalo e intentá de nuevo.</Aviso>;
    case "bloqueada":
      return (
        <Aviso tono="peligro">
          Demasiados intentos. Probá de nuevo en {r.minutos} {r.minutos === 1 ? "minuto" : "minutos"}.
        </Aviso>
      );
    default:
      return <Aviso tono="alerta">No encontramos la reserva. Puede que ya esté cancelada.</Aviso>;
  }
}

export function BuscarReserva({ servicios }: { servicios: { id: string; nombre: string }[] }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [respuesta, ejecutar, pendiente] = useActionState(buscarReservaAccion, INICIAL);
  const [confirmando, setConfirmando] = useState(false);
  const [contacto, setContacto] = useState("");
  const [cancelacion, setCancelacion] = useState<RespuestaCancelacion>();
  const [cancelando, setCancelando] = useState(false);

  const buscar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setConfirmando(false);
    setContacto("");
    setCancelacion(undefined);
    startTransition(() => ejecutar(fd));
  };

  const cancelar = async (codigo: string) => {
    setCancelando(true);
    setCancelacion(await cancelarReservaAccion(codigo, contacto));
    setCancelando(false);
  };

  const cancelada = cancelacion?.tipo === "cancelada";

  return (
    <>
      <button type="button" onClick={() => dialogo.current?.showModal()} className={boton.secundario}>
        <Search className="size-4" aria-hidden /> Buscar tu reserva
      </button>

      <dialog
        ref={dialogo}
        aria-labelledby="titulo-buscar"
        className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-tarjeta border border-borde bg-superficie p-0 text-texto backdrop:bg-black/60"
      >
        <div className="max-h-[85vh] space-y-4 overflow-y-auto p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="titulo-buscar" className="font-display text-lg font-bold">Buscar tu reserva</h2>
              <p className="text-sm text-texto-suave">Completá los datos que tengas: alcanza con uno.</p>
            </div>
            <button type="button" onClick={() => dialogo.current?.close()} aria-label="Cerrar" className={`${boton.fantasma} ${boton.chico}`}>
              <X className="size-4" aria-hidden />
            </button>
          </div>

          <form onSubmit={buscar} className="grid gap-3 sm:grid-cols-2" noValidate>
            <Campo etiqueta="Código de reserva" htmlFor="b-codigo">
              <input id="b-codigo" name="codigo" autoComplete="off" placeholder="K7Q2XA" className={`${input} uppercase`} />
            </Campo>
            <Campo etiqueta="Nombre" htmlFor="b-nombre">
              <input id="b-nombre" name="nombre" autoComplete="name" className={input} />
            </Campo>
            <Campo etiqueta="Teléfono" htmlFor="b-telefono">
              <input id="b-telefono" name="telefono" type="tel" autoComplete="tel" className={input} />
            </Campo>
            <Campo etiqueta="Email" htmlFor="b-email">
              <input id="b-email" name="email" type="email" autoComplete="email" className={input} />
            </Campo>
            <Campo etiqueta="Patente" htmlFor="b-patente">
              <input id="b-patente" name="patente" className={`${input} uppercase`} />
            </Campo>
            <Campo etiqueta="Vehículo" htmlFor="b-vehiculo">
              <input id="b-vehiculo" name="vehiculo" className={input} />
            </Campo>
            <Campo etiqueta="Servicio" htmlFor="b-servicio">
              <select id="b-servicio" name="servicioId" defaultValue="" className={input}>
                <option value="">Cualquiera</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </Campo>
            <Campo etiqueta="Día del turno" htmlFor="b-fecha">
              <input id="b-fecha" name="fecha" type="date" className={input} />
            </Campo>
            <div className="sm:col-span-2">
              <button type="submit" disabled={pendiente} className={`${boton.primario} w-full`}>
                {pendiente ? "Buscando…" : "Buscar"}
              </button>
            </div>
          </form>

          {respuesta.tipo === "error" && <Aviso tono="peligro">{respuesta.mensaje}</Aviso>}
          {respuesta.tipo === "ninguna" && <Aviso tono="alerta">No encontramos tu reserva. Revisá los datos o probá con otro.</Aviso>}
          {respuesta.tipo === "varias" && (
            <Aviso tono="alerta">Encontramos más de una reserva con esos datos. Agregá más datos para encontrar la tuya.</Aviso>
          )}

          {respuesta.tipo === "una" && (
            <div className="space-y-4 rounded-lg border border-borde p-4">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2">
                  <dt className="text-xs text-texto-suave">Servicio</dt>
                  <dd className="font-semibold">{respuesta.reserva.servicio}</dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">Día</dt>
                  <dd className="font-semibold">{respuesta.reserva.dia}</dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">Hora</dt>
                  <dd className="font-semibold">{respuesta.reserva.hora} hs</dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">Estado</dt>
                  <dd className="font-semibold">
                    {respuesta.reserva.estado}
                    {respuesta.reserva.senaPagada ? " · seña pagada" : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">Código</dt>
                  <dd className="font-mono font-bold tracking-widest">{respuesta.reserva.codigo}</dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">A nombre de</dt>
                  <dd>{respuesta.reserva.nombre}</dd>
                </div>
                {respuesta.reserva.patente && (
                  <div>
                    <dt className="text-xs text-texto-suave">Patente</dt>
                    <dd>{respuesta.reserva.patente}</dd>
                  </div>
                )}
              </dl>

              {cancelacion && <MensajeCancelacion r={cancelacion} />}

              {!cancelada && !confirmando && (
                <button type="button" onClick={() => setConfirmando(true)} className={boton.peligro}>
                  Cancelar mi reserva
                </button>
              )}

              {!cancelada && confirmando && (
                <div className="space-y-3">
                  {respuesta.reserva.senaPagada && (
                    <Aviso tono="alerta">Esta reserva tiene una seña pagada. Si la cancelás, la seña no se devuelve.</Aviso>
                  )}
                  <Campo etiqueta="Para confirmar, escribí el teléfono o el mail con el que reservaste" htmlFor="b-contacto">
                    <input id="b-contacto" value={contacto} onChange={(e) => setContacto(e.target.value)} autoComplete="off" className={input} />
                  </Campo>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={cancelando || contacto.trim() === ""}
                      onClick={() => cancelar(respuesta.reserva.codigo)}
                      className={boton.peligro}
                    >
                      {cancelando ? "Cancelando…" : "Sí, cancelar mi reserva"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmando(false);
                        setCancelacion(undefined);
                      }}
                      className={boton.fantasma}
                    >
                      No
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
