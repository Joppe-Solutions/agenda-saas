import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreateOrganization } from "@clerk/nextjs";

export default async function CreateOrgPage() {
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (orgId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <CreateOrganization
        afterCreateOrganizationUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg",
            headerTitle: "text-2xl font-bold text-slate-900 dark:text-white",
            headerSubtitle: "text-slate-600 dark:text-slate-400",
            form: "space-y-4",
            formButtonPrimary: "bg-primary hover:bg-primary/90 text-white",
            formFieldInput: "rounded-xl border-slate-200 dark:border-slate-700",
            logoBox: "hidden",
          },
        }}
      />
    </div>
  );
}
