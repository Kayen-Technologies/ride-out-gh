"use server";

import { randomUUID } from "node:crypto";

import {
  GHANA_CARD,
  CARD_IMAGE_MAX_BYTES,
  requestFieldsSchema,
  type RequestResult,
} from "@/features/rent/request/schema";
import { daysBetween } from "@/features/rent/search-params";
import { createClient as createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "id-documents";
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

/** What the file really is, judged by its first bytes (the browser's file type can be wrong or forged). */
function sniffImage(bytes: Uint8Array): { type: string; extension: string } | null {
  const at = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (at(0xff, 0xd8, 0xff)) return { type: "image/jpeg", extension: "jpg" };
  if (at(0x89, 0x50, 0x4e, 0x47)) return { type: "image/png", extension: "png" };
  if (at(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50)
    return { type: "image/webp", extension: "webp" };
  return null;
}

/**
 * "Request this car" (Figma 1:4829). Anyone can send it, signed in or not, so it runs with the service role
 * after checking everything itself: the fields, the dates, that the car is a public rental that is still free,
 * and that the Ghana Card photo is a real image. The photo goes to the private `id-documents` bucket and is only
 * ever opened by staff through a short-lived signed link. The booking starts as "inquiry received".
 */
export async function submitRentalRequest(formData: FormData): Promise<RequestResult> {
  // A hidden field real visitors never see. Bots fill it; they get a quiet "success" and nothing is saved.
  if (String(formData.get("website") ?? "").length > 0) return { ok: true, code: "RB-0" };

  const parsed = requestFieldsSchema.safeParse({
    fullName: formData.get("fullName") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    ghanaCardNumber: formData.get("ghanaCardNumber") ?? "",
  });
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: "Check the highlighted fields.", fields };
  }
  const { fullName, phone, email } = parsed.data;
  const cardMatch = GHANA_CARD.exec(parsed.data.ghanaCardNumber.replace(/\s/g, ""));
  const ghanaCardNumber = cardMatch ? `GHA-${cardMatch[1]}-${cardMatch[2]}` : null;

  const slug = String(formData.get("slug") ?? "");
  const pickup = String(formData.get("pickup") ?? "");
  const dropoff = String(formData.get("dropoff") ?? "");
  const place =
    String(formData.get("place") ?? "")
      .trim()
      .slice(0, 120) || null;
  const today = new Date().toISOString().slice(0, 10);
  if (
    !isoDate.test(pickup) ||
    !isoDate.test(dropoff) ||
    pickup < today ||
    dropoff <= pickup ||
    daysBetween(pickup, dropoff) > 365
  )
    return { ok: false, error: "Those dates are not valid. Go back and choose them again." };

  const db = createAdminClient();
  const { data: vehicle } = await db
    .from("vehicles")
    .select("id, rental_daily_rate, rental_security_deposit, availability_status")
    .eq("slug", slug)
    .eq("listing_status", "published")
    .eq("listing_purpose", "rent")
    .maybeSingle();
  if (
    !vehicle ||
    vehicle.rental_daily_rate == null ||
    !["available", "booked", "rented"].includes(vehicle.availability_status)
  )
    return { ok: false, error: "This car is not available to rent right now." };

  const { data: taken } = await db.rpc("unavailable_rental_vehicle_ids", { p_pickup: pickup, p_return: dropoff });
  if ((taken ?? []).includes(vehicle.id))
    return { ok: false, error: "Sorry, this car was just booked for those dates. Please choose other dates." };

  // The Ghana Card photo is optional. When there is one it must be a real, small image.
  let image: { bytes: Uint8Array; type: string; extension: string } | null = null;
  const file = formData.get("ghanaCardImage");
  if (file instanceof File && file.size > 0) {
    if (file.size > CARD_IMAGE_MAX_BYTES)
      return { ok: false, error: "That photo is too large.", fields: { ghanaCardImage: "Use a photo under 3 MB." } };
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = sniffImage(bytes);
    if (!kind)
      return {
        ok: false,
        error: "That file is not a photo.",
        fields: { ghanaCardImage: "Use a JPG, PNG or WebP photo." },
      };
    image = { bytes, ...kind };
  }

  // One customer per email. An existing customer's details are never overwritten by a guest form
  // (anyone can type any email); a missing phone number is filled in.
  let customerId: string;
  const { data: existing } = await db.from("customers").select("id, phone").eq("email", email).maybeSingle();
  if (existing) {
    customerId = existing.id;
    if (!existing.phone) await db.from("customers").update({ phone }).eq("id", existing.id);
  } else {
    const { data: created, error } = await db
      .from("customers")
      .insert({ full_name: fullName, email, phone })
      .select("id")
      .single();
    if (error || !created) {
      // Two requests with the same new email at once: the other one won, so use its row.
      const { data: again } = await db.from("customers").select("id").eq("email", email).maybeSingle();
      if (!again) return { ok: false, error: "We could not save your request. Please try again." };
      customerId = again.id;
    } else customerId = created.id;
  }

  // The same person sending the same request twice (a double click, a retry) gets the first one back.
  const { data: repeat } = await db
    .from("rental_bookings")
    .select("code")
    .eq("customer_id", customerId)
    .eq("vehicle_id", vehicle.id)
    .eq("pickup_date", pickup)
    .eq("return_date", dropoff)
    .eq("status", "inquiry_received")
    .maybeSingle();
  if (repeat) return { ok: true, code: repeat.code };

  let imagePath: string | null = null;
  if (image) {
    imagePath = `rental-requests/${randomUUID()}.${image.extension}`;
    const { error } = await db.storage
      .from(BUCKET)
      .upload(imagePath, image.bytes, { contentType: image.type, upsert: false });
    if (error) return { ok: false, error: "We could not upload the photo. Please try again." };
  }

  const { data: booking, error: bookingError } = await db
    .from("rental_bookings")
    .insert({
      customer_id: customerId,
      vehicle_id: vehicle.id,
      pickup_date: pickup,
      return_date: dropoff,
      pickup_location: place,
      // Rates are copied now so a later price change does not alter this request.
      daily_rate: vehicle.rental_daily_rate,
      security_deposit: vehicle.rental_security_deposit ?? 0,
      ghana_card_number: ghanaCardNumber,
      ghana_card_image_path: imagePath,
    })
    .select("code")
    .single();
  if (bookingError || !booking) {
    if (imagePath) await db.storage.from(BUCKET).remove([imagePath]);
    return { ok: false, error: "We could not save your request. Please try again." };
  }
  return { ok: true, code: booking.code };
}
