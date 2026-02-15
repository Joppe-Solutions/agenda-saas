"use client";

import { SignIn } from "@clerk/nextjs";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export function SignInContent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="mb-8 text-center">
        <Logo variant="full" size="lg" className="mx-auto" />
        <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
          Bem-vindo de volta
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Entre na sua conta para continuar
        </p>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent border-0 shadow-none p-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                main: "space-y-4",
                form: "space-y-4",
                formField: "space-y-2",
                formFieldLabel: "text-sm font-medium text-slate-700 dark:text-slate-300",
                formFieldInput: "w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent",
                formButtonPrimary: "w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-colors",
                footerAction: "text-center text-sm text-slate-600 dark:text-slate-400",
                footerActionLink: "text-primary hover:text-primary/80 font-medium",
                dividerLine: "bg-slate-200 dark:bg-slate-700",
                dividerText: "text-slate-500 dark:text-slate-400 text-sm",
                socialButtonsBlock: "space-y-2",
                socialButtonsBlockButton: "w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors",
                socialButtonsBlockButtonText: "font-medium",
                alert: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4",
                alertText: "text-red-600 dark:text-red-400 text-sm",
                logoBox: "hidden",
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
          />
        </div>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Não tem uma conta?{" "}
          <Link href="/sign-up" className="text-primary hover:text-primary/80 font-medium">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
