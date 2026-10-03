import { Router } from "express";
import { hoy } from "@/lib/tiempo";
import { cristalesConStockBajo } from "@/modules/inventario/cristal.service";
import { liberarVencidos, listarPagosParaDevolver, marcarDevuelto } from "@/modules/pagos/pagos.service";
import { listarTurnosDelDia } from "@/modules/turnos/turno.service";
import { mostrar } from "@/web/vistas";

export const rutasInicio = Router();

rutasInicio.get("/", async (_req, res) => {
  await liberarVencidos();
  const fecha = hoy();
  const [turnos, stockBajo, aDevolver] = await Promise.all([listarTurnosDelDia(fecha), cristalesConStockBajo(), listarPagosParaDevolver()]);
  const activos = turnos.filter((t) => !["CANCELADO", "AUSENTE"].includes(t.estado));
  const pendientes = activos.filter((t) => t.estado === "PENDIENTE").length;
  await mostrar(res, "panel/inicio", { titulo: "Panel", fecha, turnos, activos, pendientes, stockBajo, aDevolver });
});

rutasInicio.post("/pagos/:id/devuelto", async (req, res) => {
  await marcarDevuelto(req.params.id);
  res.redirect(303, "/");
});
