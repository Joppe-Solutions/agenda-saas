"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, User, Clock, DollarSign, Phone, Mail, Power, Calendar } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  listMerchantStaff, createStaffMember, updateStaffMember, deleteStaffMember,
  listMerchantServices, listStaffAvailability, setStaffAvailability
} from "@/lib/api";
import type { StaffMember, Service, StaffAvailability } from "@/lib/types";

interface StaffPageProps {
  merchantId: string;
}

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function StaffPage({ merchantId }: StaffPageProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    commissionPercentage: 0,
    services: [] as string[],
    active: true,
  });

  const [availabilityForm, setAvailabilityForm] = useState<{ [key: number]: { enabled: boolean; startTime: string; endTime: string } }>(() => {
    const initial: { [key: number]: { enabled: boolean; startTime: string; endTime: string } } = {};
    for (let i = 0; i < 7; i++) {
      initial[i] = { enabled: i >= 1 && i <= 5, startTime: "09:00", endTime: "18:00" };
    }
    return initial;
  });

  useEffect(() => {
    loadData();
  }, [merchantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffData, servicesData] = await Promise.all([
        listMerchantStaff(merchantId),
        listMerchantServices(merchantId),
      ]);
      setStaff(staffData.staff);
      setServices(servicesData.services);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setSelectedStaff(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      bio: "",
      commissionPercentage: 0,
      services: [],
      active: true,
    });
    setDialogOpen(true);
    setActiveTab("details");
  };

  const openEditDialog = async (member: StaffMember) => {
    setSelectedStaff(member);
    setFormData({
      name: member.name,
      email: member.email || "",
      phone: member.phone || "",
      bio: member.bio || "",
      commissionPercentage: member.commissionPercentage || 0,
      services: member.services || [],
      active: member.active,
    });

    try {
      const availData = await listStaffAvailability(member.id);
      const newForm: { [key: number]: { enabled: boolean; startTime: string; endTime: string } } = {};
      for (let i = 0; i < 7; i++) {
        const rule = availData.availability.find(a => a.dayOfWeek === i);
        newForm[i] = {
          enabled: !!rule,
          startTime: rule?.startTime || "09:00",
          endTime: rule?.endTime || "18:00",
        };
      }
      setAvailabilityForm(newForm);
    } catch (err) {
      console.error("Error loading availability:", err);
    }

    setDialogOpen(true);
    setActiveTab("details");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      if (selectedStaff) {
        await updateStaffMember(selectedStaff.id, formData);
        
        const availability = Object.entries(availabilityForm)
          .filter(([, v]) => v.enabled)
          .map(([day, v]) => ({
            staffId: selectedStaff.id,
            dayOfWeek: parseInt(day),
            startTime: v.startTime,
            endTime: v.endTime,
          }));
        
        if (availability.length > 0) {
          await setStaffAvailability(selectedStaff.id, availability);
        }
      } else {
        const result = await createStaffMember({
          merchantId,
          ...formData,
        });
        
        const availability = Object.entries(availabilityForm)
          .filter(([, v]) => v.enabled)
          .map(([day, v]) => ({
            staffId: result.staff.id,
            dayOfWeek: parseInt(day),
            startTime: v.startTime,
            endTime: v.endTime,
          }));
        
        if (availability.length > 0) {
          await setStaffAvailability(result.staff.id, availability);
        }
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      console.error("Error saving staff:", err);
      setError("Erro ao salvar profissional");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;

    setSaving(true);
    try {
      await deleteStaffMember(selectedStaff.id);
      setDeleteDialogOpen(false);
      setSelectedStaff(null);
      loadData();
    } catch (err) {
      console.error("Error deleting staff:", err);
      setError("Erro ao excluir profissional");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleService = (serviceId: string) => {
    const current = formData.services;
    if (current.includes(serviceId)) {
      setFormData({ ...formData, services: current.filter(id => id !== serviceId) });
    } else {
      setFormData({ ...formData, services: [...current, serviceId] });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
          <h2 className="text-2xl font-bold tracking-tight">Profissionais</h2>
          <p className="text-muted-foreground">
            Gerencie sua equipe e suas agendas
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Profissional
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4">
          {error}
        </div>
      )}

      {staff.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum profissional cadastrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Cadastre sua equipe para gerenciar agendas individuais
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Profissional
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <Card key={member.id} className={!member.active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.photo} />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription>
                        {member.services.length} serviço{member.services.length !== 1 ? "s" : ""}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(member)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedStaff(member);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{member.email}</span>
                  </div>
                )}
                {member.commissionPercentage && member.commissionPercentage > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>Comissão: {member.commissionPercentage}%</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1 pt-2">
                  {member.services.slice(0, 3).map((serviceId) => {
                    const service = services.find(s => s.id === serviceId);
                    return service ? (
                      <Badge key={serviceId} variant="secondary" className="text-xs">
                        {service.name}
                      </Badge>
                    ) : null;
                  })}
                  {member.services.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{member.services.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStaff ? "Editar Profissional" : "Novo Profissional"}
            </DialogTitle>
            <DialogDescription>
              Configure os dados e horários de trabalho
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Dados</TabsTrigger>
              <TabsTrigger value="availability">Horários</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do profissional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commission">Comissão (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    value={formData.commissionPercentage}
                    onChange={(e) => setFormData({ ...formData, commissionPercentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Uma breve descrição..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Serviços</Label>
                <div className="flex flex-wrap gap-2">
                  {services.map((service) => (
                    <Badge
                      key={service.id}
                      variant={formData.services.includes(service.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleToggleService(service.id)}
                    >
                      {service.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Profissional ativo</Label>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, active: checked })}
                />
              </div>
            </TabsContent>

            <TabsContent value="availability" className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Configure os horários de trabalho do profissional
              </p>
              <div className="space-y-3">
                {DAY_NAMES.map((day, index) => (
                  <div key={day} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="w-32 flex items-center gap-2">
                      <Switch
                        checked={availabilityForm[index].enabled}
                        onCheckedChange={(checked: boolean) => 
                          setAvailabilityForm({
                            ...availabilityForm,
                            [index]: { ...availabilityForm[index], enabled: checked }
                          })
                        }
                      />
                      <span className="font-medium">{day}</span>
                    </div>
                    {availabilityForm[index].enabled && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={availabilityForm[index].startTime}
                          onChange={(e) => 
                            setAvailabilityForm({
                              ...availabilityForm,
                              [index]: { ...availabilityForm[index], startTime: e.target.value }
                            })
                          }
                          className="w-28"
                        />
                        <span className="text-muted-foreground">às</span>
                        <Input
                          type="time"
                          value={availabilityForm[index].endTime}
                          onChange={(e) => 
                            setAvailabilityForm({
                              ...availabilityForm,
                              [index]: { ...availabilityForm[index], endTime: e.target.value }
                            })
                          }
                          className="w-28"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

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
            <DialogTitle>Excluir profissional</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir "{selectedStaff?.name}"? Esta ação não pode ser desfeita.
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