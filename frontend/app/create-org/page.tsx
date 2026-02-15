import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreateOrgContent } from "./create-org-content";

export default async function CreateOrgPage() {
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (orgId) {
    redirect("/dashboard");
  }

  return <CreateOrgContent />;
}
