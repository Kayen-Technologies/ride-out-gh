import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotHeroPanel } from "@/components/auth/forgot-hero-panel";
import { ForgotPasswordForm } from "@/features/auth/components/password-forms";

export default function ForgotPasswordPage() {
  return (
    <AuthShell hero={<ForgotHeroPanel />}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
