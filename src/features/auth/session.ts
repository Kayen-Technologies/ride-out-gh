import "server-only";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { isStaffRole } from "@/lib/staff";

export async function getStaffSession() {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", userId)
    .maybeSingle();

  const role = profile && typeof profile.role === "string" ? profile.role : null;
  const fullName =
    profile && typeof profile.full_name === "string" ? profile.full_name : null;
  const email = typeof data.claims.email === "string" ? data.claims.email : null;

  return {
    userId,
    email,
    fullName,
    role,
    isStaff: !error && isStaffRole(role),
  };
}
