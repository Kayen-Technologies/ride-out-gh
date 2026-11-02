import { ArrowDown, ListFilter } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { SmartImage } from "@/components/media/smart-image";
import { CarRow } from "@/features/buy/components/car-row";
import { FiltersPanel } from "@/features/buy/components/filters-panel";
import { getFacets, searchCars } from "@/features/buy/queries";
import { buyQuery, parseBuySearch, SORTS } from "@/features/buy/search-params";
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

async function Results({ searchParams }: PageProps) {
  const filters = parseBuySearch(await searchParams);
  const [content, facets, result] = await Promise.all([
    getPageContent("buy"),
    getFacets(filters.brand),
    searchCars(filters),
  ]);
  const collage = result.cars.filter((c) => c.image).slice(0, 5);

  return (
    <>
      <section className="w-full bg-black">
        <Container className="grid gap-10 pt-14 pb-14 lg:grid-cols-[1fr_564px] lg:items-center lg:pt-[72px] lg:pb-[72px]">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h1 className="font-display max-w-[480px] text-[32px] leading-[1.1] text-white lg:text-[48px]">
                {content.hero.title}
              </h1>
              <p className="max-w-[460px] text-sm leading-[1.5] text-white/80 lg:text-base">
                {content.hero.body}
              </p>
            </div>
            <a
              href="#available-cars"
              className="inline-flex h-12 w-fit items-center gap-2 rounded-full border border-white/70 px-6 text-base text-white hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Explore our fleet
              <ArrowDown className="size-4" aria-hidden />
            </a>
          </div>
          <ul
            className="flex items-end justify-end gap-3 max-lg:hidden"
            aria-hidden
          >
            {collage.map((car, i) => (
              <li
                key={car.id}
                className={cn(
                  "relative overflow-hidden bg-[#222]",
                  [
                    "h-[100px] w-[114px]",
                    "h-[150px] w-[115px]",
                    "h-[102px] w-[84px]",
                    "h-[150px] w-[130px] rounded-full",
                    "h-[102px] w-[84px]",
                  ][i],
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
        className="w-full scroll-mt-4 bg-black"
      >
        <Container className="pb-14 lg:pb-[100px]">
          <div className="flex items-end justify-between gap-4 pb-8">
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

          <div className="grid gap-6 lg:grid-cols-[414px_1fr] lg:gap-[28px]">
            <details open className="group lg:block">
              <summary className="mb-4 flex cursor-pointer list-none items-center justify-between rounded-full border border-white/30 px-5 py-3 text-white lg:hidden">
                Filters
                <span
                  aria-hidden
                  className="transition-transform group-open:rotate-180"
                >
                  ⌄
                </span>
              </summary>
              <FiltersPanel filters={filters} facets={facets} />
            </details>

            <div className="flex min-w-0 flex-col gap-5">
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
                result.cars.map((car) => <CarRow key={car.id} car={car} />)
              )}

              {result.totalPages > 1 ? (
                <nav
                  aria-label="Pages"
                  className="flex items-center justify-between pt-4 text-sm text-white"
                >
                  {result.page > 1 ? (
                    <Link
                      href={`/buy${buyQuery(filters, { page: result.page - 1 })}`}
                      className="rounded-full border border-white/30 px-5 py-2 hover:bg-white/10"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span />
                  )}
                  <span className="text-white/60">
                    Page {result.page} of {result.totalPages}
                  </span>
                  {result.page < result.totalPages ? (
                    <Link
                      href={`/buy${buyQuery(filters, { page: result.page + 1 })}`}
                      className="rounded-full border border-white/30 px-5 py-2 hover:bg-white/10"
                    >
                      Next
                    </Link>
                  ) : (
                    <span />
                  )}
                </nav>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      <section className="w-full bg-black px-0 pb-14 lg:pb-[100px]">
        <Container>
          <div className="flex flex-col gap-6 rounded-[40px] bg-[#2a2a2a] p-8 lg:p-14">
            <h2 className="font-display max-w-[460px] text-2xl leading-[1.1] text-white lg:text-[32px]">
              {content.still_looking.title}
            </h2>
            <p className="max-w-[460px] text-base text-white">
              {content.still_looking.body}
            </p>
            <Link
              href="/import"
              className="inline-flex h-12 w-fit items-center rounded-full border border-white/70 px-6 text-base text-white hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {content.still_looking.cta}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
