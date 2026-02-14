"use client";

import { useMemo, useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Copy, MessageCircle, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { checkAvailability, checkTimeSlotAvailability, createBooking, getAvailableSlots } from "@/lib/api";
import type { Resource, TimeSlot, PricingType } from "@/lib/types";
import { RESOURCE_TYPE_ICONS, RESOURCE_TYPE_LABELS } from "@/lib/types";

interface BookingFormProps {
  merchantId: string;
  merchantName: string;
  merchantWhatsapp: string;
  resources: Resource[];
  signalPercentage: number;
}

export function BookingForm({ merchantId, merchantName, merchantWhatsapp, resources, signalPercentage }: BookingFormProps) {
  const [resourceId, setResourceId] = useState(resources[0]?.id ?? "");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [peopleCount, setPeopleCount] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [availability, setAvailability] = useState<"unknown" | "available" | "unavailable">("unknown");
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<null | {
    bookingId: string;
    depositAmount: number;
    totalAmount: number;
    copyPasteCode: string;
    signalExpiresAt: string;
  }>(null);

  const selectedResource = useMemo(() => resources.find((item) => item.id === resourceId), [resourceId, resources]);
  const isHourly = selectedResource?.pricingType === "HOURLY";
  const isSlot = selectedResource?.pricingType === "SLOT";
  const isFullDay = selectedResource?.pricingType === "FULL_DAY";

  useEffect(() => {
    if (bookingDate && resourceId && (isHourly || isSlot)) {
      loadAvailableSlots();
    }
  }, [bookingDate, resourceId, isHourly, isSlot]);

  async function loadAvailableSlots() {
    if (!bookingDate || !resourceId) return;
    
    try {
      const data = await getAvailableSlots(resourceId, bookingDate);
      setAvailableSlots(data.slots);
    } catch (err) {
      console.error("Error loading slots:", err);
      setAvailableSlots([]);
    }
  }

  async function handleAvailabilityCheck() {
    if (!resourceId || !bookingDate) return;
    if ((isHourly || isSlot) && !startTime) return;

    setError("");
    setCheckingAvailability(true);
    try {
      let result;
      if ((isHourly || isSlot) && startTime && endTime) {
        result = await checkTimeSlotAvailability(resourceId, bookingDate, startTime, endTime);
      } else {
        result = await checkAvailability(resourceId, bookingDate);
      }
      setAvailability(result.available ? "available" : "unavailable");
    } catch {
      setAvailability("unknown");
      setError("Não foi possível verificar disponibilidade.");
    } finally {
      setCheckingAvailability(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await createBooking({
        resourceId,
        merchantId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        bookingDate,
        startTime: (isHourly || isSlot) ? startTime : undefined,
        endTime: (isHourly || isSlot) ? endTime : undefined,
        peopleCount,
      });

      setPaymentInfo({
        bookingId: result.bookingId,
        depositAmount: result.depositAmount,
        totalAmount: result.totalAmount,
        copyPasteCode: result.payment.copyPasteCode,
        signalExpiresAt: result.signalExpiresAt,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar reserva");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyCode() {
    if (!paymentInfo) return;
    await navigator.clipboard.writeText(paymentInfo.copyPasteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const bookingTimeText = (isHourly || isSlot) && startTime
    ? `\n⏰ Horário: ${startTime}${endTime ? ` - ${endTime}` : ""}`
    : "";

  const whatsappText = paymentInfo
    ? `Olá! Acabei de fazer uma reserva:\n\n📅 Data: ${new Date(bookingDate + "T12:00:00").toLocaleDateString("pt-BR")}${bookingTimeText}\n👥 Pessoas: ${peopleCount}\n💰 Sinal: R$ ${paymentInfo.depositAmount.toFixed(2)}\n\nReserva #${paymentInfo.bookingId.slice(0, 8)}`
    : "";

  if (!resources.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          Este estabelecimento ainda não possui recursos cadastrados.
        </p>
      </div>
    );
  }

  if (paymentInfo) {
    const expiresIn = new Date(paymentInfo.signalExpiresAt);
    const expiresText = expiresIn.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-300">Reserva Criada!</h3>
          <p className="mt-1 text-sm text-green-700 dark:text-green-400">
            Pague o sinal até às <strong>{expiresText}</strong> para confirmar
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted p-4">
            <span className="text-sm text-muted-foreground">Valor do sinal ({signalPercentage}%)</span>
            <span className="text-xl font-bold text-primary">R$ {paymentInfo.depositAmount.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
            <span className="text-sm text-muted-foreground">Valor total</span>
            <span className="font-medium">R$ {paymentInfo.totalAmount.toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            <Label>Código PIX Copia e Cola</Label>
            <div className="relative">
              <Input
                readOnly
                value={paymentInfo.copyPasteCode}
                className="pr-24 font-mono text-xs"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={handleCopyCode}
              >
                {copied ? (
                  <CheckCircle2 className="mr-1 h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="mr-1 h-4 w-4" />
                )}
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </div>
          </div>

          <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
            <a
              href={buildWhatsAppUrl(merchantWhatsapp, whatsappText)}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Enviar Comprovante via WhatsApp
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="resource">Recurso</Label>
        <Select
          value={resourceId}
          onValueChange={(value) => {
            setResourceId(value);
            setAvailability("unknown");
            setStartTime("");
            setEndTime("");
          }}
        >
          <SelectTrigger id="resource">
            <SelectValue placeholder="Selecione um recurso" />
          </SelectTrigger>
          <SelectContent>
            {resources.map((resource) => (
              <SelectItem key={resource.id} value={resource.id}>
                {RESOURCE_TYPE_ICONS[resource.resourceType]} {resource.name} - {resource.capacity} pessoas - R$ {resource.basePrice.toFixed(2)}
                {resource.pricingType === "HOURLY" ? "/hora" : resource.pricingType === "SLOT" ? "/slot" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <div className="relative">
            <Input
              id="date"
              type="date"
              value={bookingDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(event) => {
                setBookingDate(event.target.value);
                setAvailability("unknown");
              }}
              onBlur={isFullDay ? handleAvailabilityCheck : undefined}
              required
            />
            {checkingAvailability && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        {(isHourly || isSlot) ? (
          <div className="space-y-2">
            <Label htmlFor="time">Horário</Label>
            <Select
              value={startTime}
              onValueChange={(value) => {
                setStartTime(value);
                const slot = availableSlots.find(s => s.startTime === value);
                if (slot) {
                  setEndTime(slot.endTime);
                }
                setAvailability("unknown");
              }}
            >
              <SelectTrigger id="time">
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.filter(s => s.available).map((slot) => (
                  <SelectItem key={slot.startTime} value={slot.startTime}>
                    {slot.startTime} - {slot.endTime}
                  </SelectItem>
                ))}
                {availableSlots.filter(s => s.available).length === 0 && (
                  <SelectItem value="_none" disabled>Nenhum horário disponível</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="people">Pessoas</Label>
            <Input
              id="people"
              type="number"
              min={1}
              max={selectedResource?.capacity ?? 100}
              value={peopleCount}
              onChange={(event) => setPeopleCount(Number(event.target.value))}
              required
            />
          </div>
        )}
      </div>

      {(isHourly || isSlot) && (
        <div className="space-y-2">
          <Label htmlFor="people">Pessoas</Label>
          <Input
            id="people"
            type="number"
            min={1}
            max={selectedResource?.capacity ?? 100}
            value={peopleCount}
            onChange={(event) => setPeopleCount(Number(event.target.value))}
            required
          />
        </div>
      )}

      {availability === "available" && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          {isHourly || isSlot ? "Horário disponível para reserva" : "Data disponível para reserva"}
        </div>
      )}

      {availability === "unavailable" && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          {isHourly || isSlot ? "Horário indisponível para este recurso" : "Data indisponível para este recurso"}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Seu nome</Label>
        <Input
          id="name"
          placeholder="Digite seu nome completo"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Seu WhatsApp</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(00) 00000-0000"
          value={customerPhone}
          onChange={(event) => setCustomerPhone(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail (opcional)</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={customerEmail}
          onChange={(event) => setCustomerEmail(event.target.value)}
        />
      </div>

      {selectedResource && (
        <div className="rounded-lg bg-brand-blue-950/5 dark:bg-brand-blue-950/30 p-4 border border-brand-blue-800/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {isHourly ? "Valor por hora" : isSlot ? "Valor por slot" : "Valor total"}
            </span>
            <span className="font-medium">R$ {selectedResource.basePrice.toFixed(2)}</span>
          </div>
          {selectedResource.durationMinutes && (isHourly || isSlot) && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Duração</span>
              <span className="font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {selectedResource.durationMinutes} min
              </span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sinal ({signalPercentage}%)</span>
            <span className="text-lg font-bold text-primary">
              R$ {(selectedResource.basePrice * signalPercentage / 100).toFixed(2)}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            O restante de R$ {(selectedResource.basePrice * (100 - signalPercentage) / 100).toFixed(2)} é pago no dia.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Button
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        size="lg"
        disabled={loading || availability === "unavailable" || checkingAvailability || ((isHourly || isSlot) && !startTime)}
        type="submit"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          `Pagar Sinal de R$ ${selectedResource ? (selectedResource.basePrice * signalPercentage / 100).toFixed(2) : "0,00"}`
        )}
      </Button>
    </form>
  );
}