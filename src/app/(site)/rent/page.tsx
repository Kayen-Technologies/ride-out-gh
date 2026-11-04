import { ListFilter } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { SmartImage } from "@/components/media/smart-image";
import { CarRow } from "@/features/buy/components/car-row";
import { Pagination } from "@/features/buy/components/pagination";
import { getPageContent } from "@/features/cms/content";
import { FilterSheet } from "@/features/rent/components/filter-sheet";
import { RentFilters } from "@/features/rent/components/rent-filters";
import { SearchCard } from "@/features/rent/components/search-card";
import { getRentFacets, searchRentals } from "@/features/rent/queries";
import {
  daysBetween,
  parseRentSearch,
  RENT_PAGE_SIZE,
  RENT_SORTS,
  rentQuery,
  tripQuery,
} from "@/features/rent/search-params";
import { cn } from "cn";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata = { title: "Rent a car | Ride Out" };

export default function RentPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div data-page-pending className="ro-shimmer min-h-[60vh]" aria-hidden />}>
      <Results searchParams={searchParams} />
    </Suspense>
  );
}

/** Photo tiles beside the search card (Figma 1:4420): two staggered columns of real fleet photos. */
const tiles = [
  "col-start-1 row-start-1 h-[120px] self-end",
  "col-start-2 row-start-1 h-[200px]",
  "col-start-1 row-start-2 h-[220px]",
  "col-start-2 row-start-2 h-[200px]",
  "col-start-1 row-start-3 h-[160px]",
  "col-start-2 row-start-3 h-[120px]",
];

async function Results({ searchParams }: PageProps) {
  const raw = await searchParams;
  // Today's date changes, so wait for a real request before reading the clock.
  await connection();
  const today = new Date().toISOString().slice(0, 10);
  const { filters, dateError } = parseRentSearch(raw, today);
  const [content, facets, result] = await Promise.all([
    getPageContent("rent"),
    getRentFacets(),
    searchRentals(filters),
  ]);
  if (result.cars.length === 0 && result.total > 0 && filters.page > result.totalPages) {
    redirect(`/rent${rentQuery(filters, { page: result.totalPages })}`);
  }
  const collage = result.cars.filter((c) => c.image).slice(0, tiles.length);
  const dated = filters.pickup && filters.dropoff;
  const days = dated ? daysBetween(filters.pickup!, filters.dropoff!) : 0;

  return (
    <>
      <section className="w-full bg-black">
        <Container className="grid gap-10 pt-8 pb-12 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-10 lg:pt-[72px] lg:pb-[80px]">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h1 className="font-display max-w-[480px] text-2xl leading-[1.2] text-white lg:text-[48px] lg:leading-[1.1]">
                {content.hero.title}
              </h1>
              <p className="max-w-[360px] text-sm leading-[1.4] text-white lg:text-base lg:leading-[1.5] lg:text-white/80">
                {content.hero.body}
              </p>
            </div>
            <SearchCard filters={filters} today={today} dateError={dateError} />
          </div>
          <ul className="grid grid-cols-2 gap-3 max-lg:hidden" aria-hidden>
            {collage.map((car, i) => (
              <li key={car.id} className={cn("relative overflow-hidden rounded-xl bg-[#484848]", tiles[i])}>
                <SmartImage
                  src={car.image!}
                  alt=""
                  fill
                  sizes="260px"
                  blurDataURL={car.blur ?? undefined}
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section id="available-cars" aria-labelledby="available-title" className="w-full scroll-mt-4 bg-black">
        <Container className="pt-6 pb-14 lg:pt-0 lg:pb-[100px]">
          <div className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="available-title" className="font-display text-2xl text-white">
                Available cars
              </h2>
              <p className="mt-2 text-base text-white/50" aria-live="polite">
                {result.total} {result.total === 1 ? "vehicle" : "vehicles"} found
                {dated ? ` for ${days} ${days === 1 ? "day" : "days"}` : ""}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <FilterSheet>
                <RentFilters filters={filters} facets={facets} variant="sheet" total={result.total} />
              </FilterSheet>
              <details className="relative text-sm text-white">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full px-3 py-2 whitespace-nowrap hover:bg-white/10">
                  <ListFilter className="size-4" aria-hidden />
                  Sort: {RENT_SORTS.find((s) => s.value === filters.sort)?.label}
                </summary>
                <ul className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border border-white/15 bg-[#222] p-1 shadow-lg">
                  {RENT_SORTS.map((s) => (
                    <li key={s.value}>
                      <Link
                        href={`/rent${rentQuery(filters, { sort: s.value, page: 1 })}`}
                        className={cn(
                          "block rounded-md px-3 py-2 hover:bg-white/10",
                          s.value === filters.sort && "text-primary",
                        )}
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[414px_1fr] lg:gap-[28px]">
            <div className="max-lg:hidden">
              <RentFilters filters={filters} facets={facets} />
            </div>
            <div className="flex min-w-0 flex-col gap-12 transition-opacity duration-200 lg:gap-5 [html[data-filtering]_&]:opacity-50">
              {result.cars.length === 0 ? (
                <div className="rounded-lg border border-white/15 p-10 text-center text-white">
                  <p className="text-lg font-medium">
                    {dated ? "No cars are free for those dates." : "No cars match those filters."}
                  </p>
                  <p className="mt-2 text-white/60">
                    {dated ? "Try other dates, or widen the filters." : "Try widening the price, or clear the filters."}
                  </p>
                  <Link
                    href="/rent"
                    className="mt-5 inline-flex h-10 items-center rounded-full border border-white/60 px-6 text-sm font-medium hover:bg-white/10"
                  >
                    Clear search
                  </Link>
                </div>
              ) : (
                result.cars.map((car, index) => (
                  <CarRow
                    key={car.id}
                    car={car}
                    priority={index < 3}
                    href={`/rent/${car.slug}${tripQuery(filters)}`}
                    priceSuffix="/day"
                  />
                ))
              )}
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                total={result.total}
                pageSize={RENT_PAGE_SIZE}
                hrefFor={(target) => `/rent${rentQuery(filters, { page: target })}`}
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
