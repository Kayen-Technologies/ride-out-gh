import { Calendar, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { BookingListItem } from "@/features/rental-bookings/queries";
import { bookingStatusLabel, formatDateRange } from "@/features/rental-bookings/search-params";
import { formatGHS } from "@/lib/format";

/** Figma 120:6127: one card per booking; the whole card opens the booking. */
export function BookingList({ rows }: { rows: BookingListItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      {rows.map((row) => {
        const title = row.vehicles
          ? `${row.vehicles.year} ${row.vehicles.brand} ${row.vehicles.model}`
          : "Vehicle removed";
        return (
          <Link
            key={row.id}
            href={`/admin/rentals/${row.id}`}
            aria-label={`Open booking ${row.code}, ${title}`}
            className="group relative flex min-h-[158px] flex-col gap-6 rounded-xl bg-white/10 px-6 py-6 transition-colors hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-8"
          >
            <ChevronRight
              className="absolute top-6 right-6 size-6 text-foreground sm:right-8"
              strokeWidth={1.33}
              aria-hidden
            />
            <div className="flex items-start gap-4 pr-10">
              <Image src="/brand/icons/inventory-car.svg" alt="" width={24} height={24} className="size-6 shrink-0" />
              <div className="flex min-w-0 flex-col gap-1">
                <p className="text-base leading-6 font-semibold text-foreground">{title}</p>
                <p className="text-base leading-6 text-foreground/70">
                  {row.customers?.full_name ?? "Unknown customer"}
                </p>
              </div>
            </div>
            <p className="flex items-center gap-4 text-base leading-6 font-medium text-foreground">
              <Calendar className="size-6 shrink-0" strokeWidth={1.5} aria-hidden />
              {formatDateRange(row.pickup_date, row.return_date)}
            </p>
            <div className="flex items-end justify-between gap-4">
              <span className="inline-flex h-[38px] items-center rounded-full border border-primary bg-black/20 px-4 text-sm font-semibold text-foreground">
                {bookingStatusLabel(row.status)}
              </span>
              <p className="text-xl leading-6 font-medium whitespace-nowrap text-foreground">
                {formatGHS(Number(row.daily_rate))}/day
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
