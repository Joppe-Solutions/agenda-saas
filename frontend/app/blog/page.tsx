import Link from "next/link";
import { CalendarCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogPage() {
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

      {/* Content */}
      <main className="container mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CalendarCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
          Blog em breve
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          Estamos preparando conteúdos incríveis sobre gestão de reservas,
          dicas de negócios e muito mais. Fique ligado!
        </p>
        <Button className="mt-8" asChild>
          <Link href="/">Voltar para Home</Link>
        </Button>
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
