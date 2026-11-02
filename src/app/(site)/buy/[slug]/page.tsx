import {
  Armchair,
  Bookmark,
  Car,
  Fuel,
  Gauge,
  Mail,
  Phone,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { VehicleGallery } from "@/features/inventory/components/detail/vehicle-gallery";
import {
  bodyTypeOptions,
  conditionOptions,
  fuelOptions,
  labelFor,
  transmissionOptions,
} from "@/features/inventory/vehicle-form/options";
import { getBusinessProfile } from "@/features/cms/business";
import { getCarBySlug } from "@/features/buy/queries";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const car = await getCarBySlug((await params).slug);
  return {
    title: car ? `${car.title} | Ride Out` : "Car not found | Ride Out",
  };
}

export default function CarPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div
          data-page-pending
          className="ro-shimmer min-h-[60vh]"
          aria-hidden
        />
      }
    >
      <Car_ params={params} />
    </Suspense>
  );
}

const ghs = (amount: number | null) =>
  amount == null ? "Price on request" : `GHS ${amount.toLocaleString("en-GH")}`;

function SpecRow({
  label,
  value,
  dot,
}: {
  label: string;
  value: string;
  dot?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#e8e8e8] py-4 text-sm last:border-0">
      <dt className="text-[#555]">{label}</dt>
      <dd className="flex items-center gap-2 font-medium text-[#111]">
        {dot ? (
          <span
            aria-hidden
            className="size-3 rounded-full"
            style={{ background: dot }}
          />
        ) : null}
        {value}
      </dd>
    </div>
  );
}

const colourDot: Record<string, string> = {
  red: "#e12121",
  blue: "#1751d0",
  green: "#019939",
  black: "#111",
  white: "#fff",
  silver: "#c0c4c8",
  grey: "#888",
  gray: "#888",
};

async function Car_({ params }: PageProps) {
  const [{ slug }, business] = await Promise.all([
    params,
    getBusinessProfile(),
  ]);
  const car = await getCarBySlug(slug);
  if (!car) notFound();

  const facts = [
    { Icon: Fuel, label: labelFor(fuelOptions, car.fuelType ?? "") },
    {
      Icon: Gauge,
      label: labelFor(transmissionOptions, car.transmission ?? ""),
    },
    { Icon: Car, label: labelFor(bodyTypeOptions, car.bodyType ?? "") },
    { Icon: Armchair, label: car.seats ? String(car.seats) : "" },
  ].filter((fact) => fact.label);

  return (
    <div className="w-full bg-[#171717]">
      <Container className="flex flex-col gap-10 pt-8 pb-14 lg:pb-[100px]">
        <div className="flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="min-w-0 text-sm text-white">
            <ol className="flex flex-wrap gap-x-2">
              <li>
                <Link
                  href="/"
                  className="underline underline-offset-2 hover:text-primary"
                >
                  Home
                </Link>{" "}
                /
              </li>
              <li>
                <Link
                  href="/buy"
                  className="underline underline-offset-2 hover:text-primary"
                >
                  Buy a Car
                </Link>{" "}
                /
              </li>
              <li aria-current="page" className="font-medium">
                {car.title}
              </li>
            </ol>
          </nav>
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-[3px] bg-white text-[#111]"
            aria-hidden
          >
            <Bookmark className="size-4" />
          </span>
        </div>

        <VehicleGallery
          title={car.title}
          photos={car.photos}
          emptyMessage="Photos are coming soon."
        />

        <div className="flex flex-col gap-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl leading-8 font-normal text-white uppercase lg:text-[32px]">
                {car.title}
              </h1>
              <span className="inline-flex w-fit items-center rounded-md bg-[#444] px-4 py-2 text-xl text-white lg:text-2xl">
                {ghs(car.price)}
              </span>
            </div>
            {facts.length ? (
              <ul className="flex flex-wrap gap-6 text-xs text-white lg:gap-10">
                {facts.map(({ Icon, label }) => (
                  <li
                    key={label}
                    className="flex min-w-[56px] flex-col items-center gap-2"
                  >
                    <span className="flex size-6 items-center justify-center rounded-[3px] border border-white/70">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {car.description ? (
            <div className="flex max-w-[560px] flex-col gap-3">
              <h2 className="text-xl text-white">About this car</h2>
              <p className="text-sm leading-6 whitespace-pre-line text-white/70">
                {car.description}
              </p>
            </div>
          ) : null}
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <section
              aria-labelledby="specs-title"
              className="rounded-3xl bg-white p-6 lg:px-[18px]"
            >
              <h2
                id="specs-title"
                className="mb-2 text-xl font-medium text-[#111]"
              >
                Features &amp; Specs
              </h2>
              <dl>
                <SpecRow label="Year" value={String(car.year)} />
                <SpecRow label="Brand" value={car.brand} />
                <SpecRow label="Model" value={car.model} />
                {car.bodyType ? (
                  <SpecRow
                    label="Body Type"
                    value={labelFor(bodyTypeOptions, car.bodyType)}
                  />
                ) : null}
                {car.colour ? (
                  <SpecRow
                    label="Color"
                    value={car.colour}
                    dot={colourDot[car.colour.toLowerCase()]}
                  />
                ) : null}
                {car.transmission ? (
                  <SpecRow
                    label="Transmission"
                    value={labelFor(transmissionOptions, car.transmission)}
                  />
                ) : null}
                <SpecRow label="Seller" value={car.seller} />
              </dl>
            </section>

            <section
              aria-labelledby="condition-title"
              className="rounded-3xl bg-[#1c1c1c] p-6 lg:px-[18px]"
            >
              <h2 id="condition-title" className="mb-2 text-xl text-white">
                Vehicle Condition
              </h2>
              <dl className="text-white">
                {[
                  [
                    "Condition",
                    car.conditionGrade ??
                      labelFor(conditionOptions, car.condition),
                  ],
                  [
                    "Mileage",
                    car.mileage != null
                      ? `${car.mileage.toLocaleString("en-GH")} km`
                      : "-",
                  ],
                  ["Accident history", car.accidentHistory ?? "-"],
                  ["Inspection", car.inspection ?? "-"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 border-b border-white/80 py-4 text-sm last:border-0"
                  >
                    <dt>{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <section
            aria-labelledby="interest-title"
            className="rounded-3xl bg-black p-6 lg:p-8"
          >
            <h2
              id="interest-title"
              className="border-b border-white/80 pb-6 text-xl text-white"
            >
              Interested in this car?
            </h2>
            <p className="mt-6 text-sm leading-6 text-white/70">
              Interested in this vehicle? Let the Ride-Out team know and
              we&apos;ll help you with the next steps, answer your questions,
              and guide you through the purchase process.
            </p>
            <div className="mt-6 flex flex-col gap-3 text-sm text-white sm:flex-row sm:gap-8">
              <a
                href={`tel:${business.phones[0]?.replace(/\s/g, "")}`}
                className="flex items-center gap-2 hover:text-primary"
              >
                <Phone className="size-4" aria-hidden />
                {business.phones[0]}
              </a>
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-2 hover:text-primary"
              >
                <Mail className="size-4" aria-hidden />
                {business.email}
              </a>
            </div>
            <a
              href={`mailto:${business.email}?subject=${encodeURIComponent(`I'm interested in the ${car.title}`)}&body=${encodeURIComponent(`Hello Ride Out,\n\nI'm interested in the ${car.title} (${ghs(car.price)}). Please contact me with the next steps.\n`)}`}
              className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-primary text-base font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              I&apos;m Interested
            </a>
          </section>
        </div>
      </Container>
    </div>
  );
}
