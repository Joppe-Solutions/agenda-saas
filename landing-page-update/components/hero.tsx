"use client"

import { motion } from "framer-motion"
import { ArrowRight, CreditCard, QrCode, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

const textRevealVariants = {
  hidden: { y: "100%" },
  visible: (i: number) => ({
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.3 + i * 0.12,
    },
  }),
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-28 pb-20 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 grid-pattern" />

      {/* Animated gradient orbs */}
      <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-[#0ea5e9]/[0.04] rounded-full blur-[120px] animate-float-orb pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-[#38bdf8]/[0.03] rounded-full blur-[150px] animate-float-orb-delayed pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-[#0ea5e9]/[0.05] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#0ea5e9]/[0.08] border border-[#0ea5e9]/20 backdrop-blur-sm mb-10"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0ea5e9] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0ea5e9]" />
          </span>
          <span className="text-sm text-[#38bdf8] font-medium tracking-wide">
            {"Nova integração com PIX automático"}
          </span>
        </motion.div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.05]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="block overflow-hidden">
            <motion.span
              className="block text-foreground"
              variants={textRevealVariants}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              Reservas online
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="block gradient-text"
              variants={textRevealVariants}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              simples e profissionais
            </motion.span>
          </span>
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Transforme seu negócio com um sistema de reservas completo.
          Gerencie agendamentos, receba pagamentos via PIX e ofereça uma
          experiência incrível aos seus clientes.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <Button
            size="lg"
            className="shimmer-btn bg-[#0ea5e9] text-white hover:bg-[#38bdf8] rounded-xl px-8 h-13 text-base font-medium shadow-xl shadow-[#0ea5e9]/25 hover:shadow-[#0ea5e9]/40 transition-all duration-300 hover:scale-[1.02]"
          >
            {"Começar Gratuitamente"}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl px-8 h-13 text-base font-medium border-border text-muted-foreground hover:bg-card hover:text-foreground hover:border-[#0ea5e9]/30 bg-transparent transition-all duration-300"
          >
            Ver Como Funciona
          </Button>
        </motion.div>

        {/* Feature badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85 }}
          className="flex flex-wrap items-center justify-center gap-6 mb-16"
        >
          {[
            { icon: CreditCard, text: "Sem taxa de uso" },
            { icon: QrCode, text: "Pagamentos via PIX" },
            { icon: Users, text: "Suporte para grupos" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-sm text-muted-foreground">
              <item.icon className="w-4 h-4 text-[#0ea5e9]" />
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Hero Image with premium frame */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Glow behind image */}
          <div className="absolute -inset-4 bg-gradient-to-b from-[#0ea5e9]/10 via-[#0ea5e9]/5 to-transparent rounded-3xl blur-2xl pointer-events-none" />

          <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-black/40">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-card/80 backdrop-blur-sm border-b border-border/50">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]/60" />
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]/60" />
                <div className="w-3 h-3 rounded-full bg-[#22c55e]/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-lg bg-secondary/50 text-xs text-muted-foreground font-mono">
                  reserva.online/dashboard
                </div>
              </div>
            </div>

            <img
              src="/hero-reserva.jpg"
              alt="Dashboard do sistema reserva.online mostrando calendário de reservas"
              className="w-full h-auto object-cover aspect-[16/9]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
