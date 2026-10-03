import type { UsuarioSesion } from "@/modules/usuarios/usuario.service";
import type { Aviso } from "./avisos";

declare global {
  namespace Express {
    interface Locals {
      /** Usuario del panel; lo completan `verificarSesion` y `requerirRol`. */
      usuario?: UsuarioSesion;
      avisoPendiente?: Aviso | null;
      ruta?: string;
    }
  }
}

export {};
