"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Building2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Logo } from "@/components/ui/logo";

const niches = [
  { value: "FISHING", label: "Pesca Esportiva", icon: "🚤" },
  { value: "SPORTS", label: "Esportes", icon: "⚽" },
  { value: "TOURISM", label: "Turismo", icon: "🏖️" },
  { value: "SERVICES", label: "Serviços", icon: "📋" },
];

export default function CreateOrgPage() {
  const { createOrganization } = useClerk();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    niche: "SERVICES",
  });

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Digite o nome do seu negócio");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const org = await createOrganization({
        name: formData.name.trim(),
        slug: formData.name.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 30),
      });

      if (org) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Error creating organization:", err);
      setError("Erro ao criar organização. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo variant="full" size="md" />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-cyan/20">
              <Building2 className="h-6 w-6 text-brand-cyan" />
            </div>
            <h1 className="text-2xl font-bold">Criar sua Organização</h1>
            <p className="text-muted-foreground mt-2">
              Sua organização representa seu negócio no reserva.online
            </p>
          </div>

          <Card>
            <form onSubmit={handleCreateOrg}>
              <CardHeader>
                <CardTitle className="text-lg">Dados do Negócio</CardTitle>
                <CardDescription>
                  Essas informações podem ser alteradas depois em Configurações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Negócio *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Pesca Adventure"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="niche">Categoria</Label>
                  <Select
                    value={formData.niche}
                    onValueChange={(value) => setFormData({ ...formData, niche: value })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {niches.map((niche) => (
                        <SelectItem key={niche.value} value={niche.value}>
                          {niche.icon} {niche.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Isso será salvo automaticamente após a criação
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={loading}
                  >
                    <Link href="/select-org">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar
                    </Link>
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-brand-cyan hover:bg-brand-cyan/90 text-white"
                    disabled={loading || !formData.name.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar Organização"
                    )}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Você será o administrador desta organização e poderá convidar outros membros depois.
          </p>
        </div>
      </main>
    </div>
  );
}