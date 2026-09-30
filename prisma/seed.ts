/**
 * Datos iniciales: catálogos de inventario y los tres servicios por defecto.
 * Es idempotente (usa upsert), se puede correr varias veces.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashearPassword } from "../src/lib/password";
import { horaAMinutos } from "../src/lib/tiempo";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

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
    capacidad: 1,
    anticipacionMinutos: 24 * 60, // se reserva con un día de anticipación para preparar el cristal
    requiereCristal: true,
    color: "#E0A800",
    orden: 2,
    horarios: [...franja(LUN_A_VIE, "08:30", "12:30"), ...franja(LUN_A_VIE, "16:30", "20:00")],
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

  for (const nombre of ["Pilkington", "Fuyao", "Vitro", "AGC", "Saint-Gobain Sekurit", "Genérico"]) {
    await db.marcaCristal.upsert(porNombre(nombre));
  }

  const tipos = [
    ["Laminado", "Dos láminas de vidrio con PVB. Uso obligatorio en parabrisas."],
    ["Templado", "Vidrio de seguridad que se fragmenta en trozos pequeños. Laterales y lunetas."],
    ["Laminado acústico", "Laminado con capa insonorizante."],
  ] as const;
  for (const [nombre, descripcion] of tipos) {
    await db.tipoCristal.upsert({ where: { nombre }, update: {}, create: { nombre, descripcion } });
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

  const caracteristicas = [
    { nombre: "Sensor de lluvia", tipoDato: "BOOLEANO" as const },
    { nombre: "Calefaccionado", tipoDato: "BOOLEANO" as const },
    { nombre: "Antena incorporada", tipoDato: "BOOLEANO" as const },
    { nombre: "Soporte de espejo", tipoDato: "BOOLEANO" as const },
    { nombre: "Franja degradé", tipoDato: "BOOLEANO" as const },
    { nombre: "Preparado para cámara ADAS", tipoDato: "BOOLEANO" as const },
    { nombre: "Tonalidad", tipoDato: "OPCION" as const, opciones: ["Incoloro", "Verde", "Gris", "Bronce"] },
  ];
  for (const c of caracteristicas) {
    await db.caracteristica.upsert({ where: { nombre: c.nombre }, update: {}, create: c });
  }

  const vehiculos: Record<string, string[]> = {
    Toyota: ["Hilux", "Corolla", "Etios", "Yaris"],
    Ford: ["Ranger", "Ka", "Fiesta", "EcoSport"],
    Volkswagen: ["Gol Trend", "Amarok", "Polo", "Suran"],
    Chevrolet: ["Onix", "Prisma", "S10", "Cruze"],
    Fiat: ["Cronos", "Palio", "Strada", "Toro"],
    Peugeot: ["208", "2008", "Partner"],
    Renault: ["Sandero", "Kangoo", "Duster"],
  };
  for (const [marca, modelos] of Object.entries(vehiculos)) {
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
  if (ADMIN_PASSWORD.length < 10) throw new Error("ADMIN_PASSWORD debe tener al menos 10 caracteres.");

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
