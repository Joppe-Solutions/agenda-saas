"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, Check, AlertCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { getMerchantProfile, upsertMerchantProfile, updateCancellationPolicy } from "@/lib/api";
import type { Merchant, MerchantNiche } from "@/lib/types";

interface SettingsPageProps {
  merchantId: string;
}

const nicheLabels: Record<MerchantNiche, string> = {
  FISHING: "Pesca Esportiva",
  SPORTS: "Esportes",
  TOURISM: "Turismo",
  SERVICES: "Serviços",
};

export function SettingsPage({ merchantId }: SettingsPageProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);

  const [formData, setFormData] = useState({
    businessName: "",
    slug: "",
    niche: "SERVICES" as MerchantNiche,
    whatsappNumber: "",
    pixKey: "",
    mercadoPagoAccessToken: "",
  });

  const [policyData, setPolicyData] = useState({
    deadlineHours: 24,
    refundPercentage: 0,
  });

  useEffect(() => {
    const fetchMerchant = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMerchantProfile(merchantId);
        setMerchant(data.merchant);
        setFormData({
          businessName: data.merchant.businessName,
          slug: data.merchant.slug,
          niche: data.merchant.niche,
          whatsappNumber: data.merchant.whatsappNumber,
          pixKey: data.merchant.pixKey,
          mercadoPagoAccessToken: data.merchant.mercadoPagoAccessToken ?? "",
        });
        setPolicyData({
          deadlineHours: data.merchant.cancellationDeadlineHours ?? 24,
          refundPercentage: data.merchant.cancellationRefundPercentage ?? 0,
        });
      } catch (err) {
        setError("Não foi possível carregar os dados");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMerchant();
  }, [merchantId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await upsertMerchantProfile({
        id: merchantId,
        businessName: formData.businessName,
        slug: formData.slug,
        niche: formData.niche,
        whatsappNumber: formData.whatsappNumber,
        pixKey: formData.pixKey,
        mercadoPagoAccessToken: formData.mercadoPagoAccessToken || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Erro ao salvar configurações");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePolicy = async () => {
    setSavingPolicy(true);
    try {
      await updateCancellationPolicy(merchantId, {
        deadlineHours: policyData.deadlineHours,
        refundPercentage: policyData.refundPercentage,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Erro ao salvar política de cancelamento");
      console.error(err);
    } finally {
      setSavingPolicy(false);
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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Configure seu perfil e métodos de pagamento</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      )}

      {saved && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-green-700 flex items-center gap-2">
            <Check className="h-4 w-4" />
            Configurações salvas com sucesso!
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações do Negócio</CardTitle>
          <CardDescription>Dados exibidos na sua página de reservas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nome do Negócio</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">URL da Página</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">reserva.online/</span>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="niche">Categoria</Label>
            <Select
              value={formData.niche}
              onValueChange={(value) => setFormData({ ...formData, niche: value as MerchantNiche })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FISHING">Pesca Esportiva</SelectItem>
                <SelectItem value="SPORTS">Esportes</SelectItem>
                <SelectItem value="TOURISM">Turismo</SelectItem>
                <SelectItem value="SERVICES">Serviços</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              placeholder="+55 11 99999-9999"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pagamentos</CardTitle>
          <CardDescription>Configure os métodos de pagamento para sinais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pixKey">Chave PIX</Label>
            <Input
              id="pixKey"
              value={formData.pixKey}
              onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
              placeholder="CPF, CNPJ, email ou telefone"
            />
            <p className="text-xs text-muted-foreground">
              Chave PIX para pagamentos manuais (quando Mercado Pago não configurado)
            </p>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={formData.mercadoPagoAccessToken ? "default" : "secondary"}>
                {formData.mercadoPagoAccessToken ? "Integrado" : "Não configurado"}
              </Badge>
              <span className="text-sm font-medium">Mercado Pago</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mercadoPagoAccessToken">Access Token</Label>
              <Input
                id="mercadoPagoAccessToken"
                type="password"
                value={formData.mercadoPagoAccessToken}
                onChange={(e) => setFormData({ ...formData, mercadoPagoAccessToken: e.target.value })}
                placeholder="APP_USR-..."
              />
              <p className="text-xs text-muted-foreground">
                Encontre em: Mercado Pago → Desenvolvedores → Credenciais → Access Token
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Política de Cancelamento</CardTitle>
          <CardDescription>Configure as regras de cancelamento para suas reservas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deadlineHours">Prazo de Cancelamento (horas antes)</Label>
            <Input
              id="deadlineHours"
              type="number"
              min={0}
              max={168}
              value={policyData.deadlineHours}
              onChange={(e) => setPolicyData({ ...policyData, deadlineHours: parseInt(e.target.value) || 0 })}
            />
            <p className="text-xs text-muted-foreground">
              Clientes só podem cancelar até {policyData.deadlineHours} horas antes da reserva
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="refundPercentage">Reembolso do Sinal (%)</Label>
            <Input
              id="refundPercentage"
              type="number"
              min={0}
              max={100}
              value={policyData.refundPercentage}
              onChange={(e) => setPolicyData({ ...policyData, refundPercentage: parseInt(e.target.value) || 0 })}
            />
            <p className="text-xs text-muted-foreground">
              Porcentagem do sinal que será reembolsada em caso de cancelamento dentro do prazo
            </p>
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">Exemplo:</p>
            <p className="text-muted-foreground mt-1">
              Com prazo de {policyData.deadlineHours}h e reembolso de {policyData.refundPercentage}%:
            </p>
            <ul className="text-muted-foreground mt-1 list-disc list-inside text-xs space-y-1">
              <li>Cliente pode cancelar até {policyData.deadlineHours}h antes</li>
              <li>Se cancelar no prazo, recebe {policyData.refundPercentage}% do sinal de volta</li>
              <li>Se cancelar fora do prazo, não recebe reembolso</li>
            </ul>
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button onClick={handleSavePolicy} disabled={savingPolicy}>
              {savingPolicy ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Política
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
