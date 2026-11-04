import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "cn";

/** 1, then a window around the current page, then the last, with "…" where pages are skipped. */
export function pageWindow(
  page: number,
  totalPages: number,
): (number | "gap")[] {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const pages = [...wanted]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  hrefFor: (page: number) => string;
  noun?: [singular: string, plural: string];
};

/**
 * Numbered pages with Previous and Next and a "Showing 25–36 of 312 cars" line. Every control is a real link
 * to a real address, so pages can be bookmarked, shared and indexed, and the next page is fetched ahead of
 * the click.
 */
export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  hrefFor,
  noun = ["car", "cars"],
}: PaginationProps) {
  if (total === 0) return null;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(total, page * pageSize);
  const edge =
    "flex h-10 items-center gap-1 rounded-full border border-white/30 px-4 text-sm text-white hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <div className="mt-auto flex flex-col items-center gap-4 pt-4">
      <p className="text-sm text-white/60" aria-live="polite">
        Showing {first}–{last} of {total} {total === 1 ? noun[0] : noun[1]}
      </p>
      {totalPages > 1 ? (
        <nav
          aria-label="Pages"
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {page > 1 ? (
            <Link href={hrefFor(page - 1)} rel="prev" className={edge}>
              <ChevronLeft className="size-4" aria-hidden />
              <span className="max-sm:sr-only">Previous</span>
            </Link>
          ) : null}
          {pageWindow(page, totalPages).map((entry, i) =>
            entry === "gap" ? (
              <span key={`gap-${i}`} aria-hidden className="px-1 text-white/50">
                …
              </span>
            ) : (
              <Link
                key={entry}
                href={hrefFor(entry)}
                aria-label={`Page ${entry}`}
                aria-current={entry === page ? "page" : undefined}
                className={cn(
                  "flex size-10 items-center justify-center rounded-full text-sm text-white hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-ring/50",
                  entry === page &&
                    "bg-primary font-medium text-primary-foreground hover:bg-primary",
                )}
              >
                {entry}
              </Link>
            ),
          )}
          {page < totalPages ? (
            <Link href={hrefFor(page + 1)} rel="next" className={edge}>
              <span className="max-sm:sr-only">Next</span>
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
