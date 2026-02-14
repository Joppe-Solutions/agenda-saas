"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Ship, Settings, HelpCircle, CreditCard, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

const navigation = [
  { name: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
  { name: "Reservas", href: "/dashboard/bookings", icon: CalendarDays },
  { name: "Recursos", href: "/dashboard/assets", icon: Ship },
  { name: "Pagamentos", href: "/dashboard/payments", icon: CreditCard },
  { name: "Relatórios", href: "/dashboard/reports", icon: BarChart3 },
];

const secondaryNavigation = [
  { name: "Configurações", href: "/dashboard/settings", icon: Settings },
  { name: "Ajuda", href: "/dashboard/help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Logo variant="full" size="md" />
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
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-base",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="my-4 h-px bg-border" />

          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-base",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t p-4">
          <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-4 text-primary-foreground">
            <p className="text-sm font-semibold">Plano Gratuito</p>
            <p className="mt-1 text-xs opacity-80">
              5 de 20 reservas usadas
            </p>
            <Link
              href="/dashboard/upgrade"
              className="mt-3 block text-xs font-medium underline-offset-2 hover:underline"
            >
              Fazer upgrade
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
