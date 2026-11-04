import { z } from "zod";

import type { Database } from "@/lib/supabase/database.types";

export type RentalStatus = Database["public"]["Enums"]["rental_status"];

export const RENTAL_STATUSES = [
  "inquiry_received",
  "confirmed",
  "ready_for_pickup",
  "active",
  "returned",
  "cancelled",
] as const satisfies readonly RentalStatus[];

const tabs = ["new", "upcoming", "active", "past", "all"] as const;

export const bookingSearchSchema = z.object({
  tab: z.enum(tabs).catch("new"),
  status: z.enum(["all", ...RENTAL_STATUSES]).catch("all"),
  q: z.string().catch(""),
  page: z.coerce.number().int().min(1).catch(1),
});

export type BookingSearchParams = z.infer<typeof bookingSearchSchema>;
export type BookingTab = BookingSearchParams["tab"];

export function parseBookingSearchParams(raw: Record<string, string | string[] | undefined>): BookingSearchParams {
  const single = (key: string) => {
    const value = raw[key];
    return Array.isArray(value) ? value[0] : value;
  };
  return bookingSearchSchema.parse({
    tab: single("tab"),
    status: single("status"),
    q: single("q") ?? "",
    page: single("page"),
  });
}

export const BOOKINGS_PAGE_SIZE = 20;

/** Figma 120:6127: tab names. */
export const bookingTabLabels: Record<BookingTab, string> = {
  new: "New Enquiries",
  upcoming: "Upcoming",
  active: "Active Rentals",
  past: "Past bookings",
  all: "All",
};

/** Which statuses each tab holds (matches `rentalAdminTab` in lib/status). */
export const tabStatuses: Record<Exclude<BookingTab, "all">, RentalStatus[]> = {
  new: ["inquiry_received"],
  upcoming: ["confirmed", "ready_for_pickup"],
  active: ["active"],
  past: ["returned", "cancelled"],
};

/** Staff-facing names (Figma 120:6845). The customer-facing names live in lib/status. */
const adminLabels: Record<RentalStatus, string> = {
  inquiry_received: "New enquiry",
  confirmed: "Confirmed",
  ready_for_pickup: "Ready for pickup",
  active: "Active rental",
  returned: "Returned",
  cancelled: "Cancelled",
};

export function bookingStatusLabel(status: RentalStatus) {
  return adminLabels[status];
}

export const bookingStatusOptions = RENTAL_STATUSES.map((value) => ({ value, label: adminLabels[value] }));

export const bookingFilterOptions = [{ value: "all", label: "All Statuses" }, ...bookingStatusOptions] as const;

export function buildBookingSearchParams(current: BookingSearchParams, patch: Partial<BookingSearchParams>): string {
  const next = { ...current, ...patch };
  const params = new URLSearchParams();
  if (next.tab !== "new") params.set("tab", next.tab);
  if (next.status !== "all") params.set("status", next.status);
  if (next.q.trim()) params.set("q", next.q.trim());
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

const monthDay = (d: Date, withYear: boolean) =>
  d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });

/** "21–24 Oct 2026", "28 Oct – 2 Nov 2026" or "28 Dec 2026 – 2 Jan 2027" (return date is the day the car comes back). */
export function formatDateRange(pickup: string, ret: string) {
  const a = new Date(`${pickup}T00:00:00Z`);
  const b = new Date(`${ret}T00:00:00Z`);
  if (a.getUTCFullYear() !== b.getUTCFullYear()) return `${monthDay(a, true)} – ${monthDay(b, true)}`;
  if (a.getUTCMonth() !== b.getUTCMonth()) return `${monthDay(a, false)} – ${monthDay(b, true)}`;
  return `${a.getUTCDate()}–${monthDay(b, true)}`;
}
