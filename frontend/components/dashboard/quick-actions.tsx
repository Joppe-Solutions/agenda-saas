import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Share2, Settings, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  {
    title: "Nova Reserva",
    description: "Criar reserva manualmente",
    href: "/dashboard/bookings/new",
    icon: Plus,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Compartilhar Link",
    description: "Copiar link de reservas",
    href: "#",
    icon: Share2,
    color: "bg-green-500/10 text-green-600",
  },
  {
    title: "Relatórios",
    description: "Ver métricas detalhadas",
    href: "/dashboard/reports",
    icon: BarChart3,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Configurações",
    description: "Ajustar preferências",
    href: "/dashboard/settings",
    icon: Settings,
    color: "bg-orange-500/10 text-orange-600",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>Atalhos para tarefas comuns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-start gap-3 rounded-lg border p-4 transition-all hover:border-primary/50 hover:shadow-sm"
            >
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", action.color)}>
                <action.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium group-hover:text-primary">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
