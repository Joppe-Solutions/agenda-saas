"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 bg-dark-section">
      <div className="absolute inset-0 gradient-dark-section" />
      <div className="absolute inset-0 premium-grid opacity-15" />
      <div className="absolute inset-0 led-dots opacity-20" />
      
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container relative mx-auto max-w-4xl px-4 text-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-dark-fg">
            Pronto para transformar seu negócio?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-dark-muted text-lg">
            Comece gratuitamente em 2 minutos. Sem cartão de crédito.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40" asChild>
            <Link href="/sign-up">
              Criar Conta Gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 text-base bg-transparent border-white/20 text-white hover:bg-white/10"
            asChild
          >
            <Link href="mailto:contato@reserva.online">Falar com Especialista</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}