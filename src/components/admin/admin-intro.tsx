"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

import { FullScreenLoader } from "@/components/loader/full-screen-loader";

/** The loader never leaves sooner than this after a full page load, so the animation is actually seen. */
const MIN_VISIBLE_MS = 3000;
/** Failsafe: if the page never reports ready (a stuck request), let the person in anyway. */
const MAX_VISIBLE_MS = 20000;
/** Elements that mark content still on its way (skeletons, route fallbacks) carry this attribute. */
const PAGE_PENDING_ATTRIBUTE = "data-page-pending";

/**
 * Keeps the Ride Out loader up on every full page load (open, reload, typed URL) until the page is
 * actually ready: the document and its images are loaded, fonts are in, and no skeleton or route
 * fallback is left on screen. It never leaves before MIN_VISIBLE_MS, and gives up after MAX_VISIBLE_MS.
 * Moving around inside the admin does not bring it back: the layout stays mounted then.
 */
export function AdminIntro() {
  const ref = useRef<HTMLDivElement>(null);

  // Before paint, so a client-side navigation to an already-ready page never flashes the loader.
  useLayoutEffect(() => {
    if (floorPassed() && pageIsReady(ref.current)) hide(ref.current);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || element.style.display === "none") return;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      cleanup();
      hide(element);
    };
    const check = () => {
      if (done || !floorPassed() || !pageIsReady(element)) return;
      // Two frames of settle time so the content is painted before the loader lifts.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!done && pageIsReady(element)) finish();
      }));
    };

    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });
    const poll = window.setInterval(check, 100);
    const failsafe = window.setTimeout(finish, MAX_VISIBLE_MS);
    window.addEventListener("load", check);
    document.addEventListener("load", check, true); // image loads do not bubble
    void document.fonts?.ready.then(check);

    function cleanup() {
      observer.disconnect();
      window.clearInterval(poll);
      window.clearTimeout(failsafe);
      window.removeEventListener("load", check);
      document.removeEventListener("load", check, true);
    }

    check();
    return () => {
      done = true;
      cleanup();
    };
  }, []);

  return (
    <div ref={ref}>
      <FullScreenLoader />
    </div>
  );
}

function hide(element: HTMLElement | null) {
  if (element) element.style.display = "none";
}

function floorPassed() {
  // The server's loader first paints when the page response starts arriving.
  const navigation = performance.getEntriesByType("navigation")[0] as
    PerformanceNavigationTiming | undefined;
  const loaderStart = navigation?.responseStart ?? 0;
  return performance.now() >= loaderStart + MIN_VISIBLE_MS;
}

/** Everything the person is about to look at has arrived, outside the loader itself. */
function pageIsReady(loader: HTMLElement | null) {
  if (document.readyState !== "complete") return false;
  if (document.fonts && document.fonts.status !== "loaded") return false;
  if (document.querySelector(`[${PAGE_PENDING_ATTRIBUTE}]`)) return false;
  for (const image of document.images) {
    if (loader?.contains(image)) continue;
    if (!image.complete && image.loading !== "lazy") return false;
  }
  return true;
}
