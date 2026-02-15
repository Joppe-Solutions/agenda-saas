import { SignIn } from "@clerk/nextjs";
import { AuthLayout } from "@/components/auth";
import { clerkTheme } from "@/lib/clerk-theme";

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignIn 
        appearance={{ 
          elements: clerkTheme.elements, 
          variables: clerkTheme.variables,
          layout: {
            logoImageUrl: "/brand/logo-icon.png",
          },
        }}
      />
    </AuthLayout>
  );
}