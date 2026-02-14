import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getDashboardSummary } from "@/lib/api";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  const summary = await getDashboardSummary(userId);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-sm text-slate-500">Reservas de hoje</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{summary.bookingsToday}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Faturamento do mes (sinal)</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">R$ {summary.monthRevenue.toFixed(2)}</p>
        </Card>
      </div>

      <Link className="text-sm font-semibold text-brand-700 underline" href="/dashboard/bookings">
        Ver todas as reservas
      </Link>
    </section>
  );
}
