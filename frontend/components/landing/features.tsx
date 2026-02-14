"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, CreditCard, Users, BarChart3, Bell, Smartphone, Globe, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Calendar,
    title: "Calendário Inteligente",
    description: "Visualize todas as suas reservas em um calendário intuitivo.",
    badge: "Mais usado",
  },
  {
    icon: CreditCard,
    title: "Pagamentos com PIX",
    description: "Receba sinais e pagamentos via PIX instantâneo.",
    badge: "Automação",
  },
  {
    icon: Users,
    title: "Gestão de Clientes",
    description: "Mantenha um histórico completo dos seus clientes.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Detalhados",
    description: "Acompanhe faturamento e métricas importantes.",
  },
  {
    icon: Bell,
    title: "Notificações Automáticas",
    description: "Envie lembretes por WhatsApp ou e-mail.",
    badge: "Novo",
  },
  {
    icon: Smartphone,
    title: "100% Responsivo",
    description: "Acesse de qualquer dispositivo.",
  },
  {
    icon: Globe,
    title: "Página Personalizada",
    description: "Sua própria página de reservas com sua marca.",
  },
  {
    icon: Shield,
    title: "Seguro e Confiável",
    description: "Seus dados protegidos com criptografia.",
  },
  {
    icon: Zap,
    title: "Setup Instantâneo",
    description: "Comece a receber reservas em minutos.",
  },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          ref={ref}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 gradient-dark-section" />
          <div className="absolute inset-0 premium-grid opacity-15" />
          <div className="absolute inset-0 led-dots opacity-20" />
          
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative p-8 sm:p-12">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-white">
                Tudo que você precisa
              </h2>
              <p className="mt-4 text-slate-400 text-lg">
                Ferramentas poderosas para transformar a forma como você gerencia reservas.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card className="h-full bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                          <feature.icon className="h-5 w-5 text-primary" />
                        </div>
                        {feature.badge && (
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
                            {feature.badge}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-3 text-white">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-slate-400">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}