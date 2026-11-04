"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";

/** Small screens: one "Filters" button that opens the filter card as a full-screen sheet. */
export function FilterSheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#efefef] px-4 text-sm font-medium text-[#1e1e1e] focus-visible:ring-3 focus-visible:ring-primary/60 lg:hidden"
      >
        <SlidersHorizontal className="size-5" aria-hidden />
        Filters
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="gap-0 bg-white p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-none"
        >
          <div className="flex items-center justify-between px-4 py-4">
            <SheetTitle className="text-lg font-semibold text-[#1e1e1e]">Filters</SheetTitle>
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
    </>
  );
}
