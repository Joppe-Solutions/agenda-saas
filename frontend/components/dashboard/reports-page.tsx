"use client";

import { useState, useEffect } from "react";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, CalendarDays, Users, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listMerchantBookings, listMerchantPayments, listMerchantAssets } from "@/lib/api";
import type { Booking, Payment, Asset } from "@/lib/types";

interface ReportsPageProps {
  merchantId: string;
}

export function ReportsPage({ merchantId }: ReportsPageProps) {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsData, paymentsData, assetsData] = await Promise.all([
          listMerchantBookings(merchantId),
          listMerchantPayments(merchantId),
          listMerchantAssets(merchantId),
        ]);
        setBookings(bookingsData.bookings);
        setPayments(paymentsData.payments);
        setAssets(assetsData.assets);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [merchantId]);

  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    if (period === "week") {
      start.setDate(now.getDate() - 7);
    } else if (period === "month") {
      start.setMonth(now.getMonth() - 1);
    } else {
      start.setFullYear(now.getFullYear() - 1);
    }
    return { start, end: now };
  };

  const filterByPeriod = <T extends { createdAt?: string; bookingDate?: string }>(items: T[], dateField: keyof T) => {
    const { start } = getDateRange();
    return items.filter((item) => {
      const date = item[dateField];
      if (!date) return false;
      return new Date(date as string) >= start;
    });
  };

  const filteredBookings = filterByPeriod(bookings, "bookingDate");
  const filteredPayments = filterByPeriod(payments, "createdAt");

  const totalRevenue = filteredPayments
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + p.amount, 0);

  const confirmedBookings = filteredBookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingBookings = filteredBookings.filter((b) => b.status === "PENDING_PAYMENT").length;
  const cancelledBookings = filteredBookings.filter((b) => b.status === "CANCELLED").length;

  const avgDepositAmount = filteredBookings.length > 0
    ? filteredBookings.reduce((sum, b) => sum + b.depositAmount, 0) / filteredBookings.length
    : 0;

  const bookingsByAsset = assets.map((asset) => {
    const assetBookings = filteredBookings.filter((b) => b.assetId === asset.id);
    return {
      name: asset.name,
      total: assetBookings.length,
      revenue: assetBookings
        .filter((b) => b.status === "CONFIRMED")
        .reduce((sum, b) => sum + b.depositAmount, 0),
    };
  }).sort((a, b) => b.total - a.total);

  const bookingsByDay = filteredBookings.reduce((acc, booking) => {
    const date = booking.bookingDate;
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topDays = Object.entries(bookingsByDay)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
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
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Último mês</SelectItem>
            <SelectItem value="year">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faturamento</p>
                <p className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reservas Confirmadas</p>
                <p className="text-2xl font-bold">{confirmedBookings}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Confirmação</p>
                <p className="text-2xl font-bold">
                  {filteredBookings.length > 0
                    ? ((confirmedBookings / filteredBookings.length) * 100).toFixed(0)
                    : 0}%
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">R$ {avgDepositAmount.toFixed(2)}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reservas por Recurso</CardTitle>
            <CardDescription>Distribuição de reservas por cada recurso</CardDescription>
          </CardHeader>
          <CardContent>
            {bookingsByAsset.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sem dados no período</p>
            ) : (
              <div className="space-y-4">
                {bookingsByAsset.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{item.total} reservas</span>
                      <span className="text-sm font-medium">R$ {item.revenue.toFixed(2)}</span>
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
            <CardDescription>Visão geral do período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm">Confirmadas</span>
                </div>
                <span className="font-medium">{confirmedBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-cyan-500" />
                  <span className="text-sm">Aguardando Pagamento</span>
                </div>
                <span className="font-medium">{pendingBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm">Canceladas</span>
                </div>
                <span className="font-medium">{cancelledBookings}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Total de reservas: {filteredBookings.length}</p>
              {filteredBookings.length > 0 && (
                <div className="flex h-4 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-green-500"
                    style={{ width: `${(confirmedBookings / filteredBookings.length) * 100}%` }}
                  />
                  <div
                    className="bg-cyan-500"
                    style={{ width: `${(pendingBookings / filteredBookings.length) * 100}%` }}
                  />
                  <div
                    className="bg-red-500"
                    style={{ width: `${(cancelledBookings / filteredBookings.length) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dias com Mais Reservas</CardTitle>
            <CardDescription>Top 5 dias do período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            {topDays.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sem dados no período</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-5">
                {topDays.map(([date, count], index) => (
                  <div key={date} className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">
                      {new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" })}
                    </p>
                    <p className="text-lg font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
