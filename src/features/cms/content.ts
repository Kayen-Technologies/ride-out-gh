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

export function mergeBranch(branch: object, published: unknown, locale: Locale): Record<string, unknown> {
  const localeTree = localeTreeOf(published, locale);
  const englishTree = locale === "en" ? localeTree : localeTreeOf(published, "en");
  const resolved: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(branch)) {
    const localValue = valueAt(localeTree, key);
    const englishValue = valueAt(englishTree, key);
    if (isField(value)) {
      const chosen = filled(localValue) ? localValue : filled(englishValue) ? englishValue : value.default;
      resolved[key] = value.type === "list" ? withItemDefaults(chosen, value.default) : chosen;
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
  // Image and video fields: filled once a file or poster has been chosen.
  if (value && typeof value === "object") return typeof (value as { src?: unknown }).src === "string" && ((value as { src: string }).src.trim().length > 0 || typeof (value as { poster?: unknown }).poster === "string");
  return false;
}

/**
 * A list saved before a field was added (for example a picture on each service) would leave that field
 * empty. Each saved item is topped up from the default item in the same position; what staff wrote wins.
 */
function withItemDefaults(items: unknown, defaults: readonly unknown[]): unknown {
  if (!Array.isArray(items)) return items;
  return items.map((item, index) => {
    const base = defaults[index];
    if (item && base && typeof item === "object" && typeof base === "object" && !Array.isArray(item)) {
      const merged: Record<string, unknown> = { ...(base as Record<string, unknown>) };
      for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
        const empty = v === undefined || v === null || (typeof v === "object" && !(v as { src?: string }).src);
        if (!empty) merged[k] = v;
      }
      return merged;
    }
    return item;
  });
}
