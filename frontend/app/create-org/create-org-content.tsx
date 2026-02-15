"use client";

import { useOrganizationList } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, Loader2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function CreateOrgContent() {
  const { createOrganization, isLoaded } = useOrganizationList();
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !createOrganization) return;

    setLoading(true);
    setError("");

    try {
      const org = await createOrganization({ name: name.trim() });
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      console.error("Error creating organization:", err);
      setError("Erro ao criar organização. Tente novamente.");
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="mb-8 text-center">
        <Logo variant="full" size="lg" className="mx-auto" />
        <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
          Criar organização
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Dê um nome para sua organização
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Nome da organização"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-lg border-slate-200 dark:border-slate-700"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full h-12 rounded-xl"
            disabled={!name.trim() || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar organização"
            )}
          </Button>
        </div>

        <Link href="/select-org">
          <Button type="button" variant="ghost" className="w-full h-12" disabled={loading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </form>
    </div>
  );
}
