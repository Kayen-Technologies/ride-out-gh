"use client";

import { Car, Images } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { PhotoGallery, type GalleryPhoto } from "@/components/gallery/photo-gallery";
import { cn } from "cn";

/**
 * Detail page photos (Figma 120:4459): one large photo and up to two beside it, 505 px tall on desktop,
 * with "See Gallery" on the last tile. Any tile opens the full-screen viewer.
 */
export function VehicleGallery({ photos, title }: { photos: GalleryPhoto[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);

  if (photos.length === 0) {
    return (
      <div className="flex h-[260px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/30 text-text-70 lg:h-[505px]">
        <Car className="size-10" aria-hidden />
        <p className="text-sm">No photos yet. Edit the vehicle to add some.</p>
      </div>
    );
  }

  const side = photos.slice(1, 3);

  function show(index: number, element: HTMLElement) {
    opener.current = element;
    setOpen(index);
  }

  return (
    <>
      <div
        className={cn(
          "grid gap-3 lg:h-[505px] lg:gap-4",
          side.length > 0 ? "lg:grid-cols-[622fr_454fr]" : "lg:grid-cols-1",
        )}
      >
        <button
          type="button"
          onClick={(event) => show(0, event.currentTarget)}
          aria-label={`Open photo 1 of ${photos.length}`}
          className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#333] focus-visible:ring-3 focus-visible:ring-ring/50 lg:aspect-auto"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase photo, sized by its container */}
          <img src={photos[0].url} alt={title} className="size-full object-cover" />
        </button>

        {side.length > 0 ? (
          <div
            className={cn(
              "grid gap-3 lg:gap-4",
              side.length > 1 ? "grid-cols-2 lg:grid-cols-1 lg:grid-rows-2" : "grid-cols-1",
            )}
          >
            {side.map((photo, index) => (
              <div
                key={photo.id}
                className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#333] lg:aspect-auto"
              >
                <button
                  type="button"
                  onClick={(event) => show(index + 1, event.currentTarget)}
                  aria-label={`Open photo ${index + 2} of ${photos.length}`}
                  className="absolute inset-0 focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase photo */}
                  <img src={photo.url} alt="" className="size-full object-cover" />
                </button>
                {index === side.length - 1 ? (
                  <button
                    type="button"
                    onClick={(event) => show(0, event.currentTarget)}
                    className="absolute right-3 bottom-3 inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-sm font-medium text-black shadow-sm hover:bg-white/90 focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <Images className="size-4" aria-hidden />
                    See Gallery
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {open !== null ? (
        <PhotoGallery title={title} photos={photos} index={open} onIndex={setOpen} onClose={close} />
      ) : null}
    </>
  );
}
