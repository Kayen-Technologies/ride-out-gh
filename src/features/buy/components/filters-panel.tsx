import {
  bodyTypeOptions,
  fuelOptions,
  transmissionOptions,
} from "@/features/inventory/vehicle-form/options";
import { ResetFilters } from "@/features/buy/components/reset-filters";
import { LiveForm } from "@/features/buy/components/live-form";
import { BrandModelFields } from "@/features/buy/components/brand-model-fields";
import type { Facets } from "@/features/buy/queries";
import { SheetClose } from "@/components/ui/sheet";
import type { BuyFilters } from "@/features/buy/search-params";

export function Select({
  name,
  label,
  value,
  anyLabel,
  options,
}: {
  name: string;
  label: string;
  value?: string | number;
  anyLabel: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-0.5 rounded-md border border-[#b9b9b9] bg-white px-3 py-1.5 text-[#1e1e1e]">
      <span className="text-xs text-[#555]">{label}</span>
      <select
        name={name}
        defaultValue={value === undefined ? "" : String(value)}
        className="w-full cursor-pointer bg-transparent text-sm font-medium outline-none"
      >
        <option value="">{anyLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-3 border-t border-[#e5e5e5] pt-5">
      <legend className="mb-1 text-sm font-semibold text-[#1e1e1e]">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

export function Check({
  name,
  value,
  label,
  checked,
  type = "checkbox",
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  type?: "checkbox" | "radio";
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[#ececec] bg-[#fafafa] px-3 py-2 text-sm text-[#1e1e1e]">
      <input
        type={type}
        name={name}
        value={value}
        defaultChecked={checked}
        className="size-4 accent-[#ffd400]"
      />
      {label}
    </label>
  );
}

const years = Array.from(
  { length: new Date().getFullYear() + 1 - 1999 },
  (_, i) => String(new Date().getFullYear() + 1 - i),
);

/** Figma 120:16129: a white filter card. It is a plain GET form, so every search has a shareable address. */
export function FiltersPanel({
  filters,
  facets,
  variant = "card",
  total = 0,
}: {
  filters: BuyFilters;
  facets: Facets;
  variant?: "card" | "sheet";
  /** How many cars match right now, shown on the sheet's button. */
  total?: number;
}) {
  const sheet = variant === "sheet";
  const prices = [50000, 100000, 150000, 200000, 300000, 500000, 1000000].map(
    (p) => ({ value: String(p), label: `GHS ${p.toLocaleString("en-GH")}` }),
  );
  return (
    <LiveForm
      path="/buy"
      className={
        sheet
          ? "flex min-h-0 flex-1 flex-col text-[#1e1e1e]"
          : "flex flex-col gap-5 rounded-3xl bg-white p-6 text-[#1e1e1e]"
      }
    >
      <div
        className={
          sheet
            ? "flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-6"
            : "contents"
        }
      >
        {sheet ? null : (
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filters</h2>
            <ResetFilters className="text-sm font-medium text-[#b08d00] hover:underline" />
          </div>
        )}
        <div className={sheet ? "hidden" : "grid grid-cols-2 gap-3"}>
          <BrandModelFields
            facets={facets}
            brand={filters.brand}
            model={filters.model}
            variant="card"
          />
        </div>
        <Group title="Price range">
          <div className="grid grid-cols-2 gap-3">
            <Select
              name="minPrice"
              label="Min Price"
              value={filters.minPrice}
              anyLabel="No minimum"
              options={prices}
            />
            <Select
              name="maxPrice"
              label="Max Price"
              value={filters.maxPrice}
              anyLabel="No maximum"
              options={prices}
            />
          </div>
        </Group>
        <Group title="Year">
          <div className="grid grid-cols-2 gap-3">
            <Select
              name="minYear"
              label="Min Year"
              value={filters.minYear}
              anyLabel="Oldest"
              options={years.map((y) => ({ value: y, label: y }))}
            />
            <Select
              name="maxYear"
              label="Max Year"
              value={filters.maxYear}
              anyLabel="Newest"
              options={years.map((y) => ({ value: y, label: y }))}
            />
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
                  checked={filters.colour.some(
                    (x) => x.toLowerCase() === c.toLowerCase(),
                  )}
                />
              ))}
            </div>
          </Group>
        ) : null}
        <Group title="Transmission">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Check
              type="radio"
              name="transmission"
              value=""
              label="Any"
              checked={!filters.transmission}
            />
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
            <Check
              type="radio"
              name="fuel"
              value=""
              label="Any"
              checked={!filters.fuel}
            />
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
          <ResetFilters className="text-base font-medium text-[#b08d00] hover:underline" />
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
