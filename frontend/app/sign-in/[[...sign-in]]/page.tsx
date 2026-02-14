import { SignIn } from "@clerk/nextjs";
import { AuthLayout } from "@/components/auth";

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignIn forceRedirectUrl="/dashboard" />
    </AuthLayout>
  );
}
