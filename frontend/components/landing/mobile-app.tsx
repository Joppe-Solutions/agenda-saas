"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Smartphone, CalendarCheck, Bell, QrCode } from "lucide-react";

const appFeatures = [
  {
    icon: CalendarCheck,
    title: "Gerencie reservas",
    description: "Acompanhe todas as suas reservas e agendamentos em tempo real.",
  },
  {
    icon: Bell,
    title: "Notificações em tempo real",
    description: "Receba notificações de novas reservas instantaneamente.",
  },
  {
    icon: QrCode,
    title: "Check-in rápido",
    description: "Confirme a presença dos clientes com QR Code.",
  },
];

export function MobileApp() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 bg-muted/30" id="app">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 gradient-dark-section" />
          <div className="absolute inset-0 premium-grid opacity-15" />
          <div className="absolute inset-0 led-dots opacity-20" />
          
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative p-8 md:p-12 lg:p-16">
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 mb-8"
                >
                  <Smartphone className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">Aplicativo Mobile</span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight leading-tight"
                >
                  Leve o reserva.online
                </motion.h2>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-8 tracking-tight"
                >
                  no seu bolso
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-slate-400 mb-10 max-w-md leading-relaxed"
                >
                  Baixe nosso aplicativo e tenha controle total das suas reservas
                  onde você estiver. Disponível para Android e iOS.
                </motion.p>

                <div className="space-y-6 mb-10">
                  {appFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      <div className="p-2.5 rounded-xl bg-primary/20 shrink-0">
                        <feature.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white mb-1">{feature.title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="flex items-center gap-3"
                >
                  <Link
                    href="#"
                    className="inline-flex items-center gap-2.5 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-opacity"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    App Store
                  </Link>
                  <Link
                    href="#"
                    className="inline-flex items-center gap-2.5 px-5 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl font-medium text-sm hover:bg-slate-700 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.065 12l2.633-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
                    </svg>
                    Google Play
                  </Link>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40, rotateY: -5 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex-shrink-0"
              >
                <div className="relative">
                  <div className="absolute -inset-8 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

                  <div className="relative w-[280px] h-[560px] bg-slate-800 rounded-[3rem] border-2 border-slate-700 shadow-2xl overflow-hidden p-3">
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-800 rounded-full z-20" />

                    <div className="w-full h-full rounded-[2.5rem] bg-gradient-to-b from-slate-700 to-slate-800 overflow-hidden flex flex-col">
                      <div className="pt-10 px-6 pb-4 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
                          <CalendarCheck className="w-7 h-7 text-primary" />
                        </div>
                        <p className="text-white font-semibold text-lg">
                          reserva.online
                        </p>
                        <p className="text-slate-400 text-sm mt-0.5">5 reservas hoje</p>
                      </div>

                      <div className="flex-1 px-4 pb-6 space-y-3 overflow-hidden">
                        {[
                          { name: "Maria Silva", time: "09:00", color: "#22c55e" },
                          { name: "João Santos", time: "10:30", color: "#00C8FF" },
                          { name: "Ana Costa", time: "14:00", color: "#f59e0b" },
                        ].map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/50 border border-slate-700"
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm"
                              style={{ backgroundColor: `${item.color}20`, color: item.color }}
                            >
                              {item.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{item.name}</p>
                              <p className="text-xs text-slate-400">{item.time}</p>
                            </div>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}