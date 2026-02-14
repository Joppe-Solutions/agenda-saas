import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="border-t bg-primary py-16 text-primary-foreground sm:py-24">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
          Pronto para transformar seu negócio?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-primary-foreground/80 sm:mt-6 sm:text-base lg:text-lg">
          Junte-se a centenas de empresários que já simplificaram suas reservas.
          Comece gratuitamente, sem compromisso.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
          <Button size="lg" variant="secondary" className="h-11 w-full px-6 text-sm sm:h-12 sm:w-auto sm:px-8 sm:text-base" asChild>
            <Link href="/sign-up">
              Criar Conta Gratuita
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 w-full border-primary-foreground/20 bg-transparent px-6 text-sm text-primary-foreground hover:bg-primary-foreground/10 sm:h-12 sm:w-auto sm:px-8 sm:text-base"
            asChild
          >
            <Link href="mailto:contato@reserva.online">Falar com Especialista</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
