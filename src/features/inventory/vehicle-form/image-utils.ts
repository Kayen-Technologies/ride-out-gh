import { createClient } from "@/lib/supabase/client";
import type { ImageCategory, SavedImage } from "@/features/inventory/vehicle-form/schema";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const LONG_EDGE = 2000;

/**
 * A photo in the wizard: either just picked from disk (`file`) or already stored for this vehicle (`path`).
 * Stored photos only appear when editing.
 */
export type PickedImage = {
  key: string;
  name: string;
  previewUrl: string;
  file?: File;
  path?: string;
  category?: ImageCategory;
};

/** Why a file cannot be used, or null when it is fine. */
export function rejectReason(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return `${file.name}: use a JPG, PNG or WebP photo.`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name}: photos must be under 8 MB.`;
  return null;
}

/** Scales the photo down to a 2000 px long edge and re-encodes it, so uploads stay quick and light. */
async function shrink(file: File): Promise<{ blob: Blob; extension: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, LONG_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (blob && blob.type === "image/webp") return { blob, extension: "webp" };
  const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
  if (!jpeg) throw new Error("The photo could not be processed.");
  return { blob: jpeg, extension: "jpg" };
}

/**
 * Uploads every newly picked photo to `vehicle-images/<vehicleId>/<category>/`, three at a time, and returns
 * the whole list (stored photos included) in display order.
 * Throws on the first failure, after removing what already uploaded, so nothing half-saved is left.
 */
export async function uploadVehicleImages(
  vehicleId: string,
  groups: Record<ImageCategory, PickedImage[]>,
  onProgress: (done: number, total: number) => void,
): Promise<SavedImage[]> {
  const supabase = createClient();
  const jobs = (["exterior", "interior"] as const).flatMap((category) =>
    groups[category].map((image) => ({ category, image })),
  );
  const saved: (SavedImage | null)[] = jobs.map(() => null);
  let done = 0;
  let next = 0;
  onProgress(0, jobs.length);

  // A few photos at a time: far quicker than one by one, without flooding the connection.
  async function worker() {
    while (next < jobs.length) {
      const index = next++;
      const { category, image } = jobs[index];
      if (!image.file) {
        // Already stored: keep it as it is.
        saved[index] = { path: image.path!, category };
        onProgress(++done, jobs.length);
        continue;
      }
      const { blob, extension } = await shrink(image.file);
      const path = `${vehicleId}/${category}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from("vehicle-images")
        .upload(path, blob, { contentType: blob.type, upsert: false });
      if (error) throw new Error(error.message);
      saved[index] = { path, category };
      onProgress(++done, jobs.length);
    }
  }

  try {
    await Promise.all(Array.from({ length: Math.min(3, jobs.length) }, worker));
  } catch (error) {
    // Do not leave the photos that did upload behind.
    const orphans = saved
      .map((image, index) => (image && jobs[index].image.file ? image.path : null))
      .filter((path): path is string => path !== null);
    if (orphans.length) await supabase.storage.from("vehicle-images").remove(orphans);
    throw error;
  }
  return saved.filter((image): image is SavedImage => image !== null);
}
