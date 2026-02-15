"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Tag, Settings, HelpCircle, CreditCard, BarChart3, Calendar, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

const navigation = [
  { name: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agendamentos", href: "/dashboard/bookings", icon: CalendarDays },
  { name: "Calendário", href: "/dashboard/calendar", icon: Calendar },
  { name: "Clientes", href: "/dashboard/customers", icon: Users },
  { name: "Serviços", href: "/dashboard/services", icon: Tag },
  { name: "Profissionais", href: "/dashboard/staff", icon: User },
  { name: "Financeiro", href: "/dashboard/payments", icon: CreditCard },
  { name: "Relatórios", href: "/dashboard/reports", icon: BarChart3 },
];

const secondaryNavigation = [
  { name: "Configurações", href: "/dashboard/settings", icon: Settings },
  { name: "Ajuda", href: "/dashboard/help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-dark-border sidebar-dark lg:block">
      <div className="absolute inset-0 premium-grid opacity-10 pointer-events-none" />
      
      <div className="relative flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-dark-border px-6">
          <Logo variant="full" size="md" forceTheme="dark" />
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-dark-muted hover:bg-dark-card hover:text-dark-fg"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="my-4 h-px bg-dark-border" />

          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-dark-muted hover:bg-dark-card hover:text-dark-fg"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-dark-border p-4">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-4">
            <div className="absolute inset-0 led-dots opacity-30" />
            <div className="relative">
              <p className="text-sm font-semibold text-dark-fg">Plano Gratuito</p>
              <p className="mt-1 text-xs text-dark-muted">
                5 de 20 reservas usadas
              </p>
              <Link
                href="/dashboard/upgrade"
                className="mt-3 inline-block text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Fazer upgrade →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}