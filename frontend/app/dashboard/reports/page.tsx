import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReportsPage } from "@/components/dashboard/reports-page";

export default async function ReportsPageWrapper() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/reports");
  }

  return <ReportsPage merchantId={userId} />;
}
