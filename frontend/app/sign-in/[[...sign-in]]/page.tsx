import { SignIn } from "@clerk/nextjs";
import { AuthLayout } from "@/components/auth";

export default function SignInPage() {
  return (
    <AuthLayout>
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-2xl font-bold tracking-tight">Bem-vindo de volta</h2>
        <p className="mt-2 text-muted-foreground">
          Entre na sua conta para acessar o painel
        </p>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none p-0 w-full",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            socialButtonsBlockButton: "border border-input bg-background hover:bg-accent",
            formButtonPrimary: "bg-primary hover:bg-primary/90",
            footerAction: "hidden",
          },
        }}
      />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Não tem uma conta?{" "}
        <a href="/sign-up" className="font-medium text-primary hover:underline">
          Criar conta grátis
        </a>
      </p>
    </AuthLayout>
  );
}
