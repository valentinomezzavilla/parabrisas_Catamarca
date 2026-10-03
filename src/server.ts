import "dotenv/config";
import { crearApp } from "@/app";
import { db } from "@/lib/db";
import { obtenerSecreto } from "@/lib/token";

obtenerSecreto(); // sin SESSION_SECRET válida no tiene sentido arrancar

const puerto = Number(process.env.PORT ?? 3000);
const servidor = crearApp().listen(puerto, () => {
  console.log(`Parabrisas Catamarca escuchando en http://localhost:${puerto}`);
});

function apagar() {
  servidor.close(() => {
    void db.$disconnect().finally(() => process.exit(0));
  });
}
process.on("SIGTERM", apagar);
process.on("SIGINT", apagar);
