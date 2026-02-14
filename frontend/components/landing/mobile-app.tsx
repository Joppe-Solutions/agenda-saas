import Image from "next/image";
import Link from "next/link";
import { Smartphone, Bell, Calendar, QrCode } from "lucide-react";

const appFeatures = [
  {
    icon: Calendar,
    title: "Gerencie reservas",
    description: "Visualize e gerencie todas as reservas na palma da mão",
  },
  {
    icon: Bell,
    title: "Notificações em tempo real",
    description: "Receba alertas instantâneos de novas reservas",
  },
  {
    icon: QrCode,
    title: "Check-in rápido",
    description: "Confirme a presença dos clientes com QR Code",
  },
];

export function MobileApp() {
  return (
    <section className="border-t bg-muted/30 py-16 sm:py-24" id="app">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Smartphone className="h-4 w-4" />
              Aplicativo Mobile
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Leve o reserva.online
              <br />
              <span className="text-primary">no seu bolso</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Baixe nosso aplicativo e tenha controle total das suas reservas
              onde você estiver. Disponível para Android e iOS.
            </p>

            {/* App features */}
            <div className="mt-8 space-y-4">
              {appFeatures.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3 text-left">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Store badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                href="#"
                className="transition-transform hover:scale-105"
                aria-label="Baixar na App Store"
              >
                <Image
                  src="/images/app-store-badge.png"
                  alt="Disponível na App Store"
                  width={140}
                  height={42}
                  className="h-[42px] w-auto"
                />
              </Link>
              <Link
                href="#"
                className="transition-transform hover:scale-105"
                aria-label="Baixar no Google Play"
              >
                <Image
                  src="/images/google-play-badge.png"
                  alt="Disponível no Google Play"
                  width={140}
                  height={42}
                  className="h-[42px] w-auto"
                />
              </Link>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Phone frame */}
              <div className="relative h-[500px] w-[250px] rounded-[3rem] border-[8px] border-gray-900 bg-gray-900 shadow-2xl sm:h-[580px] sm:w-[280px]">
                {/* Screen */}
                <div className="absolute inset-2 overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-primary to-blue-600">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-6 py-3 text-white/80">
                    <span className="text-xs font-medium">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="h-2.5 w-2.5 rounded-full bg-white/80" />
                      <div className="h-2.5 w-4 rounded-sm bg-white/80" />
                    </div>
                  </div>

                  {/* App content preview */}
                  <div className="px-4 pt-4">
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Hoje</p>
                          <p className="text-2xl font-bold text-white">5 reservas</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-xl bg-white/10 p-3 backdrop-blur-sm"
                        >
                          <div className="h-10 w-10 rounded-full bg-white/20" />
                          <div className="flex-1">
                            <div className="h-3 w-24 rounded bg-white/30" />
                            <div className="mt-1.5 h-2 w-16 rounded bg-white/20" />
                          </div>
                          <div className="h-6 w-16 rounded-full bg-green-400/30" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notch */}
                <div className="absolute left-1/2 top-0 h-6 w-24 -translate-x-1/2 rounded-b-2xl bg-gray-900" />
              </div>

              {/* Decorative elements */}
              <div className="absolute -left-8 top-1/4 h-16 w-16 rounded-2xl bg-primary/20 blur-2xl" />
              <div className="absolute -right-8 bottom-1/4 h-20 w-20 rounded-full bg-blue-500/20 blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
