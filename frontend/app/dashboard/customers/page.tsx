import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CustomersPage } from "@/components/dashboard/customers-page";

export default async function CustomersPageWrapper() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/customers");
  }

  return <CustomersPage merchantId={userId} />;
}
