"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

const plans = [
  {
    name: "Gratuito",
    description: "Perfeito para começar",
    price: "R$ 0",
    period: "/mês",
    features: [
      { text: "Até 20 reservas/mês", included: true },
      { text: "1 recurso cadastrado", included: true },
      { text: "Página de reservas", included: true },
      { text: "Notificações WhatsApp", included: true },
      { text: "Suporte por e-mail", included: true },
      { text: "PIX automático", included: false },
      { text: "Relatórios avançados", included: false },
    ],
    cta: "Começar Grátis",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Profissional",
    description: "Para negócios em crescimento",
    price: "R$ 79",
    period: "/mês",
    features: [
      { text: "Reservas ilimitadas", included: true },
      { text: "Até 10 recursos", included: true },
      { text: "Página de reservas", included: true },
      { text: "Notificações WhatsApp", included: true },
      { text: "PIX automático", included: true },
      { text: "Relatórios e métricas", included: true },
      { text: "Domínio personalizado", included: true },
    ],
    cta: "Teste Grátis",
    variant: "default" as const,
    popular: true,
  },
  {
    name: "Empresarial",
    description: "Para grandes operações",
    price: "Sob consulta",
    period: "",
    features: [
      { text: "Reservas ilimitadas", included: true },
      { text: "Recursos ilimitados", included: true },
      { text: "Múltiplos usuários", included: true },
      { text: "API de integração", included: true },
      { text: "Relatórios avançados", included: true },
      { text: "Suporte dedicado", included: true },
      { text: "Treinamento incluso", included: true },
    ],
    cta: "Falar com Vendas",
    variant: "outline" as const,
    popular: false,
  },
];

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="precos" className="relative overflow-hidden py-20 sm:py-28 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Planos que cabem no seu bolso
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Comece grátis e escale conforme seu negócio cresce.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`relative flex flex-col h-full ${
                  plan.popular
                    ? "border-primary shadow-lg shadow-primary/10 scale-105 lg:scale-110 z-10"
                    : "border-border/50 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs">
                    Mais Escolhido
                  </Badge>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="h-4 w-4 shrink-0 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 shrink-0 text-muted-foreground/30" />
                        )}
                        <span className={`text-sm ${feature.included ? "" : "text-muted-foreground/50"}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={plan.variant} 
                    className={`w-full text-sm ${plan.popular ? "shadow-lg" : ""}`} 
                    asChild
                  >
                    <Link href="/sign-up">{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          Todos os planos incluem SSL grátis, backups diários e atualizações automáticas.
        </p>
      </div>
    </section>
  );
}
