import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SelectOrgContent } from "./select-org-content";

export default async function SelectOrgPage() {
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (orgId) {
    redirect("/dashboard");
  }

  return <SelectOrgContent />;
}
