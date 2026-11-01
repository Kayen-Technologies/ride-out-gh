import Image from "next/image";

import { Container } from "@/components/layout/container";

type Logo = { title: string; image?: { src: string; alt: string } };

/** Figma 1:491: seven grey marks, 80 px square, spread across the container. */
export function BrandsStrip({ logos }: { logos: readonly Logo[] }) {
  return (
    <section aria-label="Brands we work with" className="w-full bg-[#111]">
      <Container className="py-4 lg:py-14">
        <ul className="flex items-center justify-between gap-6 overflow-x-auto max-lg:gap-8 max-lg:[scrollbar-width:none]">
          {logos
            .filter((logo) => logo.image?.src)
            .map((logo) => (
              <li key={`${logo.title}-${logo.image!.src}`} className="shrink-0">
                <Image
                  src={logo.image!.src}
                  alt={logo.image!.alt || logo.title}
                  width={80}
                  height={80}
                  className="size-14 object-contain lg:size-20"
                />
              </li>
            ))}
        </ul>
      </Container>
    </section>
  );
}
