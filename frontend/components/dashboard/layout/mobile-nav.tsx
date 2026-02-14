"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Ship, Settings, HelpCircle, CreditCard, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
  { name: "Reservas", href: "/dashboard/bookings", icon: CalendarDays },
  { name: "Recursos", href: "/dashboard/assets", icon: Ship },
  { name: "Pagamentos", href: "/dashboard/payments", icon: CreditCard },
  { name: "Relatórios", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Configurações", href: "/dashboard/settings", icon: Settings },
  { name: "Ajuda", href: "/dashboard/help", icon: HelpCircle },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-4">
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
    </nav>
  );
}
