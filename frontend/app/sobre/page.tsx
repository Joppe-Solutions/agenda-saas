import Link from "next/link";
import { ArrowLeft, Users, Target, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo variant="full" size="sm" />
          </Link>
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Home
            </Link>
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden border-b bg-background py-16 sm:py-20">
        <div className="absolute inset-0 hero-grid-pattern opacity-20" />
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container relative mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Sobre o reserva.online
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground text-lg">
            Nascemos com a missão de simplificar a vida de quem trabalha com reservas.
            De barcos de pesca a estúdios de fotografia, queremos que você foque no que
            realmente importa: seu negócio.
          </p>
        </div>
      </section>

      <main className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border/50 bg-card/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Nossa Missão</h3>
              <p className="mt-2 text-muted-foreground">
                Democratizar o acesso a ferramentas profissionais de gestão de reservas,
                permitindo que qualquer empreendedor gerencie seu negócio de forma eficiente.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Nossos Valores</h3>
              <p className="mt-2 text-muted-foreground">
                Simplicidade, transparência e foco no cliente. Acreditamos que tecnologia
                deve facilitar a vida, não complicá-la.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Nossa Equipe</h3>
              <p className="mt-2 text-muted-foreground">
                Somos uma equipe apaixonada por tecnologia e empreendedorismo, trabalhando
                para criar a melhor solução de reservas do Brasil.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 relative overflow-hidden rounded-2xl bg-primary p-8 text-center text-primary-foreground sm:p-12">
          <div className="absolute inset-0 hero-grid-pattern opacity-10" />
          <div className="relative">
            <h2 className="text-2xl font-bold sm:text-3xl">Pronto para começar?</h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Junte-se a milhares de empreendedores que já transformaram a forma como gerenciam suas reservas.
            </p>
            <Button size="lg" variant="secondary" className="mt-8" asChild>
              <Link href="/sign-up">Criar Conta Gratuita</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t bg-muted/30">
        <div className="container mx-auto max-w-4xl px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} reserva.online. Todos os direitos reservados.</p>
          <div className="mt-4 flex justify-center gap-6">
            <Link href="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-foreground transition-colors">Termos</Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
