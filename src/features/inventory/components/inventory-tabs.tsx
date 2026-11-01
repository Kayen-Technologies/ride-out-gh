"use client";

import { usePathname } from "next/navigation";
import { useCallback, useRef } from "react";

import { PendingLink } from "@/features/inventory/components/inventory-navigation";
import { buildInventorySearchParams } from "@/features/inventory/inventory-url";
import {
  inventoryTabLabels,
  type InventorySearchParams,
} from "@/features/inventory/search-params";
import { cn } from "cn";

type InventoryTabsProps = {
  params: InventorySearchParams;
};

const tabOrder = Object.keys(
  inventoryTabLabels,
) as InventorySearchParams["tab"][];

export function InventoryTabs({ params }: InventoryTabsProps) {
  const pathname = usePathname();
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLAnchorElement>, index: number) => {
      let nextIndex: number | null = null;
      if (event.key === "ArrowRight")
        nextIndex = Math.min(index + 1, tabOrder.length - 1);
      else if (event.key === "ArrowLeft") nextIndex = Math.max(index - 1, 0);
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabOrder.length - 1;
      else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        tabRefs.current[index]?.click();
        return;
      } else return;

      event.preventDefault();
      tabRefs.current[nextIndex]?.focus();
    },
    [],
  );

  return (
    <div
      className="flex h-20 items-center bg-white/10 px-6 py-4"
      role="tablist"
      aria-label="Inventory views"
    >
      <div className="flex w-full gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] lg:grid lg:grid-cols-5 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
        {tabOrder.map((tab, index) => {
          const label = inventoryTabLabels[tab];
          const active = params.tab === tab;
          const href = `${pathname}${buildInventorySearchParams(params, { tab, page: 1 })}`;
          return (
            <PendingLink
              key={tab}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              href={href}
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
              {label}
            </PendingLink>
          );
        })}
      </div>
    </div>
  );
}
