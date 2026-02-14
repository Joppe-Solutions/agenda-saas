"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { UserPlus, Settings, Share2, Banknote, CheckCircle2 } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Crie sua conta",
    description: "Cadastre-se gratuitamente em menos de 1 minuto.",
  },
  {
    step: "02",
    icon: Settings,
    title: "Configure seus serviços",
    description: "Adicione seus recursos e defina preços e horários.",
  },
  {
    step: "03",
    icon: Share2,
    title: "Compartilhe seu link",
    description: "Receba uma página personalizada para compartilhar.",
  },
  {
    step: "04",
    icon: Banknote,
    title: "Receba reservas",
    description: "Clientes reservam e pagam online automaticamente.",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="como-funciona" className="relative overflow-hidden py-20 sm:py-28 bg-muted/30">
      <div className="absolute inset-0" />
      
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Como funciona
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Em 4 passos simples você está pronto para receber reservas.
          </p>
        </motion.div>

        <div className="space-y-6 sm:mt-16 lg:hidden">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <step.icon className="h-6 w-6" />
                </div>
                {index < steps.length - 1 && (
                  <div className="mt-3 h-12 w-px bg-gradient-to-b from-primary/50 to-transparent" />
                )}
              </div>
              <div className="flex-1 pb-8">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-primary">{step.step}</span>
                  <span className="text-lg font-semibold">{step.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

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
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-primary">{step.step}</span>
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                    </div>
                  </div>
                  <p className={`mt-2 max-w-md text-muted-foreground ${index % 2 === 1 ? "ml-16" : "mr-16"}`}>
                    {step.description}
                  </p>
                </div>

                <div className="absolute left-1/2 top-2 h-3 w-3 -translate-x-1/2 rounded-full bg-primary" />

                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
