import { cacheLife, cacheTag } from "next/cache";

import { createClient } from "@/lib/supabase/public";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { isField, registry, type Locale, type PageId, type Registry, type Resolved } from "@/features/cms/registry";

export async function getPageContent<P extends PageId>(page: P, locale: Locale = "en"): Promise<Resolved<Registry[P]>> {
  "use cache";
  cacheTag(`cms:${page}`);

  const published = await readPublished(page);
  if (!published.ok) {
    cacheLife("seconds");
    return mergeBranch(registry[page], null, locale) as Resolved<Registry[P]>;
  }

  cacheLife("max");
  return mergeBranch(registry[page], published.data, locale) as Resolved<Registry[P]>;
}

async function readPublished(page: PageId): Promise<{ ok: true; data: unknown } | { ok: false }> {
  if (!hasSupabaseEnv()) return { ok: false };
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_published_content", { p_page: page });
  if (error) return { ok: false };
  return { ok: true, data };
}

function mergeBranch(branch: object, published: unknown, locale: Locale): Record<string, unknown> {
  const localeTree = localeTreeOf(published, locale);
  const englishTree = locale === "en" ? localeTree : localeTreeOf(published, "en");
  const resolved: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(branch)) {
    const localValue = valueAt(localeTree, key);
    const englishValue = valueAt(englishTree, key);
    if (isField(value)) {
      resolved[key] = filled(localValue) ? localValue : filled(englishValue) ? englishValue : value.default;
      continue;
    }
    resolved[key] = mergeBranch(value, { en: englishValue, [locale]: localValue }, locale);
  }

  return resolved;
}

function localeTreeOf(published: unknown, locale: Locale): unknown {
  if (!published || typeof published !== "object" || Array.isArray(published)) return null;
  return (published as Record<string, unknown>)[locale] ?? null;
}

function valueAt(tree: unknown, key: string): unknown {
  if (!tree || typeof tree !== "object" || Array.isArray(tree)) return null;
  return (tree as Record<string, unknown>)[key];
}

function filled(value: unknown) {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}
