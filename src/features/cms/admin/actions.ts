"use server";

import { updateTag } from "next/cache";

import { getStaffSession } from "@/features/auth/session";
import { pageIds, type PageId } from "@/features/cms/registry";
import { sanitizeEnglish } from "@/features/cms/validate";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: true; version: number; hasUnpublishedChanges: boolean } | { ok: false; error: string };

const notStaff = "You need to be signed in as staff to do this.";

function pageOf(value: unknown): PageId | null {
  return typeof value === "string" && (pageIds as readonly string[]).includes(value) ? (value as PageId) : null;
}

/** Writes the edited English content to the page draft. The public site does not change. */
async function writeDraft(page: PageId, document: unknown, version: number, userId: string) {
  const supabase = await createClient();
  const { data: current, error } = await supabase.from("content_pages").select("draft, version").eq("page", page).maybeSingle();
  if (error) return { error: error.message } as const;
  if (!current) return { error: "That page does not exist." } as const;
  if (current.version !== version) return { error: "Content was changed by someone else. Reload and try again." } as const;

  const existing = current.draft && typeof current.draft === "object" && !Array.isArray(current.draft) ? (current.draft as Record<string, unknown>) : {};
  const next = { ...existing, en: sanitizeEnglish(page, document) };
  const { error: updateError } = await supabase
    .from("content_pages")
    .update({ draft: next as never, updated_by: userId })
    .eq("page", page)
    .eq("version", version);
  if (updateError) return { error: updateError.message } as const;
  return { supabase } as const;
}

export async function saveDraft(pageInput: unknown, document: unknown, version: unknown): Promise<Result> {
  const session = await getStaffSession();
  if (!session?.isStaff || !session.userId) return { ok: false, error: notStaff };
  const page = pageOf(pageInput);
  if (!page || typeof version !== "number") return { ok: false, error: "That request could not be understood." };

  const written = await writeDraft(page, document, version, session.userId);
  if ("error" in written) return { ok: false, error: String(written.error) };
  const { data } = await written.supabase.from("content_pages").select("version, has_unpublished_changes").eq("page", page).single();
  return { ok: true, version: data?.version ?? version, hasUnpublishedChanges: data?.has_unpublished_changes ?? true };
}

/** Saves the draft, then publishes it: one revision is kept and the public page refreshes straight away. */
export async function publishPage(pageInput: unknown, document: unknown, version: unknown): Promise<Result> {
  const session = await getStaffSession();
  if (!session?.isStaff || !session.userId) return { ok: false, error: notStaff };
  const page = pageOf(pageInput);
  if (!page || typeof version !== "number") return { ok: false, error: "That request could not be understood." };

  const written = await writeDraft(page, document, version, session.userId);
  if ("error" in written) return { ok: false, error: String(written.error) };
  const { data, error } = await written.supabase.rpc("publish_content_page", { p_page: page, p_expected_version: version });
  if (error) return { ok: false, error: error.message };

  updateTag(`cms:${page}`);
  return { ok: true, version: data.version, hasUnpublishedChanges: false };
}
