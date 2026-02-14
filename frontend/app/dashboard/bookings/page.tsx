import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReservationsTable } from "@/components/dashboard/reservations-table";
import { listMerchantBookings } from "@/lib/api";

export default async function DashboardBookingsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/bookings");
  }

  const { bookings } = await listMerchantBookings(userId);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Reservas</h1>
      <ReservationsTable initialBookings={bookings} merchantId={userId} />
    </section>
  );
}
