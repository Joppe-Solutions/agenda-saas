"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinalCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="relative py-28 px-4 overflow-hidden">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-6xl mx-auto"
      >
        {/* Background card */}
        <div className="relative rounded-3xl overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0369a1] via-[#0ea5e9] to-[#38bdf8]" />

          {/* Noise overlay for texture */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />

          {/* Glow accents */}
          <div className="absolute -top-20 -left-20 w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-[#0369a1]/40 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight text-balance"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {"Pronto para transformar seu negócio?"}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-base sm:text-lg text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              {"Junte-se a centenas de empreendedores que já simplificaram suas reservas. Comece gratuitamente, sem compromisso."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="bg-white text-[#0369a1] hover:bg-white/90 rounded-xl px-8 h-14 text-base font-semibold shadow-xl shadow-black/10 hover:scale-[1.02] transition-all duration-300"
              >
                {"Criar Conta Gratuita"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl px-8 h-14 text-base font-medium border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-transparent transition-all duration-300"
              >
                Falar com Especialista
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
