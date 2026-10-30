import Link from "next/link";

import { Section } from "@/components/layout/section";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function Home() {
  const configured = hasSupabaseEnv();

  return (
    <>
      <Section background="background" aria-label="Homepage intro">
        <div className="flex flex-col gap-6">
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
        </div>
      </Section>
      <Section background="card" aria-label="Shell layout check">
        <p className="text-sm text-muted-foreground">
          This band uses the shell <code className="text-foreground">Section</code> and{" "}
          <code className="text-foreground">Container</code> tokens. Content is capped at{" "}
          <span className="text-foreground">--container-max</span>; the background runs full width.
        </p>
      </Section>
    </>
  );
}
