import { Bookmark } from "lucide-react";
import Link from "next/link";

import { SmartImage } from "@/components/media/smart-image";
import type { BuyCar } from "@/features/buy/queries";

const ghs = (amount: number | null) =>
  amount == null ? "Price on request" : `GHS ${amount.toLocaleString("en-GH")}`;

/**
 * One result. Desktop (Figma 120:16129): photo on the left, details in a dark panel on the right.
 * Mobile (Figma 120:16313): the photo, then centred details directly on the page.
 */
export function CarRow({
  car,
  priority = false,
  href = `/buy/${car.slug}`,
  priceSuffix = "",
}: {
  car: BuyCar;
  priority?: boolean;
  /** Where "View details" goes. Defaults to the car's page under /buy. */
  href?: string;
  /** Shown after the price, for example "/day" on rentals. */
  priceSuffix?: string;
}) {
  return (
    <article className="mx-auto grid w-full max-w-[352px] gap-3 sm:max-w-none sm:grid-cols-[237px_1fr] sm:gap-2">
      <div className="relative aspect-[352/264] overflow-hidden rounded-lg bg-white sm:aspect-[237/152]">
        {car.image ? (
          <SmartImage
            src={car.image}
            preload={priority}
            alt={car.title}
            fill
            sizes="(min-width: 640px) 237px, 352px"
            blurDataURL={car.blur ?? undefined}
            className="object-cover"
          />
        ) : null}
        <span className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-[3px] border border-[#dcdcde] bg-[#eee] text-[#111] sm:size-7">
          <Bookmark className="size-4" aria-hidden />
          <span className="sr-only">Save {car.title}</span>
        </span>
      </div>
      <div className="flex flex-col items-center gap-2 py-6 text-center sm:justify-center sm:gap-5 sm:py-6 sm:rounded-lg sm:bg-[#111] sm:px-[18px] sm:py-6 sm:text-left">
        <div className="flex flex-col items-center gap-2 sm:items-start sm:gap-1">
          <p className="font-display text-sm leading-none font-light text-white/50 uppercase sm:text-xs">
            {car.brand}
          </p>
          <h3 className="text-lg leading-none text-[#eaeaea] sm:leading-6 sm:text-white">
            {car.title}
          </h3>
        </div>
        <div className="flex flex-col items-center gap-6 sm:w-full sm:flex-row sm:justify-between sm:gap-4">
          <span className="font-display inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-base leading-6 font-medium text-white sm:py-1.5">
            {ghs(car.price)}
            {car.price == null ? null : priceSuffix}
          </span>
          <Link
            href={href}
            className="text-[13px] leading-none text-primary hover:underline focus-visible:underline sm:text-xs"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
