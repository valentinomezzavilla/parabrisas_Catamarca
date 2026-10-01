import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Aviso, boton, tarjeta } from "@/components/ui";
import { pesos } from "@/lib/formato";
import { fechaLocal, formatearFecha, formatearHora } from "@/lib/tiempo";
import { liberarVencidos, sincronizarPago } from "@/modules/pagos/pagos.service";
import { vistaConfirmacion } from "@/modules/pagos/vista";
import { obtenerTurno } from "@/modules/turnos/turno.service";

export const metadata = { title: "Tu turno" };

export default async function PaginaConfirmado({ searchParams }: { searchParams: Promise<{ turno?: string }> }) {
  const { turno: id } = await searchParams;
  if (!id) notFound();

  // Nada de lo que diga la URL sobre el pago se toma como cierto: se consulta a Mercado Pago.
  await sincronizarPago(id);
  await liberarVencidos();
  const turno = await obtenerTurno(id);
  if (!turno) notFound();

  const pago = turno.pagos[0];
  const vista = vistaConfirmacion({
    turnoEstado: turno.estado,
    venceEn: turno.venceEn,
    pago: pago ? { requiereDevolucion: pago.requiereDevolucion, devuelto: !!pago.devueltoEn } : null,
    ahora: new Date(),
  });

  const Icono = vista.tipo === "esperando" ? Clock : vista.tipo === "sin_turno" || vista.tipo === "no_completado" ? XCircle : CheckCircle2;
  const claseIcono = vista.tipo === "esperando" ? "text-alerta" : vista.tipo === "sin_turno" || vista.tipo === "no_completado" ? "text-peligro" : "text-exito";
  const nombre = turno.cliente.nombre.split(" ")[0];
  const titulo = {
    esperando: "Estamos esperando tu pago",
    sin_turno: "Recibimos tu pago, pero…",
    no_completado: "No se completó el pago",
    confirmado: `¡Listo, ${nombre}!`,
    reservado: `¡Listo, ${nombre}!`,
  }[vista.tipo];
  const hayTurno = vista.tipo === "esperando" || vista.tipo === "confirmado" || vista.tipo === "reservado";

  return (
    <div className={`${tarjeta} space-y-5 p-6 text-center`}>
      <Icono className={`mx-auto size-14 ${claseIcono}`} aria-hidden />
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-extrabold">{titulo}</h1>
        {vista.tipo === "esperando" && <p className="text-texto-suave">Cuando Mercado Pago nos avise, tu turno queda confirmado.</p>}
        {vista.tipo === "confirmado" && (
          <p className="text-texto-suave">Tu turno quedó confirmado{pago ? ` con la seña de ${pesos(pago.monto)}` : ""}.</p>
        )}
        {vista.tipo === "reservado" && <p className="text-texto-suave">Tu turno quedó reservado.</p>}
      </div>

      {vista.tipo === "sin_turno" && (
        <Aviso tono="alerta">
          {vista.devuelto
            ? "No pudimos confirmar tu turno, pero ya te devolvimos la seña."
            : "No pudimos confirmar tu turno (el horario ya no estaba disponible o el monto no coincidía). Comunicate con el local para que te devuelvan la seña."}
        </Aviso>
      )}
      {vista.tipo === "no_completado" && (
        <Aviso tono="alerta">El pago no se completó y el horario se liberó. Podés sacar un turno nuevo.</Aviso>
      )}
      {vista.tipo === "confirmado" && vista.pagoDeMas && (
        <Aviso tono="alerta">Detectamos un pago de más. Comunicate con el local para que te lo devuelvan.</Aviso>
      )}

      {hayTurno && (
        <dl className="mx-auto grid max-w-sm grid-cols-2 gap-4 rounded-lg bg-marca/15 p-4 text-left text-sm">
          <div className="col-span-2">
            <dt className="text-xs text-texto-suave">Servicio</dt>
            <dd className="font-semibold">{turno.servicio.nombre}</dd>
          </div>
          <div>
            <dt className="text-xs text-texto-suave">Día</dt>
            <dd className="font-semibold">{formatearFecha(fechaLocal(turno.inicio))}</dd>
          </div>
          <div>
            <dt className="text-xs text-texto-suave">Hora</dt>
            <dd className="font-semibold">{formatearHora(turno.inicio)} hs</dd>
          </div>
          <div className="col-span-2 border-t border-borde pt-3">
            <dt className="text-xs text-texto-suave">Código de reserva</dt>
            <dd className="font-mono text-lg font-bold tracking-widest">{turno.codigo}</dd>
            <p className="mt-1 text-xs text-texto-suave">Guardalo: lo necesitás para buscar o cancelar tu reserva.</p>
          </div>
        </dl>
      )}

      {vista.tipo === "esperando" && (
        <div className="flex flex-wrap justify-center gap-2">
          <Link href={`/reservar/confirmado?turno=${turno.id}`} className={boton.primario}>Ya pagué, actualizar</Link>
          {pago?.mpInitPoint && <a href={pago.mpInitPoint} className={boton.secundario}>Volver a pagar</a>}
        </div>
      )}

      {(vista.tipo === "confirmado" || vista.tipo === "reservado") && (
        <p className="text-sm text-texto-suave">Si necesitás cambiarlo o cancelarlo, comunicate con el local. La seña no se devuelve.</p>
      )}
      {vista.tipo !== "esperando" && <Link href="/reservar" className={boton.secundario}>Sacar otro turno</Link>}
    </div>
  );
}
