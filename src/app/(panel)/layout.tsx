import { BarraLateral } from "@/components/layout/BarraLateral";

export default function LayoutPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh md:flex">
      <BarraLateral />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-8">
        <div className="mx-auto max-w-6xl space-y-8">{children}</div>
      </main>
    </div>
  );
}
