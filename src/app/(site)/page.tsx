import Link from "next/link";

import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function Home() {
  const configured = hasSupabaseEnv();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Ride Out</h1>
        <p className="text-muted-foreground">
          The app skeleton is running. Public pages and the dashboard come next.
        </p>
      </div>
      {configured ? null : (
        <p className="text-sm text-muted-foreground">
          Supabase keys are not in .env.local yet. Sign-in will not reach a project until they are.
        </p>
      )}
      <div className="flex gap-4 text-sm font-medium">
        <Link href="/login">Sign in</Link>
        <Link href="/sign-up">Create account</Link>
        <Link href="/admin">Admin</Link>
      </div>
    </main>
  );
}
