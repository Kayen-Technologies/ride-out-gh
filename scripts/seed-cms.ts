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

for (const page of pageIds) {
  const content = pageDefaults(page);
  const document = { en: content, fr: {} };
  const { data, error } = await supabase.from("content_pages").select("published").eq("page", page).maybeSingle();
  if (error) {
    console.error(page, error.message);
    process.exit(1);
  }
  if (data?.published) {
    console.log(`${page} already published`);
    continue;
  }
  const { error: updateError } = await supabase
    .from("content_pages")
    .update({ draft: document, published: document })
    .eq("page", page);
  if (updateError) {
    console.error(page, updateError.message);
    process.exit(1);
  }
  console.log(`${page} seeded`);
}
