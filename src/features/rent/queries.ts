import { cacheLife, cacheTag } from "next/cache";

import type { BuyCar, Facets } from "@/features/buy/queries";
import { vehicleImageUrl } from "@/features/inventory/image-url";
import { RENT_PAGE_SIZE, type RentFilters } from "@/features/rent/search-params";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/public";

export type RentCar = BuyCar;
export type RentResult = { cars: RentCar[]; total: number; page: number; totalPages: number };
const empty: RentResult = { cars: [], total: 0, page: 1, totalPages: 1 };

/**
 * Statuses a rental can be shown under. With no dates only cars that are free now are listed. With dates, a
 * car that is booked or out on hire today may still be free for those dates, so the bookings decide.
 */
const NOW = ["available"] as const;
const FOR_DATES = ["available", "booked", "rented"] as const;

/** Ids of cars that already have a confirmed, ready or active booking overlapping these dates. */
async function takenIds(pickup: string, dropoff: string): Promise<string[]> {
  const { data } = await createClient().rpc("unavailable_rental_vehicle_ids", { p_pickup: pickup, p_return: dropoff });
  return data ?? [];
}

/** Published rental cars, filtered by dates (when given), type, price per day and the rest, sorted as asked. */
export async function searchRentals(filters: RentFilters): Promise<RentResult> {
  "use cache";
  cacheTag("vehicles", "bookings");
  cacheLife("minutes");

  if (!hasSupabaseEnv()) return empty;
  const supabase = createClient();
  const dated = !!filters.pickup && !!filters.dropoff;
  let query = supabase
    .from("vehicles")
    .select("id, slug, brand, model, year, rental_daily_rate", { count: "exact" })
    .eq("listing_status", "published")
    .eq("listing_purpose", "rent")
    .in("availability_status", dated ? [...FOR_DATES] : [...NOW]);

  if (dated) {
    const taken = await takenIds(filters.pickup!, filters.dropoff!);
    if (taken.length) query = query.not("id", "in", `(${taken.join(",")})`);
  }
  if (filters.brand) query = query.ilike("brand", filters.brand);
  if (filters.model) query = query.ilike("model", filters.model);
  if (filters.minPrice !== undefined) query = query.gte("rental_daily_rate", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("rental_daily_rate", filters.maxPrice);
  if (filters.body.length) query = query.in("body_type", filters.body as never);
  if (filters.colour.length)
    query = query.or(filters.colour.map((c) => `exterior_colour.ilike.${c.replace(/[,()]/g, "")}`).join(","));
  if (filters.transmission) query = query.eq("transmission", filters.transmission);
  if (filters.fuel) query = query.eq("fuel_type", filters.fuel);

  query =
    filters.sort === "price-asc"
      ? query.order("rental_daily_rate", { ascending: true, nullsFirst: false })
      : filters.sort === "price-desc"
        ? query.order("rental_daily_rate", { ascending: false, nullsFirst: false })
        : query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });

  const from = (filters.page - 1) * RENT_PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + RENT_PAGE_SIZE - 1);
  if (error?.code === "PGRST103" && filters.page > 1) {
    const firstPage = await searchRentals({ ...filters, page: 1 });
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
      price: v.rental_daily_rate,
      image: coverOf.has(v.id) ? vehicleImageUrl(coverOf.get(v.id)!.storage_path) : null,
      blur: coverOf.get(v.id)?.blur_data_url ?? null,
    })),
    total,
    page: filters.page,
    totalPages: Math.max(1, Math.ceil(total / RENT_PAGE_SIZE)),
  };
}

/** Choices for the filter form, taken from the rental cars that are listed. */
export async function getRentFacets(): Promise<Facets> {
  "use cache";
  cacheTag("vehicles");
  cacheLife("minutes");

  if (!hasSupabaseEnv()) return { brands: [], modelsByBrand: {}, colours: [] };
  const { data } = await createClient()
    .from("vehicles")
    .select("brand, model, exterior_colour")
    .eq("listing_status", "published")
    .eq("listing_purpose", "rent")
    .in("availability_status", [...FOR_DATES]);
  const rows = data ?? [];
  const uniq = (values: (string | null)[]) =>
    [...new Set(values.filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b));
  const brands = uniq(rows.map((r) => r.brand));
  return {
    brands,
    modelsByBrand: Object.fromEntries(
      brands.map((b) => [b, uniq(rows.filter((r) => r.brand === b).map((r) => r.model))]),
    ),
    colours: uniq(rows.map((r) => r.exterior_colour)),
  };
}

export type RentalDetail = {
  id: string;
  slug: string;
  title: string;
  year: number;
  brand: string;
  model: string;
  dailyRate: number | null;
  securityDeposit: number | null;
  description: string | null;
  bodyType: string | null;
  transmission: string | null;
  fuelType: string | null;
  colour: string | null;
  seats: number | null;
  /** False when the car is sold, in the workshop or switched off, so it cannot be requested at all. */
  rentable: boolean;
  photos: { id: string; url: string; blur: string | null }[];
};

/** One published rental car by its address, or null when it does not exist or is not a public rental. */
export async function getRentalBySlug(slug: string): Promise<RentalDetail | null> {
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
    .eq("listing_purpose", "rent")
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
    dailyRate: v.rental_daily_rate,
    securityDeposit: v.rental_security_deposit,
    description: v.description,
    bodyType: v.body_type,
    transmission: v.transmission,
    fuelType: v.fuel_type,
    colour: v.exterior_colour,
    seats: v.seats,
    rentable: (FOR_DATES as readonly string[]).includes(v.availability_status),
    photos: (images ?? []).map((i) => ({ id: i.id, url: vehicleImageUrl(i.storage_path), blur: i.blur_data_url })),
  };
}

/** Whether this car is free for the dates: true when no confirmed, ready or active booking overlaps them. */
export async function isFreeForDates(vehicleId: string, pickup: string, dropoff: string): Promise<boolean> {
  "use cache";
  cacheTag("bookings");
  cacheLife("minutes");

  if (!hasSupabaseEnv()) return true;
  return !(await takenIds(pickup, dropoff)).includes(vehicleId);
}
