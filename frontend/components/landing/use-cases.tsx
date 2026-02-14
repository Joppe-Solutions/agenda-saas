"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Ship, Dumbbell, Camera, Briefcase, Home, Car, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const useCases = [
  {
    icon: Ship,
    title: "Barcos e Pescaria",
    description: "Alugue barcos para pesca esportiva, passeios ou mergulho.",
    color: "from-blue-500/20 to-blue-600/10",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-500",
  },
  {
    icon: Dumbbell,
    title: "Quadras e Esportes",
    description: "Reserve quadras de tênis, futebol, vôlei ou academias.",
    color: "from-green-500/20 to-green-600/10",
    borderColor: "border-green-500/30",
    iconColor: "text-green-500",
  },
  {
    icon: Camera,
    title: "Estúdios e Espaços",
    description: "Alugue estúdios de fotografia, coworking ou salas.",
    color: "from-purple-500/20 to-purple-600/10",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-500",
  },
  {
    icon: Home,
    title: "Imóveis por Temporada",
    description: "Gerencie reservas de casas, chalés e apartamentos.",
    color: "from-orange-500/20 to-orange-600/10",
    borderColor: "border-orange-500/30",
    iconColor: "text-orange-500",
  },
  {
    icon: Car,
    title: "Veículos e Transporte",
    description: "Alugue carros, motos, bikes ou ofereça transfers.",
    color: "from-red-500/20 to-red-600/10",
    borderColor: "border-red-500/30",
    iconColor: "text-red-500",
  },
  {
    icon: Briefcase,
    title: "Serviços e Consultorias",
    description: "Agende consultas, sessões de terapia ou mentorias.",
    color: "from-indigo-500/20 to-indigo-600/10",
    borderColor: "border-indigo-500/30",
    iconColor: "text-indigo-500",
  },
];

const stats = [
  { value: "10.000+", label: "Negócios atendidos" },
  { value: "500.000+", label: "Reservas processadas" },
  { value: "2 min", label: "Tempo médio de setup" },
];

export function UseCases() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 hero-grid-pattern opacity-20" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-400/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="container relative mx-auto max-w-6xl px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Para todo tipo de negócio
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            De barcos de pesca a estúdios de yoga. O reserva.online se adapta ao seu negócio.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Card className={`h-full border ${useCase.borderColor} bg-gradient-to-br ${useCase.color} shadow-sm hover:shadow-md transition-all`}>
                <CardContent className="flex items-start gap-4 p-6">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background/50 ${useCase.iconColor}`}>
                    <useCase.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{useCase.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{useCase.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-8 sm:gap-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
