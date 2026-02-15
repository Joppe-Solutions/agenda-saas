"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { CheckCircle2, Ship, Dumbbell, Camera, Briefcase, Home, Car } from "lucide-react";

const useCases = [
  {
    title: "Barcos e Pescaria",
    description: "Alugue barcos para pesca esportiva, passeios ou mergulho.",
    image: "/images/barcos_e_pescaria.jpg",
    icon: Ship,
    color: "from-blue-500",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    title: "Quadras e Esportes",
    description: "Reserve quadras de tênis, futebol, vôlei ou academias.",
    image: "/images/quadras_e_esportes.jpg",
    icon: Dumbbell,
    color: "from-green-500",
    iconBg: "bg-green-500/20",
    iconColor: "text-green-400",
  },
  {
    title: "Estúdios e Espaços",
    description: "Alugue estúdios de fotografia, coworking ou salas.",
    image: "/images/estudios_e_espacos.jpg",
    icon: Camera,
    color: "from-purple-500",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    title: "Imóveis por Temporada",
    description: "Gerencie reservas de casas, chalés e apartamentos.",
    image: "/images/imoveis_por_temporada.jpg",
    icon: Home,
    color: "from-orange-500",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
  },
  {
    title: "Veículos e Transporte",
    description: "Alugue carros, motos, bikes ou ofereça transfers.",
    image: "/images/veiculos_e_transporte.jpg",
    icon: Car,
    color: "from-red-500",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
  },
  {
    title: "Serviços e Consultorias",
    description: "Agende consultas, sessões de terapia ou mentorias.",
    image: "/images/servicos_e_consultorias.jpg",
    icon: Briefcase,
    color: "from-indigo-500",
    iconBg: "bg-indigo-500/20",
    iconColor: "text-indigo-400",
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
    <section className="relative overflow-hidden py-20 sm:py-28 bg-dark-section">
      <div className="absolute inset-0 gradient-dark-section" />
      <div className="absolute inset-0 premium-grid opacity-15" />
      <div className="absolute inset-0 led-dots opacity-20" />
      
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="container relative mx-auto max-w-6xl px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-white">
            Para todo tipo de negócio
          </h2>
          <p className="mt-4 text-slate-400 text-lg">
            De barcos de pesca a estúdios de yoga. O agendae.me se adapta ao seu negócio.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={useCase.image}
                  alt={useCase.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${useCase.color} to-transparent`} />
                
                <div className={`absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl ${useCase.iconBg} backdrop-blur-sm`}>
                  <useCase.icon className={`h-5 w-5 ${useCase.iconColor}`} />
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white mb-1">{useCase.title}</h3>
                <p className="text-sm text-slate-400">{useCase.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 py-6 border-t border-slate-700/50">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}