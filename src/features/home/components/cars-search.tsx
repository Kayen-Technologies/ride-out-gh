import { ArrowRight, Bookmark, ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { HomeCar } from "@/features/home/queries";
import { cn } from "cn";

const ghs = (amount: number | null) => (amount == null ? "Price on request" : `GHS ${amount.toLocaleString("en-GH")}`);

const budgets = [
  { value: "100000", label: "Up to GHS 100,000" },
  { value: "200000", label: "Up to GHS 200,000" },
  { value: "300000", label: "Up to GHS 300,000" },
  { value: "500000", label: "Up to GHS 500,000" },
];

const bodyTabs = [
  { label: "All cars", value: "" },
  { label: "SUVs", value: "suv" },
  { label: "Sedans", value: "sedan" },
  { label: "Hatchbacks", value: "hatchback" },
  { label: "Pickups", value: "pickup" },
];

function SearchSelect({ name, label, anyLabel, options }: { name: string; label: string; anyLabel: string; options: { value: string; label: string }[] }) {
  return (
    <label className="relative flex h-16 w-full flex-col justify-center rounded-md bg-white px-4 text-left text-[#1e1e1e]">
      <span className="text-sm leading-[17px] font-medium text-[#4f4d55]">{label}</span>
      <select name={name} defaultValue="" className="w-full cursor-pointer appearance-none bg-transparent pr-8 text-base leading-[19px] font-medium outline-none focus-visible:underline">
        <option value="">{anyLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2" aria-hidden />
    </label>
  );
}

function CarCard({ car }: { car: HomeCar }) {
  return (
    <article className="mx-auto flex w-full max-w-[348px] min-w-0 flex-col gap-3 lg:max-w-none">
      <div className="relative aspect-[348/261] overflow-hidden rounded-lg bg-white lg:aspect-[310/233]">
        {car.image ? <Image src={car.image} alt={car.title} fill sizes="(min-width: 1024px) 310px, 348px" className="object-cover" /> : null}
        <span className="absolute top-[15px] right-[15px] flex size-[29px] items-center justify-center rounded-[3px] border border-[#dcdcde] bg-[#eee] text-[#111]">
          <Bookmark className="size-4" aria-hidden />
          <span className="sr-only">Save {car.title}</span>
        </span>
      </div>
      <div className="flex flex-col items-center gap-3 text-center lg:h-[165px] lg:justify-between lg:rounded-lg lg:border lg:border-white/10 lg:bg-[#111] lg:p-6">
        <div className="flex flex-col items-center gap-2">
          <p className="font-display text-sm leading-none font-light text-white/50 uppercase">{car.brand}</p>
          <h3 className="text-lg leading-none text-[#eaeaea] lg:text-base lg:leading-6 lg:font-medium lg:text-white">{car.title}</h3>
          <span className="font-display inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-base leading-6 font-medium text-white">{ghs(car.price)}</span>
        </div>
        <Link href={`/buy/${car.slug}`} className="text-sm leading-none text-primary hover:underline focus-visible:underline">
          View details
        </Link>
      </div>
    </article>
  );
}

/** Figma 1:2242 / 120:14361: search form and body-type tabs, one featured car (desktop) and a row of cards. */
export function CarsSearch({ title, viewAll, brands, cars }: { title: string; viewAll: string; brands: string[]; cars: HomeCar[] }) {
  const [featured] = cars;

  return (
    <section aria-labelledby="search-title" className="relative w-full bg-[#111] lg:bg-black">
      <div className="mx-auto grid w-full max-w-[var(--container-max)] lg:grid-cols-[366px_1fr] lg:gap-10">
        <aside className="bg-[#111] px-4 pt-14 pb-4 text-center lg:px-14 lg:pt-[100px] lg:pb-14 lg:text-left">
          <h2 id="search-title" className="font-display mx-auto text-2xl leading-[1.1] text-white lg:mx-0 lg:max-w-[200px] lg:text-[32px]">
            {title}
          </h2>
          <form action="/buy" method="get" className="mt-6 flex flex-col gap-[13px] lg:mt-20">
            <SearchSelect name="brand" label="Car brand" anyLabel="Any brand" options={brands.map((b) => ({ value: b, label: b }))} />
            <SearchSelect name="model" label="Model" anyLabel="Any Model" options={[]} />
            <SearchSelect name="budget" label="Budget" anyLabel="Any Budget" options={budgets} />
            <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50">
              Search
              <Search className="size-4" aria-hidden />
            </button>
          </form>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-2 gap-y-4 lg:flex-col lg:items-start lg:justify-start lg:gap-y-2">
            {bodyTabs.map((tab, index) => (
              <li key={tab.label}>
                <Link
                  href={tab.value ? `/buy?body=${tab.value}` : "/buy"}
                  className={cn(
                    "inline-flex h-[33px] items-center rounded-full px-4 text-sm font-medium text-[#8f9fa3] hover:text-white",
                    index === 0 && "border-2 border-[#888] bg-[#353536] text-white",
                  )}
                >
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex min-w-0 flex-col gap-[60px] bg-[#111] px-4 pt-0 pb-[235px] lg:gap-10 lg:bg-transparent lg:pt-[100px] lg:pr-14 lg:pb-[79px] lg:pl-0">
          {featured ? (
            <div className="relative hidden aspect-[978/542] min-h-[300px] overflow-hidden rounded-2xl bg-[#111] lg:block">
              {featured.image ? <Image src={featured.image} alt={featured.title} fill sizes="978px" className="object-cover" /> : null}
              <div className="absolute top-0 left-10 flex w-[199px] flex-col items-center gap-6 bg-[#111] px-6 py-[35px] text-center">
                <p className="text-xs leading-[14px] font-medium tracking-[0.1em] text-white/70 uppercase">Featured</p>
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-2xl leading-[1.2] font-semibold tracking-[-0.02em] text-white">{featured.title}</h3>
                  <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm leading-[18px] font-medium text-white">{ghs(featured.price)}</span>
                </div>
                <Link href={`/buy/${featured.slug}`} className="text-sm leading-none text-primary hover:underline">
                  View details
                </Link>
              </div>
            </div>
          ) : null}

          {cars.length > 0 ? (
            <ul className="grid gap-[60px] sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {cars.slice(0, 4).map((car, index) => (
                <li key={car.id} className={index === 0 ? "lg:hidden" : index === 3 ? "max-lg:hidden" : undefined}>
                  <CarCard car={car} />
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex items-center justify-between gap-4 max-lg:hidden">
            <div className="flex gap-2" aria-hidden>
              {[ChevronLeft, ChevronRight].map((Icon, i) => (
                <span key={i} className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-[#222] text-white">
                  <Icon className="size-4" />
                </span>
              ))}
            </div>
            <Link href="/buy" className="inline-flex h-9 items-center gap-2 rounded-full border border-white/30 px-4 text-base text-white/80 hover:text-white">
              {viewAll}
              <ArrowRight className="size-5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
      <Image src="/home/tyre-search.png" alt="" aria-hidden width={283} height={65} className="pointer-events-none absolute bottom-0.5 left-[37px] h-[65px] w-[283px]" />
    </section>
  );
}
