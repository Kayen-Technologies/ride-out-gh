import Image from "next/image";

import { Container } from "@/components/layout/container";

const brands = [
  { name: "McLaren", file: "mclaren" },
  { name: "Honda", file: "honda" },
  { name: "Tesla", file: "tesla" },
  { name: "Mercedes-Benz", file: "mercedes" },
  { name: "BMW", file: "bmw" },
  { name: "Toyota", file: "toyota" },
  { name: "Audi", file: "audi" },
] as const;

/** Figma 1:491: seven grey marks, 80 px square, spread across the container. */
export function BrandsStrip() {
  return (
    <section aria-label="Brands we work with" className="w-full bg-[#111]">
      <Container className="py-4 lg:py-14">
        <ul className="flex items-center justify-between gap-6 overflow-x-auto max-lg:gap-8 max-lg:[scrollbar-width:none]">
          {brands.map((brand) => (
            <li key={brand.file} className="shrink-0">
              <Image src={`/home/brands/${brand.file}.png`} alt={brand.name} width={80} height={80} className="size-14 object-contain lg:size-20" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
