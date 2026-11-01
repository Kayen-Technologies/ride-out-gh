import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { buildVehicleSearchOrFilter } from "@/features/inventory/search-filter";
import {
  INVENTORY_PAGE_SIZE,
  type InventorySearchParams,
} from "@/features/inventory/search-params";

type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"];

export type InventoryVehicle = VehicleRow;

export type InventoryStats = {
  total: number;
  available: number;
  forSale: number;
  forRent: number;
};

export type ListVehiclesResult = {
  rows: InventoryVehicle[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getInventoryStats(): Promise<InventoryStats> {
  const supabase = await createClient();

  const [total, available, forSale, forRent] = await Promise.all([
    countWhere(supabase, {}),
    countWhere(supabase, { availability_status: "available" }),
    countWhere(supabase, { listing_purpose: "sale" }),
    countWhere(supabase, { listing_purpose: "rent" }),
  ]);

  return { total, available, forSale, forRent };
}

async function countWhere(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filters: Record<string, string>,
) {
  let query = supabase.from("vehicles").select("id", { count: "exact", head: true });
  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function listVehicles(input: {
  tab: InventorySearchParams["tab"];
  status: InventorySearchParams["status"];
  q: string;
  page: number;
}): Promise<ListVehiclesResult> {
  const supabase = await createClient();
  const page = Math.max(1, input.page);
  const from = (page - 1) * INVENTORY_PAGE_SIZE;
  const to = from + INVENTORY_PAGE_SIZE - 1;

  let query = supabase
    .from("vehicles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (input.tab === "sale") query = query.eq("listing_purpose", "sale");
  if (input.tab === "rent") query = query.eq("listing_purpose", "rent");
  if (input.tab === "published") query = query.eq("listing_status", "published");
  if (input.tab === "hidden") query = query.eq("listing_status", "hidden");

  if (input.status !== "all") {
    query = query.eq("availability_status", input.status);
  }

  const orFilter = buildVehicleSearchOrFilter(input.q);
  if (orFilter) {
    query = query.or(orFilter);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  const total = count ?? 0;
  return {
    rows: data ?? [],
    total,
    page,
    pageSize: INVENTORY_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / INVENTORY_PAGE_SIZE)),
  };
}

export type VehicleDetail = {
  vehicle: VehicleRow;
  images: { id: string; path: string; sortOrder: number; isCover: boolean; blur: string | null }[];
};

/** One vehicle with its photos in display order, or null when the id does not exist. */
export async function getVehicleDetail(id: string): Promise<VehicleDetail | null> {
  // A malformed id would make Postgres throw on the uuid cast, so treat it as "not found".
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const [{ data: vehicle, error }, { data: images, error: imageError }] = await Promise.all([
    supabase.from("vehicles").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("vehicle_images")
      .select("id, storage_path, sort_order, is_cover, blur_data_url")
      .eq("vehicle_id", id)
      .order("sort_order"),
  ]);
  if (error) throw error;
  if (imageError) throw imageError;
  if (!vehicle) return null;
  return {
    vehicle,
    images: (images ?? []).map((image) => ({
      id: image.id,
      path: image.storage_path,
      sortOrder: image.sort_order,
      isCover: image.is_cover,
      blur: image.blur_data_url,
    })),
  };
}
