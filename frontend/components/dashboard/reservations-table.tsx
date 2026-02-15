"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, Check, X, Phone, Calendar, Users, Clock, PlayCircle, UserX, MessageCircle, RefreshCw, Filter, CalendarClock, CreditCard, Copy, CheckCircle, FileText, Download, Printer } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateBookingStatus, rescheduleBooking, retryBookingPayment, getBookingReceipt } from "@/lib/api";
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
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rescheduleBooking_selected, setRescheduleBookingSelected] = useState<Booking | null>(null);
  const [rescheduleData, setRescheduleData] = useState({
    newDate: "",
    newStartTime: "",
  });
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<Awaited<ReturnType<typeof getBookingReceipt>> | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

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

  const openRescheduleDialog = (booking: Booking) => {
    setRescheduleBookingSelected(booking);
    setRescheduleData({
      newDate: booking.bookingDate,
      newStartTime: booking.startTime || "08:00",
    });
    setRescheduleDialogOpen(true);
  };

  const handleReschedule = async () => {
    if (!rescheduleBooking_selected || !rescheduleData.newDate) return;
    setRescheduleLoading(true);
    try {
      const result = await rescheduleBooking(rescheduleBooking_selected.id, {
        newDate: rescheduleData.newDate,
        newStartTime: rescheduleData.newStartTime || undefined,
      });
      setBookings(prev => 
        prev.map(b => b.id === rescheduleBooking_selected.id ? result.booking : b)
      );
      setRescheduleDialogOpen(false);
    } catch (err) {
      console.error("Error rescheduling:", err);
      alert("Erro ao reagendar. Verifique se o novo horário está disponível.");
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleRetryPayment = async (booking: Booking) => {
    setLoadingId(booking.id);
    setPaymentLoading(true);
    try {
      const result = await retryBookingPayment(booking.id);
      const updatedBooking = { 
        ...booking, 
        status: "pending_payment" as const,
        qrCode: result.payment.qrCode,
        copyPasteCode: result.payment.copyPasteCode,
      };
      setBookings(prev => prev.map(b => b.id === booking.id ? updatedBooking : b));
      setPaymentBooking(updatedBooking);
      setPaymentDialogOpen(true);
    } catch (err) {
      console.error("Error retrying payment:", err);
      alert("Erro ao gerar nova cobrança.");
    } finally {
      setLoadingId(null);
      setPaymentLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleOpenReceipt = async (booking: Booking) => {
    setReceiptLoading(true);
    try {
      const data = await getBookingReceipt(booking.id);
      setReceiptData(data);
      setReceiptDialogOpen(true);
    } catch (err) {
      console.error("Error loading receipt:", err);
      alert("Erro ao carregar comprovante.");
    } finally {
      setReceiptLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const timeSlots = [];
  for (let h = 6; h <= 22; h++) {
    timeSlots.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 22) timeSlots.push(`${String(h).padStart(2, "0")}:30`);
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
              <TableHead>Serviço</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => {
              const availableTransitions = VALID_TRANSITIONS[booking.status];
              const canReschedule = booking.status === "pending_payment" || booking.status === "confirmed";
              
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
                    <div>
                      <span className="text-sm font-medium">{booking.serviceName || '-'}</span>
                      {booking.staffName && (
                        <p className="text-xs text-muted-foreground">{booking.staffName}</p>
                      )}
                    </div>
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
                        
                        {canReschedule && (
                          <DropdownMenuItem onClick={() => openRescheduleDialog(booking)}>
                            <CalendarClock className="mr-2 h-4 w-4 text-brand-cyan" />
                            Reagendar
                          </DropdownMenuItem>
                        )}
                        
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

                        {(booking.status === "cancelled" || booking.status === "pending_payment") && (
                          <DropdownMenuItem onClick={() => handleRetryPayment(booking)}>
                            <CreditCard className="mr-2 h-4 w-4 text-brand-yellow" />
                            Cobrar Sinal Novamente
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem onClick={() => handleOpenReceipt(booking)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Ver Comprovante
                        </DropdownMenuItem>

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

      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reagendar Reserva</DialogTitle>
            <DialogDescription>
              Escolha uma nova data e horário para a reserva de {rescheduleBooking_selected?.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nova Data</Label>
              <Input
                type="date"
                value={rescheduleData.newDate}
                min={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Novo Horário</Label>
              <Select
                value={rescheduleData.newStartTime}
                onValueChange={(v) => setRescheduleData({ ...rescheduleData, newStartTime: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleReschedule} 
              disabled={rescheduleLoading || !rescheduleData.newDate}
              className="bg-brand-cyan hover:bg-brand-cyan/90 text-white"
            >
              {rescheduleLoading ? "Reagendando..." : "Confirmar Reagendamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagamento PIX Gerado</DialogTitle>
            <DialogDescription>
              Envie o QR Code ou código para {paymentBooking?.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentBooking?.qrCode || '')}`}
                  alt="QR Code PIX"
                  className="w-48 h-48"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Código PIX (copia e cola)</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={paymentBooking?.copyPasteCode || ''}
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(paymentBooking?.copyPasteCode || '', 'code')}
                >
                  {copied === 'code' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3 text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-300">Valor do Sinal</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                R$ {paymentBooking?.depositAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Fechar
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              asChild
            >
              <a
                href={`https://wa.me/${paymentBooking?.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Aqui está o QR Code para pagamento do sinal de R$ ${paymentBooking?.depositAmount.toFixed(2)} da sua reserva.\n\nCódigo PIX:\n${paymentBooking?.copyPasteCode}`)}`}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Enviar por WhatsApp
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-md print:max-w-none print:shadow-none">
          <DialogHeader className="print:hidden">
            <DialogTitle>Comprovante de Reserva</DialogTitle>
            <DialogDescription>
              Detalhes da reserva para {receiptData?.booking.customerName}
            </DialogDescription>
          </DialogHeader>
          
          {receiptData && (
            <div className="space-y-4 py-4 print:py-0" id="receipt-content">
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-bold text-brand-blue">{receiptData.merchant.businessName}</h2>
                {receiptData.merchant.address && (
                  <p className="text-sm text-muted-foreground">{receiptData.merchant.address}</p>
                )}
                {receiptData.merchant.city && (
                  <p className="text-sm text-muted-foreground">{receiptData.merchant.city}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Reserva</p>
                    <p className="font-mono text-sm">{receiptData.booking.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <Badge className={BOOKING_STATUS_COLORS[receiptData.booking.status as BookingStatus]}>
                    {BOOKING_STATUS_LABELS[receiptData.booking.status as BookingStatus]}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cliente</p>
                    <p className="font-medium">{receiptData.booking.customerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Telefone</p>
                    <p className="font-medium">{receiptData.booking.customerPhone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Serviço</p>
                    <p className="font-medium">{receiptData.service.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Profissional</p>
                    <p className="font-medium">{receiptData.booking.staffName || "Não definido"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Data</p>
                    <p className="font-medium">
                      {format(new Date(receiptData.booking.bookingDate + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Horário</p>
                    <p className="font-medium">
                      {receiptData.booking.startTime || "Dia inteiro"}
                      {receiptData.booking.endTime && ` - ${receiptData.booking.endTime}`}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Valor Total</span>
                    <span>R$ {receiptData.booking.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Sinal Pago</span>
                    <span className="font-medium text-green-600">R$ {receiptData.booking.depositAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Saldo Restante</span>
                    <span>R$ {(receiptData.booking.totalAmount - receiptData.booking.depositAmount).toFixed(2)}</span>
                  </div>
                </div>

                {receiptData.payment && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Pagamento Confirmado</span>
                    </div>
                    {receiptData.payment.paidAt && (
                      <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                        Pago em {format(new Date(receiptData.payment.paidAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                )}

                <div className="text-center text-xs text-muted-foreground border-t pt-3">
                  <p>Reserva criada em {format(new Date(receiptData.booking.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                  <p className="mt-1">WhatsApp: {receiptData.merchant.whatsappNumber}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={() => setReceiptDialogOpen(false)}>
              Fechar
            </Button>
            <Button onClick={handlePrintReceipt}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            {receiptData && (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                asChild
              >
                <a
                  href={`https://wa.me/${receiptData.booking.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`*COMPROVANTE DE AGENDAMENTO*\n\n` +
                    `${receiptData.merchant.businessName}\n` +
                    `Agendamento: ${receiptData.booking.id.slice(0, 8).toUpperCase()}\n` +
                    `Status: ${BOOKING_STATUS_LABELS[receiptData.booking.status as BookingStatus]}\n\n` +
                    `*Cliente:* ${receiptData.booking.customerName}\n` +
                    `*Serviço:* ${receiptData.service.name}\n` +
                    `*Profissional:* ${receiptData.booking.staffName || "Não definido"}\n` +
                    `*Data:* ${format(new Date(receiptData.booking.bookingDate + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}\n` +
                    `*Horário:* ${receiptData.booking.startTime || "Dia inteiro"}${receiptData.booking.endTime ? ` - ${receiptData.booking.endTime}` : ""}\n\n` +
                    `*Valor Total:* R$ ${receiptData.booking.totalAmount.toFixed(2)}\n` +
                    `*Sinal Pago:* R$ ${receiptData.booking.depositAmount.toFixed(2)}\n` +
                    `*Saldo Restante:* R$ ${(receiptData.booking.totalAmount - receiptData.booking.depositAmount).toFixed(2)}`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}