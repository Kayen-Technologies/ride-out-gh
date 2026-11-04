"use server";

import { updateTag } from "next/cache";

import { buildVehicleColumns } from "@/features/inventory/vehicle-form/vehicle-columns";
import { basicInfoSchema, saveVehicleInputSchema, vehicleFormSchema } from "@/features/inventory/vehicle-form/schema";
import type { SaveVehicleResult } from "@/features/inventory/vehicle-form/schema";
import { getStaffSession } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function firstIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Check the details and try again.";
}

/**
 * Creates the vehicle and its photo rows. The photos are already in the `vehicle-images` bucket
 * (the browser uploads them first, under `<vehicle id>/<category>/`). A draft only needs the basics;
 * publishing needs everything plus a price and at least one exterior photo for the cover.
 */
export async function saveVehicle(rawInput: unknown): Promise<SaveVehicleResult> {
  const session = await getStaffSession();
  if (!session?.isStaff)
    return {
      ok: false,
      error: "You need to be signed in as staff to do this.",
    };

  const input = saveVehicleInputSchema.safeParse(rawInput);
  if (!input.success)
    return {
      ok: false,
      error: "Something went wrong with the form. Refresh and try again.",
    };
  const { id, intent, images } = input.data;

  const basics = basicInfoSchema.safeParse(input.data.values);
  if (!basics.success) return { ok: false, error: firstIssue(basics.error) };

  let values: Record<string, unknown> = {};
  if (intent === "publish") {
    const full = vehicleFormSchema.safeParse(input.data.values);
    if (!full.success) return { ok: false, error: firstIssue(full.error) };
    if (!images.some((image) => image.category === "exterior")) {
      return {
        ok: false,
        error: "Add at least one exterior photo before publishing.",
      };
    }
    values = full.data;
  } else {
    values = input.data.values;
  }

  const year = Number(basics.data.year);
  const columns = buildVehicleColumns(values, {
    brand: basics.data.brand,
    model: basics.data.model,
    year,
    purpose: basics.data.purpose,
    condition: basics.data.condition,
  });

  const supabase = await createClient();

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .insert({
      ...columns,
      id,
      slug: `${slugify(`${year} ${basics.data.brand} ${basics.data.model}`)}-${id.slice(0, 6)}`,
      listing_status: intent === "publish" ? "published" : "draft",
      published_at: intent === "publish" ? new Date().toISOString() : null,
      created_by: session.userId,
      brand: basics.data.brand,
      model: basics.data.model,
      year,
      condition: basics.data.condition,
      listing_purpose: basics.data.purpose,
    })
    .select("id, code")
    .single();

  if (error || !vehicle) {
    return {
      ok: false,
      error: error?.message ?? "The vehicle could not be saved.",
    };
  }

  if (images.length > 0) {
    // Exterior first so the public gallery opens on the outside of the car; the first one is the cover.
    const ordered = [
      ...images.filter((image) => image.category === "exterior"),
      ...images.filter((image) => image.category === "interior"),
    ];
    const { error: imageError } = await supabase.from("vehicle_images").insert(
      ordered.map((image, index) => ({
        vehicle_id: vehicle.id,
        storage_path: image.path,
        sort_order: index,
        is_cover: index === 0,
        blur_data_url: image.blur ?? null,
      })),
    );
    if (imageError) {
      await supabase.from("vehicles").delete().eq("id", vehicle.id);
      return {
        ok: false,
        error: `The photos could not be saved: ${imageError.message}`,
      };
    }
  }

  updateTag("vehicles");
  return { ok: true, id: vehicle.id, code: vehicle.code };
}
