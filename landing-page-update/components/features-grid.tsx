"use client"

import { motion, useInView } from "framer-motion"
import { useRef, type MouseEvent } from "react"
import {
  Calendar,
  QrCode,
  Users,
  BarChart3,
  Bell,
  Smartphone,
  Palette,
  Shield,
  Zap,
} from "lucide-react"

const features = [
  {
    icon: Calendar,
    title: "Calendário Inteligente",
    description:
      "Visualize todas as suas reservas em um calendário intuitivo. Evite conflitos e maximize a disponibilidade.",
  },
  {
    icon: QrCode,
    title: "Pagamentos com PIX",
    description:
      "Receba pagamentos automaticamente via PIX instantâneo. Confirmação automática e muito mais rápido.",
  },
  {
    icon: Users,
    title: "Gestão de Clientes",
    description:
      "Mantenha um banco de dados completo dos seus clientes. Histórico, preferências e muito mais.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Detalhados",
    description:
      "Acompanhe o desempenho do seu negócio com relatórios e estatísticas detalhadas em tempo real.",
  },
  {
    icon: Bell,
    title: "Notificações Automáticas",
    description:
      "Envie lembretes automáticos por e-mail. Reduza no-shows e melhore a sua ocupação.",
  },
  {
    icon: Smartphone,
    title: "100% Responsivo",
    description:
      "Acesse de qualquer dispositivo. Seus clientes podem reservar pelo celular, tablet ou computador.",
  },
  {
    icon: Palette,
    title: "Página Personalizada",
    description:
      "Tenha uma página própria de reservas com a sua marca. Compartilhe nas redes sociais.",
  },
  {
    icon: Shield,
    title: "Seguro e Confiável",
    description:
      "Seus dados ficam protegidos com criptografia. Backup automático e disponibilidade 24/7.",
  },
  {
    icon: Zap,
    title: "Setup Instantâneo",
    description:
      "Comece a aceitar reservas em minutos. Sem configuração complicada, sem código, sem dor de cabeça.",
  },
]

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0]
  index: number
}) {
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseMove={handleMouseMove}
      className="group relative spotlight glow-card p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-[#0ea5e9]/20 transition-all duration-500 backdrop-blur-sm"
    >
      <div className="relative z-10">
        <div className="p-3 rounded-xl bg-[#0ea5e9]/[0.08] w-fit mb-5 group-hover:bg-[#0ea5e9]/[0.12] transition-colors duration-300">
          <feature.icon
            className="w-5 h-5 text-[#0ea5e9] group-hover:text-[#38bdf8] transition-colors duration-300"
            strokeWidth={1.5}
          />
        </div>
        <h3
          className="text-base font-semibold text-foreground mb-2 tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {feature.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  )
}

export function FeaturesGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="recursos" className="relative py-28 px-4 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#0ea5e9]/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block text-sm font-medium text-[#0ea5e9] tracking-wider uppercase mb-4"
          >
            Recursos
          </motion.span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight text-balance"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Tudo que você precisa para
            <br />
            <span className="gradient-text">gerenciar reservas</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            Ferramentas poderosas e fáceis de usar para transformar a forma como você
            recebe e gerencia suas reservas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
