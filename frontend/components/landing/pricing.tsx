"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Gratuito",
    description: "Perfeito para começar",
    price: "R$ 0",
    period: "/mês",
    features: [
      "Até 20 reservas/mês",
      "1 recurso cadastrado",
      "Página de reservas",
      "Notificações WhatsApp",
      "Suporte por e-mail",
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
      "Reservas ilimitadas",
      "Até 10 recursos",
      "PIX automático",
      "Relatórios e métricas",
      "Lembretes automáticos",
      "Suporte prioritário",
      "Domínio personalizado",
    ],
    cta: "Teste Grátis",
    variant: "default" as const,
    popular: true,
  },
  {
    name: "Empresarial",
    description: "Para grandes operações",
    price: "R$ 199",
    period: "/mês",
    features: [
      "Tudo do Profissional",
      "Recursos ilimitados",
      "Múltiplos usuários",
      "API de integração",
      "Relatórios avançados",
      "Suporte dedicado",
      "Treinamento incluso",
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
    <section id="precos" className="py-16 sm:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Planos que cabem no seu bolso
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base lg:text-lg">
            Comece grátis e escale conforme seu negócio cresce. Sem surpresas.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-6 sm:mt-12 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`relative flex flex-col ${
                  plan.popular
                    ? "border-primary shadow-lg shadow-primary/10"
                    : "border-border/50"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs">
                    Mais Popular
                  </Badge>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-4 sm:mb-6">
                    <span className="text-3xl font-bold sm:text-4xl">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 sm:space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 sm:gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-xs text-muted-foreground sm:text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant={plan.variant} className="w-full text-sm" asChild>
                    <Link href="/sign-up">{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground sm:mt-8 sm:text-sm">
          Todos os planos incluem: SSL grátis, backups diários e atualizações automáticas.
        </p>
      </div>
    </section>
  );
}
