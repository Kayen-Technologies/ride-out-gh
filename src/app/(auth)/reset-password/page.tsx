import Link from "next/link";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { ResetPasswordForm } from "@/features/auth/components/password-forms";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <ResetGate />
      </Suspense>
    </AuthShell>
  );
}

async function ResetGate() {
  if (!hasSupabaseEnv()) return <InvalidResetLink />;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return <InvalidResetLink />;

  return <ResetPasswordForm />;
}

function InvalidResetLink() {
  return (
    <div className="flex flex-col items-center gap-4 text-center text-white">
      <p className="text-sm leading-[22px]">This reset link is invalid or has expired.</p>
      <Link href="/forgot-password" className="text-sm font-semibold text-primary">
        Forgot Password?
      </Link>
    </div>
  );
}
