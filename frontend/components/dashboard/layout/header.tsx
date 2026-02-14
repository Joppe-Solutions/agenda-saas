"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Bell, Menu, Search, Plus } from "lucide-react";
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

export function DashboardHeader() {
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

        <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-xl">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
            3
          </span>
          <span className="sr-only">Notificações</span>
        </Button>

        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
            },
          }}
        />
      </div>
    </header>
  );
}
