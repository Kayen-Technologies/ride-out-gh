import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AvailabilityControl } from "@/features/inventory/components/detail/availability-control";
import { DeleteVehicle, VehicleActions } from "@/features/inventory/components/detail/vehicle-actions";
import { VehicleGallery } from "@/features/inventory/components/detail/vehicle-gallery";
import { vehicleImageUrl } from "@/features/inventory/image-url";
import type { VehicleDetail } from "@/features/inventory/queries";
import { bodyTypeOptions, conditionOptions, fuelOptions, labelFor, transmissionOptions } from "@/features/inventory/vehicle-form/options";
import { formatGHS, formatVehicleRentPrice } from "@/lib/format";
import { availabilityLabel, listingPurposeLabel, listingStatusLabel } from "@/lib/status";
import { cn } from "cn";

const NOT_PROVIDED = "Not provided";

type Row = [label: string, value: string];

/** Bordered card from Figma (120:4478): 1 px white 20% border, 12 px radius, 25 px padding. */
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-white/20 p-[25px]", className)}>{children}</div>;
}

function DetailRows({ rows }: { rows: Row[] }) {
  return (
    <Card>
      <dl className="flex flex-col gap-6">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-6 text-base text-foreground">
            <dt className="shrink-0 leading-[19px] text-text-70">{label}</dt>
            <dd className="min-w-0 text-right leading-6 break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base leading-6 font-medium text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export function VehicleDetailView({ detail }: { detail: VehicleDetail }) {
  const { vehicle, images } = detail;
  const sale = vehicle.listing_purpose === "sale";
  const title = `${vehicle.year} ${vehicle.brand} ${vehicle.model}`;
  const added = new Date(vehicle.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const specs: Row[] = [
    ["Year", String(vehicle.year)],
    ["Condition", labelFor(conditionOptions, vehicle.condition) || NOT_PROVIDED],
    ["Mileage", vehicle.mileage_km != null ? `${vehicle.mileage_km.toLocaleString("en-GB")} km` : NOT_PROVIDED],
    ["Transmission", labelFor(transmissionOptions, vehicle.transmission ?? "") || NOT_PROVIDED],
    ["Fuel type", labelFor(fuelOptions, vehicle.fuel_type ?? "") || NOT_PROVIDED],
    ["Body type", labelFor(bodyTypeOptions, vehicle.body_type ?? "") || NOT_PROVIDED],
    ["Exterior colour", vehicle.exterior_colour || NOT_PROVIDED],
  ];

  return (
    <div className="flex w-full max-w-[1092px] flex-col gap-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
        <div className="flex min-w-0 flex-col gap-6">
          <Link
            href="/admin/inventory"
            aria-label="Back to inventory"
            className="w-fit rounded-sm p-0.5 text-sky-300 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ArrowLeft className="size-[18px]" aria-hidden />
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="text-base leading-6 font-medium text-foreground">{title}</h1>
            <p className="text-base leading-[19px] text-text-70">
              {vehicle.code}
              {vehicle.trim ? ` · ${vehicle.trim}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:mt-[22px] sm:items-end">
          <p className="text-sm leading-[17px] text-foreground">Added on {added}</p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex h-[38px] items-center rounded-full border border-primary bg-black/20 px-4 text-sm font-semibold text-foreground">
              {listingPurposeLabel(vehicle.listing_purpose)}
            </span>
            <span className="inline-flex h-9 items-center rounded-full bg-black/20 px-4 text-sm font-semibold text-foreground">
              {availabilityLabel(vehicle.availability_status)}
            </span>
            <span
              className={cn(
                "inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold",
                vehicle.listing_status === "published" ? "bg-black/20 text-foreground" : "bg-white/15 text-text-70",
              )}
            >
              {listingStatusLabel(vehicle.listing_status)}
            </span>
          </div>
        </div>
      </div>

      <VehicleGallery
        title={title}
        photos={images.map((image) => ({ id: image.id, url: vehicleImageUrl(image.path) }))}
      />

      <VehicleActions id={vehicle.id} listingStatus={vehicle.listing_status} />

      {sale ? (
        <Card>
          <p className="text-base leading-[19px] text-text-70">Sale price</p>
          <p className="mt-2 text-2xl leading-[29px] font-medium text-foreground">
            {vehicle.sale_price != null ? formatGHS(vehicle.sale_price) : NOT_PROVIDED}
          </p>
        </Card>
      ) : (
        <Section title="Pricing and listing">
          <Card>
            <p className="text-base leading-[19px] text-text-70">Rental rate</p>
            <p className="mt-2 text-2xl leading-[29px] font-medium text-foreground">
              {vehicle.rental_daily_rate != null ? formatVehicleRentPrice(vehicle.rental_daily_rate) : NOT_PROVIDED}
            </p>
            <div className="mt-6 flex items-baseline justify-between gap-6 text-base text-foreground">
              <span className="leading-[19px] text-text-70">Rental security deposit</span>
              <span className="leading-6">
                {vehicle.rental_security_deposit != null ? formatGHS(vehicle.rental_security_deposit) : NOT_PROVIDED}
              </span>
            </div>
          </Card>
        </Section>
      )}

      <Section title="Vehicle specifications">
        <DetailRows rows={specs} />
      </Section>

      <Section title="Vehicle identification and location">
        <DetailRows
          rows={[
            ["Registration", vehicle.registration || NOT_PROVIDED],
            ["Location", vehicle.location || NOT_PROVIDED],
          ]}
        />
      </Section>

      {vehicle.description ? (
        <Section title="Description">
          <Card>
            <p className="text-base leading-6 whitespace-pre-line text-foreground">{vehicle.description}</p>
          </Card>
        </Section>
      ) : null}

      <AvailabilityControl id={vehicle.id} value={vehicle.availability_status} divided={!sale} />
      <DeleteVehicle id={vehicle.id} title={title} />
    </div>
  );
}
