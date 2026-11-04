import { Armchair, Bookmark, Car, Fuel, Gauge, Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { LiveForm } from "@/features/buy/components/live-form";
import { SpecRow, colourDot } from "@/features/buy/components/spec-row";
import { getBusinessProfile } from "@/features/cms/business";
import { VehicleGallery } from "@/features/inventory/components/detail/vehicle-gallery";
import { bodyTypeOptions, fuelOptions, labelFor, transmissionOptions } from "@/features/inventory/vehicle-form/options";
import { RequestModal } from "@/features/rent/request/request-modal";
import { getRentalBySlug, isFreeForDates } from "@/features/rent/queries";
import { daysBetween, parseRentSearch, rentQuery } from "@/features/rent/search-params";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Pick<PageProps, "params">): Promise<Metadata> {
  const car = await getRentalBySlug((await params).slug);
  return { title: car ? `${car.title} for rent | Ride Out` : "Car not found | Ride Out" };
}

export default function RentalPage(props: PageProps) {
  return (
    <Suspense fallback={<div data-page-pending className="ro-shimmer min-h-[60vh]" aria-hidden />}>
      <Rental {...props} />
    </Suspense>
  );
}

const ghs = (amount: number) => `GHS ${amount.toLocaleString("en-GH")}`;

const dateField =
  "flex flex-col gap-1 rounded-md bg-white px-3 py-2 text-[#1e1e1e] focus-within:ring-3 focus-within:ring-primary/60";

