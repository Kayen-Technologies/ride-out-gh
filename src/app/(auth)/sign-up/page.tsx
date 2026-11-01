import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpHeroPanel } from "@/components/auth/signup-hero-panel";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthShell hero={<SignUpHeroPanel />} mobileAlign="top" mobileTopOffset={62}>
      <SignUpForm />
    </AuthShell>
  );
}
