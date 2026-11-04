import "server-only";

import { escapeIlike, sanitizeInventorySearchQuery } from "@/features/inventory/search-filter";
import { BOOKINGS_PAGE_SIZE, tabStatuses, type BookingSearchParams } from "@/features/rental-bookings/search-params";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

type BookingRow = Database["public"]["Tables"]["rental_bookings"]["Row"];

const LIST_SELECT =
  "id, code, status, pickup_date, return_date, daily_rate, vehicles(year, brand, model), customers(full_name)";

export type BookingListItem = Pick<
  BookingRow,
  "id" | "code" | "status" | "pickup_date" | "return_date" | "daily_rate"
> & {
  vehicles: { year: number; brand: string; model: string } | null;
  customers: { full_name: string } | null;
};

export type BookingStats = { new: number; upcoming: number; active: number; past: number };

export async function getBookingStats(): Promise<BookingStats> {
  const supabase = await createClient();
  const count = async (statuses: BookingRow["status"][]) => {
    const { count, error } = await supabase
      .from("rental_bookings")
      .select("id", { count: "exact", head: true })
      .in("status", statuses);
    if (error) throw error;
    return count ?? 0;
  };
  const [n, upcoming, active, past] = await Promise.all([
    count(tabStatuses.new),
    count(tabStatuses.upcoming),
    count(tabStatuses.active),
    count(tabStatuses.past),
  ]);
  return { new: n, upcoming, active, past };
}

/** Ids of vehicles and customers whose name, code, email or phone match what staff typed. */
async function searchIds(q: string) {
  const supabase = await createClient();
  const pattern = `"%${escapeIlike(q).replace(/"/g, '""')}%"`;
  const [vehicles, customers] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id")
      .or(["brand", "model", "code", "registration"].map((c) => `${c}.ilike.${pattern}`).join(","))
      .limit(200),
    supabase
      .from("customers")
      .select("id")
      .or(["full_name", "email", "phone", "code"].map((c) => `${c}.ilike.${pattern}`).join(","))
      .limit(200),
  ]);
  if (vehicles.error) throw vehicles.error;
  if (customers.error) throw customers.error;
  return {
    vehicleIds: (vehicles.data ?? []).map((v) => v.id),
    customerIds: (customers.data ?? []).map((c) => c.id),
  };
}

export async function listBookings(input: Pick<BookingSearchParams, "tab" | "status" | "q" | "page">) {
  const supabase = await createClient();
  const page = Math.max(1, input.page);
  const from = (page - 1) * BOOKINGS_PAGE_SIZE;

  let query = supabase
    .from("rental_bookings")
    .select(LIST_SELECT, { count: "exact" })
    .order("created_at", { ascending: false });

  if (input.tab !== "all") query = query.in("status", tabStatuses[input.tab]);
  if (input.status !== "all") query = query.eq("status", input.status);

  const q = sanitizeInventorySearchQuery(input.q.trim());
  if (q) {
    const { vehicleIds, customerIds } = await searchIds(q);
    const parts = [`code.ilike."%${escapeIlike(q)}%"`];
    if (vehicleIds.length) parts.push(`vehicle_id.in.(${vehicleIds.join(",")})`);
    if (customerIds.length) parts.push(`customer_id.in.(${customerIds.join(",")})`);
    query = query.or(parts.join(","));
  }

  const { data, error, count } = await query.range(from, from + BOOKINGS_PAGE_SIZE - 1);
  if (error) throw error;
  const total = count ?? 0;
  return {
    rows: (data ?? []) as unknown as BookingListItem[],
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / BOOKINGS_PAGE_SIZE)),
  };
}

export type BookingDetail = BookingRow & {
  vehicles: {
    id: string;
    year: number;
    brand: string;
    model: string;
    code: string;
    rental_daily_rate: number | null;
  } | null;
  customers: { full_name: string; email: string; phone: string | null } | null;
  notes: { id: string; body: string; created_at: string }[];
  history: { id: string; status: BookingRow["status"]; created_at: string }[];
};

export async function getBookingDetail(id: string): Promise<BookingDetail | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const [booking, notes, history] = await Promise.all([
    supabase
      .from("rental_bookings")
      .select("*, vehicles(id, year, brand, model, code, rental_daily_rate), customers(full_name, email, phone)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("internal_notes")
      .select("id, body, created_at")
      .eq("booking_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("rental_status_history")
      .select("id, status, created_at")
      .eq("booking_id", id)
      .order("created_at", { ascending: false }),
  ]);
  if (booking.error) throw booking.error;
  if (notes.error) throw notes.error;
  if (history.error) throw history.error;
  if (!booking.data) return null;
  return { ...(booking.data as unknown as BookingDetail), notes: notes.data ?? [], history: history.data ?? [] };
}

export type RentableVehicle = { id: string; label: string; rate: number; deposit: number };

/** Published rental cars for the "Add booking" picker. */
export async function listRentableVehicles(): Promise<RentableVehicle[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, year, brand, model, code, rental_daily_rate, rental_security_deposit")
    .eq("listing_purpose", "rent")
    .not("rental_daily_rate", "is", null)
    .order("brand")
    .order("model");
  if (error) throw error;
  return (data ?? []).map((v) => ({
    id: v.id,
    label: `${v.year} ${v.brand} ${v.model} · ${v.code}`,
    rate: Number(v.rental_daily_rate),
    deposit: Number(v.rental_security_deposit ?? 0),
  }));
}
