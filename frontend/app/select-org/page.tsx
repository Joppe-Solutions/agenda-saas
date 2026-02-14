import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Plus, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default async function SelectOrgPage() {
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (orgId) {
    redirect("/dashboard");
  }

  const user = await currentUser();

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
            <h1 className="text-2xl font-bold">Olá, {user?.firstName || "bem-vindo"}!</h1>
            <p className="text-muted-foreground mt-2">
              Crie ou selecione sua organização para continuar
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Criar Nova Organização</CardTitle>
              <CardDescription>
                Uma organização representa seu negócio. Você será o administrador.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={async () => {
                "use server";
                const { orgId } = await auth();
                if (!orgId) {
                  redirect("/create-org");
                }
                redirect("/dashboard");
              }}>
                <Button type="submit" className="w-full bg-brand-cyan hover:bg-brand-cyan/90 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Minha Organização
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center text-sm text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                <p>Se você foi convidado para uma organização existente,</p>
                <p>aceite o convite no seu email antes de continuar.</p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Organizações permitem que você gerencie seu negócio com sua equipe.
              <br />
              <Link href="/help" className="text-brand-cyan hover:underline">
                Saiba mais
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}