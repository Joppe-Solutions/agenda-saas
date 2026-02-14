"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, LayoutDashboard, CalendarDays, Ship, Settings, HelpCircle, CreditCard, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

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
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <CalendarCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">reserva.online</span>
        </div>

        {/* Navigation */}
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
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="border-t p-4">
          <div className="rounded-lg bg-primary/5 p-4">
            <p className="text-sm font-medium">Plano Gratuito</p>
            <p className="mt-1 text-xs text-muted-foreground">
              5 de 20 reservas usadas
            </p>
            <Link
              href="/dashboard/upgrade"
              className="mt-3 block text-xs font-medium text-primary hover:underline"
            >
              Fazer upgrade
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
