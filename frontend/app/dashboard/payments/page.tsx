import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PaymentsPage } from "@/components/dashboard/payments-page";

export default async function PaymentsPageWrapper() {
  const { userId, orgId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/payments");
  }

  if (!orgId) {
    redirect("/select-org");
  }

  return <PaymentsPage merchantId={orgId} />;
}
