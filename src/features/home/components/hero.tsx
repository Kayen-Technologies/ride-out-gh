import { getImageProps } from "next/image";

/**
 * Figma 4:402 (desktop) and 120:12594 (mobile). The design uses a looping video behind the title, with a
 * different frame on mobile; until the video is supplied this is the still frame for each size with a slow
 * drift (see `animate-hero-drift`). A 30% black overlay sits on top, as designed.
 */
export function Hero({ title, subtitle }: { title: string; subtitle: string }) {
  const common = { alt: "", fill: true, sizes: "100vw", priority: true } as const;
  const { props: desktop } = getImageProps({ ...common, src: "/home/hero.webp" });
  const { props: mobile } = getImageProps({ ...common, src: "/home/hero-mobile.webp" });

  return (
    <section
      aria-label="Welcome"
      className="relative isolate flex h-[689px] w-full items-end overflow-hidden bg-[#111] lg:h-[742px]"
    >
      <picture className="animate-hero-drift absolute inset-0 -z-10 block">
        <source media="(min-width: 1024px)" srcSet={desktop.srcSet} sizes="100vw" />
        <img {...mobile} alt="" className="size-full object-cover" />
      </picture>
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/30" />
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--gutter)] pb-14 lg:pb-[100px]">
        <div className="flex max-w-[511px] flex-col gap-2">
          <h1 className="font-display text-[40px] leading-none text-white lg:text-[56px]">{title}</h1>
          <p className="text-sm leading-[1.4] text-white lg:text-base">{subtitle}</p>
        </div>
      </div>
    </section>
  );
}
