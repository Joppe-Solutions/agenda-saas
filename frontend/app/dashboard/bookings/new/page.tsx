import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NewBookingPage } from "@/components/dashboard/new-booking-page";

export default async function NewBookingPageWrapper() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/bookings/new");
  }

  return <NewBookingPage merchantId={userId} />;
}