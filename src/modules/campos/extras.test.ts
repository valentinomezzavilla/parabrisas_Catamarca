import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { formatearValor, nombreInput, procesarExtras } from "./extras";
import type { CampoPropio } from "./tipos";

const campo = (cambios: Partial<CampoPropio>): CampoPropio => ({
  id: "id",
  entidad: "CRISTAL",
  clave: "c",
  etiqueta: "C",
  ayuda: null,
  tipo: "TEXTO",
  requerido: false,
  unidad: null,
  opciones: [],
  orden: 10,
  visible: true,
  archivado: false,
  ...cambios,
});

const lista = campo({
  clave: "tono",
  tipo: "LISTA",
  opciones: [
    { id: "o1", etiqueta: "Verde", activo: true },
    { id: "o2", etiqueta: "Gris", activo: false },
  ],
});

const errores = (fn: () => unknown): Record<string, string> => {
  try {
    fn();
  } catch (e) {
    if (e instanceof ZodError) return Object.fromEntries(e.issues.map((i) => [i.path.join("."), i.message]));
    throw e;
  }
  return {};
};

describe("procesarExtras: tipos", () => {
  it("texto: recorta y descarta el vacío", () => {
    const t = campo({ clave: "nota", tipo: "TEXTO" });
    expect(procesarExtras([t], { [nombreInput("nota")]: "  hola  " })).toEqual({ nota: "hola" });
    expect(procesarExtras([t], { [nombreInput("nota")]: "   " })).toEqual({});
    expect(procesarExtras([t], {})).toEqual({}); // ausente = vacío
  });

  it("texto: rechaza más de 200 caracteres; texto largo admite hasta 2000", () => {
    const corto = campo({ clave: "t", tipo: "TEXTO" });
    const largo = campo({ clave: "l", tipo: "TEXTO_LARGO" });
    expect(Object.keys(errores(() => procesarExtras([corto], { extra_t: "x".repeat(201) })))).toEqual(["extra_t"]);
    expect(procesarExtras([largo], { extra_l: "x".repeat(2000) })).toEqual({ l: "x".repeat(2000) });
    expect(Object.keys(errores(() => procesarExtras([largo], { extra_l: "x".repeat(2001) })))).toEqual(["extra_l"]);
  });

  it("número: acepta texto con coma decimal y rechaza lo que no es número", () => {
    const n = campo({ clave: "n", tipo: "NUMERO" });
    expect(procesarExtras([n], { extra_n: "12,5" })).toEqual({ n: 12.5 });
    expect(procesarExtras([n], { extra_n: 0 })).toEqual({ n: 0 });
    expect(procesarExtras([n], {})).toEqual({}); // ausente = vacío
    expect(errores(() => procesarExtras([n], { extra_n: "abc" })).extra_n).toBe("Ingresá un número");
  });

  it("sí/no: una casilla sin tildar (ausente) es false y siempre queda guardada", () => {
    const b = campo({ clave: "b", tipo: "SI_NO" });
    expect(procesarExtras([b], { extra_b: "on" })).toEqual({ b: true });
    expect(procesarExtras([b], {})).toEqual({ b: false });
  });

  it("fecha: exige AAAA-MM-DD válida", () => {
    const f = campo({ clave: "f", tipo: "FECHA" });
    expect(procesarExtras([f], { extra_f: "2026-09-30" })).toEqual({ f: "2026-09-30" });
    expect(errores(() => procesarExtras([f], { extra_f: "30/09/2026" })).extra_f).toBeDefined();
    expect(errores(() => procesarExtras([f], { extra_f: "2026-02-31" })).extra_f).toBeDefined();
  });

  it("lista: solo opciones activas, más la que ya tenía guardada el registro", () => {
    expect(procesarExtras([lista], { extra_tono: "o1" })).toEqual({ tono: "o1" });
    expect(errores(() => procesarExtras([lista], { extra_tono: "o2" })).extra_tono).toBe("Elegí una opción válida");
    expect(errores(() => procesarExtras([lista], { extra_tono: "inexistente" })).extra_tono).toBe("Elegí una opción válida");
    expect(procesarExtras([lista], { extra_tono: "o2" }, { tono: "o2" })).toEqual({ tono: "o2" });
  });
});

