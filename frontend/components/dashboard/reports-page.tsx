"use client";

import { useState, useEffect } from "react";
import { RefreshCw, TrendingUp, DollarSign, CalendarDays, Users, BarChart3, AlertTriangle, Ship, UserX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getReportsSummary } from "@/lib/api";

interface ReportsPageProps {
  merchantId: string;
}

interface ReportSummary {
  period: string;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  noShowCount: number;
  totalRevenue: number;
  pendingRevenue: number;
  avgBookingValue: number;
  noShowRate: number;
  topResources: Array<{
    resourceId: string;
    resourceName: string;
    bookingCount: number;
    revenue: number;
  }>;
  dailyBreakdown: Array<{
    date: string;
    bookings: number;
    revenue: number;
  }>;
}

export function ReportsPage({ merchantId }: ReportsPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");
  const [summary, setSummary] = useState<ReportSummary | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await getReportsSummary(merchantId, period);
        setSummary(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [merchantId, period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Análise de desempenho do seu negócio</p>
        </div>
        <Card className="border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <p className="text-cyan-700 dark:text-cyan-300">Não foi possível carregar os relatórios</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Análise de desempenho do seu negócio</p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Hoje</SelectItem>
            <SelectItem value="week">Esta semana</SelectItem>
            <SelectItem value="month">Este mês</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faturamento</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  R$ {summary.totalRevenue.toFixed(2)}
                </p>
                {summary.pendingRevenue > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    R$ {summary.pendingRevenue.toFixed(2)} pendente
                  </p>
                )}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-brand-cyan">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reservas</p>
                <p className="text-2xl font-bold">{summary.confirmedBookings}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  de {summary.totalBookings} total
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-cyan/20">
                <CalendarDays className="h-5 w-5 text-brand-cyan" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-brand-yellow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold text-brand-yellow">
                  R$ {summary.avgBookingValue.toFixed(2)}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-yellow/20">
                <TrendingUp className="h-5 w-5 text-brand-yellow" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={summary.noShowRate > 10 ? "border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-900/10" : "border-l-4 border-l-gray-300"}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa No-Show</p>
                <p className={`text-2xl font-bold ${summary.noShowRate > 10 ? "text-red-600 dark:text-red-400" : ""}`}>
                  {summary.noShowRate}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.noShowCount} não compareceram
                </p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${summary.noShowRate > 10 ? "bg-red-100 dark:bg-red-900/30" : "bg-muted"}`}>
                <UserX className={`h-5 w-5 ${summary.noShowRate > 10 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Recursos</CardTitle>
            <CardDescription>Recursos mais reservados no período</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.topResources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Ship className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">Sem reservas no período</p>
              </div>
            ) : (
              <div className="space-y-4">
                {summary.topResources.map((resource, index) => (
                  <div key={resource.resourceId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-cyan/20 text-xs font-medium text-brand-cyan">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">{resource.resourceName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{resource.bookingCount} reservas</span>
                      <span className="text-sm font-medium text-brand-yellow">R$ {resource.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status das Reservas</CardTitle>
            <CardDescription>Visão geral do período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm">Confirmadas</span>
                </div>
                <span className="font-medium">{summary.confirmedBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Canceladas</span>
                </div>
                <span className="font-medium">{summary.cancelledBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm">No-Show</span>
                </div>
                <span className="font-medium">{summary.noShowCount}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Total: {summary.totalBookings} reservas</p>
              {summary.totalBookings > 0 && (
                <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="bg-green-500"
                    style={{ width: `${(summary.confirmedBookings / summary.totalBookings) * 100}%` }}
                  />
                  <div
                    className="bg-yellow-500"
                    style={{ width: `${(summary.cancelledBookings / summary.totalBookings) * 100}%` }}
                  />
                  <div
                    className="bg-red-500"
                    style={{ width: `${(summary.noShowCount / summary.totalBookings) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {summary.dailyBreakdown.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Evolução Diária</CardTitle>
              <CardDescription>Reservas por dia no período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {summary.dailyBreakdown.slice(-14).map((day) => (
                  <div key={day.date} className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">
                      {new Date(day.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" })}
                    </p>
                    <p className="text-lg font-bold">{day.bookings}</p>
                    <p className="text-xs text-muted-foreground">
                      R$ {day.revenue.toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}