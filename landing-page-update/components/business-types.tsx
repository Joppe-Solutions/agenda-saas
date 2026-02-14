"use client"

import { motion, useInView } from "framer-motion"
import { useRef, type MouseEvent } from "react"
import {
  Scissors,
  Dumbbell,
  Stethoscope,
  UtensilsCrossed,
  Car,
  Briefcase,
} from "lucide-react"

const businesses = [
  {
    icon: Scissors,
    title: "Beleza e Estética",
    description: "Salões, barbearias, estúdios de estética.",
  },
  {
    icon: Dumbbell,
    title: "Quadras e Esportes",
    description: "Quadras poliesportivas, beach tennis, futebol.",
  },
  {
    icon: Stethoscope,
    title: "Estúdios e Espaços",
    description: "Coworkings, fotografia e salas de reunião.",
  },
  {
    icon: UtensilsCrossed,
    title: "Eventos por Temporada",
    description: "Shows, festivais e venda de ingressos.",
  },
  {
    icon: Car,
    title: "Veículos e Transporte",
    description: "Aluguel de carros, motos e bikes.",
  },
  {
    icon: Briefcase,
    title: "Serviços e Consultorias",
    description: "Assessoria, consultoria e serviços em geral.",
  },
]

export function BusinessTypes() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`)
  }

  return (
    <section className="relative py-28 px-4 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-medium text-[#0ea5e9] tracking-wider uppercase mb-4">
            Versatilidade
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Para todo tipo de negócio
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            De bares de praia a estúdios de yoga. O reserva.online se adapta ao seu negócio.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((biz, index) => (
            <motion.div
              key={biz.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              onMouseMove={handleMouseMove}
              className="group relative spotlight glow-card flex flex-col items-center text-center p-8 rounded-2xl bg-card/50 border border-border/50 hover:border-[#0ea5e9]/20 transition-all duration-500 backdrop-blur-sm"
            >
              <div className="relative z-10">
                <div className="p-4 rounded-2xl bg-[#0ea5e9]/[0.08] w-fit mx-auto mb-5 group-hover:bg-[#0ea5e9]/[0.12] transition-colors duration-300">
                  <biz.icon
                    className="w-6 h-6 text-[#0ea5e9] group-hover:text-[#38bdf8] transition-colors duration-300"
                    strokeWidth={1.5}
                  />
                </div>
                <h3
                  className="text-base font-semibold text-foreground mb-2 tracking-tight"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {biz.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{biz.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
