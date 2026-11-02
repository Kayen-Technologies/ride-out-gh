import Link from "next/link";

import {
  bodyTypeOptions,
  fuelOptions,
  transmissionOptions,
} from "@/features/inventory/vehicle-form/options";
import type { Facets } from "@/features/buy/queries";
import type { BuyFilters } from "@/features/buy/search-params";

function Select({
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

function Group({
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

function Check({
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
}: {
  filters: BuyFilters;
  facets: Facets;
}) {
  const prices = [50000, 100000, 150000, 200000, 300000, 500000, 1000000].map(
    (p) => ({ value: String(p), label: `GHS ${p.toLocaleString("en-GH")}` }),
  );
  return (
    <form
      action="/buy"
      method="get"
      className="flex flex-col gap-5 rounded-3xl bg-white p-6 text-[#1e1e1e]"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Link
          href="/buy"
          className="text-sm font-medium text-[#b08d00] hover:underline"
        >
          Reset
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select
          name="brand"
          label="Car brand"
          value={filters.brand}
          anyLabel="Any brand"
          options={facets.brands.map((b) => ({ value: b, label: b }))}
        />
        <Select
          name="model"
          label="Model"
          value={filters.model}
          anyLabel="Any Model"
          options={facets.models.map((m) => ({ value: m, label: m }))}
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
      <button
        type="submit"
        className="h-12 rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Show results
      </button>
      <input type="hidden" name="sort" value={filters.sort} />
    </form>
  );
}
