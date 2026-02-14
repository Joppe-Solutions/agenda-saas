"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Power, PowerOff, RefreshCw } from "lucide-react";
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
import { listMerchantAssets, createAsset, updateAsset, deleteAsset } from "@/lib/api";
import type { Asset, PricingType } from "@/lib/types";

interface AssetsPageProps {
  merchantId: string;
}

export function AssetsPage({ merchantId }: AssetsPageProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: 1,
    basePrice: 0,
    pricingType: "FULL_DAY" as PricingType,
    durationMinutes: 60,
    active: true,
  });

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMerchantAssets(merchantId);
      setAssets(data.assets);
    } catch (err) {
      setError("Não foi possível carregar os recursos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [merchantId]);

  const openCreateDialog = () => {
    setSelectedAsset(null);
    setFormData({
      name: "",
      description: "",
      capacity: 1,
      basePrice: 0,
      pricingType: "FULL_DAY",
      durationMinutes: 60,
      active: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormData({
      name: asset.name,
      description: asset.description ?? "",
      capacity: asset.capacity,
      basePrice: asset.basePrice,
      pricingType: asset.pricingType,
      durationMinutes: asset.durationMinutes ?? 60,
      active: asset.active,
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selectedAsset) {
        await updateAsset(selectedAsset.id, {
          name: formData.name || undefined,
          description: formData.description || undefined,
          capacity: formData.capacity,
          basePrice: formData.basePrice,
          pricingType: formData.pricingType,
          durationMinutes: formData.pricingType === "HOURLY" ? formData.durationMinutes : undefined,
          active: formData.active,
        });
      } else {
        await createAsset({
          merchantId,
          name: formData.name,
          description: formData.description || undefined,
          capacity: formData.capacity,
          basePrice: formData.basePrice,
          pricingType: formData.pricingType,
          durationMinutes: formData.pricingType === "HOURLY" ? formData.durationMinutes : undefined,
          active: formData.active,
        });
      }
      setDialogOpen(false);
      fetchAssets();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar recurso");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAsset) return;
    setSaving(true);
    try {
      await deleteAsset(selectedAsset.id);
      setDeleteDialogOpen(false);
      fetchAssets();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir recurso");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (asset: Asset) => {
    try {
      await updateAsset(asset.id, { active: !asset.active });
      fetchAssets();
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
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Recurso
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-700">{error}</CardContent>
        </Card>
      )}

      {assets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum recurso cadastrado</p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Criar primeiro recurso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Card key={asset.id} className={!asset.active ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{asset.name}</CardTitle>
                    <CardDescription>
                      {asset.pricingType === "FULL_DAY" ? "Dia inteiro" : "Por hora"}
                      {asset.durationMinutes && ` (${asset.durationMinutes}min)`}
                    </CardDescription>
                  </div>
                  <Badge variant={asset.active ? "default" : "secondary"}>
                    {asset.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {asset.description && (
                  <p className="text-sm text-muted-foreground mb-4">{asset.description}</p>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacidade:</span>
                    <span>{asset.capacity} pessoas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço base:</span>
                    <span>R$ {asset.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sinal (30%):</span>
                    <span className="font-medium">R$ {(asset.basePrice * 0.3).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(asset)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(asset)}
                  >
                    {asset.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(asset)}
                    className="text-red-600 hover:text-red-700"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAsset ? "Editar Recurso" : "Novo Recurso"}</DialogTitle>
            <DialogDescription>
              Configure os detalhes do recurso disponível para reserva
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Barco de Pesca, Quadra de Tênis"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o recurso..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricingType">Tipo de Cobrança</Label>
                <Select
                  value={formData.pricingType}
                  onValueChange={(value) => setFormData({ ...formData, pricingType: value as PricingType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_DAY">Dia Inteiro</SelectItem>
                    <SelectItem value="HOURLY">Por Hora</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.pricingType === "HOURLY" && (
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
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.name}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Recurso</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir "{selectedAsset?.name}"? Esta ação não pode ser desfeita.
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