describe("procesarExtras: obligatorios, ocultos y archivados", () => {
  it("un campo obligatorio vacío falla con 'Campo obligatorio'", () => {
    const t = campo({ clave: "nota", requerido: true });
    expect(errores(() => procesarExtras([t], {})).extra_nota).toBe("Campo obligatorio");
    expect(errores(() => procesarExtras([t], { extra_nota: "  " })).extra_nota).toBe("Campo obligatorio");
  });

  it("un campo obligatorio pero oculto o archivado no se exige y conserva su valor", () => {
    const oculto = campo({ clave: "a", requerido: true, visible: false });
    const archivado = campo({ clave: "b", requerido: true, archivado: true });
    expect(procesarExtras([oculto, archivado], {}, { a: "x", b: "y" })).toEqual({ a: "x", b: "y" });
    expect(procesarExtras([oculto, archivado], {})).toEqual({});
  });

  it("vaciar un campo opcional visible borra su valor guardado", () => {
    const t = campo({ clave: "nota" });
    expect(procesarExtras([t], { extra_nota: "" }, { nota: "viejo" })).toEqual({});
  });

  it("descarta los valores de campos que ya no existen y las claves desconocidas de la entrada", () => {
    const t = campo({ clave: "nota" });
    expect(procesarExtras([t], { extra_nota: "x", extra_otro: "y" }, { nota: "a", eliminado: "z" })).toEqual({ nota: "x" });
  });

  it("no modifica el objeto `actuales` recibido", () => {
    const t = campo({ clave: "nota" });
    const actuales = { nota: "a" };
    procesarExtras([t], { extra_nota: "b" }, actuales);
    expect(actuales).toEqual({ nota: "a" });
  });
});

describe("procesarExtras: campos que no estaban en el formulario", () => {
  it("un campo que no se dibujó conserva su valor, aunque sea Sí/No o la entrada lo omita", () => {
    const b = campo({ clave: "b", tipo: "SI_NO" });
    const t = campo({ clave: "t" });
    expect(procesarExtras([b, t], {}, { b: true, t: "x" }, ["otra"])).toEqual({ b: true, t: "x" });
  });

  it("solo se validan y escriben los campos dibujados", () => {
    const b = campo({ clave: "b", tipo: "SI_NO" });
    const t = campo({ clave: "t" });
    expect(procesarExtras([b, t], { extra_t: "nuevo" }, { b: true, t: "x" }, ["t"])).toEqual({ b: true, t: "nuevo" });
  });

  it("un campo obligatorio que no se dibujó no se exige", () => {
    const t = campo({ clave: "t", requerido: true });
    expect(procesarExtras([t], {}, {}, [])).toEqual({});
  });
});

describe("formatearValor", () => {
  it("formatea según el tipo", () => {
    expect(formatearValor(campo({ tipo: "SI_NO" }), true)).toBe("Sí");
    expect(formatearValor(campo({ tipo: "SI_NO" }), false)).toBe("No");
    expect(formatearValor(campo({ tipo: "NUMERO", unidad: "mm" }), 4.8)).toBe("4.8 mm");
    expect(formatearValor(campo({ tipo: "NUMERO" }), 3)).toBe("3");
    expect(formatearValor(campo({ tipo: "FECHA" }), "2026-09-30")).toBe("30/09/2026");
    expect(formatearValor(campo({ tipo: "TEXTO" }), "hola")).toBe("hola");
  });

  it("una lista muestra la etiqueta, incluso de una opción desactivada; sin valor o sin opción, un guion", () => {
    expect(formatearValor(lista, "o1")).toBe("Verde");
    expect(formatearValor(lista, "o2")).toBe("Gris");
    expect(formatearValor(lista, "borrada")).toBe("—");
    expect(formatearValor(lista, undefined)).toBe("—");
  });
});
