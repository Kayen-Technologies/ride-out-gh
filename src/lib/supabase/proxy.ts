import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/supabase/database.types";
import { getSupabasePublishableKey, getSupabaseUrl, hasSupabaseEnv } from "@/lib/supabase/env";

export async function refreshSession(request: NextRequest): Promise<{
  response: NextResponse;
  supabase: SupabaseClient<Database> | null;
  userId: string | null;
}> {
  let response = NextResponse.next({ request });

  if (!hasSupabaseEnv()) {
    return { response, supabase: null, userId: null };
  }

  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Verifies the JWT. Refreshes the session when the access token is near expiry.
  const { data } = await supabase.auth.getClaims();

  return { response, supabase, userId: data?.claims.sub ?? null };
}
