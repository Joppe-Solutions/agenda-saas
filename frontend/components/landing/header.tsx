"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarCheck } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <CalendarCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">reserva.online</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#recursos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Recursos
          </Link>
          <Link href="#como-funciona" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Como Funciona
          </Link>
          <Link href="#precos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Preços
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Começar Grátis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
