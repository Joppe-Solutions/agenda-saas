"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Power, PowerOff, RefreshCw, Clock, Users, DollarSign, Calendar, Settings, ChevronRight } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  listMerchantResources, createResource, updateResource, deleteResource,
  listAvailabilityRules, setAvailabilityRules, listBlocks, createBlock, deleteBlock
} from "@/lib/api";
import type { Resource, PricingType, ResourceType, ResourceTemplate, AvailabilityRule, Block, BlockReason } from "@/lib/types";
import { RESOURCE_TYPE_LABELS, RESOURCE_TYPE_ICONS, BOOKING_STATUS_LABELS } from "@/lib/types";

interface ResourcesPageProps {
  merchantId: string;
}

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const DEFAULT_TEMPLATES: ResourceTemplate[] = [
  { type: "BOAT", name: "Barco", icon: "🚤", defaultCapacity: 6, defaultPricingType: "FULL_DAY", defaultDurationMinutes: 480, description: "Barco de pesca, passeio ou turismo" },
  { type: "SPORTS_COURT", name: "Quadra", icon: "⚽", defaultCapacity: 20, defaultPricingType: "HOURLY", defaultDurationMinutes: 60, description: "Quadra esportiva" },
  { type: "CONSULTING_ROOM", name: "Consultório", icon: "🏥", defaultCapacity: 1, defaultPricingType: "HOURLY", defaultDurationMinutes: 60, description: "Sala para consultas" },
  { type: "EVENT_SPACE", name: "Espaço Eventos", icon: "🎉", defaultCapacity: 50, defaultPricingType: "SLOT", defaultDurationMinutes: 240, description: "Espaço para festas" },
  { type: "EQUIPMENT", name: "Equipamento", icon: "🎮", defaultCapacity: 1, defaultPricingType: "HOURLY", defaultDurationMinutes: 60, description: "Equipamentos" },
  { type: "PROFESSIONAL", name: "Profissional", icon: "✂️", defaultCapacity: 1, defaultPricingType: "HOURLY", defaultDurationMinutes: 30, description: "Agenda de profissional" },
  { type: "VACATION_RENTAL", name: "Imóvel", icon: "🏠", defaultCapacity: 4, defaultPricingType: "FULL_DAY", defaultDurationMinutes: 1440, description: "Casa/apartamento" },
  { type: "OTHER", name: "Outro", icon: "📦", defaultCapacity: 1, defaultPricingType: "HOURLY", defaultDurationMinutes: 60, description: "Outro tipo" },
];

