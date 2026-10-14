import { sinTildes } from "@/modules/turnos/busqueda";

// Puro. El modelo de un vehículo compatible se escribe como texto ("Toyota Hilux") y acá se traduce a su id.

interface MarcaConModelos {
  nombre: string;
  modelos: { id: string; nombre: string }[];
}

/** Cómo se muestra y se escribe un modelo en el formulario: marca y modelo. */
export const nombreVehiculo = (marca: string, modelo: string): string => `${marca} ${modelo}`;

/**
 * Id del modelo escrito, sin distinguir mayúsculas, tildes ni espacios de más.
 * Vale "Toyota Hilux" o, si no hay otro modelo con ese nombre, solo "Hilux".
 */
export function buscarModelo(texto: string, marcas: MarcaConModelos[]): string | undefined {
  const buscado = sinTildes(texto);
  if (buscado === "") return undefined;
  const todos = marcas.flatMap((m) => m.modelos.map((mo) => ({ id: mo.id, completo: nombreVehiculo(m.nombre, mo.nombre), solo: mo.nombre })));
  const exacto = todos.find((m) => sinTildes(m.completo) === buscado);
  if (exacto) return exacto.id;
  const porModelo = todos.filter((m) => sinTildes(m.solo) === buscado);
  return porModelo.length === 1 ? porModelo[0].id : undefined;
}
