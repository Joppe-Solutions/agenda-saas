import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ServicesPage } from "@/components/dashboard";

export default async function ServicesPageRoute() {
  const { userId, orgId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/services");
  }

  return <ServicesPage merchantId={orgId ?? userId} />;
}