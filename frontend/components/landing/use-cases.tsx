import { Ship, Dumbbell, Camera, Briefcase, Home, Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const useCases = [
  {
    icon: Ship,
    title: "Barcos e Pescaria",
    description: "Alugue barcos para pesca esportiva, passeios ou mergulho.",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Dumbbell,
    title: "Quadras e Esportes",
    description: "Reserve quadras de tênis, futebol, vôlei ou academias.",
    color: "bg-green-500/10 text-green-600",
  },
  {
    icon: Camera,
    title: "Estúdios e Espaços",
    description: "Alugue estúdios de fotografia, coworking ou salas de reunião.",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: Home,
    title: "Imóveis por Temporada",
    description: "Gerencie reservas de casas, chalés e apartamentos.",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: Car,
    title: "Veículos e Transporte",
    description: "Alugue carros, motos, bikes ou ofereça transfers.",
    color: "bg-red-500/10 text-red-600",
  },
  {
    icon: Briefcase,
    title: "Serviços e Consultorias",
    description: "Agende consultas, sessões de terapia ou mentorias.",
    color: "bg-indigo-500/10 text-indigo-600",
  },
];

export function UseCases() {
  return (
    <section className="border-t bg-muted/30 py-16 sm:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Para todo tipo de negócio
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base lg:text-lg">
            De barcos de pesca a estúdios de yoga. O reserva.online se adapta ao seu negócio.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <Card key={useCase.title} className="group border-0 bg-card/50 transition-all hover:bg-card hover:shadow-md">
              <CardContent className="flex items-start gap-3 p-4 sm:gap-4 sm:p-6">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${useCase.color}`}>
                  <useCase.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold sm:text-base">{useCase.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{useCase.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
