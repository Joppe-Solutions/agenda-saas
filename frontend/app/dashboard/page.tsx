import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CalendarDays, DollarSign, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { StatsCard, RecentBookings, QuickActions } from "@/components/dashboard";
import { getDashboardSummary, listMerchantBookings } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  let summary = { bookingsToday: 0, monthRevenue: 0 };
  let bookings: Awaited<ReturnType<typeof listMerchantBookings>>["bookings"] = [];
  let hasError = false;

  try {
    const [summaryData, bookingsData] = await Promise.all([
      getDashboardSummary(userId),
      listMerchantBookings(userId),
    ]);
    summary = summaryData;
    bookings = bookingsData.bookings;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    hasError = true;
  }

  // Calculate additional stats
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING_PAYMENT").length;

  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground">
            Acompanhe suas reservas e métricas do negócio
          </p>
        </div>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-yellow-800">Backend não disponível</CardTitle>
                <CardDescription className="text-yellow-700">
                  Não foi possível conectar ao servidor de dados
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-yellow-700">
              O servidor backend (Encore) não está respondendo. Isso pode acontecer porque:
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-yellow-700">
              <li>O backend ainda não foi deployado</li>
              <li>A URL da API não está configurada corretamente</li>
              <li>O servidor está temporariamente indisponível</li>
            </ul>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">Voltar para Home</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">Tentar Novamente</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <QuickActions />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Visão Geral</h1>
        <p className="text-muted-foreground">
          Acompanhe suas reservas e métricas do negócio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Reservas Hoje"
          value={summary.bookingsToday.toString()}
          icon={CalendarDays}
          description="reservas agendadas"
        />
        <StatsCard
          title="Faturamento do Mês"
          value={`R$ ${summary.monthRevenue.toFixed(2)}`}
          icon={DollarSign}
          description="em sinais recebidos"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Confirmadas"
          value={confirmedBookings.toString()}
          icon={TrendingUp}
          description="reservas confirmadas"
        />
        <StatsCard
          title="Aguardando"
          value={pendingBookings.toString()}
          icon={Users}
          description="aguardando pagamento"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentBookings bookings={bookings} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
