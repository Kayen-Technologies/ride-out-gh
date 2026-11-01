import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function InventoryGlobalEmptyState() {
  // Figma 120:1107: the whole page body is this block, centred in the panel (no header row, KPIs or filters).
  return (
    <div className="flex flex-1 items-center justify-center py-12">
      <div className="flex w-full max-w-[512px] flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-14">
          <Image
            src="/brand/illustrations/inventory-empty.svg"
            alt=""
            width={309}
            height={214}
            className="h-[214px] w-[309px] max-w-full"
            unoptimized
          />
          <div className="flex w-full max-w-[352px] flex-col gap-1 text-foreground">
            <h2 className="text-xl leading-7 font-semibold">No Vehicles Yet</h2>
            <p className="text-base leading-[19px] font-medium">
              Your fleet is currently empty. Add vehicles here to begin managing
              your rental offerings.
            </p>
          </div>
        </div>
        <Button
          asChild
          size="lg"
          className="h-12 rounded-full px-3.5 text-base font-medium"
        >
          <Link href="/admin/inventory/new">Add First Vehicle</Link>
        </Button>
      </div>
    </div>
  );
}

export function InventoryFilteredEmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <h2 className="text-lg font-semibold text-foreground">
        No vehicles match your filters
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Try clearing filters or changing the active tab.
      </p>
      <Button asChild variant="link" className="mt-4">
        <Link href="/admin/inventory">Clear filters</Link>
      </Button>
    </div>
  );
}
