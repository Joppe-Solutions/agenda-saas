import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Download, Filter, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReservationsTable } from "@/components/dashboard";
import { listMerchantBookings } from "@/lib/api";

export default async function DashboardBookingsPage() {
  const { userId, orgId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/bookings");
  }

  if (!orgId) {
    redirect("/select-org");
  }

  const merchantId = orgId;

  let bookings: Awaited<ReturnType<typeof listMerchantBookings>>["bookings"] = [];
  let hasError = false;

  try {
    const data = await listMerchantBookings(merchantId);
    bookings = data.bookings;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    hasError = true;
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground">
            Gerencie todas as reservas do seu negócio
          </p>
        </div>

        <Card className="border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-900/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-800">
                <AlertTriangle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-cyan-800 dark:text-cyan-300">Não foi possível carregar as reservas</CardTitle>
                <CardDescription className="text-cyan-700 dark:text-cyan-400">
                  O servidor backend não está respondendo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">Voltar ao Dashboard</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/bookings">Tentar Novamente</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  const pendingCount = bookings.filter(b => b.status === "pending_payment").length;
  const cancelledCount = bookings.filter(b => b.status === "cancelled").length;
  const inProgressCount = bookings.filter(b => b.status === "in_progress").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground">
            Gerencie todas as reservas do seu negócio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm" className="bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue-950" asChild>
            <Link href="/dashboard/bookings/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova Reserva
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">
            {confirmedCount} confirmada{confirmedCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-sm text-muted-foreground">
            {inProgressCount} em andamento
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
          <span className="text-sm text-muted-foreground">
            {pendingCount} aguardando sinal
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-sm text-muted-foreground">
            {cancelledCount} cancelada{cancelledCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="ml-auto text-sm font-medium">
          Total: {bookings.length} reserva{bookings.length !== 1 ? 's' : ''}
        </div>
      </div>

      <ReservationsTable initialBookings={bookings} merchantId={merchantId} />
    </div>
  );
}