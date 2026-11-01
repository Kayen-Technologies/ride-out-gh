/** Characters that break PostgREST `.or()` filter grammar when unquoted. */
export function sanitizeInventorySearchQuery(raw: string): string {
  return raw.replace(/[,()."]/g, " ").replace(/\s+/g, " ").trim();
}

export function escapeIlike(value: string) {
  return value.replace(/[%_\\]/g, "\\$&");
}

function quotePostgrestFilterValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

const SEARCH_COLUMNS = ["brand", "model", "registration", "code"] as const;

/** Safe `.or()` filter for ilike search across vehicle text fields. */
export function buildVehicleSearchOrFilter(raw: string): string | null {
  const sanitized = sanitizeInventorySearchQuery(raw.trim());
  if (!sanitized) return null;
  const pattern = `%${escapeIlike(sanitized)}%`;
  const quoted = quotePostgrestFilterValue(pattern);
  return SEARCH_COLUMNS.map((col) => `${col}.ilike.${quoted}`).join(",");
}
