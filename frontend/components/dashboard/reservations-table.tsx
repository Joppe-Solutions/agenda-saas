"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, Check, X, Phone, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateBookingStatus } from "@/lib/api";
import type { Booking, BookingStatus } from "@/lib/types";

interface ReservationsTableProps {
  merchantId: string;
  initialBookings: Booking[];
}

const statusConfig = {
  PENDING_PAYMENT: {
    label: "Aguardando Pagamento",
    variant: "outline" as const,
    className: "border-yellow-200 bg-yellow-50 text-yellow-700",
  },
  CONFIRMED: {
    label: "Confirmado",
    variant: "default" as const,
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },
  CANCELLED: {
    label: "Cancelado",
    variant: "destructive" as const,
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
};

export function ReservationsTable({ merchantId, initialBookings }: ReservationsTableProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function setStatus(bookingId: string, status: BookingStatus) {
    setLoadingId(bookingId);
    try {
      await updateBookingStatus(merchantId, bookingId, status);
      setBookings((prev) =>
        prev.map((item) => (item.id === bookingId ? { ...item, status } : item))
      );
    } finally {
      setLoadingId(null);
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
        <Calendar className="h-10 w-10 text-muted-foreground/50" />
        <p className="mt-4 text-lg font-medium">Nenhuma reserva encontrada</p>
        <p className="mt-1 text-sm text-muted-foreground">
          As reservas dos seus clientes aparecerão aqui
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Pessoas</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => {
            const config = statusConfig[booking.status];
            return (
              <TableRow key={booking.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {booking.customerName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{booking.customerName}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {booking.customerPhone}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p>{format(new Date(booking.bookingDate + "T12:00:00"), "dd 'de' MMM, yyyy", { locale: ptBR })}</p>
                      {booking.startTime && (
                        <p className="text-xs text-muted-foreground">{booking.startTime}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {booking.peopleCount}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    R$ {booking.depositAmount.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={config.variant} className={config.className}>
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={loadingId === booking.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Ações</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setStatus(booking.id, "CONFIRMED")}
                        disabled={booking.status === "CONFIRMED"}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Confirmar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setStatus(booking.id, "CANCELLED")}
                        disabled={booking.status === "CANCELLED"}
                        className="text-destructive focus:text-destructive"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
