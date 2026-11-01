import type { InventorySearchParams } from "@/features/inventory/search-params";

export function buildInventorySearchParams(
  current: InventorySearchParams,
  patch: Partial<InventorySearchParams>,
): string {
  const next = { ...current, ...patch };
  const params = new URLSearchParams();
  if (next.tab !== "all") params.set("tab", next.tab);
  if (next.status !== "all") params.set("status", next.status);
  if (next.q.trim()) params.set("q", next.q.trim());
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
