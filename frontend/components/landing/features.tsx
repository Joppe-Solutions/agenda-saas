"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, CreditCard, Users, BarChart3, Bell, Smartphone, Globe, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Calendar,
    title: "Calendário Inteligente",
    description: "Visualize todas as suas reservas em um calendário intuitivo. Evite conflitos e maximize sua ocupação.",
  },
  {
    icon: CreditCard,
    title: "Pagamentos com PIX",
    description: "Receba sinais e pagamentos completos via PIX instantâneo. Confirmação automática e segura.",
  },
  {
    icon: Users,
    title: "Gestão de Clientes",
    description: "Mantenha um histórico completo dos seus clientes. Preferências, reservas anteriores e contatos.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Detalhados",
    description: "Acompanhe seu faturamento, taxa de ocupação e métricas importantes do seu negócio.",
  },
  {
    icon: Bell,
    title: "Notificações Automáticas",
    description: "Envie lembretes por WhatsApp ou e-mail. Reduza no-shows e melhore a comunicação.",
  },
  {
    icon: Smartphone,
    title: "100% Responsivo",
    description: "Acesse de qualquer dispositivo. Seus clientes podem reservar pelo celular facilmente.",
  },
  {
    icon: Globe,
    title: "Página Personalizada",
    description: "Tenha sua própria página de reservas com sua marca. Compartilhe nas redes sociais.",
  },
  {
    icon: Shield,
    title: "Seguro e Confiável",
    description: "Seus dados protegidos com criptografia. Backup automático e disponibilidade 24/7.",
  },
  {
    icon: Zap,
    title: "Setup Instantâneo",
    description: "Comece a receber reservas em minutos. Sem complicação, sem código, sem dor de cabeça.",
  },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="recursos" className="border-t bg-muted/30 py-16 sm:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Tudo que você precisa para gerenciar reservas
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base lg:text-lg">
            Ferramentas poderosas e fáceis de usar para transformar a forma como você recebe e gerencia suas reservas.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Card className="border-0 bg-card/50 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                <CardHeader className="pb-2 sm:pb-4">
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 sm:h-10 sm:w-10">
                    <feature.icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs leading-relaxed sm:text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
