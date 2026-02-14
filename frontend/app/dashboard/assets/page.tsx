import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AssetsPage } from "@/components/dashboard/assets-page";

export default async function AssetsPageWrapper() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/assets");
  }

  return <AssetsPage merchantId={userId} />;
}
