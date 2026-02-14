import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SettingsPage } from "@/components/dashboard/settings-page";

export default async function SettingsPageWrapper() {
  const { userId, orgId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/settings");
  }

  if (!orgId) {
    redirect("/select-org");
  }

  return <SettingsPage merchantId={orgId} />;
}
