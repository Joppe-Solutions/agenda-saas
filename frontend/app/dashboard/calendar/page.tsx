import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BookingCalendar } from "@/components/dashboard/booking-calendar";

export default async function CalendarPage() {
  const { userId, orgId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/calendar");
  }

  if (!orgId) {
    redirect("/select-org");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendário</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie suas reservas em formato de calendário
        </p>
      </div>
      <BookingCalendar merchantId={orgId} />
    </div>
  );
}