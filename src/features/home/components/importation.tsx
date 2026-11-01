import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { cn } from "cn";

const desktopTiles = [
  { src: "/home/import-1.webp", alt: "Black Honda CR-V" },
  { src: "/home/import-2.webp", alt: "BMW sport motorcycle" },
  { src: "/home/import-3.webp", alt: "White Mercedes van" },
  { src: "/home/import-4.webp", alt: "Grey Toyota Corolla" },
  { src: "/home/import-5.webp", alt: "Orange pickup truck" },
  { src: "/home/import-6.webp", alt: "White DAF truck" },
] as const;

/** The mobile frame (120:14333) shows a different set of six vehicles. */
const mobileTiles = [
  { src: "/home/import-m-1.webp", alt: "Silver Toyota RAV4" },
  { src: "/home/import-m-2.webp", alt: "Red motorcycle" },
  { src: "/home/import-m-3.webp", alt: "White Mercedes van" },
  { src: "/home/import-m-4.webp", alt: "White Toyota Corolla hatchback" },
  { src: "/home/import-m-5.webp", alt: "Grey pickup truck" },
  { src: "/home/import-m-6.webp", alt: "Blue cargo truck" },
] as const;

type ImportationProps = {
  title: string;
  body: string;
  primaryCta: string;
  secondaryCta: string;
};

const buttonBase =
  "inline-flex h-[38px] items-center justify-center rounded-full px-4 text-sm font-medium focus-visible:ring-3 focus-visible:ring-ring/50 lg:h-10 lg:text-base";

/** Figma 1:2215 / 120:14333: copy and buttons, plus a framed grid of six vehicle photos. */
export function Importation({ title, body, primaryCta, secondaryCta }: ImportationProps) {
  return (
    <section aria-labelledby="import-title" className="relative w-full overflow-hidden bg-[#111]">
      <Container className="relative grid gap-11 pt-[47px] pb-[39px] lg:grid-cols-[1fr_723px] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-10 lg:py-[100px] lg:pb-[141px]">
        <div className="flex flex-col items-center gap-2 text-center lg:col-start-1 lg:row-start-1 lg:items-start lg:text-left">
          <Image src="/home/car-silhouette.svg" alt="" width={321} height={67} className="h-auto w-[245px] lg:w-[321px]" />
          <h2 id="import-title" className="font-display max-w-[334px] text-2xl leading-[1.1] text-white lg:text-[40px]">
            {title}
          </h2>
        </div>

        <div className="relative z-10 -mx-3 rounded-2xl border-2 border-[#1c1c1c] bg-black p-3 sm:mx-0 sm:p-[34px] sm:pt-[42px] sm:pb-[42px] lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <ul className="grid grid-cols-2 gap-3 lg:hidden">
            {mobileTiles.map((tile) => (
              <li key={tile.src} className="aspect-[169/105] overflow-hidden rounded-lg bg-[#111]">
                <Image src={tile.src} alt={tile.alt} width={338} height={210} sizes="45vw" className="size-full object-cover" />
              </li>
            ))}
          </ul>
          <ul className="hidden grid-cols-2 gap-6 lg:grid">
            {desktopTiles.map((tile) => (
              <li key={tile.src} className="aspect-[316/198] overflow-hidden rounded-lg bg-[#111]">
                <Image src={tile.src} alt={tile.alt} width={316} height={198} sizes="316px" className="size-full object-cover" />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-[11px] flex max-w-[421px] flex-col gap-6 lg:col-start-1 lg:row-start-2 lg:mt-0 lg:self-end">
          <p className="text-sm leading-[1.5] text-[#a6a6a6] lg:text-base">{body}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/import" className={cn(buttonBase, "bg-primary text-primary-foreground hover:bg-primary/90")}>
              {primaryCta}
            </Link>
            <Link href="/policy" className={cn(buttonBase, "border border-white text-white hover:bg-white/10")}>
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
