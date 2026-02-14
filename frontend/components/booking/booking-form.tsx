"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { checkAvailability, createBooking } from "@/lib/api";
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
  const [peopleCount, setPeopleCount] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [availability, setAvailability] = useState<"unknown" | "available" | "unavailable">("unknown");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentInfo, setPaymentInfo] = useState<null | {
    bookingId: string;
    depositAmount: number;
    copyPasteCode: string;
  }>(null);

  const selectedAsset = useMemo(() => assets.find((item) => item.id === assetId), [assetId, assets]);

  async function handleAvailabilityCheck() {
    if (!assetId || !bookingDate) return;

    setError("");
    try {
      const result = await checkAvailability(assetId, bookingDate);
      setAvailability(result.available ? "available" : "unavailable");
    } catch {
      setAvailability("unknown");
      setError("Nao foi possivel validar disponibilidade.");
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
        bookingDate,
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

  const whatsappText = paymentInfo
    ? `Reserva confirmada em ${merchantName}\nReserva: ${paymentInfo.bookingId}\nData: ${bookingDate}\nPessoas: ${peopleCount}`
    : "";

  if (!assets.length) {
    return <p className="text-sm text-slate-600">Este merchant ainda nao possui recursos cadastrados.</p>;
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Recurso</label>
        <select
          className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm"
          value={assetId}
          onChange={(event) => {
            setAssetId(event.target.value);
            setAvailability("unknown");
          }}
        >
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.name} - max {asset.capacity} pessoas - R$ {asset.basePrice.toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Data</label>
        <Input
          type="date"
          value={bookingDate}
          onChange={(event) => {
            setBookingDate(event.target.value);
            setAvailability("unknown");
          }}
          onBlur={handleAvailabilityCheck}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Quantidade de pessoas</label>
        <Input
          type="number"
          min={1}
          max={selectedAsset?.capacity ?? 100}
          value={peopleCount}
          onChange={(event) => setPeopleCount(Number(event.target.value))}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Seu nome</label>
        <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Seu WhatsApp</label>
        <Input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} required />
      </div>

      {availability === "available" && <p className="text-sm text-emerald-700">Data disponivel.</p>}
      {availability === "unavailable" && <p className="text-sm text-red-700">Data indisponivel para este recurso.</p>}

      <Button className="w-full" disabled={loading || availability === "unavailable"} type="submit">
        {loading ? "Processando..." : "Pagar sinal"}
      </Button>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {paymentInfo && (
        <div className="rounded-lg border border-brand-100 bg-brand-50 p-4">
          <p className="text-sm font-semibold text-brand-700">Reserva criada</p>
          <p className="mt-2 text-sm text-slate-700">Sinal: R$ {paymentInfo.depositAmount.toFixed(2)}</p>
          <p className="mt-2 break-all rounded bg-white p-2 font-mono text-xs">{paymentInfo.copyPasteCode}</p>
          <a
            className="mt-3 inline-block text-sm font-semibold text-brand-700 underline"
            href={buildWhatsAppUrl(merchantWhatsapp, whatsappText)}
            rel="noreferrer"
            target="_blank"
          >
            Enviar para WhatsApp
          </a>
        </div>
      )}
    </form>
  );
}
