import { UserPlus, Settings, Share2, Banknote } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Crie sua conta",
    description: "Cadastre-se gratuitamente em menos de 1 minuto. Sem cartão de crédito necessário.",
  },
  {
    step: "02",
    icon: Settings,
    title: "Configure seus serviços",
    description: "Adicione seus barcos, quadras, salas ou qualquer recurso que você aluga. Defina preços e horários.",
  },
  {
    step: "03",
    icon: Share2,
    title: "Compartilhe seu link",
    description: "Receba uma página personalizada para compartilhar no WhatsApp, Instagram ou onde quiser.",
  },
  {
    step: "04",
    icon: Banknote,
    title: "Receba reservas",
    description: "Clientes reservam e pagam online. Você recebe notificações e o dinheiro cai direto na sua conta.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Como funciona
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Em 4 passos simples você está pronto para receber reservas online.
          </p>
        </div>

        <div className="relative mt-16">
          {/* Connection line */}
          <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-primary/50 via-primary to-primary/50 lg:left-1/2 lg:block lg:-translate-x-1/2" />

          <div className="space-y-12 lg:space-y-16">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className={`relative flex flex-col gap-6 lg:flex-row lg:gap-12 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 1 ? "lg:text-right" : ""}`}>
                  <div
                    className={`inline-flex items-center gap-4 ${
                      index % 2 === 1 ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    <span className="text-4xl font-bold text-primary/20">{step.step}</span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 max-w-md text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {/* Center dot */}
                <div className="absolute left-8 top-0 hidden h-4 w-4 -translate-x-1/2 rounded-full border-4 border-background bg-primary lg:left-1/2 lg:block" />

                {/* Empty space for alignment */}
                <div className="hidden flex-1 lg:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
