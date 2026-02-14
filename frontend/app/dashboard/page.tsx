import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CalendarDays, DollarSign, Users, TrendingUp } from "lucide-react";
import { StatsCard, RecentBookings, QuickActions } from "@/components/dashboard";
import { getDashboardSummary, listMerchantBookings } from "@/lib/api";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  const [summary, { bookings }] = await Promise.all([
    getDashboardSummary(userId),
    listMerchantBookings(userId),
  ]);

  // Calculate additional stats
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING_PAYMENT").length;

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
