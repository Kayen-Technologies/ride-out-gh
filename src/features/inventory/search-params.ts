import { z } from "zod";

const inventoryTabs = ["all", "sale", "rent", "published", "hidden"] as const;
const availabilityValues = [
  "all",
  "available",
  "booked",
  "rented",
  "sold",
  "under_maintenance",
  "unavailable",
] as const;
export const inventorySearchSchema = z.object({
  tab: z.enum(inventoryTabs).catch("all"),
  status: z.enum(availabilityValues).catch("all"),
  q: z.string().catch(""),
  page: z.coerce.number().int().min(1).catch(1),
});

export type InventorySearchParams = z.infer<typeof inventorySearchSchema>;

export function parseInventorySearchParams(
  raw: Record<string, string | string[] | undefined>,
): InventorySearchParams {
  const single = (key: string) => {
    const value = raw[key];
    if (Array.isArray(value)) return value[0];
    return value;
  };

  return inventorySearchSchema.parse({
    tab: single("tab"),
    status: single("status"),
    q: single("q") ?? "",
    page: single("page"),
  });
}

export const INVENTORY_PAGE_SIZE = 20;

export const inventoryTabLabels: Record<(typeof inventoryTabs)[number], string> = {
  all: "All vehicles",
  sale: "For Sale",
  rent: "For Rent",
  published: "Published",
  hidden: "Hidden",
};
