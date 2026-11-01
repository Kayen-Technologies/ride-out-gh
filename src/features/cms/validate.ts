import { isField, registry, type PageId } from "@/features/cms/registry";

type Json = Record<string, unknown>;
const isObject = (value: unknown): value is Json => value != null && typeof value === "object" && !Array.isArray(value);

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

/** A picture or video must come from this site's own files or the public `site-media` bucket. */
export function isAllowedMediaUrl(src: string) {
  if (src === "") return true;
  if (src.startsWith("/") && !src.startsWith("//") && !src.includes("..")) return true;
  try {
    const url = new URL(src);
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;
    return url.protocol === "https:" && !!base && url.hostname === base.hostname && url.pathname.startsWith("/storage/v1/object/public/site-media/");
  } catch {
    return false;
  }
}

function cleanImage(value: unknown, fallbackAlt = ""): { src: string; alt: string; blur?: string } {
  const source = isObject(value) ? value : {};
  const src = text(source.src, 600);
  const out: { src: string; alt: string; blur?: string } = { src: isAllowedMediaUrl(src) ? src : "", alt: text(source.alt ?? fallbackAlt, 125) };
  // A preview is only ever a tiny inline picture.
  if (typeof source.blur === "string" && /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(source.blur) && source.blur.length < 2000) out.blur = source.blur;
  return out;
}

function cleanItem(item: unknown, max: number): unknown {
  if (typeof item === "string") return text(item, max);
  if (!isObject(item)) return null;
  const out: Json = { title: text(item.title, max) };
  for (const key of ["body", "cta", "category"] as const) {
    if (item[key] !== undefined) out[key] = text(item[key], 2000);
  }
  for (const key of ["image", "image_mobile"] as const) {
    if (item[key] !== undefined) out[key] = cleanImage(item[key]);
  }
  return out;
}

/**
 * Keeps only what the registry defines, with the right shape and length. Anything unknown is dropped, and
 * media addresses are limited to this site's files, so a draft can never hold arbitrary content or links.
 */
export function sanitizeEnglish(page: PageId, input: unknown): Json {
  const walk = (branch: object, source: unknown): Json => {
    const out: Json = {};
    const data = isObject(source) ? source : {};
    for (const [key, field] of Object.entries(branch)) {
      if (!isField(field)) {
        out[key] = walk(field as object, data[key]);
        continue;
      }
      const value = data[key];
      if (field.type === "image") out[key] = cleanImage(value);
      else if (field.type === "video") {
        const v = isObject(value) ? value : {};
        const src = text(v.src, 600);
        const poster = text(v.poster, 600);
        out[key] = { src: isAllowedMediaUrl(src) ? src : "", poster: isAllowedMediaUrl(poster) ? poster : field.default.poster };
      } else if (field.type === "list") {
        const items = Array.isArray(value) ? value.slice(0, 24) : [];
        out[key] = items.map((item) => cleanItem(item, 600)).filter((item) => item !== null && item !== "");
      } else {
        out[key] = text(value, field.maxLength);
      }
    }
    return out;
  };
  return walk(registry[page], input);
}
