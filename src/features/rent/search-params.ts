import { z } from "zod";

import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS } from "@/features/inventory/vehicle-form/schema";

export const RENT_PAGE_SIZE = 12;
export const RENT_SORTS = [
  { value: "newest", label: "Best match" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

const list = (allowed?: readonly string[]) =>
  z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => (value === undefined ? [] : Array.isArray(value) ? value : [value]))
    .transform((values) => values.filter((v) => (allowed ? allowed.includes(v) : v.length > 0 && v.length <= 40)));

const money = z.coerce.number().int().min(0).max(1_000_000).optional().catch(undefined);
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (value) =>
      !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().startsWith(value),
  )
  .optional()
  .catch(undefined);

const rentSearchSchema = z.object({
  pickup: isoDate,
  dropoff: isoDate,
  place: z.string().trim().max(120).optional().catch(undefined),
  brand: z.string().trim().max(60).optional().catch(undefined),
  model: z.string().trim().max(60).optional().catch(undefined),
  minPrice: money,
  maxPrice: money,
  body: list(BODY_TYPES),
  colour: list(),
  transmission: z.enum(TRANSMISSIONS).optional().catch(undefined),
  fuel: z.enum(FUEL_TYPES).optional().catch(undefined),
  sort: z.enum(["newest", "price-asc", "price-desc"]).catch("newest"),
  page: z.coerce.number().int().min(1).catch(1),
});

export type RentFilters = z.infer<typeof rentSearchSchema>;

/** Whole days from `pickup` to `dropoff` (the drop-off day is not charged, as in the bookings table). */
export function daysBetween(pickup: string, dropoff: string) {
  return Math.round((Date.parse(`${dropoff}T00:00:00Z`) - Date.parse(`${pickup}T00:00:00Z`)) / 86_400_000);
}

/**
 * Reads the search address. Dates only count as a pair: a pick-up in the past, a drop-off on or before the
 * pick-up, or one date without the other is dropped, and `dateError` says why so the page can tell the visitor.
 */
export function parseRentSearch(
  raw: Record<string, string | string[] | undefined>,
  today: string,
): { filters: RentFilters; dateError: string | null } {
  const cleaned = Object.fromEntries(Object.entries(raw).filter(([, value]) => value !== "" && value !== undefined));
  const filters = rentSearchSchema.parse(cleaned);
  let dateError: string | null = null;
  if (filters.pickup || filters.dropoff) {
    if (!filters.pickup || !filters.dropoff) dateError = "Choose both a pick-up date and a return date.";
    else if (filters.pickup < today) dateError = "The pick-up date can't be in the past.";
    else if (filters.dropoff <= filters.pickup) dateError = "The return date must be after the pick-up date.";
    if (dateError) {
      filters.pickup = undefined;
      filters.dropoff = undefined;
    }
  }
  return { filters, dateError };
}

/** Builds `?pickup=…&body=suv` from filters, leaving out anything that is not set. */
export function rentQuery(filters: Partial<RentFilters>, patch: Partial<RentFilters> = {}) {
  const merged = { ...filters, ...patch };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) continue;
    if (key === "sort" && value === "newest") continue;
    if (key === "page" && value === 1) continue;
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Just the trip (dates and place), for links from a result to that car's page. */
export function tripQuery(filters: Pick<RentFilters, "pickup" | "dropoff" | "place">) {
  return rentQuery({ pickup: filters.pickup, dropoff: filters.dropoff, place: filters.place });
}
