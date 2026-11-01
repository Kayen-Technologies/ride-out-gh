import { cacheLife, cacheTag } from "next/cache";

import { vehicleImageUrl } from "@/features/inventory/image-url";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/public";

export type HomeCar = {
  id: string;
  slug: string;
  brand: string;
  title: string;
  price: number | null;
  purpose: "sale" | "rent";
  bodyType: string | null;
  image: string | null;
};

/**
 * Published cars for the homepage search block: the ones marked "feature on homepage" first (in their
 * chosen order), then the newest. Reads through the cookie-free client so the result can be cached.
 */
export async function getHomeCars(limit = 4): Promise<HomeCar[]> {
  "use cache";
  cacheTag("vehicles");
  cacheLife("minutes");

  if (!hasSupabaseEnv()) return [];
  const supabase = createClient();
  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select("id, slug, brand, model, year, sale_price, rental_daily_rate, listing_purpose, body_type")
    .eq("listing_status", "published")
    .eq("listing_purpose", "sale")
    .eq("availability_status", "available")
    .order("is_featured", { ascending: false })
    .order("featured_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !vehicles?.length) return [];

  const { data: covers } = await supabase
    .from("vehicle_images")
    .select("vehicle_id, storage_path")
    .in("vehicle_id", vehicles.map((v) => v.id))
    .eq("is_cover", true);
  const coverOf = new Map((covers ?? []).map((c) => [c.vehicle_id, c.storage_path]));

  return vehicles.map((v) => ({
    id: v.id,
    slug: v.slug,
    brand: v.brand,
    title: `${v.year} ${v.brand} ${v.model}`,
    price: v.sale_price,
    purpose: v.listing_purpose,
    bodyType: v.body_type,
    image: coverOf.has(v.id) ? vehicleImageUrl(coverOf.get(v.id)!) : null,
  }));
}

/** Brands that have at least one published car, for the search form. */
export async function getHomeBrands(): Promise<string[]> {
  "use cache";
  cacheTag("vehicles");
  cacheLife("minutes");

  if (!hasSupabaseEnv()) return [];
  const { data } = await createClient().from("vehicles").select("brand").eq("listing_status", "published");
  return [...new Set((data ?? []).map((row) => row.brand))].sort((a, b) => a.localeCompare(b));
}
