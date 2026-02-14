"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "O reserva.online é gratuito?",
    answer: "Sim! Temos um plano gratuito permanente que permite até 20 reservas por mês. É perfeito para quem está começando. Quando seu negócio crescer, você pode fazer upgrade para planos pagos com mais recursos.",
  },
  {
    question: "Como funciona o recebimento via PIX?",
    answer: "Quando um cliente faz uma reserva, ele pode pagar antecipadamente via PIX. O valor cai direto na sua conta e a reserva é confirmada automaticamente. Você também pode cobrar um sinal para garantir a reserva.",
  },
  {
    question: "Preciso de conhecimento técnico para usar?",
    answer: "Não! O reserva.online foi feito para ser simples. Em menos de 2 minutos você cria sua conta e começa a receber reservas. Nossa equipe está disponível para ajudar no que precisar.",
  },
  {
    question: "Posso usar com meu domínio personalizado?",
    answer: "Sim! Nos planos Profissional e Empresarial você pode usar seu próprio domínio (ex: reservas.seunegocio.com.br). Isso passa mais credibilidade para seus clientes.",
  },
  {
    question: "Como meus clientes fazem reservas?",
    answer: "Você recebe um link único para compartilhar no WhatsApp, Instagram, site ou onde preferir. Seus clientes acessam, escolhem o horário disponível, preenchem os dados e pronto! Reserva confirmada.",
  },
  {
    question: "Funciona no celular?",
    answer: "Sim! O sistema é 100% responsivo. Seus clientes podem reservar pelo celular e você pode gerenciar tudo pelo nosso aplicativo mobile (Android e iOS).",
  },
  {
    question: "E se eu precisar de suporte?",
    answer: "Oferecemos suporte por e-mail no plano gratuito e suporte prioritário nos planos pagos. Nossa equipe responde em português e está pronta para ajudar.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim! Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento sem multa ou burocracia. Continue usando até o fim do período pago.",
  },
];

export function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 bg-muted/30" id="faq">
      <div className="container mx-auto max-w-3xl px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Perguntas frequentes
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Tire suas dúvidas sobre o reserva.online.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-3"
        >
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-border/50 bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  openIndex === index ? "max-h-96" : "max-h-0"
                )}
              >
                <p className="px-5 pb-5 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}