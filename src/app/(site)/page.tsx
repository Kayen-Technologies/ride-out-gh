import { BrandsStrip } from "@/features/home/components/brands-strip";
import { CarsSearch } from "@/features/home/components/cars-search";
import { CtaCollage } from "@/features/home/components/cta-collage";
import { Hero } from "@/features/home/components/hero";
import { Importation } from "@/features/home/components/importation";
import { Services } from "@/features/home/components/services";
import { getHomeBrands, getHomeCars } from "@/features/home/queries";
import { getPageContent } from "@/features/cms/content";

const serviceMedia = [
  { href: "/import", image: "/home/service-1.webp", alt: "Container ship being unloaded at a port", navLabel: "Buy Through Copart" },
  { href: "/sell", image: "/home/service-2.webp", alt: "A hand holding out a car key", navLabel: "Sell your car" },
  { href: "/rent", image: "/home/service-3.webp", alt: "A row of rental cars", navLabel: "Rent a car" },
] as const;

export default async function Home() {
  const [content, cars, brands] = await Promise.all([getPageContent("home"), getHomeCars(4), getHomeBrands()]);

  const services = (content.services.items as readonly { title: string; body?: string; cta?: string }[]).map((item, i) => ({
    title: item.title,
    body: item.body ?? "",
    cta: item.cta ?? (i === 1 ? "Sell your car" : undefined),
    ...serviceMedia[i],
  }));

  return (
    <>
      <Hero title={content.hero.title} subtitle={content.hero.subtitle} />
      <BrandsStrip />
      <Importation
        title={content.import.title}
        body={content.import.body}
        primaryCta={content.import.primary_cta}
        secondaryCta={content.import.secondary_cta}
      />
      <CarsSearch title={content.search.title} viewAll={content.search.view_all_cta} brands={brands} cars={cars} />
      <Services title={content.services.title} intro={content.services.body} services={services} />
      <CtaCollage title={content.cta.title} body={content.cta.body} button={content.cta.button} />
    </>
  );
}
