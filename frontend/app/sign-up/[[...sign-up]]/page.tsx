import { SignUp } from "@clerk/nextjs";
import { AuthLayout } from "@/components/auth";
import { clerkTheme } from "@/lib/clerk-theme";

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUp 
        appearance={{ 
          elements: clerkTheme.elements, 
          variables: clerkTheme.variables,
          layout: {
            logoImageUrl: "/brand/logo-icon.png",
          },
        }}
        forceRedirectUrl="/dashboard" 
      />
    </AuthLayout>
  );
}
