import { Check, Group, Select } from "@/features/buy/components/filters-panel";
import { BrandModelFields } from "@/features/buy/components/brand-model-fields";
import { LiveForm } from "@/features/buy/components/live-form";
import { ResetFilters } from "@/features/buy/components/reset-filters";
import type { Facets } from "@/features/buy/queries";
import { SheetClose } from "@/components/ui/sheet";
import { bodyTypeOptions, fuelOptions, transmissionOptions } from "@/features/inventory/vehicle-form/options";
import type { RentFilters } from "@/features/rent/search-params";

const RATES = [200, 300, 400, 500, 600, 800, 1000, 1500].map((p) => ({
  value: String(p),
  label: `GHS ${p.toLocaleString("en-GH")}`,
}));

/**
 * Figma 1:4420: the white filter card. Same behaviour as the Buy filters (a GET form that searches as soon
 * as anything changes). The trip (dates and place) rides along as hidden fields so filtering keeps it.
 */
export function RentFilters({
  filters,
  facets,
  variant = "card",
  total = 0,
}: {
  filters: RentFilters;
  facets: Facets;
  variant?: "card" | "sheet";
  total?: number;
}) {
  const sheet = variant === "sheet";
  return (
    <LiveForm
      path="/rent"
      className={
        sheet
          ? "flex min-h-0 flex-1 flex-col text-[#1e1e1e]"
          : "flex flex-col gap-5 rounded-3xl bg-white p-6 text-[#1e1e1e]"
      }
    >
      <div className={sheet ? "flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-6" : "contents"}>
        {filters.pickup ? <input type="hidden" name="pickup" value={filters.pickup} /> : null}
        {filters.dropoff ? <input type="hidden" name="dropoff" value={filters.dropoff} /> : null}
        {filters.place ? <input type="hidden" name="place" value={filters.place} /> : null}
        {sheet ? null : (
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filters</h2>
            <ResetFilters href="/rent" className="text-sm font-medium text-[#b08d00] hover:underline" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <BrandModelFields facets={facets} brand={filters.brand} model={filters.model} variant="card" />
        </div>
        <Group title="Price range per day">
          <div className="grid grid-cols-2 gap-3">
            <Select name="minPrice" label="Min Price" value={filters.minPrice} anyLabel="No minimum" options={RATES} />
            <Select name="maxPrice" label="Max Price" value={filters.maxPrice} anyLabel="No maximum" options={RATES} />
          </div>
        </Group>
        <Group title="Type">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {bodyTypeOptions.map((o) => (
              <Check
                key={o.value}
                name="body"
                value={o.value}
                label={o.label}
                checked={filters.body.includes(o.value)}
              />
            ))}
          </div>
        </Group>
        {facets.colours.length ? (
          <Group title="Colour">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {facets.colours.map((c) => (
                <Check
                  key={c}
                  name="colour"
                  value={c}
                  label={c}
                  checked={filters.colour.some((x) => x.toLowerCase() === c.toLowerCase())}
                />
              ))}
            </div>
          </Group>
        ) : null}
        <Group title="Transmission">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Check type="radio" name="transmission" value="" label="Any" checked={!filters.transmission} />
            {transmissionOptions.map((o) => (
              <Check
                key={o.value}
                type="radio"
                name="transmission"
                value={o.value}
                label={o.label}
                checked={filters.transmission === o.value}
              />
            ))}
          </div>
        </Group>
        <Group title="Fuel Type">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Check type="radio" name="fuel" value="" label="Any" checked={!filters.fuel} />
            {fuelOptions.map((o) => (
              <Check
                key={o.value}
                type="radio"
                name="fuel"
                value={o.value}
                label={o.label}
                checked={filters.fuel === o.value}
              />
            ))}
          </div>
        </Group>
        <input type="hidden" name="sort" value={filters.sort} />
      </div>
      {sheet ? (
        <div className="flex items-center justify-between gap-4 border-t border-[#e5e5e5] bg-white px-4 py-4">
          <ResetFilters href="/rent" className="text-base font-medium text-[#b08d00] hover:underline" />
          <SheetClose asChild>
            <button
              type="submit"
              className="h-12 min-w-[200px] rounded-full bg-primary px-6 text-base font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Show {total} {total === 1 ? "result" : "results"}
            </button>
          </SheetClose>
        </div>
      ) : (
        <button type="submit" className="sr-only">
          Show results
        </button>
      )}
    </LiveForm>
  );
}
