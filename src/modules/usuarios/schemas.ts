import { z } from "@/lib/zod";

export const rolSchema = z.enum(["ADMIN", "EMPLEADO"]);

/** Las contraseñas no se recortan: los espacios también cuentan. */
export const passwordSchema = z.string().min(10).max(128);

/** Nombre de usuario para el login: minúsculas, 3–60 caracteres, letras, números y . _ @ - (un email también sirve). */
const usuarioSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(60)
  .regex(/^[a-z0-9][a-z0-9._@-]*$/, "Usar solo letras, números y . _ @ -, sin espacios");

export const loginSchema = z.object({
  usuario: usuarioSchema,
  password: z.string().min(1).max(128),
});

export const crearUsuarioSchema = z.object({
  nombre: z.string().trim().min(1).max(80),
  usuario: usuarioSchema,
  password: passwordSchema,
  rol: rolSchema,
});

export const resetPasswordSchema = z.object({ password: passwordSchema });

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
