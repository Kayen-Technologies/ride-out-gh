/**
 * Adds a tiny blurred preview to every vehicle photo that does not have one yet (photos uploaded before
 * previews existed, and the demo vehicles). Dev project only.
 *   npx tsx scripts/backfill-image-blur.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

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

async function main() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url?.includes(DEV_PROJECT_REF)) throw new Error(`refusing to run: URL must contain ${DEV_PROJECT_REF}`);
  const supabase = createClient<Database>(url, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data: rows, error } = await supabase.from("vehicle_images").select("id, storage_path").is("blur_data_url", null);
  if (error) throw error;
  let done = 0;
  const queue = [...(rows ?? [])];
  // Several at a time, each with a time limit, so one slow download cannot stall the run.
  async function worker() {
    for (let row = queue.shift(); row; row = queue.shift()) {
      try {
        const response = await fetch(`${url}/storage/v1/object/public/vehicle-images/${row.storage_path}`, { signal: AbortSignal.timeout(30000) });
        if (!response.ok) {
          console.log("skip", row.storage_path, response.status);
          continue;
        }
        const blur = await sharp(Buffer.from(await response.arrayBuffer())).resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
        const { error: updateError } = await supabase
          .from("vehicle_images")
          .update({ blur_data_url: `data:image/webp;base64,${blur.toString("base64")}` })
          .eq("id", row.id);
        if (updateError) throw updateError;
        done++;
      } catch (reason) {
        console.log("failed", row.storage_path, reason instanceof Error ? reason.message : reason);
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  console.log(`added previews to ${done} of ${rows?.length ?? 0} photos`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
