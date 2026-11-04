import { MapPin, Search } from "lucide-react";
import Link from "next/link";

import { bodyTypeOptions } from "@/features/inventory/vehicle-form/options";
import { rentQuery, type RentFilters } from "@/features/rent/search-params";
import { cn } from "cn";

const chips = [
  { label: "All cars", body: undefined },
  ...["suv", "sedan", "hatchback", "pickup"].map((value) => ({
    label: `${bodyTypeOptions.find((o) => o.value === value)!.label}s`,
    body: value,
  })),
];

const fieldClass =
  "flex flex-col gap-0.5 rounded-md bg-white px-3 py-2 text-[#1e1e1e] focus-within:ring-3 focus-within:ring-primary/60";

/**
 * Figma 1:4420: the dark search card. A plain GET form, so a search is a shareable address. Filters that
 * are already set ride along as hidden fields, so searching new dates does not throw them away.
 */
export function SearchCard({
  filters,
  today,
  dateError,
}: {
  filters: RentFilters;
  today: string;
  dateError: string | null;
}) {
  const carried: [string, string][] = [
    ...(filters.brand ? ([["brand", filters.brand]] as [string, string][]) : []),
    ...(filters.model ? ([["model", filters.model]] as [string, string][]) : []),
    ...(filters.minPrice !== undefined ? ([["minPrice", String(filters.minPrice)]] as [string, string][]) : []),
    ...(filters.maxPrice !== undefined ? ([["maxPrice", String(filters.maxPrice)]] as [string, string][]) : []),
    ...filters.body.map((v): [string, string] => ["body", v]),
    ...filters.colour.map((v): [string, string] => ["colour", v]),
    ...(filters.transmission ? ([["transmission", filters.transmission]] as [string, string][]) : []),
    ...(filters.fuel ? ([["fuel", filters.fuel]] as [string, string][]) : []),
    ...(filters.sort !== "newest" ? ([["sort", filters.sort]] as [string, string][]) : []),
  ];
  return (
    <div className="flex w-full max-w-[420px] flex-col gap-4 rounded-2xl bg-[#1c1c1c] p-4 lg:p-5">
      <form action="/rent" method="get" className="flex flex-col gap-3">
        {carried.map(([name, value], i) => (
          <input key={`${name}-${i}`} type="hidden" name={name} value={value} />
        ))}
        <label className={fieldClass}>
          <span className="text-xs text-[#555]">Pickup address</span>
          <span className="flex items-center gap-2">
            <input
              name="place"
              type="text"
              maxLength={120}
              defaultValue={filters.place ?? ""}
              placeholder="Where should we meet you?"
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:font-normal placeholder:text-[#8a8a8a]"
            />
            <MapPin className="size-4 shrink-0 text-[#555]" aria-hidden />
          </span>
        </label>
        <label className={fieldClass}>
          <span className="text-xs text-[#555]">Pickup date</span>
          <input
            name="pickup"
            type="date"
            min={today}
            required
            defaultValue={filters.pickup ?? ""}
            className="w-full cursor-pointer bg-transparent text-sm font-medium outline-none"
          />
        </label>
        <label className={fieldClass}>
          <span className="text-xs text-[#555]">Return date</span>
          <input
            name="dropoff"
            type="date"
            min={filters.pickup ?? today}
            required
            defaultValue={filters.dropoff ?? ""}
            className="w-full cursor-pointer bg-transparent text-sm font-medium outline-none"
          />
        </label>
        {dateError ? (
          <p role="alert" className="text-sm text-[#ff8a8a]">
            {dateError}
          </p>
        ) : null}
        <button
          type="submit"
          className="flex h-11 items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Search
          <Search className="size-4" aria-hidden />
        </button>
      </form>
      <ul className="flex flex-wrap justify-center gap-x-1 gap-y-2 text-xs text-white/70">
        {chips.map((chip) => {
          const active = chip.body
            ? filters.body.length === 1 && filters.body[0] === chip.body
            : filters.body.length === 0;
          return (
            <li key={chip.label}>
              <Link
                href={`/rent${rentQuery(filters, { body: chip.body ? [chip.body] : [], page: 1 })}`}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "inline-flex h-7 items-center rounded-full px-3 hover:text-white",
                  active && "border border-white/70 text-white",
                )}
              >
                {chip.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
