import type { ComponentType } from "react";
import { CalendarClock, LayoutDashboard, Package, SlidersHorizontal, UserCog, Wrench } from "lucide-react";
import type { Rol } from "@/modules/usuarios/reglas";

// Una sola definición del menú: la usan la barra lateral (escritorio y tablet) y la barra inferior (celular).

export interface ItemNav {
  href: string;
  etiqueta: string;
  Icono: ComponentType<{ className?: string }>;
  soloAdmin?: boolean;
}

export interface GrupoNav {
  titulo: string;
  items: ItemNav[];
}

export const GRUPOS: GrupoNav[] = [
  {
    titulo: "Operación",
    items: [
      { href: "/", etiqueta: "Panel", Icono: LayoutDashboard },
      { href: "/turnos", etiqueta: "Turnos", Icono: CalendarClock },
      { href: "/stock", etiqueta: "Stock", Icono: Package },
    ],
  },
  {
    titulo: "Gestión",
    items: [
      { href: "/servicios", etiqueta: "Servicios", Icono: Wrench, soloAdmin: true },
      { href: "/usuarios", etiqueta: "Usuarios", Icono: UserCog, soloAdmin: true },
      { href: "/administracion", etiqueta: "Administración", Icono: SlidersHorizontal, soloAdmin: true },
    ],
  },
];

export const esActiva = (href: string, ruta: string) =>
  href === "/" ? ruta === "/" : ruta === href || ruta.startsWith(`${href}/`);

/** Los grupos con los ítems que el rol puede ver; un grupo sin ítems no se muestra. */
export function gruposVisibles(rol: Rol): GrupoNav[] {
  return GRUPOS.map((g) => ({ ...g, items: g.items.filter((i) => !i.soloAdmin || rol === "ADMIN") })).filter(
    (g) => g.items.length > 0,
  );
}

export const inicialDe = (nombre: string) => (nombre.trim()[0] ?? "?").toUpperCase();
export const nombreDeRol = (rol: Rol) => (rol === "ADMIN" ? "Administrador" : "Empleado");
