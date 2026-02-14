import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NewBookingPage } from "@/components/dashboard/new-booking-page";

export default async function NewBookingPageWrapper() {
  const { userId, orgId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/bookings/new");
  }

  if (!orgId) {
    redirect("/select-org");
  }

  return <NewBookingPage merchantId={orgId} />;
}