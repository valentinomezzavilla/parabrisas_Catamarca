import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Cake,
  CalendarCheck,
  CalendarClock,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Copy,
  ExternalLink,
  FileUp,
  Gift,
  HandCoins,
  Hourglass,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Package,
  PackageMinus,
  Pencil,
  Phone,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  StickyNote,
  Trash2,
  Undo2,
  UserCog,
  Users,
  Wallet,
  Wrench,
  X,
  XCircle,
} from "lucide-static";

// Iconos Lucide como SVG en línea. Solo se incluyen los que usa la app.
const ICONOS = {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Cake,
  CalendarCheck,
  CalendarClock,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Copy,
  ExternalLink,
  FileUp,
  Gift,
  HandCoins,
  Hourglass,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Package,
  PackageMinus,
  Pencil,
  Phone,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  StickyNote,
  Trash2,
  Undo2,
  UserCog,
  Users,
  Wallet,
  Wrench,
  X,
  XCircle,
};

export type NombreIcono = keyof typeof ICONOS;

const listos = new Map<string, string>();

/** `<svg>` del icono con las clases indicadas. Es decorativo (`aria-hidden`): el texto accesible va al lado. */
export function icono(nombre: NombreIcono, clase = "size-4"): string {
  const clave = `${nombre}|${clase}`;
  let svg = listos.get(clave);
  if (!svg) {
    const fuente = ICONOS[nombre];
    if (!fuente) throw new Error(`Icono desconocido: ${nombre}`);
    svg = fuente
      .replace(/<!--[\s\S]*?-->/g, "")
      .trim()
      .replace(/\s*\n\s*/g, " ")
      .replace('class="lucide', `aria-hidden="true" focusable="false" class="${clase.replace(/"/g, "")} lucide`);
    listos.set(clave, svg);
  }
  return svg;
}
