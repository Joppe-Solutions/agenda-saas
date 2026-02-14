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
  return (
    <section id="recursos" className="border-t bg-muted/30 py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tudo que você precisa para gerenciar reservas
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Ferramentas poderosas e fáceis de usar para transformar a forma como você recebe e gerencia suas reservas.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 bg-card/50 shadow-sm transition-all hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
