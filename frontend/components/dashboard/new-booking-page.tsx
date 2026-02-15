"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, RefreshCw, Calendar, Clock, User, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createBooking, listMerchantServices, listMerchantStaff, getAvailableSlots } from "@/lib/api";
import type { Service, StaffMember, TimeSlot } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NewBookingPageProps {
  merchantId: string;
}

export function NewBookingPage({ merchantId }: NewBookingPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [formData, setFormData] = useState({
    serviceId: "",
    staffId: "",
    bookingDate: "",
    startTime: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, staffData] = await Promise.all([
          listMerchantServices(merchantId),
          listMerchantStaff(merchantId),
        ]);
        setServices(servicesData.services.filter((s) => s.active));
        setStaff(staffData.staff.filter((s) => s.active));
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [merchantId]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.serviceId || !formData.bookingDate) {
        setAvailableSlots([]);
        return;
      }

      setSlotsLoading(true);
      try {
        const data = await getAvailableSlots(
          formData.serviceId,
          formData.bookingDate,
          formData.staffId || undefined
        );
        setAvailableSlots(data.slots);
      } catch (err) {
        console.error(err);
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [formData.serviceId, formData.bookingDate, formData.staffId]);

  const selectedService = services.find((s) => s.id === formData.serviceId);
  const selectedStaff = staff.find((s) => s.id === formData.staffId);
  
  const eligibleStaff = selectedService
    ? staff.filter((s) => s.services.includes(selectedService.id))
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceId || !formData.bookingDate || !formData.startTime) return;

    setLoading(true);
    try {
      await createBooking({
        serviceId: formData.serviceId,
        merchantId,
        staffId: formData.staffId || undefined,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        notes: formData.notes || undefined,
      });
      router.push("/dashboard/bookings");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo Agendamento</h1>
          <p className="text-muted-foreground">Crie um agendamento manualmente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Dados do Agendamento</CardTitle>
            <CardDescription>Preencha as informações do cliente e do serviço</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceId">Serviço *</Label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) => setFormData({ ...formData, serviceId: value, staffId: "", startTime: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex items-center gap-2">
                        <span>{service.name}</span>
                        <span className="text-muted-foreground">- R$ {service.price.toFixed(2)}</span>
                        <Badge variant="secondary" className="ml-1">{formatDuration(service.durationMinutes)}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedService && (
              <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                <p><strong>Duração:</strong> {formatDuration(selectedService.durationMinutes)}</p>
                <p><strong>Preço:</strong> R$ {selectedService.price.toFixed(2)}</p>
                {selectedService.depositPercentage && (
                  <p><strong>Sinal ({selectedService.depositPercentage}%):</strong> R$ {(selectedService.price * selectedService.depositPercentage / 100).toFixed(2)}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="staffId">Profissional (opcional)</Label>
              <Select
                value={formData.staffId}
                onValueChange={(value) => setFormData({ ...formData, staffId: value, startTime: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Qualquer profissional disponível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Qualquer profissional</SelectItem>
                  {eligibleStaff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStaff && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Agendando com {selectedStaff.name}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bookingDate">Data *</Label>
                <Input
                  id="bookingDate"
                  type="date"
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value, startTime: "" })}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Horário *</Label>
                <Select
                  value={formData.startTime}
                  onValueChange={(value) => setFormData({ ...formData, startTime: value })}
                  disabled={!formData.bookingDate || slotsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={slotsLoading ? "Carregando..." : "Selecione"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot.startTime} value={slot.startTime}>
                        {slot.startTime} - {slot.endTime}
                      </SelectItem>
                    ))}
                    {availableSlots.length === 0 && !slotsLoading && (
                      <SelectItem value="none" disabled>Nenhum horário disponível</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-3">Dados do Cliente</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nome *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Telefone *</Label>
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="+55 11 99999-9999"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">E-mail</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Anotações adicionais..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !formData.serviceId || !formData.customerName || !formData.customerPhone || !formData.bookingDate || !formData.startTime}
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Criar Agendamento
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}