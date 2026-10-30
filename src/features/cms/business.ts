import { cacheLife, cacheTag } from "next/cache";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/public";

export type BusinessProfile = {
  email: string;
  phones: string[];
  address: string;
  instagramUrl: string | null;
  tiktokUrl: string | null;
};

const fallback: BusinessProfile = {
  email: "rideoutgh1@gmail.com",
  phones: ["+233 57 078 6961", "+233 55 754 1169"],
  address: "Tackie Tawiah St., Tema Comm. 4",
  instagramUrl: null,
  tiktokUrl: null,
};

export async function getBusinessProfile(): Promise<BusinessProfile> {
  "use cache";
  cacheTag("business-settings");

  if (!hasSupabaseEnv()) {
    cacheLife("seconds");
    return fallback;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("business_settings")
    .select("email, phones, address, instagram_url, tiktok_url")
    .eq("id", true)
    .maybeSingle();

  if (error) {
    cacheLife("seconds");
    return fallback;
  }

  cacheLife("max");
  if (!data) return fallback;

  return {
    email: data.email?.trim() || fallback.email,
    phones: data.phones.filter((phone) => phone.trim().length > 0).length > 0 ? data.phones : fallback.phones,
    address: data.address?.trim() || fallback.address,
    instagramUrl: data.instagram_url,
    tiktokUrl: data.tiktok_url,
  };
}
