"use client";

import { Aviso, boton, Campo, input } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import { reservar } from "./acciones";

export function FormularioReserva({ servicioId, inicio }: { servicioId: string; inicio: string }) {
  const { estado, enviar, pendiente, error } = useFormularioAccion(reservar);

  return (
    <form onSubmit={enviar} className="space-y-5" noValidate>
      {estado.mensaje && !estado.ok && <Aviso tono="peligro">{estado.mensaje}</Aviso>}
      <input type="hidden" name="servicioId" value={servicioId} />
      <input type="hidden" name="inicio" value={inicio} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nombre y apellido" htmlFor="nombre" error={error("cliente.nombre")}>
          <input id="nombre" name="nombre" autoComplete="name" className={input} aria-invalid={!!error("cliente.nombre")} />
        </Campo>
        <Campo etiqueta="Teléfono / WhatsApp" htmlFor="telefono" error={error("cliente.telefono")} ayuda="Te escribimos si hay algún cambio">
          <input id="telefono" name="telefono" type="tel" autoComplete="tel" placeholder="383 4123456" className={input} aria-invalid={!!error("cliente.telefono")} />
        </Campo>
        <Campo etiqueta="Email (opcional)" htmlFor="email" error={error("cliente.email")}>
          <input id="email" name="email" type="email" autoComplete="email" className={input} />
        </Campo>
        <Campo etiqueta="Vehículo" htmlFor="vehiculo" error={error("vehiculo")}>
          <input id="vehiculo" name="vehiculo" placeholder="Toyota Hilux 2019" className={input} />
        </Campo>
        <Campo etiqueta="Patente (opcional)" htmlFor="patente" error={error("patente")}>
          <input id="patente" name="patente" placeholder="AB123CD" className={`${input} uppercase`} />
        </Campo>
        <Campo etiqueta="Comentarios (opcional)" htmlFor="notas" error={error("notas")} className="sm:col-span-2">
          <textarea id="notas" name="notas" rows={2} placeholder="Ej.: el parabrisas tiene sensor de lluvia" className={input} />
        </Campo>
      </div>

      <button type="submit" disabled={pendiente} className={`${boton.primario} w-full py-3 text-base`}>
        {pendiente ? "Reservando…" : "Confirmar turno"}
      </button>
    </form>
  );
}
