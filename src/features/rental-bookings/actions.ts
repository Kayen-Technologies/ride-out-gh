"use server";

import { updateTag } from "next/cache";

import { getStaffSession } from "@/features/auth/session";
import { RENTAL_STATUSES, bookingStatusLabel, type RentalStatus } from "@/features/rental-bookings/search-params";
import { newBookingSchema, type ActionResult, type CreateResult } from "@/features/rental-bookings/schema";
import { formatDateRange } from "@/features/rental-bookings/search-params";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const notStaff = { ok: false, error: "You need to be signed in as staff to do this." } as const;
const CLASH = "23P01"; // Postgres exclusion violation: the no-overlap rule on rental_bookings.
const BLOCKING: RentalStatus[] = ["confirmed", "ready_for_pickup", "active"];

async function requireStaff() {
  const session = await getStaffSession();
  return session?.isStaff ? session : null;
}

const isId = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value);

/** The public site caches availability under the "bookings" tag, so every change here refreshes it. */
function refresh() {
  updateTag("bookings");
}

export async function setBookingStatus(id: string, status: string): Promise<ActionResult> {
  if (!(await requireStaff())) return notStaff;
  if (!isId(id) || !(RENTAL_STATUSES as readonly string[]).includes(status))
    return { ok: false, error: "That status is not valid." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rental_bookings")
    .update({ status: status as RentalStatus })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) {
    if (error.code === CLASH)
      return {
        ok: false,
        error: "Another confirmed booking already holds this car for those dates. Check availability first.",
      };
    return { ok: false, error: "Could not update the status. Try again." };
  }
  if (!data) return { ok: false, error: "This booking no longer exists." };
  refresh();
  return { ok: true };
}

export async function addBookingNote(id: string, body: string): Promise<ActionResult> {
  const session = await requireStaff();
  if (!session) return notStaff;
  const text = body.trim();
  if (!isId(id)) return { ok: false, error: "This booking no longer exists." };
  if (text.length < 1) return { ok: false, error: "Write a note first." };
  if (text.length > 2000) return { ok: false, error: "Keep notes under 2,000 characters." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("internal_notes")
    .insert({ booking_id: id, body: text, author_id: session.userId });
  if (error) return { ok: false, error: "Could not save the note. Try again." };
  return { ok: true };
}

export type AvailabilityResult = { ok: true; free: boolean; message: string } | { ok: false; error: string };

/**
 * Is the car free for this booking's dates? Looks at the car's own status and at every other blocking
 * booking (confirmed, ready for pickup or active) that overlaps. This booking itself is ignored.
 */
export async function checkBookingAvailability(id: string): Promise<AvailabilityResult> {
  if (!(await requireStaff())) return notStaff;
  if (!isId(id)) return { ok: false, error: "This booking no longer exists." };

  const supabase = await createClient();
  const { data: booking, error } = await supabase
    .from("rental_bookings")
    .select("vehicle_id, pickup_date, return_date, vehicles(availability_status, listing_status)")
    .eq("id", id)
    .maybeSingle();
  if (error || !booking) return { ok: false, error: "Could not check this booking." };

  const vehicle = booking.vehicles as { availability_status: string; listing_status: string } | null;
  if (vehicle && ["under_maintenance", "unavailable", "sold"].includes(vehicle.availability_status)) {
    const why = vehicle.availability_status === "under_maintenance" ? "under maintenance" : vehicle.availability_status;
    return { ok: true, free: false, message: `The car is marked ${why} in Inventory.` };
  }

  const { data: clashes, error: clashError } = await supabase
    .from("rental_bookings")
    .select("code, status, pickup_date, return_date")
    .eq("vehicle_id", booking.vehicle_id)
    .neq("id", id)
    .in("status", BLOCKING)
    .lt("pickup_date", booking.return_date)
    .gt("return_date", booking.pickup_date)
    .order("pickup_date");
  if (clashError) return { ok: false, error: "Could not check this booking." };

  if (clashes && clashes.length > 0) {
    const list = clashes
      .map(
        (c) =>
          `${c.code} (${formatDateRange(c.pickup_date, c.return_date)}, ${bookingStatusLabel(c.status).toLowerCase()})`,
      )
      .join("; ");
    return { ok: true, free: false, message: `Not free. Already held by ${list}.` };
  }
  return { ok: true, free: true, message: "The car is free for these dates." };
}

/** A short-lived link to the customer's Ghana Card photo. The bucket is private, so only staff get one. */
export async function openGhanaCard(id: string): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!(await requireStaff())) return notStaff;
  if (!isId(id)) return { ok: false, error: "This booking no longer exists." };

  const supabase = await createClient();
  const { data } = await supabase.from("rental_bookings").select("ghana_card_image_path").eq("id", id).maybeSingle();
  const path = data?.ghana_card_image_path;
  if (!path) return { ok: false, error: "No Ghana Card photo was uploaded for this booking." };

  const { data: signed, error } = await createAdminClient().storage.from("id-documents").createSignedUrl(path, 120);
  if (error || !signed) return { ok: false, error: "Could not open the photo. Try again." };
  return { ok: true, url: signed.signedUrl };
}

/**
 * "Add rental booking": a booking that came in by phone or walk-in. The daily rate is the one agreed with the
 * customer, so the booking starts as confirmed and holds the car straight away. If another confirmed booking
 * already holds those dates the database refuses it and nothing is saved.
 */
export async function createBooking(raw: unknown): Promise<CreateResult> {
  const session = await requireStaff();
  if (!session) return notStaff;

  const parsed = newBookingSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: "Check the highlighted fields.", fields };
  }
  const v = parsed.data;

  const supabase = await createClient();
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, rental_security_deposit")
    .eq("id", v.vehicleId)
    .eq("listing_purpose", "rent")
    .maybeSingle();
  if (!vehicle)
    return { ok: false, error: "That vehicle is not a rental car.", fields: { vehicleId: "Choose a rental car." } };

  // One customer per email; an existing customer is reused and never renamed.
  let customerId: string;
  const { data: existing } = await supabase.from("customers").select("id, phone").eq("email", v.email).maybeSingle();
  if (existing) {
    customerId = existing.id;
    if (!existing.phone && v.phone) await supabase.from("customers").update({ phone: v.phone }).eq("id", existing.id);
  } else {
    const { data: created, error } = await supabase
      .from("customers")
      .insert({ full_name: v.fullName, email: v.email, phone: v.phone || null, acquisition_source: "admin" })
      .select("id")
      .single();
    if (error || !created) return { ok: false, error: "Could not save the customer. Try again." };
    customerId = created.id;
  }

  const { data: booking, error } = await supabase
    .from("rental_bookings")
    .insert({
      customer_id: customerId,
      vehicle_id: vehicle.id,
      status: "confirmed",
      pickup_date: v.pickupDate,
      return_date: v.returnDate,
      pickup_location: v.pickupLocation || null,
      daily_rate: v.dailyRate,
      security_deposit: vehicle.rental_security_deposit ?? 0,
    })
    .select("id, code")
    .single();
  if (error || !booking) {
    if (error?.code === CLASH)
      return {
        ok: false,
        error: "That car is already booked for some of those dates. Choose other dates or another car.",
      };
    return { ok: false, error: "Could not save the booking. Try again." };
  }

  if (v.notes)
    await supabase.from("internal_notes").insert({ booking_id: booking.id, body: v.notes, author_id: session.userId });
  refresh();
  return { ok: true, id: booking.id, code: booking.code };
}
