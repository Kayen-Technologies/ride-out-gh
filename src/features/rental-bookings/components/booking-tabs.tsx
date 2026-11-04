"use client";

import { usePathname } from "next/navigation";
import { useCallback, useRef } from "react";

import { PendingLink } from "@/features/inventory/components/inventory-navigation";
import {
  bookingTabLabels,
  buildBookingSearchParams,
  type BookingSearchParams,
} from "@/features/rental-bookings/search-params";
import { cn } from "cn";

const tabOrder = Object.keys(bookingTabLabels) as BookingSearchParams["tab"][];

export function BookingTabs({ params }: { params: BookingSearchParams }) {
  const pathname = usePathname();
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLAnchorElement>, index: number) => {
    let next: number;
    if (event.key === "ArrowRight") next = Math.min(index + 1, tabOrder.length - 1);
    else if (event.key === "ArrowLeft") next = Math.max(index - 1, 0);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabOrder.length - 1;
    else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      tabRefs.current[index]?.click();
      return;
    } else return;
    event.preventDefault();
    tabRefs.current[next]?.focus();
  }, []);

  return (
    <div className="flex h-20 items-center bg-white/10 px-6 py-4" role="tablist" aria-label="Booking views">
      <div className="flex w-full gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] lg:grid lg:grid-cols-5 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
        {tabOrder.map((tab, index) => {
          const active = params.tab === tab;
          return (
            <PendingLink
              key={tab}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              href={`${pathname}${buildBookingSearchParams(params, { tab, page: 1 })}`}
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "inline-flex h-12 shrink-0 items-center justify-center rounded-full px-8 text-base font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:min-w-0",
                active
                  ? "border border-primary bg-card text-foreground"
                  : "border border-transparent text-foreground hover:bg-white/5",
              )}
            >
              {bookingTabLabels[tab]}
            </PendingLink>
          );
        })}
      </div>
    </div>
  );
}
