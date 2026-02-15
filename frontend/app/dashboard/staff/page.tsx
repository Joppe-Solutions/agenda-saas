import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { StaffPage } from "@/components/dashboard";

export default async function StaffPageRoute() {
  const { userId, orgId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/staff");
  }

  return <StaffPage merchantId={orgId ?? userId} />;
}