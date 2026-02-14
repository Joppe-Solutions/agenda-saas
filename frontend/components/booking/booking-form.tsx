"use client";

import { useMemo, useState } from "react";
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
import { checkAvailability, checkTimeSlotAvailability, createBooking } from "@/lib/api";
import type { Asset } from "@/lib/types";

interface BookingFormProps {
  merchantId: string;
  merchantName: string;
  merchantWhatsapp: string;
  assets: Asset[];
}

export function BookingForm({ merchantId, merchantName, merchantWhatsapp, assets }: BookingFormProps) {
  const [assetId, setAssetId] = useState(assets[0]?.id ?? "");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [peopleCount, setPeopleCount] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [availability, setAvailability] = useState<"unknown" | "available" | "unavailable">("unknown");
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<null | {
    bookingId: string;
    depositAmount: number;
    copyPasteCode: string;
  }>(null);

  const selectedAsset = useMemo(() => assets.find((item) => item.id === assetId), [assetId, assets]);
  const isHourly = selectedAsset?.pricingType === "HOURLY";

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 6; h <= 22; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
      if (h < 22) slots.push(`${String(h).padStart(2, "0")}:30`);
    }
    return slots;
  }, []);

  async function handleAvailabilityCheck() {
    if (!assetId || !bookingDate) return;
    if (isHourly && !startTime) return;

    setError("");
    setCheckingAvailability(true);
    try {
      let result;
      if (isHourly && startTime) {
        result = await checkTimeSlotAvailability(assetId, bookingDate, startTime);
      } else {
        result = await checkAvailability(assetId, bookingDate);
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
        assetId,
        merchantId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        bookingDate,
        startTime: isHourly ? startTime : undefined,
        peopleCount,
      });

      setPaymentInfo({
        bookingId: result.bookingId,
        depositAmount: result.depositAmount,
        copyPasteCode: result.payment.copyPasteCode,
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

  const bookingTimeText = isHourly && startTime
    ? `\n⏰ Horário: ${startTime}`
    : "";

  const whatsappText = paymentInfo
    ? `Olá! Acabei de fazer uma reserva:\n\n📅 Data: ${new Date(bookingDate + "T12:00:00").toLocaleDateString("pt-BR")}${bookingTimeText}\n👥 Pessoas: ${peopleCount}\n💰 Sinal: R$ ${paymentInfo.depositAmount.toFixed(2)}\n\nReserva #${paymentInfo.bookingId.slice(0, 8)}`
    : "";

  if (!assets.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          Este estabelecimento ainda não possui recursos cadastrados.
        </p>
      </div>
    );
  }

  if (paymentInfo) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-900">Reserva Criada!</h3>
          <p className="mt-1 text-sm text-green-700">
            Pague o sinal via PIX para confirmar sua reserva
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted p-4">
            <span className="text-sm text-muted-foreground">Valor do sinal</span>
            <span className="text-xl font-bold">R$ {paymentInfo.depositAmount.toFixed(2)}</span>
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

          <Button className="w-full" variant="outline" asChild>
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
        <Label htmlFor="asset">Recurso</Label>
        <Select
          value={assetId}
          onValueChange={(value) => {
            setAssetId(value);
            setAvailability("unknown");
            setStartTime("");
          }}
        >
          <SelectTrigger id="asset">
            <SelectValue placeholder="Selecione um recurso" />
          </SelectTrigger>
          <SelectContent>
            {assets.map((asset) => (
              <SelectItem key={asset.id} value={asset.id}>
                {asset.name} - {asset.capacity} pessoas - R$ {asset.basePrice.toFixed(2)}
                {asset.pricingType === "HOURLY" ? "/hora" : ""}
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
              onBlur={handleAvailabilityCheck}
              required
            />
            {checkingAvailability && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        {isHourly ? (
          <div className="space-y-2">
            <Label htmlFor="time">Horário</Label>
            <Select
              value={startTime}
              onValueChange={(value) => {
                setStartTime(value);
                setAvailability("unknown");
              }}
            >
              <SelectTrigger id="time">
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
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
              max={selectedAsset?.capacity ?? 100}
              value={peopleCount}
              onChange={(event) => setPeopleCount(Number(event.target.value))}
              required
            />
          </div>
        )}
      </div>

      {isHourly && (
        <div className="space-y-2">
          <Label htmlFor="people">Pessoas</Label>
          <Input
            id="people"
            type="number"
            min={1}
            max={selectedAsset?.capacity ?? 100}
            value={peopleCount}
            onChange={(event) => setPeopleCount(Number(event.target.value))}
            required
          />
        </div>
      )}

      {availability === "available" && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          {isHourly ? "Horário disponível para reserva" : "Data disponível para reserva"}
        </div>
      )}

      {availability === "unavailable" && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {isHourly ? "Horário indisponível para este recurso" : "Data indisponível para este recurso"}
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

      {selectedAsset && (
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {isHourly ? "Valor por hora" : "Valor total"}
            </span>
            <span className="font-medium">R$ {selectedAsset.basePrice.toFixed(2)}</span>
          </div>
          {selectedAsset.durationMinutes && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Duração</span>
              <span className="font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {selectedAsset.durationMinutes} min
              </span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sinal (30%)</span>
            <span className="text-lg font-bold text-primary">
              R$ {(selectedAsset.basePrice * 0.3).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        disabled={loading || availability === "unavailable" || checkingAvailability || (isHourly && !startTime)}
        type="submit"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          "Pagar Sinal e Reservar"
        )}
      </Button>
    </form>
  );
}
