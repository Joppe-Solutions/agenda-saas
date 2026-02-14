import Link from "next/link";
import { CalendarCheck, ArrowLeft, Users, Target, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary sm:h-8 sm:w-8">
              <CalendarCheck className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5" />
            </div>
            <span className="text-lg font-bold sm:text-xl">reserva.online</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b bg-muted/30 py-12 sm:py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Sobre o reserva.online
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base lg:text-lg">
            Nascemos com a missão de simplificar a vida de quem trabalha com reservas.
            De barcos de pesca a estúdios de fotografia, queremos que você foque no que
            realmente importa: seu negócio.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="border-0 bg-muted/30">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Nossa Missão</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Democratizar o acesso a ferramentas profissionais de gestão de reservas,
                permitindo que qualquer empreendedor gerencie seu negócio de forma eficiente.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-muted/30">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Nossos Valores</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Simplicidade, transparência e foco no cliente. Acreditamos que tecnologia
                deve facilitar a vida, não complicá-la.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-muted/30">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Nossa Equipe</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Somos uma equipe apaixonada por tecnologia e empreendedorismo, trabalhando
                para criar a melhor solução de reservas do Brasil.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 rounded-xl bg-primary p-8 text-center text-primary-foreground sm:p-12">
          <h2 className="text-xl font-bold sm:text-2xl">Pronto para começar?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
            Junte-se a centenas de empreendedores que já transformaram a forma como gerenciam suas reservas.
          </p>
          <Button size="lg" variant="secondary" className="mt-6" asChild>
            <Link href="/sign-up">Criar Conta Gratuita</Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto max-w-4xl px-4 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} reserva.online. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
