import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/supabase/database.types";
import { getSupabasePublishableKey, getSupabaseUrl, hasSupabaseEnv } from "@/lib/supabase/env";

const rememberCookieName = "rideout-remember";

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

function shapeAuthCookies(cookiesToSet: CookieToSet[], persist: boolean): CookieToSet[] {
  const clearing = cookiesToSet.length > 0 && cookiesToSet.every((cookie) => cookie.value === "");
  const shaped = cookiesToSet.map((cookie) => ({
    ...cookie,
    options: persist || cookie.options?.maxAge === 0 ? cookie.options : omitExpiry(cookie.options),
  }));
  const maxAge = cookiesToSet.reduce((longest, cookie) => {
    const age = cookie.options?.maxAge;
    return typeof age === "number" && age > longest ? age : longest;
  }, 0);

  shaped.push({
    name: rememberCookieName,
    value: clearing ? "" : persist ? "1" : "0",
    options: clearing
      ? { path: "/", maxAge: 0 }
      : persist
        ? { path: "/", httpOnly: true, sameSite: "lax", maxAge: maxAge || 60 * 60 * 24 * 30 }
        : { path: "/", httpOnly: true, sameSite: "lax" },
  });

  return shaped;
}

function omitExpiry(options: Record<string, unknown> | undefined) {
  if (!options) return options;
  const session = { ...options };
  delete session.maxAge;
  delete session.expires;
  return session;
}

export async function refreshSession(request: NextRequest): Promise<{
  response: NextResponse;
  supabase: SupabaseClient<Database> | null;
  userId: string | null;
}> {
  let response = NextResponse.next({ request });

  if (!hasSupabaseEnv()) {
    return { response, supabase: null, userId: null };
  }

  const persist = request.cookies.get(rememberCookieName)?.value === "1";

  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        const shaped = shapeAuthCookies(cookiesToSet, persist);
        shaped.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        shaped.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Verifies the JWT. Refreshes the session when the access token is near expiry.
  const { data } = await supabase.auth.getClaims();

  return { response, supabase, userId: data?.claims.sub ?? null };
}
