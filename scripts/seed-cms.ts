import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

import { pageDefaults, pageIds } from "../src/features/cms/registry.ts";

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

const supabase = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

type Json = Record<string, unknown>;
const isObject = (value: unknown): value is Json => value != null && typeof value === "object" && !Array.isArray(value);

/** Fills in anything missing from `existing` with the registry default, never overwriting what staff wrote. */
function fillMissing(defaults: Json, existing: unknown): Json {
  const base = isObject(existing) ? existing : {};
  const out: Json = { ...base };
  for (const [key, value] of Object.entries(defaults)) {
    const have = base[key];
    if (have === undefined || have === null) out[key] = value;
    else if (isObject(value) && isObject(have) && !("src" in value)) out[key] = fillMissing(value, have);
  }
  return out;
}

async function main() {
  // The video bucket rules (see migration 20261101000000_site_media_video.sql), applied to the dev project here.
  const { error: bucketError } = await supabase.storage.updateBucket("site-media", {
    public: true,
    fileSizeLimit: 52428800,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "video/mp4", "video/webm"],
  });
  console.log(bucketError ? `bucket: ${bucketError.message}` : "site-media bucket accepts video up to 50 MB");

  for (const page of pageIds) {
    const defaults = pageDefaults(page) as unknown as Json;
    const { data, error } = await supabase.from("content_pages").select("draft, published").eq("page", page).maybeSingle();
    if (error) {
      console.error(page, error.message);
      process.exit(1);
    }
    const draft = isObject(data?.draft) ? data.draft : {};
    const published = isObject(data?.published) ? data.published : null;
    const nextDraft = { fr: {}, ...draft, en: fillMissing(defaults, draft.en) };
    const nextPublished = published ? { fr: {}, ...published, en: fillMissing(defaults, published.en) } : nextDraft;
    const { error: updateError } = await supabase
      .from("content_pages")
      .update({ draft: nextDraft, published: nextPublished })
      .eq("page", page);
    if (updateError) {
      console.error(page, updateError.message);
      process.exit(1);
    }
    console.log(`${page} seeded`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
