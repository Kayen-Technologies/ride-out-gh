"use client";

import { useSyncExternalStore } from "react";

type Connection = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
};

const SLOW = ["slow-2g", "2g", "3g"];

/** Whether the looping video is worth its weight right now. Exported so the rule can be tested on its own. */
export function shouldPlayVideo(
  connection: Pick<Connection, "saveData" | "effectiveType"> | undefined,
  reducedMotion: boolean,
) {
  if (reducedMotion) return false;
  if (connection?.saveData) return false;
  if (connection?.effectiveType && SLOW.includes(connection.effectiveType))
    return false;
  return true;
}

const getConnection = () =>
  (navigator as Navigator & { connection?: Connection }).connection;

function subscribe(onChange: () => void) {
  const connection = getConnection();
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  connection?.addEventListener?.("change", onChange);
  motion.addEventListener("change", onChange);
  return () => {
    connection?.removeEventListener?.("change", onChange);
    motion.removeEventListener("change", onChange);
  };
}

const snapshot = () =>
  shouldPlayVideo(
    getConnection(),
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

/**
 * The hero's looping video. Nothing is sent on slow connections, with Data Saver on, or when the visitor
 * prefers reduced motion: the still picture behind it is shown instead. The server never renders the
 * video, so those visitors do not download it first and then throw it away.
 */
export function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const play = useSyncExternalStore(subscribe, snapshot, () => false);
  if (!play) return null;
  return (
    <video
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      className="absolute inset-0 -z-10 size-full object-cover"
    />
  );
}
