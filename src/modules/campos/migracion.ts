import { claveUnica } from "./clave";
import { crearOpciones, generarIdOpcion, type GeneradorId } from "./opciones";
import type { Extras, OpcionCampo, TipoCampo, ValorExtra } from "./tipos";

// Puro. Convierte las `Caracteristica` de la versión anterior en campos propios y sus valores en `extras`.

export interface CaracteristicaAntigua {
  id: string;
  nombre: string;
  tipoDato: "BOOLEANO" | "TEXTO" | "NUMERO" | "OPCION";
  opciones: string[];
  unidad: string | null;
}

export interface ValorAntiguo {
  cristalId: string;
  caracteristicaId: string;
  valor: string;
}

export interface CampoMigrado {
  idAntiguo: string;
  clave: string;
  etiqueta: string;
  tipo: TipoCampo;
  unidad: string | null;
  opciones: OpcionCampo[];
  orden: number;
}

const TIPO: Record<CaracteristicaAntigua["tipoDato"], TipoCampo> = {
  BOOLEANO: "SI_NO",
  TEXTO: "TEXTO",
  NUMERO: "NUMERO",
  OPCION: "LISTA",
};

function convertirValor(campo: CampoMigrado, texto: string, generarId: GeneradorId): ValorExtra | undefined {
  const limpio = texto.trim();
  switch (campo.tipo) {
    case "SI_NO":
      return limpio === "true" ? true : undefined;
    case "NUMERO": {
      const n = Number(limpio.replace(",", "."));
      return limpio !== "" && Number.isFinite(n) ? n : undefined;
    }
    case "LISTA": {
      if (limpio === "") return undefined;
      let opcion = campo.opciones.find((o) => o.etiqueta === limpio);
      if (!opcion) {
        // El dato no estaba entre las opciones: se conserva como opción inactiva.
        opcion = { id: generarId(), etiqueta: limpio, activo: false };
        campo.opciones.push(opcion);
      }
      return opcion.id;
    }
    default:
      return limpio === "" ? undefined : limpio;
  }
}

export function convertirCaracteristicas(
  caracteristicas: CaracteristicaAntigua[],
  valores: ValorAntiguo[],
  clavesOcupadas: string[],
  generarId: GeneradorId = generarIdOpcion,
): { campos: CampoMigrado[]; extrasPorCristal: Record<string, Extras> } {
  const ocupadas = new Set(clavesOcupadas);
  const ordenadas = [...caracteristicas].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const campos = ordenadas.map((c, i): CampoMigrado => {
    const clave = claveUnica(c.nombre, ocupadas);
    ocupadas.add(clave);
    return {
      idAntiguo: c.id,
      clave,
      etiqueta: c.nombre.trim(),
      tipo: TIPO[c.tipoDato],
      unidad: c.tipoDato === "NUMERO" ? c.unidad : null,
      opciones: c.tipoDato === "OPCION" ? crearOpciones(c.opciones, generarId) : [],
      orden: (i + 1) * 10,
    };
  });

  const porId = new Map(campos.map((c) => [c.idAntiguo, c]));
  const extrasPorCristal: Record<string, Extras> = {};
  for (const v of valores) {
    const campo = porId.get(v.caracteristicaId);
    if (!campo) continue;
    const valor = convertirValor(campo, v.valor, generarId);
    if (valor === undefined) continue;
    (extrasPorCristal[v.cristalId] ??= {})[campo.clave] = valor;
  }
  return { campos, extrasPorCristal };
}
