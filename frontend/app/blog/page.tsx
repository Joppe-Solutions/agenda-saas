import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function BlogPage() {
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

      <main className="container mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-24 text-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
        </div>
        <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">
          Blog em breve
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground text-lg">
          Estamos preparando conteúdos incríveis sobre gestão de reservas,
          dicas de negócios e muito mais. Fique ligado!
        </p>
        <Button size="lg" className="mt-8" asChild>
          <Link href="/">Voltar para Home</Link>
        </Button>
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
