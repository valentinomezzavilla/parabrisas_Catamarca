"use client";

import { startTransition, useActionState, useState, type FormEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { EstadoFormulario } from "@/lib/formularios";
import { boton } from "./index";

/**
 * Envía el formulario a una Server Action sin el reseteo automático que React
 * aplica a `<form action>`: si la validación falla, el usuario no pierde lo que cargó.
 */
export function useFormularioAccion(accion: (previo: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>) {
  const [estado, ejecutar, pendiente] = useActionState(accion, { ok: false });
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => ejecutar(fd));
  };
  return { estado, enviar, pendiente, error: (campo: string) => estado.errores?.[campo] };
}

/** Botón de envío que se deshabilita mientras la Server Action está en curso. */
export function BotonEnviar({
  children,
  variante = "primario",
  className = "",
}: {
  children: ReactNode;
  variante?: keyof typeof boton;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${boton[variante]} ${className}`}>
      {pending ? "Guardando…" : children}
    </button>
  );
}

/**
 * Acción destructiva en dos pasos, sin diálogos del navegador:
 * primer clic muestra la confirmación, el segundo ejecuta la acción.
 */
export function BotonConfirmar({
  accion,
  children,
  pregunta = "¿Seguro?",
  confirmar = "Sí, confirmar",
  chico = false,
}: {
  accion: () => Promise<void>;
  children: ReactNode;
  pregunta?: string;
  confirmar?: string;
  chico?: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const tamanio = chico ? boton.chico : "";

  if (!abierto) {
    return (
      <button type="button" onClick={() => setAbierto(true)} className={`${boton.fantasma} ${tamanio}`}>
        {children}
      </button>
    );
  }
  return (
    <form action={accion} className="inline-flex items-center gap-2">
      <span className="text-xs text-texto-suave">{pregunta}</span>
      <BotonEnviar variante="peligro" className={tamanio}>
        {confirmar}
      </BotonEnviar>
      <button type="button" onClick={() => setAbierto(false)} className={`${boton.fantasma} ${tamanio}`}>
        No
      </button>
    </form>
  );
}
