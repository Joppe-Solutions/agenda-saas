import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Image
        src="/hero-bg.png"
        alt=""
        fill
        className="object-cover object-center"
        priority
        quality={90}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-900/70 to-navy-950/90" />

      <div className="container relative mx-auto max-w-6xl px-4 py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="info" className="mb-4 px-4 py-1.5 text-xs sm:mb-6 sm:text-sm">
            Novo: Integração com PIX automático
          </Badge>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Reservas online
            <span className="block bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
              simples e profissionais
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-white/70 sm:mt-6 sm:text-lg md:text-xl">
            Transforme seu negócio com um sistema de reservas completo.
            Gerencie agendamentos, receba pagamentos via PIX e ofereça
            uma experiência incrível aos seus clientes.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <Button size="lg" className="h-12 w-full px-8 text-base sm:w-auto" asChild>
              <Link href="/sign-up">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 w-full px-8 text-base border-white/30 text-white hover:bg-white/10 sm:w-auto" asChild>
              <Link href="#como-funciona">Ver Como Funciona</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/60 sm:mt-10 sm:gap-x-8 sm:text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span>Sem taxa de setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span>Pagamentos via PIX</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span>Suporte em português</span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-12 max-w-4xl sm:mt-16">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-card/80 backdrop-blur-sm shadow-lg">
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/LXb3EKWsInQ?rel=0&modestbranding=1&autoplay=1&mute=1&loop=1&playlist=LXb3EKWsInQ"
                title="Vídeo demonstrativo do reserva.online"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
          <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-cyan-500/20 via-cyan-400/30 to-cyan-500/20 opacity-60 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
