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
            cardBox: "shadow-none w-full",
            card: "shadow-none p-0 w-full bg-transparent",
            header: "hidden",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            main: "gap-4",
            form: "gap-4",
            formFieldRow: "gap-4",
            formFieldInput: "rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            formFieldLabel: "text-sm font-medium leading-none",
            formButtonPrimary: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full h-10",
            socialButtonsBlockButton: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            socialButtonsBlockButtonText: "font-medium",
            dividerLine: "bg-border",
            dividerText: "text-muted-foreground text-xs",
            footerAction: "hidden",
            footer: "hidden",
            identityPreview: "border border-input rounded-md",
            identityPreviewEditButton: "text-primary hover:text-primary/90",
            formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
            alert: "rounded-md border p-3 text-sm",
            alertText: "text-sm",
          },
          layout: {
            socialButtonsPlacement: "top",
            socialButtonsVariant: "blockButton",
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
