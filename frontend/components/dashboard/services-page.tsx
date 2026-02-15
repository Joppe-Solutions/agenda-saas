"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Power, Clock, DollarSign, Settings, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  listMerchantServices, createService, updateService, deleteService,
  listServiceCategories
} from "@/lib/api";
import type { Service, ServiceCategory } from "@/lib/types";

interface ServicesPageProps {
  merchantId: string;
}

export function ServicesPage({ merchantId }: ServicesPageProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    durationMinutes: 60,
    price: 0,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 0,
    requireDeposit: true,
    depositAmount: 0,
    depositPercentage: 50,
    allowStaffSelection: true,
    active: true,
  });

  useEffect(() => {
    loadServices();
    loadCategories();
  }, [merchantId]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await listMerchantServices(merchantId);
      setServices(data.services);
    } catch (err) {
      console.error("Error loading services:", err);
      setError("Erro ao carregar serviços");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await listServiceCategories(merchantId);
      setCategories(data.categories);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const openCreateDialog = () => {
    setSelectedService(null);
    setFormData({
      name: "",
      description: "",
      categoryId: categories[0]?.id || "",
      durationMinutes: 60,
      price: 0,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 0,
      requireDeposit: true,
      depositAmount: 0,
      depositPercentage: 50,
      allowStaffSelection: true,
      active: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      categoryId: service.categoryId || "",
      durationMinutes: service.durationMinutes,
      price: service.price,
      bufferBeforeMinutes: service.bufferBeforeMinutes,
      bufferAfterMinutes: service.bufferAfterMinutes,
      requireDeposit: service.requireDeposit,
      depositAmount: service.depositAmount || 0,
      depositPercentage: service.depositPercentage || 50,
      allowStaffSelection: service.allowStaffSelection,
      active: service.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      if (selectedService) {
        await updateService(selectedService.id, formData);
      } else {
        await createService({
          merchantId,
          ...formData,
        });
      }
      setDialogOpen(false);
      loadServices();
    } catch (err) {
      console.error("Error saving service:", err);
      setError("Erro ao salvar serviço");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;

    setSaving(true);
    try {
      await deleteService(selectedService.id);
      setDeleteDialogOpen(false);
      setSelectedService(null);
      loadServices();
    } catch (err) {
      console.error("Error deleting service:", err);
      setError("Erro ao excluir serviço");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await updateService(service.id, { active: !service.active });
      loadServices();
    } catch (err) {
      console.error("Error toggling service:", err);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Serviços</h2>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos pelo seu negócio
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4">
          {error}
        </div>
      )}

      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum serviço cadastrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece cadastrando seus serviços para que seus clientes possam agendar
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Serviço
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className={!service.active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    {service.category && (
                      <Badge variant="secondary" className="mt-1">
                        {service.category.name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(service)}
                    >
                      {service.active ? (
                        <Power className="h-4 w-4 text-green-500" />
                      ) : (
                        <Power className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(service)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedService(service);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {service.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDuration(service.durationMinutes)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      R$ {service.price.toFixed(2)}
                    </span>
                  </div>
                </div>
                {service.requireDeposit && (
                  <p className="text-xs text-muted-foreground">
                    Sinal: {service.depositPercentage 
                      ? `${service.depositPercentage}%` 
                      : `R$ ${service.depositAmount?.toFixed(2)}`}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedService ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
            <DialogDescription>
              Configure os detalhes do serviço
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Corte feminino"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o serviço..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="requireDeposit">Exigir sinal</Label>
                <Switch
                  id="requireDeposit"
                  checked={formData.requireDeposit}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, requireDeposit: checked })}
                />
              </div>
              
              {formData.requireDeposit && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="depositPercentage">% do sinal</Label>
                    <Input
                      id="depositPercentage"
                      type="number"
                      value={formData.depositPercentage}
                      onChange={(e) => setFormData({ ...formData, depositPercentage: parseInt(e.target.value) || 50 })}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="allowStaffSelection">Permitir escolher profissional</Label>
              <Switch
                id="allowStaffSelection"
                checked={formData.allowStaffSelection}
                onCheckedChange={(checked: boolean) => setFormData({ ...formData, allowStaffSelection: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Serviço ativo</Label>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked: boolean) => setFormData({ ...formData, active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.name.trim()}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir serviço</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir "{selectedService?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}