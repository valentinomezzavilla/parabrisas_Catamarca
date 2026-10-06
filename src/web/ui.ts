import type { EstadoTurno } from "@/generated/prisma/client";

// Clases compartidas de la interfaz (Tailwind). Las vistas las usan como `ui.boton.primario`.
// Áreas táctiles: 44 px de alto en celular y 40 px desde `sm`; `boton.chico` es el tamaño compacto.

const baseBoton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10";

export const boton = {
  primario: `${baseBoton} bg-linear-to-b from-amarillo-300 to-marca text-sobre-marca shadow-marca hover:-translate-y-px hover:from-amarillo-200 hover:to-amarillo-300 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_1px_0_rgb(0_0_0/0.14),0_10px_22px_-6px_rgb(253_221_61/0.75)]`,
  secundario: `${baseBoton} border border-borde bg-superficie shadow-tarjeta hover:-translate-y-px hover:border-grafito-400 hover:shadow-elevada`,
  peligro: `${baseBoton} bg-peligro text-white shadow-tarjeta hover:bg-peligro/90 hover:shadow-[0_8px_18px_-6px_rgb(214_69_69/0.6)]`,
  fantasma: `${baseBoton} text-texto-suave hover:bg-grafito-500/10 hover:text-texto`,
  chico: "px-2.5 py-1 text-xs min-h-9! sm:min-h-0!",
};

export type VarianteBoton = Exclude<keyof typeof boton, "chico">;

export const input =
  "w-full min-h-11 rounded-lg border border-borde bg-superficie px-3 py-2 text-base shadow-tarjeta transition-[border-color,box-shadow] duration-200 placeholder:text-grafito-400 hover:border-grafito-400 focus:border-amarillo-500 focus:outline-none focus:ring-2 focus:ring-amarillo-500/30 aria-invalid:border-peligro sm:min-h-10 sm:text-sm";

export const tarjeta =
  "rounded-tarjeta border border-borde bg-superficie shadow-tarjeta dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]";

/** Tarjeta que es un enlace: se eleva y se tiñe de amarillo al pasar el mouse o enfocarla. */
export const tarjetaEnlace = `${tarjeta} transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-amarillo-500/70 hover:shadow-elevada focus-visible:-translate-y-0.5 focus-visible:shadow-elevada`;

export const casilla = "size-4 accent-amarillo-500";

export type Tono = "neutro" | "marca" | "exito" | "alerta" | "peligro";

/** Insignias: etiquetas cortas de estado. */
export const insignia: Record<Tono, string> = {
  neutro: "bg-grafito-500/15 text-texto-suave ring-1 ring-inset ring-grafito-500/20",
  marca: "bg-marca text-sobre-marca ring-1 ring-inset ring-amarillo-600/30",
  exito: "bg-exito/15 text-exito ring-1 ring-inset ring-exito/25",
  alerta: "bg-alerta/15 text-alerta ring-1 ring-inset ring-alerta/25",
  peligro: "bg-peligro/15 text-peligro ring-1 ring-inset ring-peligro/25",
};

/** Cuadrito tintado detrás de un icono: firma visual de tarjetas y estados vacíos. */
export const chip: Record<Tono, string> = {
  marca: "bg-marca/20 text-acento ring-1 ring-inset ring-marca/40",
  alerta: "bg-alerta/15 text-alerta ring-1 ring-inset ring-alerta/25",
  peligro: "bg-peligro/15 text-peligro ring-1 ring-inset ring-peligro/25",
  exito: "bg-exito/15 text-exito ring-1 ring-inset ring-exito/25",
  neutro: "bg-grafito-500/15 text-texto-suave ring-1 ring-inset ring-grafito-500/20",
};

export const aviso: Record<"exito" | "alerta" | "peligro", string> = {
  exito: "border-exito/40 bg-exito/10",
  alerta: "border-alerta/40 bg-alerta/10",
  peligro: "border-peligro/40 bg-peligro/10",
};

/** Tarjeta de resumen: color de la franja superior y del número. */
export const estadistica = {
  franja: { marca: "bg-marca", alerta: "bg-alerta", peligro: "bg-peligro", exito: "bg-exito" },
  numero: { marca: "", alerta: "text-alerta", peligro: "text-peligro", exito: "text-exito" },
};

export const ESTADOS_TURNO: Record<EstadoTurno, { etiqueta: string; tono: Tono }> = {
  ESPERANDO_PAGO: { etiqueta: "Esperando pago", tono: "alerta" },
  PENDIENTE: { etiqueta: "Pendiente", tono: "alerta" },
  CONFIRMADO: { etiqueta: "Confirmado", tono: "marca" },
  EN_CURSO: { etiqueta: "En curso", tono: "neutro" },
  COMPLETADO: { etiqueta: "Completado", tono: "exito" },
  CANCELADO: { etiqueta: "Cancelado", tono: "peligro" },
  AUSENTE: { etiqueta: "No vino", tono: "neutro" },
};

export const ui = { boton, input, tarjeta, tarjetaEnlace, casilla, insignia, chip, aviso, estadistica };
