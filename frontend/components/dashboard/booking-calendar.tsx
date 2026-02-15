"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from "lucide-react";
import { Calendar as CalendarIcon, Clock, Users, DollarSign, Phone } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { listMerchantBookings, updateBookingStatus } from "@/lib/api";
import type { Booking, BookingStatus } from "@/lib/types";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "@/lib/types";

const locales = {
  "pt-BR": ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Booking;
}

interface BookingCalendarProps {
  merchantId: string;
}

const STATUS_COLORS_CSS: Record<BookingStatus, string> = {
  pending_payment: "#FFB800",
  confirmed: "#22C55E",
  in_progress: "#3B82F6",
  completed: "#6B7280",
  cancelled: "#EF4444",
  no_show: "#F97316",
};

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending_payment: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled", "completed"],
  in_progress: ["completed", "no_show"],
  completed: [],
  cancelled: [],
  no_show: [],
};

export function BookingCalendar({ merchantId }: BookingCalendarProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<typeof Views[keyof typeof Views]>(Views.DAY);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listMerchantBookings(merchantId);
      setBookings(data.bookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const events: CalendarEvent[] = useMemo(() => {
    return bookings
      .filter(b => b.status !== "cancelled")
      .map((booking) => {
        const dateStr = booking.bookingDate;
        const startTime = booking.startTime || "08:00";
        const startParts = startTime.split(":");
        
        let endTime = booking.endTime;
        if (!endTime) {
          const durationMinutes = 60;
          const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
          const endMinutes = startMinutes + durationMinutes;
          const endHour = Math.floor(endMinutes / 60);
          const endMin = endMinutes % 60;
          endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
        }

        const start = new Date(`${dateStr}T${startTime}:00`);
        const end = new Date(`${dateStr}T${endTime}:00`);

        return {
          id: booking.id,
          title: `${booking.customerName} - ${booking.serviceName || "Serviço"}`,
          start,
          end,
          resource: booking,
        };
      });
  }, [bookings]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedBooking(event.resource);
    setDetailsOpen(true);
  }, []);

  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: typeof Views[keyof typeof Views]) => {
    setView(newView);
  }, []);

  const handleStatusChange = async (newStatus: BookingStatus) => {
    if (!selectedBooking) return;
    setUpdating(true);
    try {
      await updateBookingStatus(merchantId, selectedBooking.id, newStatus);
      setBookings(prev => 
        prev.map(b => b.id === selectedBooking.id ? { ...b, status: newStatus } : b)
      );
      setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdating(false);
    }
  };

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const booking = event.resource;
    return {
      style: {
        backgroundColor: STATUS_COLORS_CSS[booking.status],
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  }, []);

  const CustomToolbar = useCallback(({ onNavigate, label }: { onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void; label: string }) => (
    <div className="flex items-center justify-between mb-4 p-2">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onNavigate("PREV")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate("TODAY")}>
          Hoje
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate("NEXT")}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <span className="text-lg font-semibold">{label}</span>
      <div className="flex items-center gap-2">
        <Select value={view} onValueChange={(v) => setView(v as typeof view)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Views.DAY}>Dia</SelectItem>
            <SelectItem value={Views.WEEK}>Semana</SelectItem>
            <SelectItem value={Views.MONTH}>Mês</SelectItem>
            <SelectItem value={Views.AGENDA}>Agenda</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchBookings}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ), [view, fetchBookings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Calendário de Reservas</h2>
        <Button onClick={fetchBookings} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <style jsx global>{`
          .rbc-calendar {
            font-family: inherit;
          }
          .rbc-header {
            padding: 8px;
            font-weight: 600;
            background: hsl(var(--muted));
            border-bottom: 1px solid hsl(var(--border));
          }
          .rbc-header + .rbc-header {
            border-left: 1px solid hsl(var(--border));
          }
          .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
            border: none;
          }
          .rbc-month-row + .rbc-month-row {
            border-top: 1px solid hsl(var(--border));
          }
          .rbc-day-bg + .rbc-day-bg {
            border-left: 1px solid hsl(var(--border));
          }
          .rbc-off-range-bg {
            background: hsl(var(--muted));
          }
          .rbc-today {
            background: hsl(var(--brand-cyan) / 0.1);
          }
          .rbc-event {
            cursor: pointer;
            padding: 2px 6px;
          }
          .rbc-event:hover {
            opacity: 1;
          }
          .rbc-agenda-view table.rbc-agenda-table {
            border: none;
          }
          .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
            padding: 8px;
            border-top: 1px solid hsl(var(--border));
          }
          .rbc-time-header-content {
            border-left: 1px solid hsl(var(--border));
          }
          .rbc-time-content > * + * > * {
            border-left: 1px solid hsl(var(--border));
          }
          .rbc-timeslot-group {
            border-top: 1px solid hsl(var(--border));
          }
          .rbc-time-slot {
            border-top: 1px solid hsl(var(--border));
          }
        `}</style>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          date={currentDate}
          onView={handleViewChange}
          onNavigate={handleNavigate}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          views={[Views.DAY, Views.WEEK, Views.MONTH, Views.AGENDA]}
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            date: "Data",
            time: "Hora",
            event: "Reserva",
            noEventsInRange: "Não há reservas neste período.",
            showMore: (total) => `+ Ver mais (${total})`,
          }}
          components={{
            toolbar: CustomToolbar,
          }}
          style={{ height: 600 }}
        />
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: STATUS_COLORS_CSS.pending_payment }} />
          <span>Aguardando Sinal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: STATUS_COLORS_CSS.confirmed }} />
          <span>Confirmada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: STATUS_COLORS_CSS.in_progress }} />
          <span>Em Andamento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: STATUS_COLORS_CSS.completed }} />
          <span>Concluída</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: STATUS_COLORS_CSS.no_show }} />
          <span>No-Show</span>
        </div>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Reserva</DialogTitle>
            <DialogDescription>
              Informações completas da reserva selecionada
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={BOOKING_STATUS_COLORS[selectedBooking.status]}>
                  {BOOKING_STATUS_LABELS[selectedBooking.status]}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{selectedBooking.customerName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedBooking.customerPhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {new Date(selectedBooking.bookingDate + "T12:00:00").toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                    {selectedBooking.startTime && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {selectedBooking.startTime}
                        {selectedBooking.endTime && ` - ${selectedBooking.endTime}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">R$ {selectedBooking.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Sinal: R$ {selectedBooking.depositAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {VALID_TRANSITIONS[selectedBooking.status].length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Alterar status:</p>
                  <div className="flex flex-wrap gap-2">
                    {VALID_TRANSITIONS[selectedBooking.status].map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant="outline"
                        disabled={updating}
                        onClick={() => handleStatusChange(status)}
                      >
                        {BOOKING_STATUS_LABELS[status]}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button variant="outline" className="w-full" asChild>
                <a
                  href={`https://wa.me/${selectedBooking.customerPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Abrir WhatsApp
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}