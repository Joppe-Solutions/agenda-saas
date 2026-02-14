import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ResourcesPage } from "@/components/dashboard/resources-page";

export default async function AssetsPageWrapper() {
  const { userId, orgId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/assets");
  }

  if (!orgId) {
    redirect("/select-org");
  }

  return <ResourcesPage merchantId={orgId} />;
}