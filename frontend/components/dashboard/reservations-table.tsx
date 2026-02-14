"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, Check, X, Phone, Calendar, Users, Clock, PlayCircle, UserX, MessageCircle, RefreshCw, Filter } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateBookingStatus } from "@/lib/api";
import type { Booking, BookingStatus } from "@/lib/types";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "@/lib/types";

interface ReservationsTableProps {
  merchantId: string;
  initialBookings: Booking[];
}

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending_payment: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled", "completed"],
  in_progress: ["completed", "no_show"],
  completed: [],
  cancelled: [],
  no_show: [],
};

export function ReservationsTable({ merchantId, initialBookings }: ReservationsTableProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");

  const filteredBookings = statusFilter === "all" 
    ? bookings 
    : bookings.filter(b => b.status === statusFilter);

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
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BookingStatus | "all")}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="pending_payment">Aguardando Sinal</SelectItem>
            <SelectItem value="confirmed">Confirmadas</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="completed">Concluídas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
            <SelectItem value="no_show">Não Compareceu</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {filteredBookings.length} reserva{filteredBookings.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Recurso</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Pessoas</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => {
              const availableTransitions = VALID_TRANSITIONS[booking.status];
              
              return (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-brand-cyan/20 text-brand-cyan text-sm">
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
                    <span className="text-sm">{booking.resourceName || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p>{format(new Date(booking.bookingDate + "T12:00:00"), "dd 'de' MMM", { locale: ptBR })}</p>
                        {booking.startTime && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {booking.startTime}{booking.endTime ? ` - ${booking.endTime}` : ''}
                          </p>
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
                    <div className="flex flex-col">
                      <span className="font-medium">
                        R$ {booking.totalAmount.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Sinal: R$ {booking.depositAmount.toFixed(2)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={BOOKING_STATUS_COLORS[booking.status]}>
                      {BOOKING_STATUS_LABELS[booking.status]}
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
                          {loadingId === booking.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {availableTransitions.includes("confirmed") && (
                          <DropdownMenuItem onClick={() => setStatus(booking.id, "confirmed")}>
                            <Check className="mr-2 h-4 w-4 text-green-600" />
                            Confirmar
                          </DropdownMenuItem>
                        )}
                        
                        {availableTransitions.includes("in_progress") && (
                          <DropdownMenuItem onClick={() => setStatus(booking.id, "in_progress")}>
                            <PlayCircle className="mr-2 h-4 w-4 text-blue-600" />
                            Iniciar
                          </DropdownMenuItem>
                        )}
                        
                        {availableTransitions.includes("completed") && (
                          <DropdownMenuItem onClick={() => setStatus(booking.id, "completed")}>
                            <Check className="mr-2 h-4 w-4 text-green-600" />
                            Concluir
                          </DropdownMenuItem>
                        )}
                        
                        {availableTransitions.includes("no_show") && (
                          <DropdownMenuItem onClick={() => setStatus(booking.id, "no_show")}>
                            <UserX className="mr-2 h-4 w-4 text-orange-600" />
                            Não Compareceu
                          </DropdownMenuItem>
                        )}
                        
                        {availableTransitions.includes("cancelled") && (
                          <DropdownMenuItem 
                            onClick={() => setStatus(booking.id, "cancelled")}
                            className="text-destructive focus:text-destructive"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancelar
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem asChild>
                          <a 
                            href={`https://wa.me/${booking.customerPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            WhatsApp
                          </a>
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
    </div>
  );
}