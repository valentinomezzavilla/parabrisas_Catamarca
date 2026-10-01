import { describe, expect, it } from "vitest";
import { camposVisibles, combinarCampos, moverCampo, type ConfigCampo } from "./combinar";
import { claveUnica } from "./clave";
import { clavesProhibidas, clavesReservadas, REGISTRO, SECCIONES } from "./registro";
import type { CampoPropio } from "./tipos";

const propio = (cambios: Partial<CampoPropio> = {}): CampoPropio => ({
  id: "p1",
  entidad: "CRISTAL",
  clave: "sensor_de_lluvia",
  etiqueta: "Sensor de lluvia",
  ayuda: null,
  tipo: "SI_NO",
  requerido: false,
  unidad: null,
  opciones: [],
  orden: 10,
  visible: true,
  archivado: false,
  ...cambios,
});

const config = (clave: string, cambios: Partial<ConfigCampo> = {}): ConfigCampo => ({
  clave,
  etiqueta: null,
  ayuda: null,
  oculto: false,
  orden: null,
  ...cambios,
});

const claves = (campos: { clave: string }[]) => campos.map((c) => c.clave);

describe("registro", () => {
  it("los campos protegidos de Stock no son ocultables", () => {
    const protegidos = ["codigo", "descripcion", "marcaId", "tipoId", "ubicacionId", "stockMinimo", "cantidad"];
    for (const clave of protegidos) {
      const c = REGISTRO.CRISTAL.find((x) => x.clave === clave);
      expect(c?.protegido, clave).toBe(true);
      expect(c?.ocultable, clave).toBe(false);
    }
  });

  it("todos los campos del sistema de Servicios son fijos, no ocultables y de una sección conocida", () => {
    expect(REGISTRO.SERVICIO.length).toBe(12);
    const secciones = new Set(SECCIONES.map((s) => s.id));
    for (const c of REGISTRO.SERVICIO) {
      expect(c.fijo, c.clave).toBe(true);
      expect(c.ocultable, c.clave).toBe(false);
      expect(secciones.has(c.seccion), c.clave).toBe(true);
    }
  });

  it("las claves del sistema de Servicios no se repiten y están reservadas", () => {
    const claves = REGISTRO.SERVICIO.map((c) => c.clave);
    expect(new Set(claves).size).toBe(claves.length);
    expect(clavesReservadas("SERVICIO")).toEqual(expect.arrayContaining(["nombre", "precioBase", "horarios", "capacidad"]));
    expect(clavesProhibidas("SERVICIO")).toContain("nuevo");
  });

  it("los campos de Stock no son fijos", () => {
    expect(REGISTRO.CRISTAL.some((c) => c.fijo)).toBe(false);
  });

  it("clavesReservadas devuelve todas las claves del sistema", () => {
    expect(clavesReservadas("CRISTAL")).toContain("costo");
    expect(clavesReservadas("CRISTAL")).toHaveLength(REGISTRO.CRISTAL.length);
  });

  it("clavesProhibidas suma las claves de ruta: un campo propio 'Nuevo' chocaría con /campos/nuevo", () => {
    expect(clavesProhibidas("CRISTAL")).toContain("nuevo");
    expect(clavesProhibidas("CRISTAL")).toContain("costo");
    expect(claveUnica("Nuevo", clavesProhibidas("CRISTAL"))).toBe("nuevo_2");
  });
});

