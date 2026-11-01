import { getSupabaseUrl } from "@/lib/supabase/env";

/** Public address of a photo in the `vehicle-images` bucket (the bucket is public-read). */
export function vehicleImageUrl(storagePath: string) {
  return `${getSupabaseUrl()}/storage/v1/object/public/vehicle-images/${storagePath}`;
}

/** Photos are stored under `<vehicle id>/<category>/<file>`, so the category is the middle segment. */
export function categoryFromPath(storagePath: string): "interior" | "exterior" {
  return storagePath.split("/")[1] === "interior" ? "interior" : "exterior";
}
