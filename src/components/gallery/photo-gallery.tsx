"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { cn } from "cn";

export type GalleryPhoto = { id: string; url: string };

type PhotoGalleryProps = {
  title: string;
  photos: GalleryPhoto[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
};

const roundButton =
  "flex size-12 items-center justify-center rounded-full border border-white/20 bg-[#1c1c1c] text-foreground transition-colors hover:bg-[#2a2a2a] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

/**
 * Full-screen photo viewer: the whole screen goes dark, one photo is shown large with previous and next
 * buttons, and a strip of thumbnails sits underneath. Arrow keys move, Escape closes, a swipe works on
 * touch screens, and page scrolling is locked while it is open. Same behaviour as the Lotlines gallery,
 * in Ride Out colours.
 */
export function PhotoGallery({ title, photos, index, onIndex, onClose }: PhotoGalleryProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const stripRef = useRef<HTMLUListElement>(null);
  const touchStart = useRef<number | null>(null);
  const count = photos.length;
  const at = ((index % count) + count) % count;

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") onIndex((at + 1) % count);
      else if (event.key === "ArrowLeft") onIndex((at - 1 + count) % count);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [at, count, onClose, onIndex]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Keep the current thumbnail in view as the photo changes.
  useEffect(() => {
    stripRef.current?.children[at]?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [at]);

  const stop = (event: { stopPropagation: () => void }) => event.stopPropagation();

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photos`}
      onClick={onClose}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchStart.current === null || count < 2) return;
        const delta = event.changedTouches[0].clientX - touchStart.current;
        touchStart.current = null;
        if (Math.abs(delta) > 50) onIndex((at + (delta < 0 ? 1 : -1) + count) % count);
      }}
      className="fixed inset-0 z-[80] flex flex-col bg-black text-foreground"
    >
      <div onClick={stop} className="flex items-center justify-between gap-3 px-4 pt-4 pb-2 sm:px-6">
        <p className="flex flex-col gap-0.5">
          <strong className="text-base font-medium">{title}</strong>
          <small className="font-mono text-xs text-text-70">
            {at + 1} / {count}
          </small>
        </p>
        <button ref={closeRef} type="button" aria-label="Close photos" onClick={onClose} className={roundButton}>
          <X className="size-6" aria-hidden />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-2 sm:px-20">
        {count > 1 ? (
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(event) => {
              stop(event);
              onIndex((at - 1 + count) % count);
            }}
            className={cn(roundButton, "absolute top-1/2 left-3 z-10 -translate-y-1/2 max-sm:size-10")}
          >
            <ChevronLeft className="size-6" aria-hidden />
          </button>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase photo, shown at its natural ratio */}
        <img
          src={photos[at].url}
          alt={`${title}, photo ${at + 1} of ${count}`}
          onClick={stop}
          className="max-h-full max-w-full rounded-xl object-contain"
        />
        {count > 1 ? (
          <button
            type="button"
            aria-label="Next photo"
            onClick={(event) => {
              stop(event);
              onIndex((at + 1) % count);
            }}
            className={cn(roundButton, "absolute top-1/2 right-3 z-10 -translate-y-1/2 max-sm:size-10")}
          >
            <ChevronRight className="size-6" aria-hidden />
          </button>
        ) : null}
      </div>

      {count > 1 ? (
        <ul ref={stripRef} onClick={stop} className="flex gap-2 overflow-x-auto px-4 pt-2 pb-4 sm:px-6">
          {photos.map((photo, i) => (
            <li key={photo.id} className="shrink-0">
              <button
                type="button"
                aria-label={`Photo ${i + 1}`}
                aria-current={i === at}
                onClick={() => onIndex(i)}
                className={cn(
                  "block overflow-hidden rounded-[10px] border-2 border-transparent opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  i === at && "border-primary opacity-100",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase thumbnail */}
                <img src={photo.url} alt="" className="block h-[54px] w-[72px] rounded-lg object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>,
    document.body,
  );
}
