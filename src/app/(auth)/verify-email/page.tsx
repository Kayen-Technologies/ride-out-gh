import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailForm } from "@/features/auth/components/verify-email-form";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  return (
    <AuthShell>
      <Suspense>
        <VerifyEmailContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function VerifyEmailContent({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  return <VerifyEmailForm email={params.email ?? ""} />;
}
