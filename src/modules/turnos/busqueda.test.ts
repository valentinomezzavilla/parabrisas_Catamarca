import { describe, expect, it } from "vitest";
import {
  aReservaVisible,
  coincideConCriterios,
  contactoCoincide,
  etiquetaEstadoCliente,
  normalizarCriterios,
  resolverBusqueda,
  SinCriteriosError,
  tapadoNombre,
  tapadoPatente,
  telefonoCoincide,
  type TurnoBuscable,
} from "./busqueda";

const turno = (o: Partial<TurnoBuscable> = {}): TurnoBuscable => ({
  id: "t1",
  codigo: "K7Q2XA",
  servicioId: "s1",
  servicioNombre: "Lavados",
  inicio: new Date("2026-10-05T13:00:00Z"), // 10:00 en Catamarca
  estado: "CONFIRMADO",
  nombre: "Valentino Mezzavilla",
  telefono: "383 4123456",
  email: "Valen@Example.com",
  patente: "AB 123 CD",
  vehiculo: "Toyota Hilux 2019",
  senaPagada: true,
  ...o,
});

describe("normalizarCriterios", () => {
  it("se queda solo con lo que se completó, ya normalizado", () => {
    expect(normalizarCriterios({ codigo: " k7q2 xa ", nombre: "  Valentíno ", telefono: "(383) 412-3456", email: " VALEN@x.com ", patente: "ab-123 cd", vehiculo: "HILUX" })).toEqual({
      codigo: "K7Q2XA",
      nombre: "valentino",
      telefono: "3834123456",
      email: "valen@x.com",
      patente: "AB123CD",
      vehiculo: "hilux",
    });
  });

  it("con un solo dato alcanza", () => {
    expect(normalizarCriterios({ patente: "ab123cd" })).toEqual({ patente: "AB123CD" });
  });

  it("sin datos, o solo con espacios, falla", () => {
    expect(() => normalizarCriterios({})).toThrow(SinCriteriosError);
    expect(() => normalizarCriterios({ nombre: "   ", telefono: "---", codigo: "" })).toThrow(SinCriteriosError);
  });

  it("el servicio y el día solos no alcanzan: hace falta un dato que identifique", () => {
    expect(() => normalizarCriterios({ servicioId: "s1" })).toThrow(SinCriteriosError);
    expect(() => normalizarCriterios({ fecha: "2026-10-05" })).toThrow(SinCriteriosError);
    expect(() => normalizarCriterios({ servicioId: "s1", fecha: "2026-10-05" })).toThrow(SinCriteriosError);
    expect(normalizarCriterios({ servicioId: "s1", fecha: "2026-10-05", nombre: "ana" })).toEqual({ servicioId: "s1", fecha: "2026-10-05", nombre: "ana" });
  });

  it("una fecha mal escrita se ignora", () => {
    expect(() => normalizarCriterios({ fecha: "5/10" })).toThrow(SinCriteriosError);
  });
});

describe("telefonoCoincide", () => {
  it("compara por dígitos y acepta que falte el prefijo", () => {
    expect(telefonoCoincide("383 4123456", "3834123456")).toBe(true);
    expect(telefonoCoincide("+54 9 383 412-3456", "383-4123456")).toBe(true);
    expect(telefonoCoincide("383 4123456", "4123456")).toBe(true);
  });

  it("también cuando lo ingresado trae el prefijo y lo guardado no", () => {
    expect(telefonoCoincide("383 4123456", "+54 9 383 412-3456")).toBe(true);
    expect(telefonoCoincide("383 4123456", "+54 9 383 999-9999")).toBe(false);
  });

  it("no coincide con menos dígitos que el mínimo ni con otro número", () => {
    expect(telefonoCoincide("383 4123456", "23456")).toBe(false);
    expect(telefonoCoincide("383 4123456", "3834999999")).toBe(false);
  });
});

describe("coincideConCriterios", () => {
  it("con un solo criterio busca solo por ese", () => {
    expect(coincideConCriterios(turno(), { patente: "AB123CD" })).toBe(true);
    expect(coincideConCriterios(turno(), { patente: "ZZ999ZZ" })).toBe(false);
  });

  it("con varios criterios deben coincidir todos", () => {
    expect(coincideConCriterios(turno(), { patente: "AB123CD", nombre: "valentino" })).toBe(true);
    expect(coincideConCriterios(turno(), { patente: "AB123CD", nombre: "otra persona" })).toBe(false);
  });

  it("el nombre y el vehículo van por coincidencia parcial sin tildes, con al menos 3 letras", () => {
    expect(coincideConCriterios(turno({ nombre: "Valentíno Mezzavilla" }), { nombre: "mezza" })).toBe(true);
    expect(coincideConCriterios(turno(), { nombre: "va" })).toBe(false);
    expect(coincideConCriterios(turno(), { vehiculo: "hilux" })).toBe(true);
    expect(coincideConCriterios(turno(), { vehiculo: "to" })).toBe(false);
  });

  it("el código, el mail, el servicio y el día son exactos", () => {
    expect(coincideConCriterios(turno(), { codigo: "K7Q2XA" })).toBe(true);
    expect(coincideConCriterios(turno(), { codigo: "K7Q2XB" })).toBe(false);
    expect(coincideConCriterios(turno(), { email: "valen@example.com" })).toBe(true);
    expect(coincideConCriterios(turno({ email: null }), { email: "valen@example.com" })).toBe(false);
    expect(coincideConCriterios(turno(), { servicioId: "s2" })).toBe(false);
    expect(coincideConCriterios(turno(), { fecha: "2026-10-05" })).toBe(true);
    expect(coincideConCriterios(turno(), { fecha: "2026-10-06" })).toBe(false);
  });

  it("un turno sin patente no coincide con una patente", () => {
    expect(coincideConCriterios(turno({ patente: null }), { patente: "AB123CD" })).toBe(false);
  });
});

