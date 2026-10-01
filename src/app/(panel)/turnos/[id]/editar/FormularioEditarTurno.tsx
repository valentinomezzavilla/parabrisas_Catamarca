"use client";

import Link from "next/link";
import { Aviso, boton, Campo, input, tarjeta } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import { editarTurnoAccion } from "../../acciones";

export interface DatosEditables {
  nombre: string;
  telefono: string;
  email: string;
  vehiculo: string;
  patente: string;
  notas: string;
  precio: string;
  cristalId: string;
}

export function FormularioEditarTurno({
  id,
  servicioId,
  inicio,
  datos,
  cristales,
  mostrarCristal,
  sena,
  volver,
}: {
  id: string;
  servicioId: string;
  inicio: string;
  datos: DatosEditables;
  cristales: { id: string; etiqueta: string }[];
  mostrarCristal: boolean;
  /** Seña pagada ya formateada ("$ 10.000"), o null si no hay. */
  sena: string | null;
  volver: string;
}) {
  const { estado, enviar, pendiente, error } = useFormularioAccion(editarTurnoAccion.bind(null, id));

  return (
    <form onSubmit={enviar} className={`${tarjeta} space-y-5 p-5`} noValidate>
      {estado.mensaje && !estado.ok && <Aviso tono="peligro">{estado.mensaje}</Aviso>}
      {sena && <Aviso tono="alerta">Este turno tiene una seña de {sena} pagada. La seña no cambia aunque modifiques el servicio.</Aviso>}
      <input type="hidden" name="servicioId" value={servicioId} />
      <input type="hidden" name="inicio" value={inicio} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nombre y apellido" htmlFor="nombre" error={error("cliente.nombre")}>
          <input id="nombre" name="nombre" defaultValue={datos.nombre} className={input} aria-invalid={!!error("cliente.nombre")} />
        </Campo>
        <Campo etiqueta="Teléfono / WhatsApp" htmlFor="telefono" error={error("cliente.telefono")} ayuda="Si lo cambiás, el turno pasa al cliente de ese teléfono">
          <input id="telefono" name="telefono" type="tel" defaultValue={datos.telefono} className={input} aria-invalid={!!error("cliente.telefono")} />
        </Campo>
        <Campo etiqueta="Email (opcional)" htmlFor="email" error={error("cliente.email")}>
          <input id="email" name="email" type="email" defaultValue={datos.email} className={input} />
        </Campo>
        <Campo etiqueta="Vehículo" htmlFor="vehiculo" error={error("vehiculo")}>
          <input id="vehiculo" name="vehiculo" defaultValue={datos.vehiculo} className={input} />
        </Campo>
        <Campo etiqueta="Patente (opcional)" htmlFor="patente" error={error("patente")}>
          <input id="patente" name="patente" defaultValue={datos.patente} className={`${input} uppercase`} />
        </Campo>
        <Campo etiqueta="Precio (opcional)" htmlFor="precio" error={error("precio")}>
          <input id="precio" name="precio" type="number" min={0} step="0.01" defaultValue={datos.precio} className={input} />
        </Campo>
        {mostrarCristal && (
          <Campo etiqueta="Cristal a colocar" htmlFor="cristalId" error={error("cristalId")} className="sm:col-span-2">
            <select id="cristalId" name="cristalId" defaultValue={datos.cristalId} className={input}>
              <option value="">Sin cristal asignado</option>
              {cristales.map((c) => (
                <option key={c.id} value={c.id}>{c.etiqueta}</option>
              ))}
            </select>
          </Campo>
        )}
        <Campo etiqueta="Notas" htmlFor="notas" error={error("notas")} className="sm:col-span-2">
          <textarea id="notas" name="notas" rows={3} defaultValue={datos.notas} className={input} />
        </Campo>
      </div>

      <div className="flex justify-end gap-2">
        <Link href={volver} className={boton.secundario}>Cancelar</Link>
        <button type="submit" disabled={pendiente} className={boton.primario}>{pendiente ? "Guardando…" : "Guardar cambios"}</button>
      </div>
    </form>
  );
}
