import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import express, { type NextFunction, type Request, type Response } from "express";
import { esRutaPublica } from "@/lib/rutas";
import { verificarSesion } from "@/lib/sesion";
import { rutasAdministracion } from "@/rutas/administracion";
import { rutasAuth } from "@/rutas/auth";
import { rutasClientes } from "@/rutas/clientes";
import { rutasInicio } from "@/rutas/inicio";
import { rutasMercadoPago } from "@/rutas/mercadopago";
import { rutasOrdenes } from "@/rutas/ordenes";
import { rutasReservar } from "@/rutas/reservar";
import { rutasSeo } from "@/rutas/seo";
import { rutasServicios } from "@/rutas/servicios";
import { rutasStock } from "@/rutas/stock";
import { rutasTurnos } from "@/rutas/turnos";
import { rutasUsuarios } from "@/rutas/usuarios";
import { leerAviso } from "@/web/avisos";
import { crearUrlRecurso } from "@/web/recursos";
import { encabezadosSeguros, mismoOrigen } from "@/web/seguridad";
import { ayudas, mostrar } from "@/web/vistas";
import { requerirRol } from "@/lib/sesion";

// Raíz del proyecto: este archivo vive en `src/` (desarrollo) o en `dist/` (compilado), un nivel abajo.
const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const PRODUCCION = process.env.NODE_ENV === "production";

export function crearApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("view engine", "ejs");
  app.set("views", `${RAIZ}views`);
  Object.assign(app.locals, ayudas);
  // `recurso('/css/app.css')` → URL con huella: al publicar cambios, nadie se queda con el CSS viejo del caché.
  app.locals.recurso = crearUrlRecurso(`${RAIZ}public`, PRODUCCION);

  app.use(encabezadosSeguros);
  app.use(express.static(`${RAIZ}public`, { index: false, maxAge: PRODUCCION ? "1d" : 0 }));
  app.use(cookieParser());
  // La importación desde Notion manda el CSV entero en el formulario. El resto usa el límite general.
  app.use("/administracion/ordenes/importar", express.urlencoded({ extended: false, limit: "2mb" }));
  app.use(express.urlencoded({ extended: false, limit: "100kb" }));
  app.use(leerAviso);
  app.use((req, res, next) => {
    res.locals.ruta = req.path;
    next();
  });

  // Aviso de Mercado Pago: llega desde sus servidores (sin Origin del sitio); se valida con la firma.
  app.use("/api/mercadopago", rutasMercadoPago);

  app.use(mismoOrigen);

  // Todo lo que no es público exige sesión. Va antes de las rutas: una ruta nueva queda protegida por defecto.
  app.use((req, res, next) => (esRutaPublica(req.path) ? next() : verificarSesion(req, res, next)));
  app.use(["/servicios", "/usuarios", "/administracion"], requerirRol("ADMIN"));

  app.use(rutasAuth);
  app.use(rutasSeo);
  app.use("/reservar", rutasReservar);
  app.use(rutasInicio);
  app.use("/turnos", rutasTurnos);
  app.use("/stock", rutasStock);
  app.use("/ordenes", rutasOrdenes);
  app.use("/clientes", rutasClientes);
  app.use("/servicios", rutasServicios);
  app.use("/usuarios", rutasUsuarios);
  app.use("/administracion", rutasAdministracion);

  app.use(async (_req: Request, res: Response) => {
    await mostrar(res, "errores/404", { titulo: "No encontrado", layout: res.locals.usuario ? "panel" : "publico" }, 404);
  });

  app.use(async (error: unknown, _req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    if (res.headersSent) return next(error);
    try {
      await mostrar(res, "errores/500", { titulo: "Error", layout: res.locals.usuario ? "panel" : "publico" }, 500);
    } catch {
      res.status(500).type("text/plain").send("Ocurrió un error inesperado.");
    }
  });

  return app;
}
