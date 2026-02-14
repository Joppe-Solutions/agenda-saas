"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Booking } from "@/lib/types";

interface RecentBookingsProps {
  bookings: Booking[];
}

const statusMap = {
  PENDING_PAYMENT: { label: "Aguardando", variant: "outline" as const },
  CONFIRMED: { label: "Confirmado", variant: "default" as const },
  CANCELLED: { label: "Cancelado", variant: "destructive" as const },
};

export function RecentBookings({ bookings }: RecentBookingsProps) {
  const recentBookings = bookings.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Reservas Recentes</CardTitle>
          <CardDescription>Últimas 5 reservas do seu negócio</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/bookings">
            Ver todas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recentBookings.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            <p>Nenhuma reserva encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {booking.customerName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{booking.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.bookingDate + "T12:00:00").toLocaleDateString("pt-BR")}
                      {booking.startTime && ` • ${booking.startTime}`}
                      {" • "}
                      {booking.peopleCount} {booking.peopleCount === 1 ? "pessoa" : "pessoas"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">R$ {booking.depositAmount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(booking.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <Badge variant={statusMap[booking.status].variant}>
                    {statusMap[booking.status].label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
