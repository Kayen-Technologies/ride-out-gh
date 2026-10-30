import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getBusinessProfile } from "@/features/cms/business";
import { getPageContent } from "@/features/cms/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [content, business] = await Promise.all([getPageContent("global"), getBusinessProfile()]);

  return (
    <>
      <SiteHeader items={content.menu.items} business={business} />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter footer={content.footer} business={business} />
    </>
  );
}
