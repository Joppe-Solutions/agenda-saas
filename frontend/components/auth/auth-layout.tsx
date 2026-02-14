import Link from "next/link";
import { CalendarCheck, CheckCircle2 } from "lucide-react";

const features = [
  "Gerencie todas as suas reservas em um só lugar",
  "Receba pagamentos via PIX instantâneo",
  "Notifique clientes automaticamente",
  "Relatórios e métricas em tempo real",
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="relative hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-700" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold">reserva.online</span>
          </Link>

          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold leading-tight lg:text-4xl">
                Simplifique suas reservas,
                <br />
                maximize seus resultados.
              </h1>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Junte-se a centenas de empresários que já transformaram
                a forma como gerenciam suas reservas.
              </p>
            </div>

            <ul className="space-y-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary-foreground/80" />
                  <span className="text-primary-foreground/90">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} reserva.online. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex flex-col">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b p-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <CalendarCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">reserva.online</span>
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
