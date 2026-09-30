import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { BarraLateral } from "@/components/layout/BarraLateral";
import "./globals.css";

// Montserrat en peso extra-bold se acerca a la tipografía geométrica y pesada del logo.
const montserrat = Montserrat({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-montserrat" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Parabrisas Catamarca · Gestión",
  description: "Stock de cristales y agenda de turnos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${montserrat.variable} ${inter.variable}`}>
      <body className="min-h-dvh antialiased md:flex">
        <BarraLateral />
        <main className="flex-1 px-4 py-6 md:px-10 md:py-8">{children}</main>
      </body>
    </html>
  );
}
