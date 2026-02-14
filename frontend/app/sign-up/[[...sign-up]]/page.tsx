import { SignUp } from "@clerk/nextjs";
import { AuthLayout } from "@/components/auth";

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUp forceRedirectUrl="/dashboard" />
    </AuthLayout>
  );
}
