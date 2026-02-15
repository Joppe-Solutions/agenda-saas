import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OrganizationList } from "@clerk/nextjs";
import { Logo } from "@/components/ui/logo";

export default async function SelectOrgPage() {
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (orgId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="mb-8">
        <Logo variant="full" size="lg" />
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Selecione sua organização</h1>
          <p className="text-muted-foreground mt-2">
            Escolha uma organização existente ou crie uma nova para continuar
          </p>
        </div>
        
        <div className="bg-card rounded-2xl border shadow-lg p-6">
          <OrganizationList
            afterCreateOrganizationUrl="/dashboard"
            afterSelectOrganizationUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "w-full",
                organizationList: "w-full",
                organizationListItem: "rounded-lg hover:bg-muted p-3",
                organizationPreviewMainIdentifier: "font-semibold",
                organizationPreviewAvatarContainer: "h-8 w-8",
                organizationPreviewAvatar: "h-8 w-8",
                card: "border-0 shadow-none bg-transparent",
                navbar: "hidden",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
