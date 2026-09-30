import type { ReactNode } from "react";

// Clases compartidas: se exportan como strings para poder aplicarlas también a <Link>.

const baseBoton =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const boton = {
  primario: `${baseBoton} bg-marca text-sobre-marca hover:bg-amarillo-500`,
  secundario: `${baseBoton} border border-borde bg-superficie hover:border-grafito-400`,
  peligro: `${baseBoton} bg-peligro text-white hover:bg-peligro/90`,
  fantasma: `${baseBoton} text-texto-suave hover:bg-grafito-500/10 hover:text-texto`,
  chico: "px-2.5 py-1 text-xs",
};

export const input =
  "w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-sm placeholder:text-grafito-400 focus:border-amarillo-500 focus:outline-none aria-invalid:border-peligro";

export const tarjeta = "rounded-tarjeta border border-borde bg-superficie";

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
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold tracking-widest text-acento uppercase">{seccion}</p>
        <h1 className="font-display text-3xl font-extrabold">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-texto-suave">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </header>
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

export function Vacio({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-tarjeta border border-dashed border-borde p-8 text-center text-sm text-texto-suave">
      {children}
    </div>
  );
}