describe("combinarCampos", () => {
  it("sin ajustes devuelve los campos de fábrica, con los propios al final", () => {
    const r = combinarCampos("CRISTAL", [], [propio()]);
    expect(r[0].clave).toBe("codigo");
    expect(r.at(-1)?.clave).toBe("sensor_de_lluvia");
    expect(r.at(-1)?.origen).toBe("PROPIO");
    expect(r.at(-1)?.seccion).toBe("adicionales");
    expect(r.filter((c) => c.origen === "SISTEMA")).toHaveLength(REGISTRO.CRISTAL.length);
  });

  it("aplica etiqueta y ayuda ajustadas; una etiqueta o ayuda en blanco vuelve a la de fábrica", () => {
    const r = combinarCampos(
      "CRISTAL",
      [config("costo", { etiqueta: "Precio de compra", ayuda: "Sin IVA" }), config("precioVenta", { etiqueta: "  ", ayuda: " " })],
      [],
    );
    expect(r.find((c) => c.clave === "costo")).toMatchObject({ etiqueta: "Precio de compra", ayuda: "Sin IVA" });
    expect(r.find((c) => c.clave === "precioVenta")?.etiqueta).toBe("Precio de venta");
  });

  it("oculta solo los campos ocultables: el ajuste sobre un protegido se ignora", () => {
    const r = combinarCampos("CRISTAL", [config("costo", { oculto: true }), config("codigo", { oculto: true })], []);
    expect(r.find((c) => c.clave === "costo")?.visible).toBe(false);
    expect(r.find((c) => c.clave === "codigo")?.visible).toBe(true);
  });

  it("reordena dentro de la sección según `orden`", () => {
    const r = combinarCampos("CRISTAL", [config("descripcion", { orden: 1 })], []);
    const identificacion = r.filter((c) => c.seccion === "identificacion");
    expect(identificacion[0].clave).toBe("descripcion");
  });

  it("un campo propio archivado u oculto no es visible; los de otra entidad se ignoran", () => {
    const r = combinarCampos(
      "CRISTAL",
      [],
      [propio({ id: "a", clave: "a", archivado: true }), propio({ id: "b", clave: "b", visible: false }), propio({ id: "c", clave: "c", entidad: "SERVICIO" })],
    );
    expect(r.find((c) => c.clave === "a")).toMatchObject({ visible: false, archivado: true });
    expect(r.find((c) => c.clave === "b")?.visible).toBe(false);
    expect(r.find((c) => c.clave === "c")).toBeUndefined();
  });

  it("el campo propio conserva tipo, unidad, opciones, obligatorio e id", () => {
    const opciones = [{ id: "o1", etiqueta: "Verde", activo: true }];
    const r = combinarCampos("CRISTAL", [], [propio({ tipo: "LISTA", opciones, requerido: true, unidad: null })]);
    expect(r.at(-1)).toMatchObject({ tipo: "LISTA", opciones, requerido: true, id: "p1", protegido: false, ocultable: true });
  });
});

describe("camposVisibles", () => {
  it("deja solo los visibles y no archivados", () => {
    const todos = combinarCampos("CRISTAL", [config("costo", { oculto: true })], [propio({ archivado: true })]);
    const visibles = camposVisibles(todos);
    expect(claves(visibles)).not.toContain("costo");
    expect(claves(visibles)).not.toContain("sensor_de_lluvia");
    expect(claves(visibles)).toContain("codigo");
  });
});

describe("moverCampo", () => {
  const todos = () => combinarCampos("CRISTAL", [], []);

  it("intercambia con el vecino de la sección y renumera la sección completa", () => {
    const r = moverCampo(todos(), "descripcion", "ARRIBA");
    const identificacion = REGISTRO.CRISTAL.filter((c) => c.seccion === "identificacion").map((c) => c.clave);
    expect(identificacion.slice(0, 3)).toEqual(["codigo", "codigoFabricante", "descripcion"]);
    expect(r.map((c) => c.clave)).toEqual(["codigo", "descripcion", "codigoFabricante"]);
    expect(r.map((c) => c.orden)).toEqual([10, 20, 30]);
  });

  it("no hace nada en los bordes ni con una clave inexistente", () => {
    expect(moverCampo(todos(), "codigo", "ARRIBA")).toEqual([]);
    expect(moverCampo(todos(), "descripcion", "ABAJO")).toEqual([]); // es el último de su sección
    expect(moverCampo(todos(), "codigoFabricante", "ABAJO").length).toBeGreaterThan(0);
    expect(moverCampo(todos(), "noExiste", "ABAJO")).toEqual([]);
  });
});

describe("combinarCampos para Servicios", () => {
  const propioServicio = (cambios: Partial<CampoPropio> = {}): CampoPropio =>
    propio({ id: "s1", entidad: "SERVICIO", clave: "garantia", etiqueta: "Garantía", tipo: "TEXTO", ...cambios });

  it("pone los campos del sistema primero (fijos) y los propios al final, en 'Datos adicionales'", () => {
    const campos = combinarCampos("SERVICIO", [], [propioServicio()]);
    const sistema = campos.filter((c) => c.origen === "SISTEMA");
    expect(sistema.every((c) => c.fijo && !c.ocultable)).toBe(true);
    expect(campos.at(-1)).toMatchObject({ clave: "garantia", origen: "PROPIO", seccion: "adicionales", fijo: false });
  });

  it("ignora los campos propios de otra entidad", () => {
    const deCristal = propio({ clave: "sensor", entidad: "CRISTAL" });
    expect(claves(combinarCampos("SERVICIO", [], [deCristal]))).not.toContain("sensor");
  });

  it("ordena los propios por `orden` y permite subir uno", () => {
    const campos = combinarCampos("SERVICIO", [], [
      propioServicio({ id: "a", clave: "a", etiqueta: "A", orden: 10 }),
      propioServicio({ id: "b", clave: "b", etiqueta: "B", orden: 20 }),
    ]);
    expect(moverCampo(campos, "b", "ARRIBA")).toEqual([
      { clave: "b", orden: 10 },
      { clave: "a", orden: 20 },
    ]);
  });
});
