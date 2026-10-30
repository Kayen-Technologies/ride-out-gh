import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <AuthShell>
      <Suspense>
        <AuthError searchParams={searchParams} />
      </Suspense>
      <SignInForm />
    </AuthShell>
  );
}

async function AuthError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  if (params.error !== "auth") return null;
  return <p className="mb-4 text-center text-sm text-destructive">The sign-in link failed. Try again.</p>;
}
