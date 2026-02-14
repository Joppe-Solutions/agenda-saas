import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-mesh" />

      <div className="container relative mx-auto max-w-6xl px-4 py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            Novo: Integração com PIX automático
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Reservas online
            <span className="block bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              simples e profissionais
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Transforme seu negócio com um sistema de reservas completo.
            Gerencie agendamentos, receba pagamentos via PIX e ofereça
            uma experiência incrível aos seus clientes.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/sign-up">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link href="#como-funciona">Ver Como Funciona</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
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

        {/* Dashboard preview placeholder */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="overflow-hidden rounded-xl border bg-card shadow-2xl shadow-primary/10">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-4 text-xs text-muted-foreground">dashboard.reserva.online</span>
            </div>
            <div className="aspect-[16/9] bg-gradient-to-br from-muted/50 to-muted p-8">
              <div className="grid h-full grid-cols-3 gap-4">
                <div className="col-span-2 space-y-4">
                  <div className="h-8 w-48 animate-pulse rounded-lg bg-primary/10" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 rounded-lg bg-card shadow-sm" />
                    <div className="h-24 rounded-lg bg-card shadow-sm" />
                    <div className="h-24 rounded-lg bg-card shadow-sm" />
                  </div>
                  <div className="h-48 rounded-lg bg-card shadow-sm" />
                </div>
                <div className="space-y-4">
                  <div className="h-32 rounded-lg bg-card shadow-sm" />
                  <div className="h-40 rounded-lg bg-card shadow-sm" />
                </div>
              </div>
            </div>
          </div>
          {/* Glow effect */}
          <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-primary/20 via-blue-400/20 to-primary/20 opacity-50 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
