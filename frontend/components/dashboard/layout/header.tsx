"use client";

import Link from "next/link";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { Bell, Menu, Search, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MobileNav } from "./mobile-nav";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { userButtonTheme, userButtonThemeDark } from "@/lib/clerk-theme";

export function DashboardHeader() {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? userButtonThemeDark : userButtonTheme;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle className="flex items-center">
              <Logo variant="full" size="md" />
            </SheetTitle>
          </SheetHeader>
          <MobileNav />
        </SheetContent>
      </Sheet>

      <div className="hidden lg:flex items-center gap-3">
        <OrganizationSwitcher
          afterCreateOrganizationUrl="/dashboard"
          afterLeaveOrganizationUrl="/select-org"
          afterSelectOrganizationUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "flex items-center justify-center",
              organizationSwitcherTrigger: "px-3 py-2 rounded-lg border bg-background hover:bg-accent flex items-center gap-2 text-sm font-medium",
              organizationSwitcherPopoverCard: "rounded-xl border shadow-lg",
              organizationPreviewMainIdentifier: "font-semibold",
              organizationPreviewAvatarContainer: "h-6 w-6",
              organizationPreviewAvatar: "h-6 w-6",
            },
          }}
        />
      </div>

      <div className="hidden flex-1 md:block">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar reservas, clientes..."
            className="h-11 pl-10 bg-muted/50 border-0 rounded-xl"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Button size="sm" className="hidden sm:flex h-11 px-5 rounded-xl" asChild>
          <Link href="/dashboard/bookings/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Reserva
          </Link>
        </Button>

        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-xl">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
            3
          </span>
          <span className="sr-only">Notificações</span>
        </Button>

        <UserButton
          appearance={{
            elements: theme.elements,
            variables: theme.variables,
          }}
        />
      </div>
    </header>
  );
}
