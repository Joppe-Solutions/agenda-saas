import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-mesh" />

      <div className="container relative mx-auto max-w-6xl px-4 py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs sm:mb-6 sm:px-4 sm:py-1.5 sm:text-sm">
            Novo: Integração com PIX automático
          </Badge>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Reservas online
            <span className="block bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              simples e profissionais
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg md:text-xl">
            Transforme seu negócio com um sistema de reservas completo.
            Gerencie agendamentos, receba pagamentos via PIX e ofereça
            uma experiência incrível aos seus clientes.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <Button size="lg" className="h-11 w-full px-6 text-sm sm:h-12 sm:w-auto sm:px-8 sm:text-base" asChild>
              <Link href="/sign-up">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-11 w-full px-6 text-sm sm:h-12 sm:w-auto sm:px-8 sm:text-base" asChild>
              <Link href="#como-funciona">Ver Como Funciona</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground sm:mt-10 sm:gap-x-8 sm:text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Sem taxa de setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Pagamentos via PIX</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Suporte em português</span>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative mx-auto mt-12 max-w-4xl sm:mt-16">
          <div className="overflow-hidden rounded-xl border bg-card shadow-2xl shadow-primary/10">
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
                title="Vídeo demonstrativo do reserva.online"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
          {/* Glow effect */}
          <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-primary/20 via-blue-400/20 to-primary/20 opacity-50 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