describe("resolverBusqueda", () => {
  const a = turno({ id: "a", codigo: "AAAAAA", nombre: "Ana López", telefono: "383 1111111" });
  const b = turno({ id: "b", codigo: "BBBBBB", nombre: "Bruno Díaz", telefono: "383 2222222" });

  it("ninguna coincidencia", () => {
    expect(resolverBusqueda([a, b], { nombre: "carlos" })).toEqual({ tipo: "ninguna" });
  });

  it("varias coincidencias: no devuelve ningún turno", () => {
    expect(resolverBusqueda([a, b], { patente: "AB123CD" })).toEqual({ tipo: "varias" });
  });

  it("una sola coincidencia: devuelve ese turno", () => {
    expect(resolverBusqueda([a, b], { telefono: "3832222222" })).toEqual({ tipo: "una", turno: b });
  });
});

describe("enmascarado", () => {
  it("nombre: el primero y la inicial del último apellido", () => {
    expect(tapadoNombre("Valentino Mezzavilla")).toBe("Valentino M.");
    expect(tapadoNombre("Ana María de los Ángeles Pérez")).toBe("Ana P.");
    expect(tapadoNombre("Ana")).toBe("Ana");
    expect(tapadoNombre("  ")).toBe("");
  });

  it("patente: solo la primera y la última", () => {
    expect(tapadoPatente("AB 123 CD")).toBe("A*****D");
    expect(tapadoPatente("AB")).toBe("**");
    expect(tapadoPatente(null)).toBeNull();
  });
});

describe("aReservaVisible", () => {
  it("expone solo lo permitido, en hora de Catamarca y con los datos tapados", () => {
    const v = aReservaVisible(turno());
    expect(v).toEqual({
      codigo: "K7Q2XA",
      servicio: "Lavados",
      dia: "lunes, 5 de octubre",
      hora: "10:00",
      estado: "Confirmada",
      senaPagada: true,
      nombre: "Valentino M.",
      patente: "A*****D",
    });
    // Ni un solo dígito del teléfono: sino se puede adivinar el resto y cancelar un turno ajeno.
    expect(Object.keys(v)).not.toContain("telefono");
    expect(JSON.stringify(v)).not.toMatch(/\d{4}\*|3456|4123/);
    expect(Object.keys(v)).not.toContain("email");
    expect(JSON.stringify(v)).not.toContain("Example");
  });
});

describe("etiquetaEstadoCliente", () => {
  it("usa palabras para el cliente", () => {
    expect(etiquetaEstadoCliente("CONFIRMADO")).toBe("Confirmada");
    expect(etiquetaEstadoCliente("ESPERANDO_PAGO")).toBe("Esperando la seña");
    expect(etiquetaEstadoCliente("PENDIENTE")).toBe("Pendiente de confirmación");
  });
});

describe("contactoCoincide", () => {
  const guardado = { telefono: "383 4123456", email: "Valen@Example.com" };

  it("acepta el teléfono completo o el mail, sin importar formato ni mayúsculas", () => {
    expect(contactoCoincide(guardado, "3834123456")).toBe(true);
    expect(contactoCoincide(guardado, "+54 9 383 412-3456")).toBe(true);
    expect(contactoCoincide(guardado, " valen@example.COM ")).toBe(true);
  });

  it("pide el teléfono completo: los últimos dígitos solos no alcanzan", () => {
    expect(contactoCoincide(guardado, "34123456")).toBe(false); // 8 de los 10 dígitos
    expect(contactoCoincide(guardado, "4123456")).toBe(false);
    expect(contactoCoincide({ telefono: "4123456", email: null }, "383 4123456")).toBe(true); // guardado sin código de área
    expect(contactoCoincide({ telefono: "4123456", email: null }, "4123456")).toBe(true);
    expect(contactoCoincide({ telefono: "4123456", email: null }, "123456")).toBe(false);
  });

  it("rechaza un teléfono corto, otro número u otro mail", () => {
    expect(contactoCoincide(guardado, "4123456")).toBe(false);
    expect(contactoCoincide(guardado, "3834999999")).toBe(false);
    expect(contactoCoincide(guardado, "otro@example.com")).toBe(false);
  });

  it("si la reserva no tiene mail, un mail nunca coincide", () => {
    expect(contactoCoincide({ telefono: "383 4123456", email: null }, "valen@example.com")).toBe(false);
  });
});
