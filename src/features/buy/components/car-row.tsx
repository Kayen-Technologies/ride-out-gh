import { Bookmark } from "lucide-react";
import Link from "next/link";

import { SmartImage } from "@/components/media/smart-image";
import type { BuyCar } from "@/features/buy/queries";

const ghs = (amount: number | null) =>
  amount == null ? "Price on request" : `GHS ${amount.toLocaleString("en-GH")}`;

/** One result: photo on the left, details on the right (Figma 120:16129 results). */
export function CarRow({ car }: { car: BuyCar }) {
  return (
    <article className="grid overflow-hidden rounded-lg sm:grid-cols-[237px_1fr] sm:gap-2">
      <div className="relative aspect-[237/152] overflow-hidden bg-white sm:rounded-lg">
        {car.image ? (
          <SmartImage
            src={car.image}
            alt={car.title}
            fill
            sizes="(min-width: 640px) 237px, 100vw"
            blurDataURL={car.blur ?? undefined}
            className="object-cover"
          />
        ) : null}
        <span className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-[3px] border border-[#dcdcde] bg-[#eee] text-[#111]">
          <Bookmark className="size-4" aria-hidden />
          <span className="sr-only">Save {car.title}</span>
        </span>
      </div>
      <div className="flex flex-col justify-center gap-5 bg-[#111] p-6 sm:rounded-lg sm:px-[18px] sm:py-6">
        <div className="flex flex-col gap-1">
          <p className="font-display text-xs font-light text-white/50 uppercase">
            {car.brand}
          </p>
          <h3 className="text-lg leading-6 text-white">{car.title}</h3>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="font-display inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-base font-medium text-white">
            {ghs(car.price)}
          </span>
          <Link
            href={`/buy/${car.slug}`}
            className="text-xs text-primary hover:underline focus-visible:underline"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
