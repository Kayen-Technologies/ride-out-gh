import Image from "next/image";
import Link from "next/link";

import { SmartImage } from "@/components/media/smart-image";
import { Container } from "@/components/layout/container";
import { cn } from "cn";

type Tile = {
  title: string;
  image?: { src: string; alt: string };
  image_mobile?: { src: string; alt: string };
};

type ImportationProps = {
  title: string;
  body: string;
  primaryCta: string;
  secondaryCta: string;
  tiles: readonly Tile[];
};

const buttonBase =
  "inline-flex h-[38px] items-center justify-center rounded-full px-4 text-sm font-medium focus-visible:ring-3 focus-visible:ring-ring/50 lg:h-10 lg:text-base";

/** Figma 1:2215 / 120:14333: copy and buttons, plus a framed grid of six vehicle photos. */
export function Importation({
  title,
  body,
  primaryCta,
  secondaryCta,
  tiles,
}: ImportationProps) {
  return (
    <section
      aria-labelledby="import-title"
      className="relative w-full overflow-hidden bg-[#111]"
    >
      <Container className="relative grid gap-11 pt-[47px] pb-[39px] lg:grid-cols-[1fr_723px] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-10 lg:py-[100px] lg:pb-[141px]">
        <div className="flex flex-col items-center gap-2 text-center lg:col-start-1 lg:row-start-1 lg:items-start lg:text-left">
          <Image
            src="/home/car-silhouette.svg"
            alt=""
            width={321}
            height={67}
            className="h-auto w-[245px] lg:w-[321px]"
          />
          <h2
            id="import-title"
            className="font-display max-w-[334px] text-2xl leading-[1.1] text-white lg:text-[40px]"
          >
            {title}
          </h2>
        </div>

        <div className="relative z-10 -mx-3 rounded-2xl border-2 border-[#1c1c1c] bg-black p-3 sm:mx-0 sm:p-[34px] sm:pt-[42px] sm:pb-[42px] lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <ul className="grid grid-cols-2 gap-3 lg:hidden">
            {tiles.slice(0, 6).map((tile) => {
              const picture = tile.image_mobile?.src
                ? tile.image_mobile
                : tile.image;
              return picture?.src ? (
                <li
                  key={`m-${tile.title}`}
                  className="relative aspect-[169/105] overflow-hidden rounded-lg bg-[#111]"
                >
                  <SmartImage
                    src={picture.src}
                    alt={picture.alt || tile.title}
                    fill
                    sizes="45vw"
                    className="object-cover"
                  />
                </li>
              ) : null;
            })}
          </ul>
          <ul className="hidden grid-cols-2 gap-6 lg:grid">
            {tiles.slice(0, 6).map((tile) =>
              tile.image?.src ? (
                <li
                  key={`d-${tile.title}`}
                  className="relative aspect-[316/198] overflow-hidden rounded-lg bg-[#111]"
                >
                  <SmartImage
                    src={tile.image.src}
                    alt={tile.image.alt || tile.title}
                    fill
                    sizes="316px"
                    className="object-cover"
                  />
                </li>
              ) : null,
            )}
          </ul>
        </div>

        <div className="mt-[11px] flex max-w-[421px] flex-col gap-6 lg:col-start-1 lg:row-start-2 lg:mt-0 lg:self-end">
          <p className="text-sm leading-[1.5] text-[#a6a6a6] lg:text-base">
            {body}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/import"
              className={cn(
                buttonBase,
                "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {primaryCta}
            </Link>
            <Link
              href="/policy"
              className={cn(
                buttonBase,
                "border border-white text-white hover:bg-white/10",
              )}
            >
              {secondaryCta}
            </Link>
          </div>
        </div>
      </Container>
      <Image
        src="/home/tyre-import.png"
        alt=""
        aria-hidden
        width={188}
        height={53}
        className="pointer-events-none absolute top-[568px] right-[26px] h-[35px] w-[125px] lg:top-auto lg:right-[76px] lg:bottom-[99px] lg:h-[53px] lg:w-[188px]"
      />
    </section>
  );
}
