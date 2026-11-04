import { z } from "zod";

import {
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
} from "@/features/inventory/vehicle-form/schema";

export const PAGE_SIZE = 12;
export const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

const list = (allowed?: readonly string[]) =>
  z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) =>
      value === undefined ? [] : Array.isArray(value) ? value : [value],
    )
    .transform((values) =>
      values.filter((v) =>
        allowed ? allowed.includes(v) : v.length > 0 && v.length <= 40,
      ),
    );

const money = z.coerce
  .number()
  .int()
  .min(0)
  .max(100_000_000)
  .optional()
  .catch(undefined);
const year = z.coerce
  .number()
  .int()
  .min(1950)
  .max(2100)
  .optional()
  .catch(undefined);

export const buySearchSchema = z.object({
  brand: z.string().trim().max(60).optional().catch(undefined),
  model: z.string().trim().max(60).optional().catch(undefined),
  minPrice: money,
  maxPrice: money,
  minYear: year,
  maxYear: year,
  body: list(BODY_TYPES),
  colour: list(),
  transmission: z.enum(TRANSMISSIONS).optional().catch(undefined),
  fuel: z.enum(FUEL_TYPES).optional().catch(undefined),
  sort: z.enum(["newest", "price-asc", "price-desc"]).catch("newest"),
  page: z.coerce.number().int().min(1).catch(1),
});

export type BuyFilters = z.infer<typeof buySearchSchema>;

export function parseBuySearch(
  raw: Record<string, string | string[] | undefined>,
): BuyFilters {
  // Empty form fields arrive as "", which should mean "no filter".
  const cleaned = Object.fromEntries(
    Object.entries(raw).filter(
      ([, value]) => value !== "" && value !== undefined,
    ),
  );
  return buySearchSchema.parse(cleaned);
}

/** Builds `?brand=Toyota&body=suv…` from filters, leaving out anything that is not set. */
export function buyQuery(
  filters: Partial<BuyFilters>,
  patch: Partial<BuyFilters> = {},
) {
  const merged = { ...filters, ...patch };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    )
      continue;
    if (key === "sort" && value === "newest") continue;
    if (key === "page" && value === 1) continue;
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}
