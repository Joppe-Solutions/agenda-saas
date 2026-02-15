"use client";

import { useOrganizationList, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Building2, Plus, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export function SelectOrgContent() {
  const { isLoaded, userMemberships, setActive } = useOrganizationList({
    userMemberships: { infinite: true },
  });
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && userMemberships.data?.length === 0) {
      // No organizations, could redirect to create one
    }
  }, [isLoaded, userMemberships.data]);

  const handleSelectOrg = async (organizationId: string) => {
    if (!setActive) return;
    try {
      await setActive({ organization: organizationId });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error selecting organization:", error);
    }
  };

  const handleCreateOrg = () => {
    router.push("/create-org");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const organizations = userMemberships.data ?? [];
  const userName = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split("@")[0] || "Usuário";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="mb-8 text-center">
        <Logo variant="full" size="lg" className="mx-auto" />
        <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
          Bem-vindo, {userName}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Selecione uma organização para continuar
        </p>
      </div>

      <div className="w-full max-w-md space-y-4">
        {organizations.length > 0 ? (
          <div className="space-y-2">
            {organizations.map((membership) => (
              <button
                key={membership.id}
                onClick={() => handleSelectOrg(membership.organization.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                {membership.organization.imageUrl ? (
                  <img
                    src={membership.organization.imageUrl}
                    alt={membership.organization.name ?? ""}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {membership.organization.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Membro
                  </p>
                </div>
                <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Você ainda não faz parte de nenhuma organização
            </p>
          </div>
        )}

        <Button
          onClick={handleCreateOrg}
          variant="outline"
          className="w-full h-12 rounded-xl border-dashed"
        >
          <Plus className="mr-2 h-5 w-5" />
          Criar nova organização
        </Button>
      </div>
    </div>
  );
}
