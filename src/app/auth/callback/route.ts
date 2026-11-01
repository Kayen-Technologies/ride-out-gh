import { NextResponse } from "next/server";

import { landingPath } from "@/features/auth/landing";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next");
  // An explicit, same-site `next` wins (for example /reset-password). Otherwise staff land in the admin portal.
  const explicitNext = requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : null;

  if (code && hasSupabaseEnv()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${explicitNext ?? (await landingPath(supabase))}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
