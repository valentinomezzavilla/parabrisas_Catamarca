"use client";

import { useState, useTransition } from "react";
import { boton } from "@/components/ui";
import type { EstadoFormulario } from "@/lib/formularios";
import type { Rol } from "@/modules/usuarios/reglas";
import { alternarActivoAccion, cambiarRolAccion } from "./acciones";
import { FormularioPassword } from "./FormularioPassword";

export function AccionesUsuario({ id, rol, activo, esYo }: { id: string; rol: Rol; activo: boolean; esYo: boolean }) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string>();
  const [verPassword, setVerPassword] = useState(false);

  const ejecutar = (accion: () => Promise<EstadoFormulario>) =>
    iniciar(async () => {
      setError(undefined);
      const r = await accion();
      if (!r.ok) setError(r.mensaje);
    });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {!esYo && (
          <>
            <button
              type="button"
              disabled={pendiente}
              onClick={() => ejecutar(() => cambiarRolAccion(id, rol === "ADMIN" ? "EMPLEADO" : "ADMIN"))}
              className={`${boton.secundario} ${boton.chico}`}
            >
              {rol === "ADMIN" ? "Pasar a Empleado" : "Pasar a Admin"}
            </button>
            <button
              type="button"
              disabled={pendiente}
              onClick={() => ejecutar(() => alternarActivoAccion(id, !activo))}
              className={`${boton.fantasma} ${boton.chico}`}
            >
              {activo ? "Desactivar" : "Activar"}
            </button>
          </>
        )}
        <button type="button" onClick={() => setVerPassword((v) => !v)} className={`${boton.fantasma} ${boton.chico}`}>
          Nueva contraseña
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-peligro">
          {error}
        </p>
      )}
      {verPassword && <FormularioPassword id={id} />}
    </div>
  );
}
