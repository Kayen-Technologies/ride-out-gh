"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventoryNavigation } from "@/features/inventory/components/inventory-navigation";
import {
  bookingFilterOptions,
  buildBookingSearchParams,
  type BookingSearchParams,
} from "@/features/rental-bookings/search-params";

function SearchField({ q, onDebouncedChange }: { q: string; onDebouncedChange: (value: string) => void }) {
  const [query, setQuery] = useState(q);

  useEffect(() => {
    const handle = window.setTimeout(() => onDebouncedChange(query), 300);
    return () => window.clearTimeout(handle);
  }, [query, onDebouncedChange]);

  return (
    <div className="relative h-10 w-full min-w-0">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-black/40"
        aria-hidden
      />
      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search vehicles, bookings, customers..."
        className="h-10 rounded-full border-0 bg-[#eff4fa] pl-10 text-sm font-medium text-black placeholder:text-black/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-[#eff4fa] dark:text-black"
        aria-label="Search bookings"
      />
    </div>
  );
}

export function BookingFilters({ params }: { params: BookingSearchParams }) {
  const { navigate } = useInventoryNavigation();

  const onDebouncedChange = useCallback(
    (value: string) => {
      if (value === params.q) return;
      navigate(`/admin/rentals${buildBookingSearchParams(params, { q: value, page: 1 })}`);
    },
    [params, navigate],
  );

  const statusLabel = bookingFilterOptions.find((o) => o.value === params.status)?.label ?? "All Statuses";

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
      <Select
        value={params.status}
        onValueChange={(value) =>
          navigate(
            `/admin/rentals${buildBookingSearchParams(params, { status: value as BookingSearchParams["status"], page: 1 })}`,
          )
        }
      >
        <SelectTrigger className="h-10 w-full rounded-full border-[rgb(228_231_236/50%)] !bg-transparent px-6 py-2.5 text-sm font-medium text-foreground data-[size=default]:h-10 dark:!bg-transparent [&_svg]:size-4">
          <SelectValue placeholder="All Statuses">{statusLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {bookingFilterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <SearchField key={params.q} q={params.q} onDebouncedChange={onDebouncedChange} />
    </div>
  );
}
