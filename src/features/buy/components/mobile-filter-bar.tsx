"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { LiveForm } from "@/features/buy/components/live-form";
import { BrandModelFields } from "@/features/buy/components/brand-model-fields";
import type { Facets } from "@/features/buy/queries";
import type { BuyFilters } from "@/features/buy/search-params";

/**
 * Mobile only (Figma 120:16313): a filter button and the brand and model choosers in one row. Choosing a
 * brand or model searches straight away; the button opens the full filter sheet (Figma 120:16129).
 */
export function MobileFilterBar({
  filters,
  facets,
  children,
}: {
  filters: BuyFilters;
  facets: Facets;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const keep: [string, string][] = [
    ...(filters.minPrice !== undefined
      ? ([["minPrice", String(filters.minPrice)]] as [string, string][])
      : []),
    ...(filters.maxPrice !== undefined
      ? ([["maxPrice", String(filters.maxPrice)]] as [string, string][])
      : []),
    ...(filters.minYear !== undefined
      ? ([["minYear", String(filters.minYear)]] as [string, string][])
      : []),
    ...(filters.maxYear !== undefined
      ? ([["maxYear", String(filters.maxYear)]] as [string, string][])
      : []),
    ...filters.body.map((v): [string, string] => ["body", v]),
    ...filters.colour.map((v): [string, string] => ["colour", v]),
    ...(filters.transmission
      ? ([["transmission", filters.transmission]] as [string, string][])
      : []),
    ...(filters.fuel ? ([["fuel", filters.fuel]] as [string, string][]) : []),
    ["sort", filters.sort],
  ];
  return (
    <div className="flex gap-2 lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open filters"
        className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-[#efefef] text-[#1e1e1e] focus-visible:ring-3 focus-visible:ring-primary/60"
      >
        <SlidersHorizontal className="size-5" aria-hidden />
      </button>
      <LiveForm path="/buy" className="flex min-w-0 flex-1 gap-2">
        {keep.map(([name, value], i) => (
          <input key={`${name}-${i}`} type="hidden" name={name} value={value} />
        ))}
        <BrandModelFields
          // Rebuilt whenever the address changes, so a Reset inside the sheet also clears these two.
          key={`${filters.brand ?? ""}|${filters.model ?? ""}`}
          facets={facets}
          brand={filters.brand}
          model={filters.model}
          variant="bar"
        />
      </LiveForm>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="gap-0 bg-white p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-none"
        >
          <div className="flex items-center justify-between px-4 py-4">
            <SheetTitle className="text-lg font-semibold text-[#1e1e1e]">
              Filters
            </SheetTitle>
            <SheetClose
              className="flex size-9 items-center justify-center rounded-full bg-[#f1f1f1] text-[#1e1e1e]"
              aria-label="Close filters"
            >
              <X className="size-4" aria-hidden />
            </SheetClose>
          </div>
          {children}
        </SheetContent>
      </Sheet>
    </div>
  );
}
