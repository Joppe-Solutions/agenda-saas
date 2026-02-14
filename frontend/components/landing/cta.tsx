import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="border-t bg-primary py-24 text-primary-foreground">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Pronto para transformar seu negócio?
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80">
          Junte-se a centenas de empresários que já simplificaram suas reservas.
          Comece gratuitamente, sem compromisso.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" variant="secondary" className="h-12 px-8 text-base" asChild>
            <Link href="/sign-up">
              Criar Conta Gratuita
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 border-primary-foreground/20 bg-transparent px-8 text-base text-primary-foreground hover:bg-primary-foreground/10"
            asChild
          >
            <Link href="mailto:contato@reserva.online">Falar com um Especialista</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