export function ResourcesPage({ merchantId }: ResourcesPageProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [saving, setSaving] = useState(false);
  const [wizardStep, setWizardStep] = useState<"template" | "details" | "availability" | "blocks">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<ResourceTemplate | null>(null);
  const [availabilityRules, setAvailabilityRulesState] = useState<AvailabilityRule[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [newBlock, setNewBlock] = useState<{
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    reason: BlockReason;
    notes: string;
  }>({
    startDate: "",
    startTime: "08:00",
    endDate: "",
    endTime: "18:00",
    reason: "maintenance",
    notes: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    resourceType: "OTHER" as ResourceType,
    capacity: 1,
    basePrice: 0,
    pricingType: "FULL_DAY" as PricingType,
    durationMinutes: 60,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 0,
    terms: "",
    active: true,
  });

  const [availabilityForm, setAvailabilityForm] = useState<{ [key: number]: { enabled: boolean; startTime: string; endTime: string } }>(() => {
    const initial: { [key: number]: { enabled: boolean; startTime: string; endTime: string } } = {};
    for (let i = 0; i < 7; i++) {
      initial[i] = { enabled: true, startTime: "08:00", endTime: "18:00" };
    }
    return initial;
  });

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMerchantResources(merchantId);
      setResources(data.resources);
    } catch (err) {
      setError("Não foi possível carregar os recursos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [merchantId]);

  const openCreateDialog = () => {
    setSelectedResource(null);
    setSelectedTemplate(null);
    setWizardStep("template");
    setFormData({
      name: "",
      description: "",
      resourceType: "OTHER",
      capacity: 1,
      basePrice: 0,
      pricingType: "FULL_DAY",
      durationMinutes: 60,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 0,
      terms: "",
      active: true,
    });
    setAvailabilityForm(() => {
      const initial: { [key: number]: { enabled: boolean; startTime: string; endTime: string } } = {};
      for (let i = 0; i < 7; i++) {
        initial[i] = { enabled: true, startTime: "08:00", endTime: "18:00" };
      }
      return initial;
    });
    setDialogOpen(true);
  };

  const openEditDialog = async (resource: Resource) => {
    setSelectedResource(resource);
    setSelectedTemplate(DEFAULT_TEMPLATES.find(t => t.type === resource.resourceType) || null);
    setWizardStep("details");
    setFormData({
      name: resource.name,
      description: resource.description ?? "",
      resourceType: resource.resourceType,
      capacity: resource.capacity,
      basePrice: resource.basePrice,
      pricingType: resource.pricingType,
      durationMinutes: resource.durationMinutes ?? 60,
      bufferBeforeMinutes: resource.bufferBeforeMinutes,
      bufferAfterMinutes: resource.bufferAfterMinutes,
      terms: resource.terms ?? "",
      active: resource.active,
    });

    try {
      const rulesData = await listAvailabilityRules(resource.id);
      setAvailabilityRulesState(rulesData.rules);
      
      const newAvailabilityForm: { [key: number]: { enabled: boolean; startTime: string; endTime: string } } = {};
      for (let i = 0; i < 7; i++) {
        const rule = rulesData.rules.find(r => r.dayOfWeek === i);
        newAvailabilityForm[i] = rule 
          ? { enabled: true, startTime: rule.startTime, endTime: rule.endTime }
          : { enabled: false, startTime: "08:00", endTime: "18:00" };
      }
      setAvailabilityForm(newAvailabilityForm);

      const blocksData = await listBlocks(resource.id);
      setBlocks(blocksData.blocks);
    } catch (err) {
      console.error("Error loading availability:", err);
    }

    setDialogOpen(true);
  };

  const openDeleteDialog = (resource: Resource) => {
    setSelectedResource(resource);
    setDeleteDialogOpen(true);
  };

  const handleTemplateSelect = (template: ResourceTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      resourceType: template.type,
      capacity: template.defaultCapacity,
      pricingType: template.defaultPricingType,
      durationMinutes: template.defaultDurationMinutes ?? 60,
    });
    setWizardStep("details");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let resourceId = selectedResource?.id;

      if (selectedResource) {
        await updateResource(selectedResource.id, {
          name: formData.name || undefined,
          description: formData.description || undefined,
          resourceType: formData.resourceType,
          capacity: formData.capacity,
          basePrice: formData.basePrice,
          pricingType: formData.pricingType,
          durationMinutes: formData.pricingType !== "FULL_DAY" ? formData.durationMinutes : undefined,
          bufferBeforeMinutes: formData.bufferBeforeMinutes,
          bufferAfterMinutes: formData.bufferAfterMinutes,
          terms: formData.terms || undefined,
          active: formData.active,
        });
      } else {
        const result = await createResource({
          merchantId,
          name: formData.name,
          description: formData.description || undefined,
          resourceType: formData.resourceType,
          capacity: formData.capacity,
          basePrice: formData.basePrice,
          pricingType: formData.pricingType,
          durationMinutes: formData.pricingType !== "FULL_DAY" ? formData.durationMinutes : undefined,
          bufferBeforeMinutes: formData.bufferBeforeMinutes,
          bufferAfterMinutes: formData.bufferAfterMinutes,
          terms: formData.terms || undefined,
          active: formData.active,
        });
        resourceId = result.resource.id;
      }

      if (resourceId) {
        const rules = [];
        for (let day = 0; day < 7; day++) {
          const dayConfig = availabilityForm[day];
          if (dayConfig.enabled) {
            rules.push({
              resourceId,
              dayOfWeek: day,
              startTime: dayConfig.startTime,
              endTime: dayConfig.endTime,
              slotDurationMinutes: formData.durationMinutes || 60,
            });
          }
        }

        if (rules.length > 0) {
          await setAvailabilityRules(resourceId, rules);
        }
      }

      setDialogOpen(false);
      fetchResources();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar recurso");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedResource) return;
    setSaving(true);
    try {
      await deleteResource(selectedResource.id);
      setDeleteDialogOpen(false);
      fetchResources();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir recurso");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (resource: Resource) => {
    try {
      await updateResource(resource.id, { active: !resource.active });
      fetchResources();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBlock = async () => {
    if (!selectedResource || !newBlock.startDate || !newBlock.endDate) return;
    setSaving(true);
    try {
      await createBlock({
        resourceId: selectedResource.id,
        startTime: `${newBlock.startDate}T${newBlock.startTime}:00`,
        endTime: `${newBlock.endDate}T${newBlock.endTime}:00`,
        reason: newBlock.reason,
        notes: newBlock.notes || undefined,
      });
      const blocksData = await listBlocks(selectedResource.id);
      setBlocks(blocksData.blocks);
      setBlockDialogOpen(false);
      setNewBlock({
        startDate: "",
        startTime: "08:00",
        endDate: "",
        endTime: "18:00",
        reason: "maintenance",
        notes: "",
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao criar bloqueio");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!selectedResource) return;
    try {
      await deleteBlock(blockId);
      const blocksData = await listBlocks(selectedResource.id);
      setBlocks(blocksData.blocks);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recursos</h1>
          <p className="text-muted-foreground">Gerencie os recursos disponíveis para reserva</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Novo Recurso
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="p-4 text-red-700 dark:text-red-400">{error}</CardContent>
        </Card>
      )}

      {resources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum recurso cadastrado</p>
            <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Criar primeiro recurso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.id} className={!resource.active ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{RESOURCE_TYPE_ICONS[resource.resourceType]}</span>
                    <div>
                      <CardTitle className="text-lg">{resource.name}</CardTitle>
                      <CardDescription>
                        {RESOURCE_TYPE_LABELS[resource.resourceType]}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={resource.active ? "default" : "secondary"} className={resource.active ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}>
                    {resource.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {resource.description && (
                  <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> Capacidade:
                    </span>
                    <span>{resource.capacity} pessoas</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Preço base:
                    </span>
                    <span className="font-medium">R$ {resource.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Cobrança:
                    </span>
                    <span>
                      {resource.pricingType === "FULL_DAY" ? "Diária" : 
                       resource.pricingType === "HOURLY" ? "Por hora" :
                       resource.pricingType === "SLOT" ? "Por slot" : "Por pessoa"}
                      {resource.durationMinutes && resource.pricingType !== "FULL_DAY" && ` (${resource.durationMinutes}min)`}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(resource)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(resource)}
                  >
                    {resource.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(resource)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
              {selectedResource ? "Editar Recurso" : wizardStep === "template" ? "Escolha o Tipo" : "Novo Recurso"}
            </DialogTitle>
            <DialogDescription>
              {wizardStep === "template" && "Selecione um template para começar rapidamente"}
              {wizardStep === "details" && "Configure os detalhes do recurso"}
              {wizardStep === "availability" && "Configure os horários de funcionamento"}
            </DialogDescription>
          </DialogHeader>

          {wizardStep === "template" && !selectedResource && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
              {DEFAULT_TEMPLATES.map((template) => (
                <Card 
                  key={template.type}
                  className="cursor-pointer hover:border-brand-cyan hover:bg-brand-cyan/5 transition-all"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardContent className="p-4 text-center">
                    <span className="text-3xl block mb-2">{template.icon}</span>
                    <span className="font-medium text-sm">{template.name}</span>
                    <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {(wizardStep === "details" || wizardStep === "availability" || wizardStep === "blocks") && (
            <Tabs value={wizardStep} onValueChange={(v) => setWizardStep(v as typeof wizardStep)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="availability">Disponibilidade</TabsTrigger>
                <TabsTrigger value="blocks">Bloqueios</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="resourceType">Tipo</Label>
                    <Select
                      value={formData.resourceType}
                      onValueChange={(value) => setFormData({ ...formData, resourceType: value as ResourceType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEFAULT_TEMPLATES.map(t => (
                          <SelectItem key={t.type} value={t.type}>
                            {t.icon} {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Barco Thor, Quadra 1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o recurso..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacidade</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min={1}
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Preço Base (R$)</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      min={0}
                      step={0.01}
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricingType">Tipo Cobrança</Label>
                    <Select
                      value={formData.pricingType}
                      onValueChange={(value) => setFormData({ ...formData, pricingType: value as PricingType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL_DAY">Diária</SelectItem>
                        <SelectItem value="HOURLY">Por Hora</SelectItem>
                        <SelectItem value="SLOT">Por Slot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.pricingType !== "FULL_DAY" && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="durationMinutes">Duração (min)</Label>
                      <Input
                        id="durationMinutes"
                        type="number"
                        min={15}
                        step={15}
                        value={formData.durationMinutes}
                        onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bufferBefore">Buffer Antes (min)</Label>
                      <Input
                        id="bufferBefore"
                        type="number"
                        min={0}
                        value={formData.bufferBeforeMinutes}
                        onChange={(e) => setFormData({ ...formData, bufferBeforeMinutes: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bufferAfter">Buffer Depois (min)</Label>
                      <Input
                        id="bufferAfter"
                        type="number"
                        min={0}
                        value={formData.bufferAfterMinutes}
                        onChange={(e) => setFormData({ ...formData, bufferAfterMinutes: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="terms">Termos e Regras</Label>
                  <Textarea
                    id="terms"
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    placeholder="Regras de cancelamento, políticas, etc."
                    rows={2}
                  />
                </div>
              </TabsContent>

              <TabsContent value="availability" className="space-y-4 py-4">
                <div className="space-y-3">
                  {DAY_NAMES.map((day, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                      <div className="w-32 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`day-${index}`}
                          checked={availabilityForm[index].enabled}
                          onChange={(e) => setAvailabilityForm({
                            ...availabilityForm,
                            [index]: { ...availabilityForm[index], enabled: e.target.checked }
                          })}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`day-${index}`} className="cursor-pointer">{day}</Label>
                      </div>
                      {availabilityForm[index].enabled && (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="time"
                            value={availabilityForm[index].startTime}
                            onChange={(e) => setAvailabilityForm({
                              ...availabilityForm,
                              [index]: { ...availabilityForm[index], startTime: e.target.value }
                            })}
                            className="w-28"
                          />
                          <span className="text-muted-foreground">às</span>
                          <Input
                            type="time"
                            value={availabilityForm[index].endTime}
                            onChange={(e) => setAvailabilityForm({
                              ...availabilityForm,
                              [index]: { ...availabilityForm[index], endTime: e.target.value }
                            })}
                            className="w-28"
                          />
                        </div>
                      )}
                      {!availabilityForm[index].enabled && (
                        <span className="text-muted-foreground text-sm">Fechado</span>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="blocks" className="space-y-4 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">Bloqueios de Horário</h4>
                    <p className="text-sm text-muted-foreground">
                      Períodos em que o recurso não estará disponível
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setBlockDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Bloqueio
                  </Button>
                </div>

                {blocks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>Nenhum bloqueio cadastrado</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {blocks.map((block) => (
                      <div key={block.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div>
                          <p className="font-medium text-sm">
                            {new Date(block.startTime).toLocaleDateString("pt-BR")}{" "}
                            {new Date(block.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            {" - "}
                            {new Date(block.endTime).toLocaleDateString("pt-BR")}{" "}
                            {new Date(block.endTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {block.reason === "maintenance" && "Manutenção"}
                            {block.reason === "vacation" && "Folga/Férias"}
                            {block.reason === "weather" && "Clima"}
                            {block.reason === "other" && "Outro"}
                            {block.notes && ` - ${block.notes}`}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteBlock(block.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Bloqueio</DialogTitle>
                      <DialogDescription>
                        Defina um período em que o recurso não estará disponível
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Data Início</Label>
                          <Input
                            type="date"
                            value={newBlock.startDate}
                            onChange={(e) => setNewBlock({ ...newBlock, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Horário Início</Label>
                          <Input
                            type="time"
                            value={newBlock.startTime}
                            onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Data Fim</Label>
                          <Input
                            type="date"
                            value={newBlock.endDate}
                            onChange={(e) => setNewBlock({ ...newBlock, endDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Horário Fim</Label>
                          <Input
                            type="time"
                            value={newBlock.endTime}
                            onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Motivo</Label>
                        <Select
                          value={newBlock.reason}
                          onValueChange={(v) => setNewBlock({ ...newBlock, reason: v as BlockReason })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maintenance">Manutenção</SelectItem>
                            <SelectItem value="vacation">Folga/Férias</SelectItem>
                            <SelectItem value="weather">Clima</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Observações</Label>
                        <Input
                          value={newBlock.notes}
                          onChange={(e) => setNewBlock({ ...newBlock, notes: e.target.value })}
                          placeholder="Opcional"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleCreateBlock} disabled={saving || !newBlock.startDate || !newBlock.endDate}>
                        {saving ? "Salvando..." : "Criar Bloqueio"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="gap-2">
            {wizardStep !== "template" && !selectedResource && (
              <Button variant="outline" onClick={() => setWizardStep("template")}>
                Voltar
              </Button>
            )}
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            {(wizardStep === "availability" || wizardStep === "blocks") && (
              <Button onClick={handleSave} disabled={saving || !formData.name} className="bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue-950">
                {saving ? "Salvando..." : "Salvar Recurso"}
              </Button>
            )}
            {wizardStep === "details" && (
              <Button onClick={() => setWizardStep("availability")} disabled={!formData.name} className="bg-brand-cyan hover:bg-brand-cyan/90 text-white">
                Próximo <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Recurso</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir "{selectedResource?.name}"? Esta ação não pode ser desfeita.
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