"use server";

import { updateTag } from "next/cache";

import { getStaffSession } from "@/features/auth/session";
import { saveVehicleInputSchema, basicInfoSchema, vehicleFormSchema } from "@/features/inventory/vehicle-form/schema";
import { buildVehicleColumns } from "@/features/inventory/vehicle-form/vehicle-columns";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Result = { ok: true } | { ok: false; error: string };

const notStaff: Result = {
  ok: false,
  error: "You need to be signed in as staff to do this.",
};

function firstIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Check the details and try again.";
}

async function requireStaff() {
  const session = await getStaffSession();
  return session?.isStaff ? session : null;
}

function isId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value);
}

const BUCKET = "vehicle-images";

/**
 * Saves edits to a vehicle. `images` is the final photo list in display order: photos that were already
 * stored plus ones the browser just uploaded. Anything stored but missing from the list is removed.
 * A published listing must stay complete; a draft or hidden one only needs the basics.
 */
export async function updateVehicle(rawInput: unknown): Promise<Result> {
  if (!(await requireStaff())) return notStaff;

  const input = saveVehicleInputSchema.omit({ intent: true }).safeParse(rawInput);
  if (!input.success)
    return {
      ok: false,
      error: "Something went wrong with the form. Refresh and try again.",
    };
  const { id, images } = input.data;

  const supabase = await createClient();
  const { data: current, error: findError } = await supabase
    .from("vehicles")
    .select("listing_status")
    .eq("id", id)
    .maybeSingle();
  if (findError) return { ok: false, error: findError.message };
  if (!current) return { ok: false, error: "This vehicle no longer exists." };

  const basics = basicInfoSchema.safeParse(input.data.values);
  if (!basics.success) return { ok: false, error: firstIssue(basics.error) };

  let values: Record<string, unknown> = input.data.values;
  if (current.listing_status === "published") {
    const full = vehicleFormSchema.safeParse(input.data.values);
    if (!full.success) return { ok: false, error: firstIssue(full.error) };
    if (!images.some((image) => image.category === "exterior")) {
      return {
        ok: false,
        error: "A published vehicle needs at least one exterior photo.",
      };
    }
    values = full.data;
  }

  const columns = buildVehicleColumns(values, {
    brand: basics.data.brand,
    model: basics.data.model,
    year: Number(basics.data.year),
    purpose: basics.data.purpose,
    condition: basics.data.condition,
  });

  const { error } = await supabase.from("vehicles").update(columns).eq("id", id);
  if (error) return { ok: false, error: error.message };

  const { data: stored } = await supabase
    .from("vehicle_images")
    .select("storage_path, blur_data_url")
    .eq("vehicle_id", id);
  const storedPaths = (stored ?? []).map((row) => row.storage_path);

  // Rewrite the photo rows in the new order: exterior first, the first photo is the cover.
  const ordered = [
    ...images.filter((image) => image.category === "exterior"),
    ...images.filter((image) => image.category === "interior"),
  ];
  const { error: clearError } = await supabase.from("vehicle_images").delete().eq("vehicle_id", id);
  if (clearError) return { ok: false, error: clearError.message };
  if (ordered.length > 0) {
    const { error: insertError } = await supabase.from("vehicle_images").insert(
      ordered.map((image, index) => ({
        vehicle_id: id,
        storage_path: image.path,
        sort_order: index,
        is_cover: index === 0,
        blur_data_url: image.blur ?? null,
      })),
    );
    if (insertError) {
      // Put the old rows back so the vehicle is not left without photos.
      await supabase.from("vehicle_images").insert(
        (stored ?? []).map((row, index) => ({
          vehicle_id: id,
          storage_path: row.storage_path,
          sort_order: index,
          is_cover: index === 0,
          blur_data_url: row.blur_data_url,
        })),
      );
      return {
        ok: false,
        error: `The photos could not be saved: ${insertError.message}`,
      };
    }
  }

  const kept = new Set(ordered.map((image) => image.path));
  const removed = storedPaths.filter((path) => !kept.has(path));
  if (removed.length > 0) await supabase.storage.from(BUCKET).remove(removed);

  updateTag("vehicles");
  return { ok: true };
}

/** Permanently removes a vehicle and its photos. Vehicles with orders or bookings are protected by the database. */
export async function deleteVehicle(id: unknown): Promise<Result> {
  if (!(await requireStaff())) return notStaff;
  if (!isId(id)) return { ok: false, error: "That vehicle could not be found." };

  const supabase = await createClient();
  const { data: stored } = await supabase.from("vehicle_images").select("storage_path").eq("vehicle_id", id);

  const { error, count } = await supabase.from("vehicles").delete({ count: "exact" }).eq("id", id);
  if (error) {
    const blocked = error.code === "23503";
    return {
      ok: false,
      error: blocked
        ? "This vehicle has orders or rental bookings, so it cannot be deleted. Hide the listing instead."
        : error.message,
    };
  }
  if (!count) return { ok: false, error: "That vehicle could not be found." };

  const paths = (stored ?? []).map((row) => row.storage_path);
  if (paths.length > 0) await supabase.storage.from(BUCKET).remove(paths);
  updateTag("vehicles");
  return { ok: true };
}

/** Publish, hide or return a listing to draft. Publishing needs a price and at least one photo. */
export async function setListingStatus(id: unknown, status: unknown): Promise<Result> {
  if (!(await requireStaff())) return notStaff;
  if (!isId(id) || (status !== "published" && status !== "hidden" && status !== "draft")) {
    return { ok: false, error: "That request could not be understood." };
  }

  const supabase = await createClient();
  const { data: vehicle, error: findError } = await supabase
    .from("vehicles")
    .select("listing_purpose, sale_price, rental_daily_rate, published_at")
    .eq("id", id)
    .maybeSingle();
  if (findError) return { ok: false, error: findError.message };
  if (!vehicle) return { ok: false, error: "That vehicle could not be found." };

  if (status === "published") {
    const price = vehicle.listing_purpose === "sale" ? vehicle.sale_price : vehicle.rental_daily_rate;
    if (!price) {
      return {
        ok: false,
        error: `Add the ${vehicle.listing_purpose === "sale" ? "sale price" : "daily rental rate"} before publishing.`,
      };
    }
    const { count } = await supabase
      .from("vehicle_images")
      .select("id", { count: "exact", head: true })
      .eq("vehicle_id", id);
    if (!count) return { ok: false, error: "Add at least one photo before publishing." };
  }

  const { error } = await supabase
    .from("vehicles")
    .update({
      listing_status: status,
      published_at: status === "published" ? (vehicle.published_at ?? new Date().toISOString()) : vehicle.published_at,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  updateTag("vehicles");
  return { ok: true };
}

const availabilityValues: Database["public"]["Enums"]["availability_status"][] = [
  "available",
  "booked",
  "rented",
  "sold",
  "under_maintenance",
  "unavailable",
];

export async function setAvailability(id: unknown, status: unknown): Promise<Result> {
  if (!(await requireStaff())) return notStaff;
  if (!isId(id) || typeof status !== "string" || !(availabilityValues as string[]).includes(status)) {
    return { ok: false, error: "That request could not be understood." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("vehicles")
    .update({
      availability_status: status as (typeof availabilityValues)[number],
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  updateTag("vehicles");
  return { ok: true };
}
