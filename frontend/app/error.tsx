"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          Algo deu errado
        </h1>
        <p className="mb-2 text-muted-foreground">
          Ocorreu um erro inesperado. Nossa equipe foi notificada e estamos trabalhando para resolver.
        </p>

        {error.digest && (
          <p className="mb-6 font-mono text-xs text-muted-foreground">
            Código do erro: {error.digest}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Voltar para Home</Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Se o problema persistir, entre em contato com o{" "}
          <a href="mailto:suporte@agendae.me" className="text-primary hover:underline">
            suporte
          </a>
        </p>
      </div>
    </div>
  );
}
