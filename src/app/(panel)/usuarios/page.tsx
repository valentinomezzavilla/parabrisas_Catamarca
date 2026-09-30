import Link from "next/link";
import { Plus } from "lucide-react";
import { Aviso, boton, EncabezadoPagina, Insignia, tarjeta } from "@/components/ui";
import { requerirRol } from "@/lib/sesion";
import { listarUsuarios } from "@/modules/usuarios/usuario.service";
import { AccionesUsuario } from "./AccionesUsuario";

export const metadata = { title: "Usuarios" };

const AVISOS: Record<string, string> = { creado: "Usuario creado." };

const fechaHora = (fecha: Date) =>
  fecha.toLocaleString("es-AR", { timeZone: "America/Argentina/Catamarca", dateStyle: "short", timeStyle: "short" });

export default async function PaginaUsuarios({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  const yo = await requerirRol("ADMIN");
  const { aviso } = await searchParams;
  const usuarios = await listarUsuarios();

  return (
    <>
      <EncabezadoPagina
        seccion="Administración"
        titulo="Usuarios"
        descripcion="Quién puede entrar al panel. El Admin gestiona usuarios y servicios; el Empleado maneja turnos y stock."
        acciones={
          <Link href="/usuarios/nuevo" className={boton.primario}>
            <Plus className="size-4" aria-hidden />
            Nuevo usuario
          </Link>
        }
      />

      {aviso && AVISOS[aviso] && <Aviso>{AVISOS[aviso]}</Aviso>}

      <ul className="space-y-3">
        {usuarios.map((u) => (
          <li key={u.id} className={`${tarjeta} flex flex-wrap items-start justify-between gap-4 p-4 ${u.activo ? "" : "opacity-70"}`}>
            <div className="min-w-0 space-y-1">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {u.nombre}
                {u.id === yo.id && <Insignia>Vos</Insignia>}
                <Insignia tono={u.rol === "ADMIN" ? "marca" : "neutro"}>{u.rol === "ADMIN" ? "Admin" : "Empleado"}</Insignia>
                {!u.activo && <Insignia tono="peligro">Desactivado</Insignia>}
              </p>
              <p className="text-sm text-texto-suave">{u.usuario}</p>
              <p className="text-xs text-texto-suave">
                {u.ultimoAcceso ? `Último acceso: ${fechaHora(u.ultimoAcceso)}` : "Todavía no ingresó"}
              </p>
            </div>
            <AccionesUsuario id={u.id} rol={u.rol} activo={u.activo} esYo={u.id === yo.id} />
          </li>
        ))}
      </ul>
    </>
  );
}
