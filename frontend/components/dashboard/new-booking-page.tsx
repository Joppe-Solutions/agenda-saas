"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";
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
import { createBooking, listMerchantResources } from "@/lib/api";
import type { Resource } from "@/lib/types";
import { useEffect } from "react";

interface NewBookingPageProps {
  merchantId: string;
}

export function NewBookingPage({ merchantId }: NewBookingPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);

  const [formData, setFormData] = useState({
    resourceId: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    bookingDate: "",
    startTime: "",
    peopleCount: 1,
    notes: "",
    skipPayment: true,
  });

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await listMerchantResources(merchantId);
        setResources(data.resources.filter((r) => r.active));
      } catch (err) {
        console.error(err);
      } finally {
        setResourcesLoading(false);
      }
    };
    fetchResources();
  }, [merchantId]);

  const selectedResource = resources.find((r) => r.id === formData.resourceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.resourceId) return;

    setLoading(true);
    try {
      await createBooking({
        resourceId: formData.resourceId,
        merchantId,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        bookingDate: formData.bookingDate,
        startTime: selectedResource?.pricingType === "HOURLY" ? formData.startTime : undefined,
        peopleCount: formData.peopleCount,
      });
      router.push("/dashboard/bookings");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar reserva");
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 6; h <= 22; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
      slots.push(`${String(h).padStart(2, "0")}:30`);
    }
    return slots;
  };

  if (resourcesLoading) {
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
          <h1 className="text-2xl font-bold tracking-tight">Nova Reserva</h1>
          <p className="text-muted-foreground">Crie uma reserva manualmente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Dados da Reserva</CardTitle>
            <CardDescription>Preencha as informações do cliente e da reserva</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resourceId">Recurso *</Label>
              <Select
                value={formData.resourceId}
                onValueChange={(value) => setFormData({ ...formData, resourceId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um recurso" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.name} - R$ {resource.basePrice.toFixed(2)}
                      {resource.pricingType === "HOURLY" && "/hora"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedResource && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p><strong>Capacidade:</strong> {selectedResource.capacity} pessoas</p>
                <p><strong>Sinal (30%):</strong> R$ {(selectedResource.basePrice * 0.3).toFixed(2)}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bookingDate">Data *</Label>
                <Input
                  id="bookingDate"
                  type="date"
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              {selectedResource?.pricingType === "HOURLY" && (
                <div className="space-y-2">
                  <Label htmlFor="startTime">Horário *</Label>
                  <Select
                    value={formData.startTime}
                    onValueChange={(value) => setFormData({ ...formData, startTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeSlots().map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="peopleCount">Pessoas *</Label>
                <Input
                  id="peopleCount"
                  type="number"
                  min={1}
                  max={selectedResource?.capacity ?? 100}
                  value={formData.peopleCount}
                  onChange={(e) => setFormData({ ...formData, peopleCount: parseInt(e.target.value) || 1 })}
                  required
                />
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
          <Button type="submit" disabled={loading || !formData.resourceId || !formData.customerName || !formData.customerPhone || !formData.bookingDate}>
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Criar Reserva
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
