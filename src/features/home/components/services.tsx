"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SmartImage } from "@/components/media/smart-image";
import { Container } from "@/components/layout/container";
import { cn } from "cn";

type Service = {
  title: string;
  body: string;
  cta?: string;
  href: string;
  image: string;
  alt: string;
  navLabel: string;
};

/** Figma 1:2372. A numbered list on the left follows the service that is on screen. */
export function Services({
  title,
  intro,
  services,
}: {
  title: string;
  intro: string;
  services: Service[];
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const targets = services
      .map((_, i) => document.getElementById(`service-${i + 1}`))
      .filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
        if (visible) setActive(targets.indexOf(visible.target as HTMLElement));
      },
      { rootMargin: "-30% 0px -50% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [services]);

  return (
    <section aria-labelledby="services-title" className="w-full bg-[#111]">
      <Container className="pt-14 pb-14 lg:pt-[84px] lg:pb-[190px]">
        <div className="grid gap-6 lg:grid-cols-[1fr_656px] lg:gap-16">
          <h2
            id="services-title"
            className="font-display text-2xl leading-[1.1] text-white lg:text-[32px]"
          >
            {title}
          </h2>
          <p className="text-sm leading-[1.5] text-[#a6a6a6] lg:text-base">
            {intro}
          </p>
        </div>

        <div className="mt-8 grid gap-10 lg:mt-[102px] lg:grid-cols-[1fr_656px] lg:gap-16">
          <ol className="hidden lg:sticky lg:top-24 lg:block lg:h-fit lg:pt-[10px]">
            {services.map((service, i) => (
              <li key={service.title} className="mb-[31px]">
                <a
                  href={`#service-${i + 1}`}
                  className={cn(
                    "flex gap-8 text-base leading-6 transition-colors",
                    i === active
                      ? "text-white"
                      : "text-white/30 hover:text-white/60",
                  )}
                >
                  <span className="w-5">{String(i + 1).padStart(2, "0")}</span>
                  <span>{service.navLabel}</span>
                </a>
              </li>
            ))}
          </ol>

          <div className="flex flex-col gap-[63px]">
            {services.map((service, i) => (
              <article
                key={service.title}
                id={`service-${i + 1}`}
                className="flex scroll-mt-24 flex-col gap-6 [&>a]:mt-2 lg:[&>a]:mt-4 [&>div:first-child]:max-lg:mb-1"
              >
                <div className="flex flex-col gap-2">
                  <p className="text-base leading-6 text-white/70">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display text-2xl leading-[1.1] text-white">
                    {service.title}
                  </h3>
                  <p className="text-sm leading-[1.5] text-white/70 lg:text-base lg:leading-6">
                    {service.body}
                  </p>
                </div>
                {service.image ? (
                  <div className="relative aspect-[358/372] overflow-hidden rounded-2xl lg:aspect-[656/368]">
                    <SmartImage
                      src={service.image}
                      alt={service.alt}
                      fill
                      sizes="(min-width: 1024px) 656px, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                {service.cta ? (
                  <Link
                    href={service.href}
                    className="inline-flex h-[38px] w-fit items-center rounded-full border border-white/70 px-8 text-sm font-medium lg:h-12 lg:text-base text-white hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {service.cta}
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