async function Rental({ params, searchParams }: PageProps) {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  // Today's date changes, so wait for a real request before reading the clock.
  await connection();
  const today = new Date().toISOString().slice(0, 10);
  const [car, business] = await Promise.all([getRentalBySlug(slug), getBusinessProfile()]);
  if (!car) notFound();

  const { filters, dateError } = parseRentSearch(raw, today);
  const { pickup, dropoff, place } = filters;
  const dated = !!pickup && !!dropoff;
  const days = dated ? daysBetween(pickup, dropoff) : 0;
  const free = dated ? await isFreeForDates(car.id, pickup, dropoff) : true;
  const rate = car.dailyRate;
  const total = dated && rate != null ? rate * days : null;
  const canRequest = dated && free && car.rentable && total !== null;

  const facts = [
    { Icon: Fuel, label: labelFor(fuelOptions, car.fuelType ?? "") },
    { Icon: Gauge, label: labelFor(transmissionOptions, car.transmission ?? "") },
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
                <Link href="/" className="underline underline-offset-2 hover:text-primary">
                  Home
                </Link>{" "}
                /
              </li>
              <li>
                <Link href="/rent" className="underline underline-offset-2 hover:text-primary">
                  Rent a Car
                </Link>{" "}
                /
              </li>
              {dated ? (
                <li>
                  <Link
                    href={`/rent${rentQuery({ pickup, dropoff, place })}`}
                    className="underline underline-offset-2 hover:text-primary"
                  >
                    Search Results
                  </Link>{" "}
                  /
                </li>
              ) : null}
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

        <VehicleGallery title={car.title} photos={car.photos} emptyMessage="Photos are coming soon." singleOnMobile />

        <div className="mt-[23px] flex flex-col gap-11 lg:mt-0 lg:gap-8">
          <div className="flex flex-col gap-11 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl leading-none font-medium text-white uppercase lg:text-[32px] lg:leading-8 lg:font-normal">
                {car.title}
              </h1>
              <span className="inline-flex h-11 w-fit items-center rounded-[4px] bg-[#404040] px-4 text-xl font-semibold text-white lg:rounded-md lg:text-2xl lg:font-normal">
                {rate == null ? "Rate on request" : `${ghs(rate)}/day`}
              </span>
            </div>
            {facts.length ? (
              <ul className="flex justify-between gap-2 px-px text-sm leading-none font-medium text-[#cbcbcb] lg:justify-start lg:gap-10 lg:px-0 lg:text-xs lg:leading-normal lg:font-normal lg:text-white">
                {facts.map(({ Icon, label }) => (
                  <li key={label} className="flex min-w-[30px] flex-col items-center gap-3 lg:min-w-[56px] lg:gap-2">
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
                {car.bodyType ? <SpecRow label="Body Type" value={labelFor(bodyTypeOptions, car.bodyType)} /> : null}
                {car.colour ? (
                  <SpecRow label="Color" value={car.colour} dot={colourDot[car.colour.toLowerCase()]} />
                ) : null}
                {car.transmission ? (
                  <SpecRow label="Transmission" value={labelFor(transmissionOptions, car.transmission)} />
                ) : null}
              </dl>
            </section>

            <section
              aria-labelledby="contact-title"
              className="rounded-[20px] bg-white px-6 py-6 text-[#1e1e1e] lg:rounded-3xl lg:px-[18px]"
            >
              <h2 id="contact-title" className="sr-only">
                Contact Ride Out
              </h2>
              <p className="text-sm leading-[1.5]">
                Interested in this vehicle? Let the Ride-Out team know and we&apos;ll help you with the next steps and
                answer your questions.
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm lg:flex-row lg:gap-8">
                <a
                  href={`tel:${business.phones[0]?.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <Phone className="size-4" aria-hidden />
                  {business.phones[0]}
                </a>
                <a href={`mailto:${business.email}`} className="flex items-center gap-2 hover:underline">
                  <Mail className="size-4" aria-hidden />
                  {business.email}
                </a>
              </div>
            </section>
          </div>

          <section
            aria-labelledby="trip-title"
            className="rounded-[20px] bg-black p-6 pt-8 text-white lg:rounded-3xl lg:p-6"
          >
            <h2 id="trip-title" className="sr-only">
              Your trip
            </h2>
            <LiveForm path={`/rent/${car.slug}`} className="flex flex-col gap-4">
              {place ? <input type="hidden" name="place" value={place} /> : null}
              <label className={dateField}>
                <span className="text-xs text-[#555]">Pick-up date</span>
                <input
                  name="pickup"
                  type="date"
                  min={today}
                  defaultValue={pickup ?? ""}
                  className="w-full cursor-pointer bg-transparent text-sm font-medium outline-none"
                />
              </label>
              <label className={dateField}>
                <span className="text-xs text-[#555]">Drop-off date</span>
                <input
                  name="dropoff"
                  type="date"
                  min={pickup ?? today}
                  defaultValue={dropoff ?? ""}
                  className="w-full cursor-pointer bg-transparent text-sm font-medium outline-none"
                />
              </label>
              <button type="submit" className="sr-only">
                Update dates
              </button>
            </LiveForm>
            {dateError ? (
              <p role="alert" className="mt-3 text-sm text-[#ff8a8a]">
                {dateError}
              </p>
            ) : null}
            {dated && !free ? (
              <p role="status" className="mt-3 rounded-md bg-[#2a1215] px-3 py-2 text-sm text-[#ff8a8a]">
                This car is already booked for those dates. Try other dates, or{" "}
                <Link href={`/rent${rentQuery({ pickup, dropoff, place })}`} className="underline">
                  see cars that are free
                </Link>
                .
              </p>
            ) : null}
            {dated && !car.rentable ? (
              <p role="status" className="mt-3 rounded-md bg-[#2a1215] px-3 py-2 text-sm text-[#ff8a8a]">
                This car isn&apos;t available to rent right now.
              </p>
            ) : null}

            <dl className="mt-6 text-sm">
              <div className="flex items-center justify-between border-b border-white/40 py-3.5">
                <dt>Total day(s)</dt>
                <dd className="font-medium">{dated ? `${days} ${days === 1 ? "day" : "days"}` : "-"}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-white/40 py-3.5">
                <dt>Price</dt>
                <dd className="font-medium">{total !== null ? ghs(total) : "-"}</dd>
              </div>
              {car.securityDeposit ? (
                <div className="flex items-center justify-between border-b border-white/40 py-3.5">
                  <dt>Security deposit</dt>
                  <dd className="font-medium">{ghs(car.securityDeposit)}</dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm">Total Price</p>
                <p className="text-xl font-semibold lg:text-2xl">{total !== null ? ghs(total) : "-"}</p>
              </div>
              {canRequest ? (
                <RequestModal
                  slug={car.slug}
                  title={car.title}
                  pickup={pickup}
                  dropoff={dropoff}
                  place={place}
                  summary={`${days} ${days === 1 ? "day" : "days"} · ${ghs(total)}`}
                />
              ) : (
                <span
                  aria-disabled
                  className="inline-flex h-11 cursor-not-allowed items-center justify-center rounded-full bg-white/15 px-6 text-sm font-medium text-white/60 lg:min-w-[200px]"
                >
                  {dated ? "Not available" : "Choose your dates"}
                </span>
              )}
            </div>
            {car.securityDeposit ? (
              <p className="mt-3 text-xs text-white/60">
                The security deposit is separate and is not part of the total.
              </p>
            ) : null}
          </section>
        </div>
      </Container>
    </div>
  );
}
