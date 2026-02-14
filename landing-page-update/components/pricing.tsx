"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Gratuito",
    description: "Perfeito para começar",
    price: "0",
    period: "/mês",
    features: [
      "Até 20 reservas/mês",
      "Calendário publicado",
      "Página de reservas",
      "Wi-Fi com WhatsApp",
      "Suporte por e-mail",
    ],
    cta: "Comece Grátis",
    highlighted: false,
  },
  {
    name: "Profissional",
    description: "Para negócios em crescimento",
    price: "79",
    period: "/mês",
    features: [
      "Reservas ilimitadas",
      "Até 10 serviços",
      "Página de e-mails extras",
      "PIX automático",
      "Suporte prioritário",
      "Exportar relatórios",
      "Chat de atendimento",
    ],
    cta: "Teste Grátis",
    highlighted: true,
  },
  {
    name: "Empresarial",
    description: "Para grandes operações",
    price: "199",
    period: "/mês",
    features: [
      "Tudo do Profissional",
      "API de integração",
      "Múltiplos serviços",
      "Suporte web-call",
      "Termos em exibição",
    ],
    cta: "Fale com Vendas",
    highlighted: false,
  },
]

function BorderBeam() {
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
      <div
        className="absolute w-20 h-20 bg-[#0ea5e9]/40 blur-xl border-beam"
        style={{
          offsetPath: "rect(0 100% 100% 0 round 16px)",
        }}
      />
    </div>
  )
}

export function Pricing() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="precos" className="relative py-28 px-4 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#0ea5e9]/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-medium text-[#0ea5e9] tracking-wider uppercase mb-4">
            Precos
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Planos que cabem no seu bolso
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            {"Comece grátis e escale conforme seu negócio cresce. Sem surpresas."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: 0.1 + index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`relative p-8 rounded-2xl border transition-all duration-500 ${
                plan.highlighted
                  ? "bg-card border-[#0ea5e9]/30 shadow-2xl shadow-[#0ea5e9]/10 md:-mt-4 md:mb-[-16px]"
                  : "bg-card/50 border-border/50 hover:border-[#0ea5e9]/15 backdrop-blur-sm"
              }`}
            >
              {plan.highlighted && <BorderBeam />}

              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white text-xs font-semibold rounded-full shadow-lg shadow-[#0ea5e9]/30">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="relative z-10">
                <div className="mb-8">
                  <h3
                    className="text-xl font-semibold text-foreground mb-1.5"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-muted-foreground font-medium">R$</span>
                    <span
                      className="text-5xl font-bold text-foreground tracking-tight"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3.5 mb-10">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-foreground/80">
                      <div className="w-5 h-5 rounded-full bg-[#0ea5e9]/10 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-[#0ea5e9]" strokeWidth={2.5} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full rounded-xl h-12 font-medium transition-all duration-300 ${
                    plan.highlighted
                      ? "shimmer-btn bg-[#0ea5e9] text-white hover:bg-[#38bdf8] shadow-lg shadow-[#0ea5e9]/20 hover:shadow-[#0ea5e9]/40"
                      : "bg-secondary text-foreground hover:bg-secondary/80 border border-border/50"
                  }`}
                >
                  {plan.cta}
                  {plan.highlighted && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-10"
        >
          Todos os planos incluem SSL gratuito, backups diários e atualizações automáticas.
        </motion.p>
      </div>
    </section>
  )
}
