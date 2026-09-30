"use client";

import { useEffect, useRef, useState } from "react";
import { Aviso, boton, Campo, input } from "@/components/ui";
import { useFormularioAccion } from "@/components/ui/cliente";
import { guardarMovimiento } from "../acciones";

const AYUDA = {
  INGRESO: "Compra a proveedor o devolución.",
  EGRESO: "Venta o colocación.",
  AJUSTE: "Corrección por conteo: usá un número negativo para restar (ej. -1 por rotura).",
};

export function FormularioMovimiento({ cristalId }: { cristalId: string }) {
  const { estado, enviar, pendiente, error } = useFormularioAccion(guardarMovimiento.bind(null, cristalId));
  const [tipo, setTipo] = useState<keyof typeof AYUDA>("INGRESO");
  const formulario = useRef<HTMLFormElement>(null);

  // Tras registrar un movimiento se limpia el formulario para cargar el siguiente.
  useEffect(() => {
    if (estado.ok) formulario.current?.reset();
  }, [estado]);

  return (
    <form ref={formulario} onSubmit={enviar} className="space-y-4" noValidate>
      {estado.mensaje && <Aviso tono={estado.ok ? "exito" : "peligro"}>{estado.mensaje}</Aviso>}
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_2fr]">
        <Campo etiqueta="Tipo" htmlFor="tipo">
          <select id="tipo" name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value as keyof typeof AYUDA)} className={input}>
            <option value="INGRESO">Ingreso</option>
            <option value="EGRESO">Egreso</option>
            <option value="AJUSTE">Ajuste</option>
          </select>
        </Campo>
        <Campo etiqueta="Cantidad" htmlFor="cantidad" error={error("cantidad")}>
          <input id="cantidad" name="cantidad" type="number" step={1} min={tipo === "AJUSTE" ? undefined : 1} className={input} aria-invalid={!!error("cantidad")} />
        </Campo>
        <Campo etiqueta="Motivo (opcional)" htmlFor="motivo" error={error("motivo")}>
          <input id="motivo" name="motivo" placeholder="Remito 0001-2345, venta mostrador…" className={input} />
        </Campo>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-texto-suave">{AYUDA[tipo]}</p>
        <button type="submit" disabled={pendiente} className={boton.primario}>
          {pendiente ? "Registrando…" : "Registrar movimiento"}
        </button>
      </div>
    </form>
  );
}
