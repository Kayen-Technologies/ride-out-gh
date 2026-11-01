import "server-only";

import { mergeBranch } from "@/features/cms/content";
import { registry, type PageId } from "@/features/cms/registry";
import { createClient } from "@/lib/supabase/server";

export type PageSummary = { page: PageId; hasUnpublishedChanges: boolean; publishedAt: string | null };

export async function listPages(): Promise<PageSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("content_pages").select("page, has_unpublished_changes, published_at");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    page: row.page as PageId,
    hasUnpublishedChanges: row.has_unpublished_changes ?? false,
    publishedAt: row.published_at,
  }));
}

/** The draft the editor opens with: the saved English draft over the registry defaults, plus its version. */
export async function getDraft(page: PageId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_pages")
    .select("draft, version, has_unpublished_changes, published_at")
    .eq("page", page)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const draft = data.draft && typeof data.draft === "object" && !Array.isArray(data.draft) ? (data.draft as { en?: unknown }) : {};
  return {
    values: mergeBranch(registry[page], { en: draft.en }, "en"),
    version: data.version,
    hasUnpublishedChanges: data.has_unpublished_changes ?? false,
    publishedAt: data.published_at,
  };
}
