import { ArrowDown, ListFilter } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { SmartImage } from "@/components/media/smart-image";
import { Pagination } from "@/features/buy/components/pagination";
import { CarRow } from "@/features/buy/components/car-row";
import { FiltersPanel } from "@/features/buy/components/filters-panel";
import { MobileFilterBar } from "@/features/buy/components/mobile-filter-bar";
import { getFacets, searchCars } from "@/features/buy/queries";
import {
  buyQuery,
  PAGE_SIZE,
  parseBuySearch,
  SORTS,
} from "@/features/buy/search-params";
import { getPageContent } from "@/features/cms/content";
import { cn } from "cn";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = { title: "Buy a car | Ride Out" };

export default function BuyPage({ searchParams }: PageProps) {
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
      <Results searchParams={searchParams} />
    </Suspense>
  );
}

/** Sizes of the five hero photos, from Figma 120:16313 (mobile, first four) and 1:3047 (desktop). */
const collageSizes = [
  "h-[58px] w-[79px] lg:h-[100px] lg:w-[114px]",
  "h-[104px] w-[79px] lg:h-[150px] lg:w-[115px]",
  "h-[71px] w-[58px] lg:h-[102px] lg:w-[84px]",
  "h-[109px] w-[90px] rounded-full lg:h-[150px] lg:w-[130px]",
  "hidden lg:block lg:h-[102px] lg:w-[84px]",
];

async function Results({ searchParams }: PageProps) {
  const filters = parseBuySearch(await searchParams);
  const [content, facets, result] = await Promise.all([
    getPageContent("buy"),
    getFacets(),
    searchCars(filters),
  ]);
  // A page number past the end (an old bookmark after cars were removed) goes to the last real page.
  if (
    result.cars.length === 0 &&
    result.total > 0 &&
    filters.page > result.totalPages
  ) {
    redirect(`/buy${buyQuery(filters, { page: result.totalPages })}`);
  }
  const collage = result.cars.filter((c) => c.image).slice(0, 5);

  return (
    <>
      <section className="w-full bg-[#111] lg:bg-black">
        <Container className="grid gap-10 pt-6 pb-[62px] lg:grid-cols-[1fr_564px] lg:items-center lg:gap-10 lg:pt-[72px] lg:pb-[72px]">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 lg:gap-4">
              <h1 className="font-display max-w-[480px] text-2xl leading-[1.2] text-white lg:text-[48px] lg:leading-[1.1]">
                {content.hero.title}
              </h1>
              <p className="max-w-[460px] text-sm leading-[1.4] text-white lg:text-base lg:leading-[1.5] lg:text-white/80">
                {content.hero.body}
              </p>
            </div>
            <a
              href="#available-cars"
              className="mt-2.5 inline-flex h-12 w-fit items-center gap-2 rounded-full border border-white/70 px-8 text-sm lg:mt-0 text-white hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-ring/50 lg:px-6 lg:text-base"
            >
              Explore our fleet
              <ArrowDown className="size-4" aria-hidden />
            </a>
          </div>
          <ul
            className="flex items-end justify-center gap-2 lg:justify-end lg:gap-3"
            aria-hidden
          >
            {collage.map((car, i) => (
              <li
                key={car.id}
                className={cn(
                  "relative overflow-hidden rounded-sm bg-[#484848] lg:rounded-none",
                  collageSizes[i],
                )}
              >
                <SmartImage
                  src={car.image!}
                  alt=""
                  fill
                  sizes="130px"
                  blurDataURL={car.blur ?? undefined}
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section
        id="available-cars"
        aria-labelledby="available-title"
        className="w-full scroll-mt-4 bg-[#111] lg:bg-black"
      >
        <Container className="pt-6 pb-14 lg:pt-0 lg:pb-[100px]">
          <div className="pb-10 lg:hidden">
            <MobileFilterBar filters={filters} facets={facets}>
              <FiltersPanel
                filters={filters}
                facets={facets}
                variant="sheet"
                total={result.total}
              />
            </MobileFilterBar>
          </div>

          <div className="flex items-end justify-between gap-4 pb-8 max-lg:hidden">
            <div>
              <h2
                id="available-title"
                className="font-display text-2xl text-white"
              >
                Available cars
              </h2>
              <p className="mt-2 text-base text-white/50" aria-live="polite">
                {result.total} {result.total === 1 ? "vehicle" : "vehicles"}{" "}
                found
              </p>
            </div>
            <details className="relative text-sm text-white">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full px-3 py-2 hover:bg-white/10">
                <ListFilter className="size-4" aria-hidden />
                Sort: {SORTS.find((s) => s.value === filters.sort)?.label}
              </summary>
              <ul className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border border-white/15 bg-[#222] p-1 shadow-lg">
                {SORTS.map((s) => (
                  <li key={s.value}>
                    <Link
                      href={`/buy${buyQuery(filters, { sort: s.value, page: 1 })}`}
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
          <h2 id="available-title-mobile" className="sr-only lg:hidden">
            Available cars, {result.total} found
          </h2>

          <div className="grid gap-6 lg:grid-cols-[414px_1fr] lg:gap-[28px]">
            <div className="max-lg:hidden">
              <FiltersPanel filters={filters} facets={facets} />
            </div>

            <div className="flex min-w-0 flex-col gap-12 transition-opacity duration-200 lg:gap-5 [html[data-filtering]_&]:opacity-50">
              {result.cars.length === 0 ? (
                <div className="rounded-lg border border-white/15 p-10 text-center text-white">
                  <p className="text-lg font-medium">
                    No cars match those filters.
                  </p>
                  <p className="mt-2 text-white/60">
                    Try widening the price or year, or clear the filters.
                  </p>
                  <Link
                    href="/buy"
                    className="mt-5 inline-flex h-10 items-center rounded-full border border-white/60 px-6 text-sm font-medium hover:bg-white/10"
                  >
                    Clear filters
                  </Link>
                </div>
              ) : (
                result.cars.map((car, index) => (
                  <CarRow key={car.id} car={car} priority={index < 3} />
                ))
              )}

              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                total={result.total}
                pageSize={PAGE_SIZE}
                hrefFor={(target) =>
                  `/buy${buyQuery(filters, { page: target })}`
                }
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="w-full bg-[#111] pb-14 lg:bg-black lg:pb-[100px]">
        <Container>
          <div className="flex flex-col items-center gap-6 rounded-[40px] bg-[#2a2a2a] px-5 py-10 text-center lg:items-start lg:p-14 lg:text-left">
            <h2 className="font-display max-w-[460px] text-2xl leading-[1.1] text-white lg:text-[32px]">
              {content.still_looking.title}
            </h2>
            <p className="max-w-[460px] text-sm text-white lg:text-base">
              {content.still_looking.body}
            </p>
            <Link
              href="/import"
              className="inline-flex h-12 w-fit items-center rounded-full border border-white/70 px-6 text-sm text-white hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-ring/50 lg:text-base"
            >
              {content.still_looking.cta}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
