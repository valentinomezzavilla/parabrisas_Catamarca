import type { ComponentType, ReactNode } from "react";

// Clases compartidas: se exportan como strings para poder aplicarlas también a <Link>.
// Áreas táctiles: 44 px de alto en celular y 40 px desde `sm`; `boton.chico` es el tamaño compacto.

const baseBoton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10";

export const boton = {
  primario: `${baseBoton} bg-marca text-sobre-marca shadow-marca hover:bg-amarillo-300 hover:shadow-[0_1px_0_rgb(0_0_0/0.14),0_8px_20px_-6px_rgb(253_221_61/0.7)]`,
  secundario: `${baseBoton} border border-borde bg-superficie shadow-tarjeta hover:border-grafito-400`,
  peligro: `${baseBoton} bg-peligro text-white hover:bg-peligro/90`,
  fantasma: `${baseBoton} text-texto-suave hover:bg-grafito-500/10 hover:text-texto`,
  chico: "px-2.5 py-1 text-xs min-h-9! sm:min-h-0!",
};

export const input =
  "w-full min-h-11 rounded-lg border border-borde bg-superficie px-3 py-2 text-base placeholder:text-grafito-400 focus:border-amarillo-500 focus:outline-none focus:ring-2 focus:ring-amarillo-500/30 aria-invalid:border-peligro sm:min-h-10 sm:text-sm";

export const tarjeta =
  "rounded-tarjeta border border-borde bg-superficie shadow-tarjeta dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]";

/** Icono dentro de un cuadrito tintado con el color de la marca: firma visual de tarjetas y estados vacíos. */
export function ChipIcono({
  Icono,
  tono = "marca",
  className = "",
}: {
  Icono: ComponentType<{ className?: string }>;
  tono?: "marca" | "alerta" | "peligro" | "exito" | "neutro";
  className?: string;
}) {
  const tonos = {
    marca: "bg-marca/20 text-acento",
    alerta: "bg-alerta/15 text-alerta",
    peligro: "bg-peligro/15 text-peligro",
    exito: "bg-exito/15 text-exito",
    neutro: "bg-grafito-500/15 text-texto-suave",
  };
  return (
    <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tonos[tono]} ${className}`}>
      <Icono className="size-[1.15rem]" />
    </span>
  );
}

export function EncabezadoPagina({
  seccion,
  titulo,
  descripcion,
  acciones,
}: {
  seccion: string;
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="flex min-w-0 gap-3">
        <span aria-hidden className="mt-1 hidden h-11 w-1 shrink-0 rounded-full bg-marca sm:block" />
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-widest text-acento uppercase sm:text-sm">{seccion}</p>
          <h1 className="font-display text-2xl leading-tight font-extrabold sm:text-3xl">{titulo}</h1>
          {descripcion && <p className="mt-1 text-sm text-texto-suave">{descripcion}</p>}
        </div>
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </header>
  );
}

/** Tarjeta de resumen: franja de color arriba, icono, número grande y etiqueta corta. */
export function Estadistica({
  etiqueta,
  valor,
  Icono,
  tono = "marca",
}: {
  etiqueta: string;
  valor: number | string;
  Icono: ComponentType<{ className?: string }>;
  tono?: "marca" | "alerta" | "peligro" | "exito";
}) {
  const franja = { marca: "bg-marca", alerta: "bg-alerta", peligro: "bg-peligro", exito: "bg-exito" };
  const numero = { marca: "", alerta: "text-alerta", peligro: "text-peligro", exito: "text-exito" };
  return (
    <div className={`${tarjeta} relative overflow-hidden p-3 sm:p-5`}>
      <span aria-hidden className={`absolute inset-x-0 top-0 h-1 ${franja[tono]}`} />
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs leading-snug text-texto-suave sm:text-sm">{etiqueta}</p>
        <ChipIcono Icono={Icono} tono={tono} className="hidden sm:flex" />
      </div>
      <p className={`mt-1 font-display text-3xl font-extrabold tabular-nums sm:mt-3 sm:text-4xl ${numero[tono]}`}>{valor}</p>
    </div>
  );
}

export function Campo({
  etiqueta,
  htmlFor,
  error,
  ayuda,
  className = "",
  children,
}: {
  etiqueta: string;
  htmlFor?: string;
  error?: string;
  ayuda?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {etiqueta}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-peligro">{error}</p>
      ) : (
        ayuda && <p className="text-xs text-texto-suave">{ayuda}</p>
      )}
    </div>
  );
}

const tonos = {
  neutro: "bg-grafito-500/15 text-texto-suave",
  marca: "bg-marca text-sobre-marca",
  exito: "bg-exito/15 text-exito",
  alerta: "bg-alerta/15 text-alerta",
  peligro: "bg-peligro/15 text-peligro",
};

export function Insignia({ tono = "neutro", children }: { tono?: keyof typeof tonos; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${tonos[tono]}`}>
      {children}
    </span>
  );
}

export function Aviso({ tono = "exito", children }: { tono?: "exito" | "alerta" | "peligro"; children: ReactNode }) {
  const estilos = {
    exito: "border-exito/40 bg-exito/10",
    alerta: "border-alerta/40 bg-alerta/10",
    peligro: "border-peligro/40 bg-peligro/10",
  };
  return (
    <div role="status" className={`rounded-lg border px-4 py-3 text-sm ${estilos[tono]}`}>
      {children}
    </div>
  );
}

export function Vacio({ children, Icono }: { children: ReactNode; Icono?: ComponentType<{ className?: string }> }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-tarjeta border border-dashed border-borde p-8 text-center text-sm text-texto-suave">
      {Icono && <ChipIcono Icono={Icono} tono="neutro" />}
      <div>{children}</div>
    </div>
  );
}
