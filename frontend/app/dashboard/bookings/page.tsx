import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Download, Filter, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReservationsTable } from "@/components/dashboard";
import { listMerchantBookings } from "@/lib/api";

export default async function DashboardBookingsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/bookings");
  }

  let bookings: Awaited<ReturnType<typeof listMerchantBookings>>["bookings"] = [];
  let hasError = false;

  try {
    const data = await listMerchantBookings(userId);
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

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-yellow-800">Não foi possível carregar as reservas</CardTitle>
                <CardDescription className="text-yellow-700">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground">
            Gerencie todas as reservas do seu negócio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/bookings/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova Reserva
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">
            {bookings.filter((b) => b.status === "CONFIRMED").length} confirmadas
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
          <span className="text-sm text-muted-foreground">
            {bookings.filter((b) => b.status === "PENDING_PAYMENT").length} aguardando
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-sm text-muted-foreground">
            {bookings.filter((b) => b.status === "CANCELLED").length} canceladas
          </span>
        </div>
        <div className="ml-auto text-sm font-medium">
          Total: {bookings.length} reservas
        </div>
      </div>

      {/* Table */}
      <ReservationsTable initialBookings={bookings} merchantId={userId} />
    </div>
  );
}
