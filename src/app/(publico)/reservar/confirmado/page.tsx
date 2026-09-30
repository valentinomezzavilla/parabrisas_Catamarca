import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { boton, tarjeta } from "@/components/ui";
import { fechaLocal, formatearFecha, formatearHora } from "@/lib/tiempo";
import { obtenerTurno } from "@/modules/turnos/turno.service";

export const metadata = { title: "Turno reservado" };

export default async function PaginaConfirmado({ searchParams }: { searchParams: Promise<{ turno?: string }> }) {
  const { turno: id } = await searchParams;
  const turno = id ? await obtenerTurno(id) : null;
  if (!turno) notFound();

  return (
    <div className={`${tarjeta} space-y-5 p-6 text-center`}>
      <CheckCircle2 className="mx-auto size-14 text-exito" aria-hidden />
      <div>
        <h1 className="font-display text-2xl font-extrabold">¡Listo, {turno.cliente.nombre.split(" ")[0]}!</h1>
        <p className="text-texto-suave">Tu turno quedó reservado.</p>
      </div>
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
      <p className="text-sm text-texto-suave">Si necesitás cambiarlo o cancelarlo, comunicate con el local.</p>
      <Link href="/reservar" className={boton.secundario}>Sacar otro turno</Link>
    </div>
  );
}
