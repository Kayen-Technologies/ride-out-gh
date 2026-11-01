"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * A `fill` image that shows a blurred preview (when it has one) or the Ride Out shimmer in its box until the
 * picture has arrived, so a slow connection never leaves an empty hole. The parent must be `relative` and
 * sized (for example by an aspect ratio). Both are part of the server-rendered page, so they are there from
 * the first paint.
 */
export function SmartImage({ onLoad, onError, alt, blurDataURL, ...props }: ImageProps) {
  const [pending, setPending] = useState(true);
  // With a blurred preview the blur is the loading signal; without one, the shimmer is.
  return (
    <>
      {pending && !blurDataURL ? <span aria-hidden className="ro-shimmer absolute inset-0" /> : null}
      <Image
        {...props}
        alt={alt}
        {...(blurDataURL ? { placeholder: "blur" as const, blurDataURL } : {})}
        // Pictures already in the browser cache are complete before React attaches, so check here too.
        ref={(element) => {
          if (element?.complete && element.naturalWidth > 0) setPending(false);
        }}
        onLoad={(event) => {
          setPending(false);
          onLoad?.(event);
        }}
        onError={(event) => {
          setPending(false);
          onError?.(event);
        }}
      />
    </>
  );
}
