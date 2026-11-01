import { createClient } from "@/lib/supabase/client";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
export const VIDEO_TYPES = ["video/mp4", "video/webm"];
const MAX_IMAGE = 8 * 1024 * 1024;
const MAX_VIDEO = 50 * 1024 * 1024;

/** Why a file cannot be used for this slot, or null when it is fine. */
export function mediaProblem(file: File, kind: "image" | "video") {
  const allowed = kind === "image" ? IMAGE_TYPES : VIDEO_TYPES;
  if (!allowed.includes(file.type)) return kind === "image" ? "Use a JPG, PNG, WebP or SVG picture." : "Use an MP4 or WebM video.";
  if (file.size > (kind === "image" ? MAX_IMAGE : MAX_VIDEO)) return kind === "image" ? "Pictures must be under 8 MB." : "Videos must be under 50 MB.";
  return null;
}

/** Uploads to the public `site-media` bucket and returns the file's public address. */
export async function uploadSiteMedia(file: File, folder: string) {
  const extension = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "") : "bin";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from("site-media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl;
}
