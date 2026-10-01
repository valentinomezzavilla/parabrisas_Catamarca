import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Aviso, boton, EncabezadoPagina, input, tarjeta, Vacio } from "@/components/ui";
import { pesos } from "@/lib/formato";
import { verificarSesion } from "@/lib/sesion";
import { fechaLocal, formatearFecha, formatearHora } from "@/lib/tiempo";
import { puedeEditar } from "@/modules/turnos/edicion";
import { listarServicios, obtenerDisponibilidad } from "@/modules/turnos/servicio.service";
import { cristalesDisponibles, obtenerTurnoParaEditar } from "@/modules/turnos/turno.service";
import { FormularioEditarTurno } from "./FormularioEditarTurno";

export const metadata = { title: "Editar turno" };

export default async function PaginaEditarTurno({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ servicio?: string; fecha?: string; inicio?: string }>;
}) {
  await verificarSesion();
  const { id } = await params;
  const p = await searchParams;
  const turno = await obtenerTurnoParaEditar(id);
  if (!turno) notFound();

  const diaDelTurno = fechaLocal(turno.inicio);
  const volver = `/turnos?fecha=${diaDelTurno}`;

  if (!puedeEditar(turno.estado)) {
    return (
      <>
        <EncabezadoPagina seccion="Agenda" titulo="Editar turno" />
        <Aviso tono="alerta">Este turno ya no se puede editar (está completado, cancelado, ausente o esperando el pago).</Aviso>
        <Link href={volver} className={boton.secundario}>Volver a la agenda</Link>
      </>
    );
  }

  const servicios = (await listarServicios()).filter((s) => s.activo || s.id === turno.servicioId);
  const servicioId = servicios.some((s) => s.id === p.servicio) ? p.servicio! : turno.servicioId;
  const servicio = servicios.find((s) => s.id === servicioId)!;
  const fecha = p.fecha && /^\d{4}-\d{2}-\d{2}$/.test(p.fecha) ? p.fecha : diaDelTurno;

  const mismaAgenda = servicioId === turno.servicioId && fecha === diaDelTurno;
  const libres = await obtenerDisponibilidad(servicioId, fecha, turno.id);
  const actualISO = turno.inicio.toISOString();
  const candidato = p.inicio ?? (mismaAgenda ? actualISO : undefined);
  // Un horario solo vale si está libre; el actual siempre vale mientras no cambie el servicio ni el día.
  const inicio =
    candidato && (libres.some((t) => t.inicio.toISOString() === candidato) || (mismaAgenda && candidato === actualISO))
      ? candidato
      : undefined;

  const cristales = await cristalesDisponibles();
  const opcionesCristal = [
    ...(turno.cristal && !cristales.some((c) => c.id === turno.cristal!.id)
      ? [{ id: turno.cristal.id, etiqueta: `${turno.cristal.codigo} · sin stock` }]
      : []),
    ...cristales.map((c) => ({ id: c.id, etiqueta: `${c.codigo} · ${c.descripcion} (${c.cantidad})` })),
  ];
  const sena = turno.pagos[0] ? pesos(turno.pagos[0].monto) : null;

  return (
    <>
      <Link href={volver} className={`${boton.fantasma} ${boton.chico} -ml-2.5`}>
        <ArrowLeft className="size-3.5" aria-hidden /> Agenda
      </Link>
      <EncabezadoPagina seccion="Agenda" titulo="Editar turno" descripcion={`Código ${turno.codigo} · ${turno.cliente.nombre}`} />

      <section className={`${tarjeta} space-y-4 p-5`}>
        <h2 className="font-display font-bold">Día y horario</h2>
        <p className="text-sm text-texto-suave">
          Ahora: {turno.servicio.nombre}, {formatearFecha(diaDelTurno)} a las {formatearHora(turno.inicio)} hs.
        </p>
        {/* Formulario GET: no lleva datos personales, solo el servicio y el día. */}
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <label htmlFor="servicio" className="block text-sm font-medium">Servicio</label>
            <select id="servicio" name="servicio" defaultValue={servicioId} className={input}>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="fecha" className="block text-sm font-medium">Día</label>
            <input id="fecha" name="fecha" type="date" defaultValue={fecha} className={input} />
          </div>
          <button type="submit" className={boton.secundario}>Ver horarios</button>
        </form>

        {libres.length === 0 ? (
          <Vacio>No quedan horarios libres ese día para {servicio.nombre}.</Vacio>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {libres.map((t) => {
              const iso = t.inicio.toISOString();
              const actual = iso === inicio;
              return (
                <Link
                  key={iso}
                  href={`/turnos/${turno.id}/editar?servicio=${servicioId}&fecha=${fecha}&inicio=${encodeURIComponent(iso)}`}
                  className={`rounded-lg border py-2 text-center font-semibold tabular-nums transition-colors ${
                    actual ? "border-marca bg-marca text-sobre-marca" : "border-borde bg-superficie hover:border-marca"
                  }`}
                >
                  {formatearHora(t.inicio)}
                </Link>
              );
            })}
          </div>
        )}
        {p.inicio && !inicio && <p className="text-sm text-peligro">Ese horario ya no está disponible. Elegí otro.</p>}
      </section>

      {inicio ? (
        <FormularioEditarTurno
          key={`${servicioId}-${inicio}`}
          id={turno.id}
          servicioId={servicioId}
          inicio={inicio}
          datos={{
            nombre: turno.cliente.nombre,
            telefono: turno.cliente.telefono,
            email: turno.cliente.email ?? "",
            vehiculo: turno.vehiculo ?? "",
            patente: turno.patente ?? "",
            notas: turno.notas ?? "",
            precio: turno.precio === null ? "" : String(turno.precio),
            cristalId: turno.cristalId ?? "",
          }}
          cristales={opcionesCristal}
          mostrarCristal={servicio.requiereCristal || !!turno.cristalId}
          sena={sena}
          volver={volver}
        />
      ) : (
        <Vacio>Elegí un horario para poder guardar los cambios.</Vacio>
      )}
    </>
  );
}
