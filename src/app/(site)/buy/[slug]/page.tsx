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
import { SpecRow, colourDot } from "@/features/buy/components/spec-row";
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
    <div className="w-full bg-[#111] lg:bg-[#171717]">
      <Container className="flex flex-col pt-[10px] pb-14 lg:gap-10 lg:pt-8 lg:pb-[100px]">
        <div className="hidden items-center justify-between gap-4 lg:flex">
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
          singleOnMobile
        />

        <div className="mt-[23px] flex flex-col gap-11 lg:mt-0 lg:gap-8">
          <div className="flex flex-col gap-11 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl leading-none font-medium text-white uppercase lg:text-[32px] lg:leading-8 lg:font-normal">
                {car.title}
              </h1>
              <span className="inline-flex h-11 w-fit items-center rounded-[4px] bg-[#404040] px-4 text-xl font-semibold text-white lg:rounded-md lg:text-2xl lg:font-normal">
                {ghs(car.price)}
              </span>
            </div>
            {facts.length ? (
              <ul className="leading-none lg:leading-normal flex justify-between gap-2 px-px text-sm font-medium text-[#cbcbcb] lg:justify-start lg:gap-10 lg:px-0 lg:text-xs lg:font-normal lg:text-white">
                {facts.map(({ Icon, label }) => (
                  <li
                    key={label}
                    className="flex min-w-[30px] flex-col items-center gap-3 lg:min-w-[56px] lg:gap-2"
                  >
                    <span className="flex size-[30px] items-center justify-center rounded-[3px] border border-white/80 text-white lg:size-6">
                      <Icon className="size-[18px] lg:size-4" aria-hidden />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {car.description ? (
            <div className="flex max-w-[560px] flex-col gap-4 lg:gap-3">
              <h2 className="text-xl font-medium text-white">About this car</h2>
              <p className="text-sm leading-[1.5] whitespace-pre-line text-[#a6a6a6] lg:leading-6 lg:text-white/70">
                {car.description}
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-8 grid items-start gap-4 lg:mt-0 lg:grid-cols-2 lg:gap-6">
          <div className="flex flex-col gap-4 lg:gap-6">
            <section
              aria-labelledby="specs-title"
              className="rounded-[20px] bg-white px-6 pt-8 pb-9 lg:rounded-3xl lg:p-6 lg:px-[18px]"
            >
              <h2
                id="specs-title"
                className="mb-6 text-2xl leading-none font-semibold text-[#1e1e1e] lg:mb-2 lg:text-xl lg:leading-7 lg:font-medium lg:text-[#111]"
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
              className="rounded-[20px] bg-[#181818] px-6 pt-8 pb-7 lg:rounded-3xl lg:bg-[#1c1c1c] lg:p-6 lg:px-[18px]"
            >
              <h2
                id="condition-title"
                className="mb-6 text-xl leading-none font-semibold text-white lg:mb-2 lg:leading-7 lg:font-normal"
              >
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
                    className="flex items-center justify-between gap-4 border-b border-white/80 py-[23.5px] text-sm leading-none last:border-0 lg:py-4 lg:leading-5"
                  >
                    <dt className="font-medium">{label}</dt>
                    <dd className="font-semibold lg:font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <section
            aria-labelledby="interest-title"
            className="mt-4 rounded-[20px] bg-black p-6 pt-8 lg:mt-0 lg:rounded-3xl lg:p-8"
          >
            <h2
              id="interest-title"
              className="border-b border-white/80 pb-[26px] text-xl font-semibold text-white lg:font-normal"
            >
              Interested in this car?
            </h2>
            <p className="mt-[34px] text-sm leading-[1.5] text-[#a6a6a6] lg:mt-6 lg:leading-6 lg:text-white/70">
              Interested in this vehicle? Let the Ride-Out team know and
              we&apos;ll help you with the next steps, answer your questions,
              and guide you through the purchase process.
            </p>
            <div className="mt-8 flex flex-col gap-[18px] text-sm text-white lg:mt-6 lg:flex-row lg:gap-8">
              <a
                href={`tel:${business.phones[0]?.replace(/\s/g, "")}`}
                className="flex items-center gap-3 hover:text-primary lg:gap-2"
              >
                <Phone className="size-5 lg:size-4" aria-hidden />
                {business.phones[0]}
              </a>
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-3 hover:text-primary lg:gap-2"
              >
                <Mail className="size-5 lg:size-4" aria-hidden />
                {business.email}
              </a>
            </div>
            <a
              href={`mailto:${business.email}?subject=${encodeURIComponent(`I'm interested in the ${car.title}`)}&body=${encodeURIComponent(`Hello Ride Out,\n\nI'm interested in the ${car.title} (${ghs(car.price)}). Please contact me with the next steps.\n`)}`}
              className="mt-8 flex h-[38px] w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 lg:h-12 lg:text-base"
            >
              I&apos;m Interested
            </a>
          </section>
        </div>
      </Container>
    </div>
  );
}
