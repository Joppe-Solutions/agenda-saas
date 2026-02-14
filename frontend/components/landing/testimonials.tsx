"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Eduardo",
    role: "Proprietário de Marina",
    location: "Angra dos Reis, RJ",
    content: "Antes eu perdia reservas por não conseguir acompanhar tudo no WhatsApp. Agora tenho tudo organizado e recebo pagamentos antecipados. Aumentei meu faturamento em 40% no primeiro mês.",
    rating: 5,
  },
  {
    name: "Mariana Silva",
    role: "Personal Trainer",
    location: "São Paulo, SP",
    content: "Uso para agendar minhas consultas e sessões. Os clientes adoram receber lembretes automáticos. Antes eu tinha 30% de no-show, agora caiu para menos de 5%.",
    rating: 5,
  },
  {
    name: "Roberto Costa",
    role: "Dono de Quadras Esportivas",
    location: "Belo Horizonte, MG",
    content: "Simplesmente perfeito. Meus clientes conseguem reservar sozinhos e eu recebo na hora via PIX. Não preciso mais ficar mandando mensagem pra todo mundo.",
    rating: 5,
  },
  {
    name: "Fernanda Oliveira",
    role: "Proprietária de Pousada",
    location: "Gramado, RS",
    content: "O sistema de reservas online transformou meu negócio. Recebo reservas de madrugada sem precisar atender telefone. Recomendo demais!",
    rating: 5,
  },
  {
    name: "Lucas Mendes",
    role: "Guia de Pesca",
    location: "Pantanal, MS",
    content: "Finalmente um sistema que entende o que a gente precisa. Cobrança de sinal automática, lembretes, tudo funcionando sem eu precisar mexer.",
    rating: 5,
  },
  {
    name: "Patricia Santos",
    role: "Estúdio de Fotografia",
    location: "Curitiba, PR",
    content: "Minha agenda sempre estava uma bagunça. Agora os clientes agendam online, pagam antecipado e recebem confirmação automática. Nota 10!",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            O que nossos clientes dizem
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Mais de 10.000 negócios já transformaram sua gestão de reservas.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div className="flex gap-6 animate-scroll">
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-[350px] p-6 rounded-2xl border border-border/50 bg-card shadow-sm"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <Quote className="h-8 w-8 text-primary/20 mb-3" />
                
                <p className="text-foreground leading-relaxed mb-4">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                
                <div className="flex items-center gap-3 pt-4 border-t">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}