"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { UserPlus, Settings, Share2, CalendarCheck } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Crie sua conta",
    description:
      "Cadastre-se gratuitamente em menos de 5 minutos. Sem cartão de crédito necessário.",
  },
  {
    number: "02",
    icon: Settings,
    title: "Configure seus serviços",
    description:
      "Adicione seus horários, serviços, valores e tudo o que você precisa. Simples e intuitivo.",
  },
  {
    number: "03",
    icon: Share2,
    title: "Compartilhe seu link",
    description:
      "Receba uma página personalizada para compartilhar via WhatsApp, Instagram ou onde quiser.",
  },
  {
    number: "04",
    icon: CalendarCheck,
    title: "Receba reservas",
    description:
      "Clientes começam a reservar e pagar online. Você recebe notificações e o dinheiro na sua conta.",
  },
]

export function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="como-funciona" className="relative py-28 px-4 overflow-hidden">
      {/* Subtle divider gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-sm font-medium text-[#0ea5e9] tracking-wider uppercase mb-4">
            Passo a passo
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Como funciona
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            Em 4 passos simples você está pronto para receber reservas online.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-8 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-gradient-to-b from-[#0ea5e9]/40 via-border to-transparent hidden sm:block" />

          <div className="space-y-16 sm:space-y-24">
            {steps.map((step, index) => {
              const isRight = index % 2 !== 0

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`relative flex items-center gap-8 ${
                    isRight ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content card */}
                  <div className={`flex-1 ${isRight ? "md:text-right" : ""}`}>
                    <div
                      className={`relative p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-[#0ea5e9]/20 transition-all duration-500 max-w-md ${
                        isRight ? "md:ml-auto" : ""
                      }`}
                    >
                      <div className={`flex items-center gap-3 mb-4 ${isRight ? "md:flex-row-reverse" : ""}`}>
                        <span className="text-xs font-mono text-[#0ea5e9] bg-[#0ea5e9]/[0.08] px-2.5 py-1 rounded-lg tracking-wider">
                          {step.number}
                        </span>
                      </div>
                      <h3
                        className="text-xl font-semibold text-foreground mb-3 tracking-tight"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Center node */}
                  <div className="hidden md:flex items-center justify-center w-14 h-14 rounded-2xl bg-card border border-border/50 z-10 shrink-0 shadow-lg shadow-black/10">
                    <step.icon className="w-6 h-6 text-[#0ea5e9]" strokeWidth={1.5} />
                  </div>

                  {/* Empty spacer */}
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
