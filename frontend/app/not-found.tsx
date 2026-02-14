import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        <h1 className="mb-2 text-4xl font-bold tracking-tight">404</h1>
        <h2 className="mb-4 text-xl font-semibold text-muted-foreground">
          Página não encontrada
        </h2>
        <p className="mb-8 text-muted-foreground">
          A página que você está procurando não existe ou foi movida para outro endereço.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">Voltar para Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Ir para Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
