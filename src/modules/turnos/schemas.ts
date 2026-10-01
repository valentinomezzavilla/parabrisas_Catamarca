import { z } from "@/lib/zod";
import { horaAMinutos } from "@/lib/tiempo";

const hora = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Formato HH:MM")
  .transform(horaAMinutos);

/** Franja horaria tal como llega del formulario: { diaSemana: 1, desde: "08:30", hasta: "12:30" }. */
export const franjaSchema = z
  .object({
    diaSemana: z.number().int().min(0).max(6),
    desde: hora,
    hasta: hora,
  })
  .refine((f) => f.hasta > f.desde, { message: "La hora de cierre debe ser posterior a la de apertura", path: ["hasta"] })
  .transform((f) => ({ diaSemana: f.diaSemana, horaInicio: f.desde, horaFin: f.hasta }));

const aSlug = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const servicioSchema = z
  .object({
    nombre: z.string().trim().min(2).max(60),
    slug: z.string().trim().optional(),
    descripcion: z.string().trim().max(500).optional(),
    duracionMinutos: z.number().int().min(5).max(24 * 60),
    intervaloMinutos: z.number().int().min(5).max(24 * 60).default(30),
    margenMinutos: z.number().int().min(0).max(240).default(0),
    capacidad: z.number().int().min(1).max(20).default(1),
    anticipacionMinutos: z.number().int().min(0).default(60),
    precioBase: z.number().min(0).optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color hexadecimal #RRGGBB").default("#FDDD3D"),
    requiereCristal: z.boolean().default(false),
    activo: z.boolean().default(true),
    orden: z.number().int().default(0),
    horarios: z.array(franjaSchema).min(1, "El servicio necesita al menos una franja horaria"),
    // Campos propios (Administración): controles `extra_<clave>` del formulario. Se validan en el servicio.
    extrasEntrada: z.record(z.string(), z.unknown()).optional(),
    extrasDibujados: z.array(z.string()).optional(),
  })
  .superRefine((s, ctx) => {
    const porDia = new Map<number, typeof s.horarios>();
    for (const f of s.horarios) porDia.set(f.diaSemana, [...(porDia.get(f.diaSemana) ?? []), f]);

    for (const [dia, franjas] of porDia) {
      franjas.sort((a, b) => a.horaInicio - b.horaInicio);
      for (let i = 1; i < franjas.length; i++) {
        if (franjas[i].horaInicio < franjas[i - 1].horaFin) {
          ctx.addIssue({ code: "custom", path: ["horarios"], message: `Hay franjas superpuestas el día ${dia}` });
        }
      }
    }

    const franjaMasLarga = Math.max(...s.horarios.map((f) => f.horaFin - f.horaInicio));
    if (s.duracionMinutos > franjaMasLarga) {
      ctx.addIssue({
        code: "custom",
        path: ["duracionMinutos"],
        message: "La duración no entra en ninguna franja: el servicio no tendría turnos disponibles",
      });
    }
  })
  .transform((s) => ({ ...s, slug: s.slug || aSlug(s.nombre) }));

export const reservaSchema = z.object({
  servicioId: z.string().min(1),
  inicio: z.coerce.date(),
  cliente: z.object({
    nombre: z.string().trim().min(2).max(100),
    telefono: z.string().trim().min(6).max(30),
    email: z.email().optional(),
  }),
  vehiculo: z.string().trim().max(100).optional(),
  patente: z.string().trim().toUpperCase().max(10).optional(),
  cristalId: z.string().optional(),
  notas: z.string().trim().max(500).optional(),
});

export const editarTurnoSchema = z.object({
  servicioId: z.string().min(1),
  inicio: z.coerce.date(),
  cliente: z.object({
    nombre: z.string().trim().min(2).max(100),
    telefono: z.string().trim().min(6).max(30),
    email: z.email().optional(),
  }),
  vehiculo: z.string().trim().max(100).optional(),
  patente: z.string().trim().toUpperCase().max(10).optional(),
  cristalId: z.string().optional(),
  precio: z.number().min(0).optional(),
  notas: z.string().trim().max(500).optional(),
});

export type ServicioInput = z.input<typeof servicioSchema>;
export type EditarTurnoInput = z.input<typeof editarTurnoSchema>;
export type ReservaInput = z.input<typeof reservaSchema>;
