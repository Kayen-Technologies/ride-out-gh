import "server-only";

import { isStaffRole } from "@/lib/staff";
import type { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

/** Where a signed-in user lands by default: staff go to the admin portal, customers to the site. */
export async function landingPath(supabase: ServerClient) {
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) return "/";

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  return isStaffRole(profile?.role) ? "/admin" : "/";
}
