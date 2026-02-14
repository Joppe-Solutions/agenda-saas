import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const features = [
  "Gerencie todas as suas reservas em um só lugar",
  "Receba pagamentos via PIX instantâneo",
  "Notifique clientes automaticamente",
  "Relatórios e métricas em tempo real",
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/30 via-cyan-500/10 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center">
            <Logo variant="full" size="md" forceTheme="dark" />
          </Link>

          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold leading-tight lg:text-4xl">
                Simplifique suas reservas,
                <br />
                maximize seus resultados.
              </h1>
              <p className="mt-4 text-lg text-white/70">
                Junte-se a centenas de empresários que já transformaram
                a forma como gerenciam suas reservas.
              </p>
            </div>

            <ul className="space-y-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  </div>
                  <span className="text-white/80">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} reserva.online. Todos os direitos reservados.
          </p>
        </div>
      </div>

      <div className="flex flex-col bg-background">
        <header className="flex items-center justify-between border-b p-4 lg:hidden">
          <Link href="/" className="flex items-center">
            <Logo variant="full" size="sm" />
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
