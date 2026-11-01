"use client";

import {
  bodyTypeOptions,
  conditionOptions,
  fuelOptions,
  labelFor,
  purposeOptions,
  transmissionOptions,
} from "@/features/inventory/vehicle-form/options";
import type { PickedImage } from "@/features/inventory/vehicle-form/image-utils";
import { parseMoney, type ImageCategory, type VehicleFormValues } from "@/features/inventory/vehicle-form/schema";
import { formatGHS, formatVehicleRentPrice } from "@/lib/format";

const NOT_PROVIDED = "Not provided";

type Row = [label: string, value: string];

function ReviewSection({ title, rows, onEdit }: { title: string; rows: Row[]; onEdit: () => void }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm leading-5 font-medium text-foreground">{title}</h2>
        <button type="button" onClick={onEdit} className="text-sm leading-5 font-medium text-foreground underline underline-offset-2 hover:text-primary">
          Edit
        </button>
      </div>
      <dl className="flex flex-col gap-3.5 rounded-xl bg-[#404040] px-4 py-4">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-6 text-xs leading-[14px] text-foreground">
            <dt className="shrink-0 text-text-70">{label}</dt>
            <dd className="min-w-0 text-right break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ReviewStep({
  values,
  images,
  goTo,
}: {
  values: VehicleFormValues;
  images: Record<ImageCategory, PickedImage[]>;
  goTo: (step: 1 | 2 | 3) => void;
}) {
  const sale = values.purpose === "sale";
  const mileage = values.mileage.trim();
  const price = parseMoney(sale ? values.salePrice : values.dailyRate);
  const deposit = parseMoney(values.securityDeposit);

  const basic: Row[] = [
    ["Vehicle name", values.name || NOT_PROVIDED],
    ["Brand", values.brand || NOT_PROVIDED],
    ["Model", values.model || NOT_PROVIDED],
    ["Condition", labelFor(conditionOptions, values.condition)],
    ["Year", values.year || NOT_PROVIDED],
    ["Listing purpose", labelFor(purposeOptions, values.purpose).replace("For ", "")],
  ];

  const specs: Row[] = [
    ["Mileage", mileage ? `${mileage.replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km` : NOT_PROVIDED],
    ["Transmission", labelFor(transmissionOptions, values.transmission) || NOT_PROVIDED],
    ["Fuel type", labelFor(fuelOptions, values.fuelType) || NOT_PROVIDED],
    ["Body type", labelFor(bodyTypeOptions, values.bodyType) || NOT_PROVIDED],
    ["Colour", values.exteriorColour || NOT_PROVIDED],
    [
      sale ? "Sale price" : "Daily rental rate",
      price ? (sale ? formatGHS(price) : formatVehicleRentPrice(price)) : NOT_PROVIDED,
    ],
    ...(sale ? [] : ([["Security deposit", deposit ? formatGHS(deposit) : NOT_PROVIDED]] as Row[])),
    ["Location", values.location || NOT_PROVIDED],
    ["Registration", values.registration || NOT_PROVIDED],
  ];

  const all = [...images.exterior, ...images.interior];

  return (
    <div className="flex flex-col gap-6">
      <ReviewSection title="Basic information" rows={basic} onEdit={() => goTo(1)} />
      <ReviewSection title="Specifications & pricing" rows={specs} onEdit={() => goTo(2)} />
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm leading-5 font-medium text-foreground">Images</h2>
          <button type="button" onClick={() => goTo(3)} className="text-sm leading-5 font-medium text-foreground underline underline-offset-2 hover:text-primary">
            Edit
          </button>
        </div>
        {all.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 rounded-xl bg-[#404040] p-4 sm:grid-cols-3 sm:gap-4 sm:p-6">
            {all.map((image) => (
              <li key={image.key} className="aspect-[4/3] rounded-xl bg-[#2e2e2e] p-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                <img src={image.previewUrl} alt={image.name} className="size-full rounded-lg bg-[#666] object-cover" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl bg-[#404040] px-4 py-4 text-xs leading-[14px] text-text-70">
            No photos added yet. Publishing needs at least one exterior photo.
          </p>
        )}
      </section>
    </div>
  );
}
