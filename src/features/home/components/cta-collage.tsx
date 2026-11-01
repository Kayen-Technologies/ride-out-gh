import { blurFor } from "@/features/cms/blur-data";
import { SmartImage } from "@/components/media/smart-image";
import Link from "next/link";

/** Figma 1:2417 / 120:14501: a centred call to action over a wide collage of cars. */
type Picture = { src: string; alt: string; blur?: string };

export function CtaCollage({
  title,
  body,
  button,
  image,
  imageMobile,
}: {
  title: string;
  body: string;
  button: string;
  image: Picture;
  imageMobile: Picture;
}) {
  return (
    <section
      aria-labelledby="cta-title"
      className="w-full overflow-hidden bg-[#111] pt-14 pb-4 lg:pt-[100px] lg:pb-[73px]"
    >
      <div className="mx-auto flex max-w-[629px] flex-col items-center gap-6 px-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <h2
            id="cta-title"
            className="font-display text-2xl leading-[1.1] tracking-[-0.02em] whitespace-nowrap text-white lg:text-[32px] lg:tracking-normal lg:whitespace-normal"
          >
            {title}
          </h2>
          <p className="text-sm leading-[1.4] text-white/70 lg:text-base">
            {body}
          </p>
        </div>
        <Link
          href="/buy"
          className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 lg:text-base"
        >
          {button}
        </Link>
      </div>
      <div className="mx-auto mt-7 max-w-[1920px] lg:mt-[57px]">
        <div className="relative aspect-[780/460] w-full lg:hidden">
          <SmartImage
            src={imageMobile.src}
            blurDataURL={imageMobile.blur ?? blurFor(imageMobile.src)}
            alt={imageMobile.alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="relative hidden aspect-[1440/527] w-full lg:block">
          <SmartImage
            src={image.src}
            blurDataURL={image.blur ?? blurFor(image.src)}
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
