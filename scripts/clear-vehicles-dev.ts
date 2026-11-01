import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

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
  console.error(`refusing to clear: URL must contain ${DEV_PROJECT_REF}`);
  process.exit(1);
}

const supabase = createClient<Database>(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

async function main() {
  const { count, error: countError } = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true });
  if (countError) {
    console.error(countError.message);
    process.exit(1);
  }

  const before = count ?? 0;
  const { error } = await supabase.from("vehicles").delete().neq("slug", "");
  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  const { count: afterCount } = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true });

  console.log(`cleared vehicles: ${before} -> ${afterCount ?? 0}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
