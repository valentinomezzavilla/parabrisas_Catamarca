/**
 * Datos iniciales: catálogos de inventario y los tres servicios por defecto.
 * Es idempotente (usa upsert), se puede correr varias veces.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { hashearPassword } from "../src/lib/password";
import { generarClave } from "../src/modules/campos/clave";
import { crearOpciones } from "../src/modules/campos/opciones";
import { horaAMinutos } from "../src/lib/tiempo";
import { VEHICULOS } from "./vehiculos";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const FABRICAS = ["Pilkington", "Sekurit", "Original y legítimo", "Temcem", "Favicur", "Polissurex", "Glass", "Cristem", "Fuyao", "Otros"];
const TIPOS_CRISTAL = ["Verde", "Verde con degradé"];

const LUN_A_VIE = [1, 2, 3, 4, 5];
const franja = (dias: number[], desde: string, hasta: string) =>
  dias.map((diaSemana) => ({ diaSemana, horaInicio: horaAMinutos(desde), horaFin: horaAMinutos(hasta) }));

// Horario cortado típico de Catamarca: mañana y tarde, sábados solo mañana.
const HORARIO_COMERCIAL = [
  ...franja(LUN_A_VIE, "08:30", "12:30"),
  ...franja(LUN_A_VIE, "16:30", "20:00"),
  ...franja([6], "09:00", "13:00"),
];

const SERVICIOS = [
  {
    nombre: "Lavados",
    slug: "lavados",
    descripcion: "Lavado exterior e interior del vehículo.",
    duracionMinutos: 60,
    intervaloMinutos: 30,
    margenMinutos: 10,
    capacidad: 2,
    color: "#FDDD3D",
    orden: 1,
    horarios: HORARIO_COMERCIAL,
  },
  {
    nombre: "Colocación de vidrios",
    slug: "colocacion-de-vidrios",
    descripcion: "Colocación de parabrisas, lunetas y cristales laterales.",
    duracionMinutos: 120,
    intervaloMinutos: 60,
    margenMinutos: 15,
    capacidad: null, // sin límite: todos los vehículos del día entran a las 09:00 o a las 14:00
    anticipacionMinutos: 24 * 60, // se reserva con un día de anticipación para preparar el cristal
    requiereCristal: true,
    color: "#E0A800",
    orden: 2,
    horariosFijos: true,
    horarios: [...franja(LUN_A_VIE, "09:00", "09:00"), ...franja(LUN_A_VIE, "14:00", "14:00")],
  },
  {
    nombre: "Polarizados",
    slug: "polarizados",
    descripcion: "Colocación de lámina de control solar.",
    duracionMinutos: 180,
    intervaloMinutos: 60,
    margenMinutos: 15,
    capacidad: 1,
    color: "#8A8F99",
    orden: 3,
    horarios: [...franja(LUN_A_VIE, "08:30", "12:30"), ...franja(LUN_A_VIE, "16:30", "20:00")],
  },
];

async function sembrarServicios() {
  for (const { horarios, ...datos } of SERVICIOS) {
    const existente = await db.servicio.findUnique({ where: { slug: datos.slug } });
    if (existente) continue; // no pisar la configuración que el local haya editado
    await db.servicio.create({ data: { ...datos, horarios: { create: horarios } } });
  }
}

async function sembrarCatalogos() {
  const porNombre = (nombre: string) => ({ where: { nombre }, update: {}, create: { nombre } });

  // Fábricas del cristal (la tabla se llama marcas_cristal; en pantalla es "Fábrica"). Deben coincidir con la
  // migración 20261018120000_fabricas_y_tipos_de_cristal.
  for (const nombre of FABRICAS) {
    await db.marcaCristal.upsert(porNombre(nombre));
  }

  for (const nombre of TIPOS_CRISTAL) {
    await db.tipoCristal.upsert(porNombre(nombre));
  }

  const ubicaciones: [string, boolean][] = [
    ["Parabrisas", false],
    ["Luneta", false],
    ["Puerta delantera", true],
    ["Puerta trasera", true],
    ["Ventilete", true],
    ["Custodia / lateral fijo", true],
    ["Techo / sunroof", false],
  ];
  for (const [i, [nombre, tieneLado]] of ubicaciones.entries()) {
    await db.ubicacionVehiculo.upsert({
      where: { nombre },
      update: {},
      create: { nombre, tieneLado, orden: i },
    });
  }

  // Campos propios de Stock que trae el sistema. Es idempotente: no pisa lo que el Admin haya editado.
  const camposStock: { etiqueta: string; tipo: "SI_NO" | "LISTA"; opciones?: string[] }[] = [
    { etiqueta: "Sensor de lluvia", tipo: "SI_NO" },
    { etiqueta: "Calefaccionado", tipo: "SI_NO" },
    { etiqueta: "Antena incorporada", tipo: "SI_NO" },
    { etiqueta: "Soporte de espejo", tipo: "SI_NO" },
    { etiqueta: "Franja degradé", tipo: "SI_NO" },
    { etiqueta: "Preparado para cámara ADAS", tipo: "SI_NO" },
    { etiqueta: "Tonalidad", tipo: "LISTA", opciones: ["Incoloro", "Verde", "Gris", "Bronce"] },
  ];
  for (const [i, c] of camposStock.entries()) {
    const clave = generarClave(c.etiqueta);
    await db.campoPersonalizado.upsert({
      where: { entidad_clave: { entidad: "CRISTAL", clave } },
      update: {},
      create: {
        entidad: "CRISTAL",
        clave,
        etiqueta: c.etiqueta,
        tipo: c.tipo,
        opciones: crearOpciones(c.opciones ?? []) as unknown as Prisma.InputJsonArray,
        orden: (i + 1) * 10,
      },
    });
  }

  for (const [marca, modelos] of Object.entries(VEHICULOS)) {
    const m = await db.marcaVehiculo.upsert(porNombre(marca));
    for (const nombre of modelos) {
      await db.modeloVehiculo.upsert({
        where: { marcaId_nombre: { marcaId: m.id, nombre } },
        update: {},
        create: { marcaId: m.id, nombre },
      });
    }
  }
}

async function sembrarAdmin() {
  if ((await db.usuario.count()) > 0) return; // ya hay usuarios: no se toca nada

  const { ADMIN_USUARIO, ADMIN_PASSWORD, ADMIN_NOMBRE } = process.env;
  if (!ADMIN_USUARIO || !ADMIN_PASSWORD) {
    console.warn("No hay usuarios y faltan ADMIN_USUARIO / ADMIN_PASSWORD en .env: no se creó ningún administrador.");
    return;
  }
  if (ADMIN_PASSWORD.length < 5) throw new Error("ADMIN_PASSWORD debe tener al menos 5 caracteres.");

  const usuario = ADMIN_USUARIO.trim().toLowerCase();
  await db.usuario.create({
    data: {
      usuario,
      nombre: ADMIN_NOMBRE?.trim() || "Administrador",
      passwordHash: await hashearPassword(ADMIN_PASSWORD),
      rol: "ADMIN",
    },
  });
  console.log(`Administrador creado: ${usuario}`);
}

async function main() {
  await sembrarCatalogos();
  await sembrarServicios();
  await sembrarAdmin();
  console.log("Seed completo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
