import { cacheLife, cacheTag } from "next/cache";

import { vehicleImageUrl } from "@/features/inventory/image-url";
import { PAGE_SIZE, type BuyFilters } from "@/features/buy/search-params";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/public";

export type BuyCar = {
  id: string;
  slug: string;
  brand: string;
  title: string;
  price: number | null;
  image: string | null;
  blur: string | null;
};

export type SearchResult = {
  cars: BuyCar[];
  total: number;
  page: number;
  totalPages: number;
};

const empty: SearchResult = { cars: [], total: 0, page: 1, totalPages: 1 };

/** Published cars for sale that are available now, filtered and sorted as the page asks. */
export async function searchCars(filters: BuyFilters): Promise<SearchResult> {
  "use cache";
  cacheTag("vehicles");
  cacheLife("minutes");

  if (!hasSupabaseEnv()) return empty;
  const supabase = createClient();
  let query = supabase
    .from("vehicles")
    .select("id, slug, brand, model, year, sale_price", { count: "exact" })
    .eq("listing_status", "published")
    .eq("listing_purpose", "sale")
    .eq("availability_status", "available");

  if (filters.brand) query = query.ilike("brand", filters.brand);
  if (filters.model) query = query.ilike("model", filters.model);
  if (filters.minPrice !== undefined)
    query = query.gte("sale_price", filters.minPrice);
  if (filters.maxPrice !== undefined)
    query = query.lte("sale_price", filters.maxPrice);
  if (filters.minYear !== undefined) query = query.gte("year", filters.minYear);
  if (filters.maxYear !== undefined) query = query.lte("year", filters.maxYear);
  if (filters.body.length) query = query.in("body_type", filters.body as never);
  if (filters.colour.length)
    query = query.or(
      filters.colour
        .map((c) => `exterior_colour.ilike.${c.replace(/[,()]/g, "")}`)
        .join(","),
    );
  if (filters.transmission)
    query = query.eq("transmission", filters.transmission);
  if (filters.fuel) query = query.eq("fuel_type", filters.fuel);

  query =
    filters.sort === "price-asc"
      ? query.order("sale_price", { ascending: true, nullsFirst: false })
      : filters.sort === "price-desc"
        ? query.order("sale_price", { ascending: false, nullsFirst: false })
        : query
            .order("is_featured", { ascending: false })
            .order("created_at", { ascending: false });

  const from = (filters.page - 1) * PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);
  if (error?.code === "PGRST103" && filters.page > 1) {
    // Asked for a page past the end. Report the real total so the page can send the visitor to the last one.
    const firstPage = await searchCars({ ...filters, page: 1 });
    return { cars: [], total: firstPage.total, page: filters.page, totalPages: firstPage.totalPages };
  }
  if (error || !data) return empty;

  const { data: covers } = data.length
    ? await supabase
        .from("vehicle_images")
        .select("vehicle_id, storage_path, blur_data_url")
        .in(
          "vehicle_id",
          data.map((v) => v.id),
        )
        .eq("is_cover", true)
    : { data: [] };
  const coverOf = new Map((covers ?? []).map((c) => [c.vehicle_id, c]));

  const total = count ?? data.length;
  return {
    cars: data.map((v) => ({
      id: v.id,
      slug: v.slug,
      brand: v.brand,
      title: `${v.year} ${v.brand} ${v.model}`,
      price: v.sale_price,
      image: coverOf.has(v.id)
        ? vehicleImageUrl(coverOf.get(v.id)!.storage_path)
        : null,
      blur: coverOf.get(v.id)?.blur_data_url ?? null,
    })),
    total,
    page: filters.page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export type Facets = {
  brands: string[];
  /** Models for each brand, so the model list can follow the chosen brand without a round trip. */
  modelsByBrand: Record<string, string[]>;
  colours: string[];
};

/** Choices for the filter form, taken from the cars that are actually on sale. */
export async function getFacets(): Promise<Facets> {
  "use cache";
  cacheTag("vehicles");
  cacheLife("minutes");

  if (!hasSupabaseEnv()) return { brands: [], modelsByBrand: {}, colours: [] };
  const { data } = await createClient()
    .from("vehicles")
    .select("brand, model, exterior_colour")
    .eq("listing_status", "published")
    .eq("listing_purpose", "sale")
    .eq("availability_status", "available");
  const rows = data ?? [];
  const uniq = (values: (string | null)[]) =>
    [...new Set(values.filter((v): v is string => !!v))].sort((a, b) =>
      a.localeCompare(b),
    );
  const brands = uniq(rows.map((r) => r.brand));
  const modelsByBrand = Object.fromEntries(
    brands.map((brand) => [
      brand,
      uniq(rows.filter((r) => r.brand === brand).map((r) => r.model)),
    ]),
  );
  return {
    brands,
    modelsByBrand,
    colours: uniq(rows.map((r) => r.exterior_colour)),
  };
}

export type CarDetail = {
  id: string;
  slug: string;
  title: string;
  year: number;
  brand: string;
  model: string;
  price: number | null;
  description: string | null;
  bodyType: string | null;
  transmission: string | null;
  fuelType: string | null;
  colour: string | null;
  seats: number | null;
  seller: string;
  condition: string;
  mileage: number | null;
  conditionGrade: string | null;
  accidentHistory: string | null;
  inspection: string | null;
  photos: { id: string; url: string; blur: string | null }[];
};

/** One published car by its address, or null when it does not exist or is not public. */
export async function getCarBySlug(slug: string): Promise<CarDetail | null> {
  "use cache";
  cacheTag("vehicles");
  cacheLife("minutes");

  if (!hasSupabaseEnv()) return null;
  const supabase = createClient();
  const { data: v } = await supabase
    .from("vehicles")
    .select("*")
    .eq("slug", slug)
    .eq("listing_status", "published")
    .maybeSingle();
  if (!v) return null;
  const { data: images } = await supabase
    .from("vehicle_images")
    .select("id, storage_path, blur_data_url")
    .eq("vehicle_id", v.id)
    .order("sort_order");
  return {
    id: v.id,
    slug: v.slug,
    title: `${v.year} ${v.brand} ${v.model}`,
    year: v.year,
    brand: v.brand,
    model: v.model,
    price: v.sale_price,
    description: v.description,
    bodyType: v.body_type,
    transmission: v.transmission,
    fuelType: v.fuel_type,
    colour: v.exterior_colour,
    seats: v.seats,
    seller: v.seller_name,
    condition: v.condition,
    mileage: v.mileage_km,
    conditionGrade: v.condition_grade,
    accidentHistory: v.accident_history,
    inspection: v.inspection_status,
    photos: (images ?? []).map((i) => ({
      id: i.id,
      url: vehicleImageUrl(i.storage_path),
      blur: i.blur_data_url,
    })),
  };
}
