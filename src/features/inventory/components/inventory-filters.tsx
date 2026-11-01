"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useInventoryNavigation } from "@/features/inventory/components/inventory-navigation";
import { buildInventorySearchParams } from "@/features/inventory/inventory-url";
import type { InventorySearchParams } from "@/features/inventory/search-params";
import { availabilityFilterOptions } from "@/lib/status";

type InventoryFiltersProps = {
  params: InventorySearchParams;
};

function InventorySearchField({
  params,
  onDebouncedChange,
}: {
  params: InventorySearchParams;
  onDebouncedChange: (value: string) => void;
}) {
  const [query, setQuery] = useState(params.q);

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
        placeholder="Search brand, model, registration or vehicle ID"
        className="h-10 rounded-full border-0 bg-[#eff4fa] pl-10 text-sm font-medium text-black placeholder:text-black/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-[#eff4fa] dark:text-black"
        aria-label="Search vehicles"
      />
    </div>
  );
}

export function InventoryFilters({ params }: InventoryFiltersProps) {
  const { navigate } = useInventoryNavigation();

  const onDebouncedChange = useCallback(
    (value: string) => {
      if (value === params.q) return;
      navigate(
        `/admin/inventory${buildInventorySearchParams(params, { q: value, page: 1 })}`,
      );
    },
    [params, navigate],
  );

  const statusLabel =
    availabilityFilterOptions.find((option) => option.value === params.status)
      ?.label ?? "All Statuses";

  function push(patch: Partial<InventorySearchParams>) {
    navigate(
      `/admin/inventory${buildInventorySearchParams(params, { ...patch, page: 1 })}`,
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
      <Select
        value={params.status}
        onValueChange={(value) =>
          push({ status: value as InventorySearchParams["status"] })
        }
      >
        <SelectTrigger className="h-10 w-full rounded-full border-[rgb(228_231_236/50%)] !bg-transparent px-6 py-2.5 text-sm font-medium text-foreground data-[size=default]:h-10 dark:!bg-transparent [&_svg]:size-4">
          {/* Rendered on the server so the label is there before the select hydrates. */}
          <SelectValue placeholder="All Statuses">{statusLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availabilityFilterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <InventorySearchField
        key={params.q}
        params={params}
        onDebouncedChange={onDebouncedChange}
      />
    </div>
  );
}
