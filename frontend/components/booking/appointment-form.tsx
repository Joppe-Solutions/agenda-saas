"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Copy, MessageCircle, Loader2, Clock, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { createBooking, getAvailableSlots } from "@/lib/api";
import type { Service, StaffMember, TimeSlot } from "@/lib/types";

interface AppointmentFormProps {
  merchantId: string;
  merchantName: string;
  merchantWhatsapp: string;
  services: Service[];
  staff: StaffMember[];
}

export function AppointmentForm({ merchantId, merchantName, merchantWhatsapp, services, staff }: AppointmentFormProps) {
  const [step, setStep] = useState<"service" | "staff" | "datetime" | "details" | "payment">("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<null | {
    bookingId: string;
    depositAmount: number;
    totalAmount: number;
    copyPasteCode: string;
    expiresAt: string;
  }>(null);

  const availableStaff = selectedService 
    ? staff.filter(s => s.services.includes(selectedService.id))
    : staff;

  useEffect(() => {
    if (selectedService && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedService, selectedDate, selectedStaff]);

  const loadAvailableSlots = async () => {
    if (!selectedService || !selectedDate) return;
    
    setLoadingSlots(true);
    try {
      const data = await getAvailableSlots(
        selectedService.id, 
        selectedDate, 
        selectedStaff?.id
      );
      setAvailableSlots(data.slots);
    } catch (err) {
      console.error("Error loading slots:", err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setSelectedStaff(null);
    if (service.allowStaffSelection && availableStaff.length > 0) {
      setStep("staff");
    } else {
      setStep("datetime");
    }
  };

  const handleSelectStaff = (staffMember: StaffMember | null) => {
    setSelectedStaff(staffMember);
    setStep("datetime");
  };

  const handleSelectDateTime = () => {
    if (!selectedDate || !selectedTime) {
      setError("Selecione uma data e horário");
      return;
    }
    setStep("details");
  };

  const handleSubmit = async () => {
    if (!selectedService || !customerName.trim() || !customerPhone.trim()) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await createBooking({
        serviceId: selectedService.id,
        staffId: selectedStaff?.id,
        merchantId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        bookingDate: selectedDate,
        startTime: selectedTime,
        notes: notes || undefined,
      });

      if (result.payment) {
        setPaymentInfo({
          bookingId: result.bookingId,
          depositAmount: result.depositAmount,
          totalAmount: result.totalAmount,
          copyPasteCode: result.payment.copyPasteCode,
          expiresAt: result.payment.expiresAt,
        });
        setStep("payment");
      } else {
        setStep("payment");
      }
    } catch (err) {
      console.error("Error creating booking:", err);
      setError("Erro ao criar agendamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (paymentInfo?.copyPasteCode) {
      navigator.clipboard.writeText(paymentInfo.copyPasteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (step === "service") {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold">Escolha um serviço</h3>
          <p className="text-sm text-muted-foreground">Selecione o serviço desejado</p>
        </div>

        {services.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhum serviço disponível</p>
        ) : (
          <div className="grid gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => handleSelectService(service)}
                className="w-full text-left p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{service.name}</p>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(service.durationMinutes)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">R$ {service.price.toFixed(2)}</p>
                    {service.requireDeposit && (
                      <p className="text-xs text-muted-foreground">Sinal requerido</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (step === "staff") {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setStep("service")}>
          ← Voltar
        </Button>

        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold">Escolha um profissional</h3>
          <p className="text-sm text-muted-foreground">Opcional - ou deixe em branco para qualquer disponível</p>
        </div>

        <div className="grid gap-3">
          <button
            onClick={() => handleSelectStaff(null)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              selectedStaff === null ? "border-primary bg-primary/5" : "hover:border-primary hover:bg-primary/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Qualquer profissional</p>
                <p className="text-sm text-muted-foreground">Primeiro disponível</p>
              </div>
            </div>
          </button>

          {availableStaff.map((member) => (
            <button
              key={member.id}
              onClick={() => handleSelectStaff(member)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedStaff?.id === member.id ? "border-primary bg-primary/5" : "hover:border-primary hover:bg-primary/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.photo} />
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  {member.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-1">{member.bio}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <Button onClick={() => handleSelectStaff(null)} className="w-full">
          Continuar sem escolher
        </Button>
      </div>
    );
  }

  if (step === "datetime") {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => selectedService?.allowStaffSelection ? setStep("staff") : setStep("service")}>
          ← Voltar
        </Button>

        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold">Escolha data e horário</h3>
          <p className="text-sm text-muted-foreground">
            {selectedService?.name} {selectedStaff && `• ${selectedStaff.name}`}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Data</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime("");
              }}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {selectedDate && (
            <div className="space-y-2">
              <Label>Horários disponíveis</Label>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum horário disponível para esta data
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.filter(s => s.available).map((slot) => (
                    <button
                      key={slot.startTime}
                      onClick={() => setSelectedTime(slot.startTime)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        selectedTime === slot.startTime
                          ? "border-primary bg-primary text-primary-foreground"
                          : "hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button 
            onClick={handleSelectDateTime} 
            className="w-full"
            disabled={!selectedDate || !selectedTime}
          >
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  if (step === "details") {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setStep("datetime")}>
          ← Voltar
        </Button>

        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold">Seus dados</h3>
          <p className="text-sm text-muted-foreground">Preencha suas informações</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alguma informação adicional?"
            />
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Serviço</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              {selectedStaff && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Profissional</span>
                  <span className="font-medium">{selectedStaff.name}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Data</span>
                <span className="font-medium">{new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Horário</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="font-medium">Total</span>
                <span className="font-bold text-primary">R$ {selectedService?.price.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button onClick={handleSubmit} className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Agendando...
              </>
            ) : (
              "Confirmar Agendamento"
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (step === "payment") {
    if (paymentInfo) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold">Agendamento criado!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Pague o sinal de R$ {paymentInfo.depositAmount.toFixed(2)} para confirmar
            </p>
          </div>

          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Pague via PIX</span>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Código PIX</Label>
                <div className="flex gap-2">
                  <Input
                    value={paymentInfo.copyPasteCode}
                    readOnly
                    className="text-xs font-mono"
                  />
                  <Button size="icon" variant="outline" onClick={handleCopyPix}>
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Expira em {new Date(paymentInfo.expiresAt).toLocaleTimeString("pt-BR")}
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              asChild
            >
              <a
                href={buildWhatsAppUrl(
                  merchantWhatsapp,
                  `Olá! Acabei de fazer um agendamento (${selectedService?.name} - ${selectedDate} às ${selectedTime}). Código do agendamento: ${paymentInfo.bookingId}`
                )}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Agendamento confirmado!</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedService?.name} em {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR")} às {selectedTime}
          </p>
        </div>
        <Button
          variant="outline"
          asChild
        >
          <a
            href={buildWhatsAppUrl(
              merchantWhatsapp,
              `Olá! Confirmei um agendamento (${selectedService?.name} - ${selectedDate} às ${selectedTime})`
            )}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Falar no WhatsApp
          </a>
        </Button>
      </div>
    );
  }

  return null;
}