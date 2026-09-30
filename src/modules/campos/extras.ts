import { z } from "@/lib/zod";
import { nombreInput, type CampoPropio, type Extras, type ValorExtra } from "./tipos";

// Puro (usa Zod). Valida y da formato a los valores de los campos propios.

export { nombreInput };

const vacioAUndefined = (v: unknown) =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "") ? undefined : v;

const opcional = (esquema: z.ZodType, requerido: boolean) =>
  z.preprocess(vacioAUndefined, requerido ? esquema : esquema.optional());

function fechaValida(s: string) {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(s);
}

function esquemaDe(campo: CampoPropio, valorGuardado: unknown): z.ZodType {
  switch (campo.tipo) {
    case "SI_NO":
      return z.preprocess((v) => v === true || v === "on" || v === "true", z.boolean());
    case "TEXTO":
      return opcional(z.string().trim().max(200), campo.requerido);
    case "TEXTO_LARGO":
      return opcional(z.string().trim().max(2000), campo.requerido);
    case "NUMERO":
      return z.preprocess(
        (v) => {
          const s = vacioAUndefined(v);
          return typeof s === "string" ? Number(s.replace(",", ".")) : s;
        },
        campo.requerido ? z.number() : z.number().optional(),
      );
    case "FECHA":
      return opcional(
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida").refine(fechaValida, "Fecha inválida"),
        campo.requerido,
      );
    case "LISTA": {
      const permitidas = new Set(campo.opciones.filter((o) => o.activo).map((o) => o.id));
      if (typeof valorGuardado === "string") permitidas.add(valorGuardado); // no bloquear registros viejos
      return opcional(z.string().refine((id) => permitidas.has(id), "Elegí una opción válida"), campo.requerido);
    }
  }
}

/**
 * Valida la entrada del formulario (claves `extra_<clave>`) y devuelve los extras resultantes.
 * Solo se validan los campos visibles y no archivados; los ocultos y archivados conservan su valor.
 * `dibujados` (opcional) son las claves que el formulario realmente mostró: un campo que pasó a visible
 * mientras la persona tenía el formulario abierto no viaja en la entrada y no debe pisarse.
 * Los valores de campos que ya no existen se descartan. Lanza `ZodError` con rutas `extra_<clave>`.
 */
export function procesarExtras(
  propios: CampoPropio[],
  entrada: Record<string, unknown>,
  actuales: Extras = {},
  dibujados?: string[],
): Extras {
  const activos = propios.filter((p) => !p.archivado && p.visible && (!dibujados || dibujados.includes(p.clave)));
  const forma: Record<string, z.ZodType> = {};
  for (const p of activos) forma[nombreInput(p.clave)] = esquemaDe(p, actuales[p.clave]);
  // Los campos ausentes (p. ej. una casilla sin tildar) se completan con `undefined` para validarlos igual que los vacíos.
  const completa = Object.fromEntries(activos.map((p) => [nombreInput(p.clave), entrada[nombreInput(p.clave)]]));
  const datos = z.object(forma).parse(completa) as Record<string, unknown>;

  const resultado: Extras = {};
  for (const p of propios) if (actuales[p.clave] !== undefined) resultado[p.clave] = actuales[p.clave];
  for (const p of activos) {
    const valor = datos[nombreInput(p.clave)];
    if (valor === undefined) delete resultado[p.clave];
    else resultado[p.clave] = valor as ValorExtra;
  }
  return resultado;
}

/** Texto para mostrar un valor en la ficha. */
export function formatearValor(
  campo: Pick<CampoPropio, "tipo" | "unidad" | "opciones">,
  valor: ValorExtra | undefined,
): string {
  if (valor === undefined) return "—";
  switch (campo.tipo) {
    case "SI_NO":
      return valor === true ? "Sí" : "No";
    case "LISTA":
      return campo.opciones.find((o) => o.id === valor)?.etiqueta ?? "—";
    case "NUMERO":
      return `${valor}${campo.unidad ? ` ${campo.unidad}` : ""}`;
    case "FECHA": {
      const [a, m, d] = String(valor).split("-");
      return `${d}/${m}/${a}`;
    }
    default:
      return String(valor);
  }
}
