"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Smartphone, CalendarCheck, Bell, QrCode, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const appFeatures = [
  {
    icon: CalendarCheck,
    title: "Gerencie agendamentos",
    description: "Acompanhe todos os seus agendamentos em tempo real.",
  },
  {
    icon: Bell,
    title: "Notificações em tempo real",
    description: "Receba notificações de novos agendamentos instantaneamente.",
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
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

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
          
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative p-8 md:p-12 lg:p-16">
            <div className="flex flex-col items-center text-center gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30"
              >
                <Smartphone className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">Em Breve</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight"
              >
                Leve o agendae.me
                <span className="block text-primary">no seu bolso</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-slate-400 max-w-md leading-relaxed"
              >
                Estamos desenvolvendo nosso aplicativo mobile para Android e iOS. 
                Cadastre-se para ser notificado quando lançar.
              </motion.p>

              <div className="grid gap-4 sm:grid-cols-3 w-full max-w-2xl">
                {appFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="p-2.5 rounded-xl bg-primary/20 mb-3">
                      <feature.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="w-full max-w-md"
              >
                {submitted ? (
                  <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-green-500/20 border border-green-500/30">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">Você será notificado!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      required
                    />
                    <Button type="submit" className="shrink-0">
                      Me avise
                    </Button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}