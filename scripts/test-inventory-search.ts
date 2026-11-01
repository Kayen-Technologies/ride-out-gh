import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

import { buildVehicleSearchOrFilter } from "../src/features/inventory/search-filter.ts";
import type { Database } from "../src/lib/supabase/database.types.ts";

const DEV_PROJECT_REF = "bqpnweyznvijtmwsctwj";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const secret = env.SUPABASE_SECRET_KEY;

if (!url || !secret) {
  console.error("missing supabase env");
  process.exit(1);
}

if (!url.includes(DEV_PROJECT_REF)) {
  console.error(`refusing: URL must contain ${DEV_PROJECT_REF}`);
  process.exit(1);
}

const supabase = createClient<Database>(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const QUERIES = ["C-Class (2022)", "a,id.eq.1", "50%", "Land Cruiser"] as const;

async function runSearch(q: string) {
  const orFilter = buildVehicleSearchOrFilter(q);
  let query = supabase.from("vehicles").select("slug, brand, model, year", { count: "exact" });
  if (orFilter) query = query.or(orFilter);
  const { data, error, count } = await query.limit(5);
  if (error) {
    return { q, orFilter, error: error.message, count: 0, slugs: [] as string[] };
  }
  return {
    q,
    orFilter,
    error: null as string | null,
    count: count ?? 0,
    slugs: (data ?? []).map((row) => row.slug),
  };
}

async function main() {
  for (const q of QUERIES) {
    const result = await runSearch(q);
    console.log(JSON.stringify(result));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
