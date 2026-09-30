"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ArrowDown, ArrowUp, Pencil } from "lucide-react";
import { boton } from "@/components/ui";
import { moverCampoAccion } from "./acciones";

export function AccionesFila({ clave }: { clave: string }) {
  const [pendiente, iniciar] = useTransition();
  const mover = (direccion: "ARRIBA" | "ABAJO") =>
    iniciar(async () => {
      await moverCampoAccion(clave, direccion);
    });

  return (
    <div className="flex justify-end gap-1">
      <button type="button" disabled={pendiente} onClick={() => mover("ARRIBA")} aria-label="Subir" className={`${boton.fantasma} ${boton.chico}`}>
        <ArrowUp className="size-3.5" aria-hidden />
      </button>
      <button type="button" disabled={pendiente} onClick={() => mover("ABAJO")} aria-label="Bajar" className={`${boton.fantasma} ${boton.chico}`}>
        <ArrowDown className="size-3.5" aria-hidden />
      </button>
      <Link href={`/administracion/stock/campos/${clave}`} className={`${boton.secundario} ${boton.chico}`}>
        <Pencil className="size-3.5" aria-hidden /> Editar
      </Link>
    </div>
  );
}
