import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/database.types";

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

export async function createClient(options?: { persistSession?: boolean }) {
  const cookieStore = await cookies();
  const persist = options?.persistSession ?? cookieStore.get(rememberCookieName)?.value === "1";

  return createServerClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          shapeAuthCookies(cookiesToSet, persist).forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies. The proxy refreshes the session.
        }
      },
    },
  });
}
