"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Ship, Settings, HelpCircle, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
  { name: "Reservas", href: "/dashboard/bookings", icon: CalendarDays },
  { name: "Recursos", href: "/dashboard/assets", icon: Ship },
  { name: "Pagamentos", href: "/dashboard/payments", icon: CreditCard },
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
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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
    </nav>
  );
}
