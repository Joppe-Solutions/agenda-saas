"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CalendarCheck, CreditCard, Headphones } from "lucide-react";

const socialProof = [
  { icon: CalendarCheck, text: "20+ reservas hoje" },
  { icon: CreditCard, text: "PIX confirmado" },
  { icon: Headphones, text: "Suporte online" },
];

export function Hero() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative overflow-hidden pt-20 min-h-[90vh] flex items-center bg-dark-section">
      <div className="absolute inset-0 gradient-dark-section" />
      <div className="absolute inset-0 premium-grid opacity-20" />
      <div className="absolute inset-0 led-dots opacity-30" />
      
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative mx-auto max-w-6xl px-4 py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 px-4 py-1.5 text-xs sm:mb-6 sm:text-sm bg-primary/20 border-primary/30 text-primary">
              Novo: Integração com PIX automático
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-dark-fg"
          >
            Reservas online
            <span className="block bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              simples e profissionais
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-dark-muted sm:text-xl"
          >
            Transforme seu negócio com um sistema de reservas completo. 
            Gerencie agendamentos e receba pagamentos via PIX.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4"
          >
            <Button size="lg" className="h-12 w-full px-8 text-base sm:w-auto shadow-lg shadow-primary/25 hover:shadow-primary/40" asChild>
              <Link href="/sign-up">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 w-full px-8 text-base sm:w-auto bg-transparent border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="#como-funciona">Ver Como Funciona</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8"
          >
            {socialProof.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-dark-muted">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative mx-auto mt-16 max-w-4xl"
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-cyan-400/20 to-primary/20 rounded-3xl blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-dark-border bg-dark-card shadow-xl">
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/LXb3EKWsInQ?rel=0&modestbranding=1&autoplay=1&mute=1&loop=1&playlist=LXb3EKWsInQ"
                title="Vídeo demonstrativo do reserva.online"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}