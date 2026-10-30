import Link from "next/link";

import { hrefForLabel } from "@/components/site/links";
import type { BusinessProfile } from "@/features/cms/business";
import type { Resolved, Registry } from "@/features/cms/registry";

export function SiteFooter({
  footer,
  business,
}: {
  footer: Resolved<Registry["global"]>["footer"];
  business: BusinessProfile;
}) {
  return (
    <footer className="mt-auto bg-black px-4 py-10 text-white md:px-14">
      <div className="flex flex-col gap-8 md:flex-row md:justify-between">
        <div className="max-w-md">
          <p className="text-2xl leading-tight">{footer.title}</p>
          <p className="mt-3 text-sm leading-6 text-white/60">{footer.body}</p>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-white/60">Explore</p>
          {footer.explore_links.map((label) => (
            <Link key={label} href={hrefForLabel(label)}>
              {label}
            </Link>
          ))}
        </div>
        <div className="max-w-xs text-sm">
          <p>{business.address}</p>
          <a className="mt-2 block" href={`mailto:${business.email}`}>
            {business.email}
          </a>
        </div>
      </div>
      <p className="mt-10 text-sm text-white/60">{footer.copyright}</p>
    </footer>
  );
}
