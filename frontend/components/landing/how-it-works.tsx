"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { UserPlus, Settings, Share2, Banknote } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Crie sua conta",
    description: "Cadastre-se gratuitamente em menos de 1 minuto. Sem cartão de crédito necessário.",
  },
  {
    step: "02",
    icon: Settings,
    title: "Configure seus serviços",
    description: "Adicione seus barcos, quadras, salas ou qualquer recurso que você aluga. Defina preços e horários.",
  },
  {
    step: "03",
    icon: Share2,
    title: "Compartilhe seu link",
    description: "Receba uma página personalizada para compartilhar no WhatsApp, Instagram ou onde quiser.",
  },
  {
    step: "04",
    icon: Banknote,
    title: "Receba reservas",
    description: "Clientes reservam e pagam online. Você recebe notificações e o dinheiro cai direto na sua conta.",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="como-funciona" className="py-16 sm:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Como funciona
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base lg:text-lg">
            Em 4 passos simples você está pronto para receber reservas online.
          </p>
        </motion.div>

        <div className="mt-10 space-y-8 sm:mt-16 lg:hidden">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                {index < steps.length - 1 && (
                  <div className="mt-2 h-full w-px bg-gradient-to-b from-primary/50 to-transparent" />
                )}
              </div>
              <div className="pb-8">
                <span className="text-3xl font-bold text-primary/20">{step.step}</span>
                <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative mt-16 hidden lg:block">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary/50 via-primary to-primary/50" />

          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`relative flex gap-12 ${
                  index % 2 === 1 ? "flex-row-reverse" : ""
                }`}
              >
                <div className={`flex-1 ${index % 2 === 1 ? "text-right" : ""}`}>
                  <div
                    className={`inline-flex items-center gap-4 ${
                      index % 2 === 1 ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span className="text-4xl font-bold text-primary/20">{step.step}</span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 max-w-md text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-background bg-primary" />

                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
