import { SignUp } from "@clerk/nextjs";
import { AuthLayout } from "@/components/auth";

export default function SignUpPage() {
  return (
    <AuthLayout>
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-2xl font-bold tracking-tight">Crie sua conta</h2>
        <p className="mt-2 text-muted-foreground">
          Comece a gerenciar suas reservas em minutos
        </p>
      </div>
      <SignUp
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
        Já tem uma conta?{" "}
        <a href="/sign-in" className="font-medium text-primary hover:underline">
          Fazer login
        </a>
      </p>
    </AuthLayout>
  );
}
