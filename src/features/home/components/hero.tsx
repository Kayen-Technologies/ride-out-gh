import { getImageProps } from "next/image";

import { HeroVideo } from "@/features/home/components/hero-video";

/**
 * Figma 4:402 (desktop) and 120:12594 (mobile). Staff can set a looping video in the admin; without one
 * this shows the still frame for each size with a slow drift (see `animate-hero-drift`). A 30% black overlay
 * sits on top, as designed.
 */
type HeroProps = {
  title: string;
  subtitle: string;
  image: { src: string; alt: string; blur?: string };
  imageMobile: { src: string; alt: string; blur?: string };
  video: { src: string; poster: string };
};

export function Hero({
  title,
  subtitle,
  image,
  imageMobile,
  video,
}: HeroProps) {
  const common = {
    alt: "",
    fill: true,
    sizes: "100vw",
    preload: true,
  } as const;
  const { props: desktop } = getImageProps({ ...common, src: image.src });
  const { props: mobile } = getImageProps({ ...common, src: imageMobile.src });

  return (
    <section
      aria-label="Welcome"
      className="relative isolate flex h-[689px] w-full items-end overflow-hidden bg-[#111] lg:h-[742px]"
    >
      <picture className="animate-hero-drift absolute inset-0 -z-10 block">
        <source
          media="(min-width: 1024px)"
          srcSet={desktop.srcSet}
          sizes="100vw"
        />
        <img {...mobile} alt="" className="size-full object-cover" />
      </picture>
      {video.src ? (
        <HeroVideo src={video.src} poster={video.poster || image.src} />
      ) : null}
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/30" />
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--gutter)] pb-14 lg:pb-[100px]">
        <div className="flex max-w-[511px] flex-col gap-2">
          <h1 className="font-display text-[40px] leading-none text-white lg:text-[56px]">
            {title}
          </h1>
          <p className="text-sm leading-[1.4] text-white lg:text-base">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
