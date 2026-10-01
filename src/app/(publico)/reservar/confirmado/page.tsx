import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Aviso, boton, tarjeta } from "@/components/ui";
import { pesos } from "@/lib/formato";
import { fechaLocal, formatearFecha, formatearHora } from "@/lib/tiempo";
import { sincronizarPago } from "@/modules/pagos/pagos.service";
import { obtenerTurno } from "@/modules/turnos/turno.service";

export const metadata = { title: "Tu turno" };

export default async function PaginaConfirmado({ searchParams }: { searchParams: Promise<{ turno?: string }> }) {
  const { turno: id } = await searchParams;
  if (!id) notFound();

  // Nada de lo que diga la URL sobre el pago se toma como cierto: se consulta a Mercado Pago.
  await sincronizarPago(id);
  const turno = await obtenerTurno(id);
  if (!turno) notFound();

  const pago = turno.pagos[0];
  const vigente = turno.estado === "ESPERANDO_PAGO" && !!turno.venceEn && turno.venceEn > new Date();
  const sinTurno = !!pago?.requiereDevolucion;
  const cancelado = turno.estado === "CANCELADO";

  const Icono = vigente ? Clock : sinTurno || cancelado ? XCircle : CheckCircle2;
  const claseIcono = vigente ? "text-alerta" : sinTurno || cancelado ? "text-peligro" : "text-exito";
  const nombre = turno.cliente.nombre.split(" ")[0];
  const titulo = vigente ? "Estamos esperando tu pago" : sinTurno ? "Recibimos tu pago, pero…" : cancelado ? "No se completó el pago" : `¡Listo, ${nombre}!`;
  const confirmado = turno.estado === "CONFIRMADO" || turno.estado === "EN_CURSO" || turno.estado === "COMPLETADO";

  return (
    <div className={`${tarjeta} space-y-5 p-6 text-center`}>
      <Icono className={`mx-auto size-14 ${claseIcono}`} aria-hidden />
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-extrabold">{titulo}</h1>
        {vigente && <p className="text-texto-suave">Cuando Mercado Pago nos avise, tu turno queda confirmado.</p>}
        {!vigente && !sinTurno && !cancelado && (
          <p className="text-texto-suave">{confirmado ? `Tu turno quedó confirmado${pago ? ` con la seña de ${pesos(pago.monto)}` : ""}.` : "Tu turno quedó reservado."}</p>
        )}
      </div>

      {sinTurno && (
        <Aviso tono="alerta">
          El horario ya no estaba disponible, así que el turno no se pudo confirmar. Comunicate con el local para que te devuelvan la seña.
        </Aviso>
      )}
      {cancelado && !sinTurno && (
        <Aviso tono="alerta">El pago no se completó y el horario se liberó. Podés sacar un turno nuevo.</Aviso>
      )}

      {!cancelado && !sinTurno && (
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
        </dl>
      )}

      {vigente && (
        <div className="flex flex-wrap justify-center gap-2">
          <Link href={`/reservar/confirmado?turno=${turno.id}`} className={boton.primario}>Ya pagué, actualizar</Link>
          {pago?.mpInitPoint && <a href={pago.mpInitPoint} className={boton.secundario}>Volver a pagar</a>}
        </div>
      )}

      {!vigente && !cancelado && !sinTurno && (
        <p className="text-sm text-texto-suave">Si necesitás cambiarlo o cancelarlo, comunicate con el local. La seña no se devuelve.</p>
      )}
      {!vigente && <Link href="/reservar" className={boton.secundario}>Sacar otro turno</Link>}
    </div>
  );
}
