import { BrandsStrip } from "@/features/home/components/brands-strip";
import { CarsSearch } from "@/features/home/components/cars-search";
import { CtaCollage } from "@/features/home/components/cta-collage";
import { Hero } from "@/features/home/components/hero";
import { Importation } from "@/features/home/components/importation";
import { Services } from "@/features/home/components/services";
import { getHomeBrands, getHomeCars } from "@/features/home/queries";
import { getPageContent } from "@/features/cms/content";

const serviceLinks = ["/import", "/sell", "/rent"] as const;

export default async function Home() {
  const [content, cars, brands] = await Promise.all([getPageContent("home"), getHomeCars(4), getHomeBrands()]);

  const services = (content.services.items as readonly { title: string; body?: string; cta?: string; image?: { src: string; alt: string } }[]).map((item, i) => ({
    title: item.title,
    body: item.body ?? "",
    cta: item.cta,
    href: serviceLinks[i] ?? "/buy",
    image: item.image?.src ?? "",
    alt: item.image?.alt ?? item.title,
    navLabel: item.title,
  }));

  return (
    <>
      <Hero title={content.hero.title} subtitle={content.hero.subtitle} image={content.hero.image} imageMobile={content.hero.image_mobile} video={content.hero.video} />
      <BrandsStrip logos={content.brands.logos} />
      <Importation
        title={content.import.title}
        body={content.import.body}
        primaryCta={content.import.primary_cta}
        secondaryCta={content.import.secondary_cta}
        tiles={content.import.tiles}
      />
      <CarsSearch title={content.search.title} viewAll={content.search.view_all_cta} brands={brands} cars={cars} />
      <Services title={content.services.title} intro={content.services.body} services={services} />
      <CtaCollage title={content.cta.title} body={content.cta.body} button={content.cta.button} image={content.cta.image} imageMobile={content.cta.image_mobile} />
    </>
  );
}
