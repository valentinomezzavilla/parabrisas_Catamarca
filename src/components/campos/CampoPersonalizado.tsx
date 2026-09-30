"use client";

import { Campo, input } from "@/components/ui";
import type { CampoFinal } from "@/modules/campos/combinar";
import { nombreInput, type ValorExtra } from "@/modules/campos/tipos";

/** Control de formulario para un campo propio, según su tipo. El nombre del control es `extra_<clave>`. */
export function CampoPersonalizado({ campo, valor, error }: { campo: CampoFinal; valor?: ValorExtra; error?: string }) {
  const nombre = nombreInput(campo.clave);

  if (campo.tipo === "SI_NO") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name={nombre} defaultChecked={valor === true} className="size-4 accent-amarillo-500" />
        {campo.etiqueta}
        {campo.ayuda && <span className="text-xs text-texto-suave"> · {campo.ayuda}</span>}
      </label>
    );
  }

  const etiqueta = campo.unidad ? `${campo.etiqueta} (${campo.unidad})` : campo.etiqueta;
  const comun = { id: nombre, name: nombre, className: input, "aria-invalid": !!error };
  const texto = typeof valor === "string" ? valor : "";

  return (
    <Campo etiqueta={etiqueta} htmlFor={nombre} error={error} ayuda={campo.ayuda ?? undefined}>
      {campo.tipo === "LISTA" ? (
        <select {...comun} defaultValue={texto}>
          <option value="">—</option>
          {campo.opciones
            .filter((o) => o.activo || o.id === valor)
            .map((o) => (
              <option key={o.id} value={o.id}>
                {o.etiqueta}
                {o.activo ? "" : " (desactivada)"}
              </option>
            ))}
        </select>
      ) : campo.tipo === "TEXTO_LARGO" ? (
        <textarea {...comun} rows={3} defaultValue={texto} />
      ) : (
        <input
          {...comun}
          type={campo.tipo === "NUMERO" ? "number" : campo.tipo === "FECHA" ? "date" : "text"}
          step={campo.tipo === "NUMERO" ? "any" : undefined}
          defaultValue={valor === undefined || typeof valor === "boolean" ? "" : String(valor)}
        />
      )}
    </Campo>
  );
}
