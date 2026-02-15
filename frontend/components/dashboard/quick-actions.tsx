"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Share2, Settings, BarChart3, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  merchantSlug?: string;
}

export function QuickActions({ merchantSlug }: QuickActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!merchantSlug) return;
    
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/${merchantSlug}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>Atalhos para tarefas comuns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/dashboard/bookings/new"
            className="group flex items-start gap-3 rounded-lg border p-4 transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600")}>
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium group-hover:text-primary">Novo Agendamento</p>
              <p className="text-xs text-muted-foreground">Criar manualmente</p>
            </div>
          </Link>

          <Button
            variant="outline"
            className="group flex items-start gap-3 rounded-lg border p-4 h-auto justify-start transition-all hover:border-primary/50 hover:shadow-sm"
            onClick={handleCopyLink}
            disabled={!merchantSlug}
          >
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600")}>
              {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
            </div>
            <div className="text-left">
              <p className="font-medium group-hover:text-primary">
                {copied ? "Copiado!" : "Compartilhar Link"}
              </p>
              <p className="text-xs text-muted-foreground">
                {merchantSlug ? "Copiar página de agendamentos" : "Configure seu slug"}
              </p>
            </div>
          </Button>

          <Link
            href="/dashboard/reports"
            className="group flex items-start gap-3 rounded-lg border p-4 transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600")}>
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium group-hover:text-primary">Relatórios</p>
              <p className="text-xs text-muted-foreground">Ver métricas detalhadas</p>
            </div>
          </Link>

          <Link
            href="/dashboard/settings"
            className="group flex items-start gap-3 rounded-lg border p-4 transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600")}>
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium group-hover:text-primary">Configurações</p>
              <p className="text-xs text-muted-foreground">Ajustar preferências</p>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
