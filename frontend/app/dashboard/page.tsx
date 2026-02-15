import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, DollarSign, Users, TrendingUp, AlertTriangle, Ship, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { StatsCard, QuickActions } from "@/components/dashboard";
import { getDashboardSummary, getTodaysBookings, listMerchantResources } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "@/lib/types";
import type { Booking } from "@/lib/types";

export default async function DashboardPage() {
  const { userId, orgId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  const merchantId = orgId ?? userId;

  let summary = { bookingsToday: 0, pendingToday: 0, monthRevenue: 0, pendingBookings: 0, totalResources: 0, activeResources: 0 };
  let todaysBookings: Booking[] = [];
  let resources: { id: string; name: string }[] = [];
  let hasError = false;

  try {
    const [summaryData, bookingsData, resourcesData] = await Promise.all([
      getDashboardSummary(userId),
      getTodaysBookings(userId),
      listMerchantResources(userId),
    ]);
    summary = summaryData;
    todaysBookings = bookingsData.bookings;
    resources = resourcesData.resources;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    hasError = true;
  }

  const pendingPayments = todaysBookings.filter(b => b.status === "pending_payment");
  const confirmedToday = todaysBookings.filter(b => b.status === "confirmed" || b.status === "in_progress");

  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground">
            Acompanhe suas reservas e métricas do negócio
          </p>
        </div>

        <Card className="border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-900/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-800">
                <AlertTriangle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-cyan-800 dark:text-cyan-300">Backend não disponível</CardTitle>
                <CardDescription className="text-cyan-700 dark:text-cyan-400">
                  Não foi possível conectar ao servidor de dados
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-cyan-700 dark:text-cyan-400">
              O servidor backend (Encore) não está respondendo. Isso pode acontecer porque:
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-cyan-700 dark:text-cyan-400">
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Visão Geral</h1>
        <p className="text-muted-foreground">
          O que importa hoje em 10 segundos
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Reservas Hoje"
          value={summary.bookingsToday.toString()}
          icon={CalendarDays}
          description="confirmadas"
          className={summary.bookingsToday > 0 ? "border-l-4 border-l-green-500" : ""}
        />
        <StatsCard
          title="Aguardando Sinal"
          value={summary.pendingToday.toString()}
          icon={Clock}
          description="pendentes hoje"
          className={summary.pendingToday > 0 ? "border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10" : ""}
        />
        <StatsCard
          title="Faturamento do Mês"
          value={`R$ ${summary.monthRevenue.toFixed(2)}`}
          icon={DollarSign}
          description="sinais confirmados"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Recursos Ativos"
          value={`${summary.activeResources}/${summary.totalResources}`}
          icon={Ship}
          description="disponíveis"
        />
      </div>

      {summary.totalResources === 0 && (
        <Card className="border-brand-cyan/50 bg-brand-cyan/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cyan/20">
                <Ship className="h-5 w-5 text-brand-cyan" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-brand-blue-800 dark:text-brand-cyan">Comece cadastrando seus recursos</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Adicione barcos, quadras, salas ou qualquer recurso que seus clientes possam reservar.
                </p>
                <Button size="sm" className="mt-3 bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue-950" asChild>
                  <Link href="/dashboard/assets">Cadastrar Recursos</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingPayments.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <CardTitle className="text-base text-yellow-800 dark:text-yellow-300">
                Aguardando Sinal ({pendingPayments.length})
              </CardTitle>
            </div>
            <CardDescription className="text-yellow-700 dark:text-yellow-400">
              Reservas que precisam de pagamento para confirmar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingPayments.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between rounded-lg bg-white/50 dark:bg-black/20 p-3">
                  <div>
                    <p className="font-medium text-sm">{booking.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.resourceName} • R$ {booking.depositAmount.toFixed(2)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs" asChild>
                    <Link href="/dashboard/bookings">Ver</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Reservas de Hoje</CardTitle>
                  <CardDescription>
                    {todaysBookings.length === 0 
                      ? "Nenhuma reserva para hoje" 
                      : `${todaysBookings.length} reserva${todaysBookings.length > 1 ? 's' : ''} agendada${todaysBookings.length > 1 ? 's' : ''}`}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/bookings">Ver Todas</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {todaysBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarDays className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma reserva para hoje
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href="/dashboard/bookings/new">Criar Reserva</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaysBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{booking.customerName}</span>
                          <span className="text-sm text-muted-foreground">
                            {booking.resourceName}
                            {booking.startTime && ` • ${booking.startTime}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">{booking.peopleCount} pessoa{booking.peopleCount > 1 ? 's' : ''}</p>
                          <p className="text-xs text-muted-foreground">R$ {booking.totalAmount.toFixed(2)}</p>
                        </div>
                        <Badge className={BOOKING_STATUS_COLORS[booking.status]}>
                          {BOOKING_STATUS_LABELS[booking.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Recebido</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
                    R$ {summary.monthRevenue.toFixed(2)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">sinais este mês</p>
                </div>
                <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4">
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Pendente</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">
                    R$ {pendingPayments.reduce((acc, b) => acc + b.depositAmount, 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">{pendingPayments.length} aguardando</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <QuickActions />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingPayments.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="h-4 w-4" />
                    <span>{pendingPayments.length} reserva{pendingPayments.length > 1 ? 's' : ''} aguardando sinal</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Tudo em ordem!</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}