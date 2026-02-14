import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CustomersPage } from "@/components/dashboard/customers-page";

export default async function CustomersPageWrapper() {
  const { userId, orgId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/customers");
  }

  if (!orgId) {
    redirect("/select-org");
  }

  return <CustomersPage merchantId={orgId} />;
}
