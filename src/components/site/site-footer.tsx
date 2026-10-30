import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/site/brand-logo";
import { Container } from "@/components/layout/container";
import { hrefForLabel } from "@/components/site/links";
import { SocialLinks } from "@/components/site/social-links";
import type { BusinessProfile } from "@/features/cms/business";
import type { Resolved, Registry } from "@/features/cms/registry";

export function SiteFooter({
  footer,
  business,
}: {
  footer: Resolved<Registry["global"]>["footer"];
  business: BusinessProfile;
}) {
  const [addressLine1, addressLine2] = splitAddress(business.address);

  return (
    <footer className="mt-auto bg-background text-white lg:min-h-[var(--footer-min-h)]">
      <Container nav className="relative pb-[var(--footer-outer-pb)] pt-[var(--footer-outer-pt)]">
        {/* Single tree: mobile 120:14542; desktop 1:2458 (tab overhang + card). */}
        <div className="relative flex w-full flex-col overflow-visible lg:mt-[122px]">
          <div className="flex h-24 w-[172px] shrink-0 items-center rounded-tl-[var(--footer-logo-tab-radius)] rounded-tr-[var(--footer-logo-tab-radius)] bg-black p-4 lg:pointer-events-none lg:absolute lg:top-[calc(-1*var(--footer-logo-overhang))] lg:left-0 lg:z-10 lg:h-[var(--footer-logo-tab-h)] lg:w-[var(--footer-logo-tab-w)] lg:justify-center lg:p-0">
            <Link href="/" aria-label="Ride Out" className="pointer-events-auto block h-16 w-[140px] lg:h-20 lg:w-[175px]">
              <span className="lg:hidden">
                <BrandLogo variant="footer-mobile" />
              </span>
              <span className="hidden lg:block">
                <BrandLogo variant="footer-desktop" />
              </span>
            </Link>
          </div>

          <div className="flex w-full flex-col gap-10 rounded-bl-[var(--footer-card-radius)] rounded-br-[var(--footer-card-radius)] rounded-tr-[var(--footer-card-radius)] bg-black px-[var(--footer-card-px)] pt-[var(--footer-card-pt)] pb-[var(--footer-card-pb)] lg:min-h-[var(--footer-card-min-h)] lg:gap-0">
            <div className="flex flex-col gap-10 lg:min-h-[438px] lg:flex-row lg:justify-between lg:gap-3">
              <div className="flex flex-col gap-10 lg:w-[605px] lg:shrink-0 lg:justify-between">
                <div className="flex flex-col gap-4 lg:w-[420px]">
                  <h2 className="type-h2 max-w-[420px] lg:type-h1">{footer.title}</h2>
                  <p className="type-body-sm max-w-[420px] leading-[1.4] text-text-subtle lg:type-body lg:leading-[1.4] lg:tracking-normal">
                    {footer.body}
                  </p>
                </div>
                <div className="flex flex-col gap-6 lg:h-10 lg:flex-row lg:items-end lg:gap-[120px]">
                  <SocialLinks business={business} size="md" />
                  <p className="type-caption text-text-subtle lg:whitespace-nowrap">{footer.copyright}</p>
                </div>
              </div>

              <div className="flex flex-col gap-10 lg:w-[615px] lg:shrink-0 lg:justify-between">
                <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-0">
                  <FooterLinkColumn title="Explore">
                    {footer.explore_links.map((label) => (
                      <FooterLink key={label} href={hrefForLabel(label)}>
                        {label}
                      </FooterLink>
                    ))}
                  </FooterLinkColumn>

                  <FooterLinkColumn title="Contact Us">
                    {business.phones.map((phone) => (
                      <p
                        key={phone}
                        className="type-body-sm leading-[1.6] text-text-subtle lg:type-body lg:tracking-[-0.01em]"
                      >
                        {phone}
                      </p>
                    ))}
                    <a
                      href={`mailto:${business.email}`}
                      className="type-body-sm leading-[1.6] text-text-subtle hover:text-white lg:type-body lg:tracking-[-0.01em]"
                    >
                      {business.email}
                    </a>
                  </FooterLinkColumn>

                  <FooterLinkColumn title="Location">
                    <p className="type-body-sm leading-[1.6] text-text-subtle lg:type-body lg:tracking-[-0.01em]">
                      {addressLine1}
                    </p>
                    {addressLine2 ? (
                      <p className="type-body-sm leading-[1.6] text-text-subtle lg:type-body lg:tracking-[-0.01em]">
                        {addressLine2}
                      </p>
                    ) : null}
                  </FooterLinkColumn>
                </div>

                <div className="flex items-end justify-between">
                  <Link
                    href="/policy"
                    className="type-body-sm leading-[1.6] text-text-subtle hover:text-white lg:type-body-sm"
                  >
                    Terms &amp; Policy
                  </Link>
                  <div className="flex flex-col items-end gap-[15px]">
                    <span className="type-caption font-semibold text-white">Languages</span>
                    <div className="flex gap-5 type-body-sm font-medium leading-[1.6]">
                      <span className="text-white">En</span>
                      <span className="text-text-subtle">Fr</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterLinkColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-body-sm leading-[1.1] text-white lg:type-body lg:tracking-[-0.01em]">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="type-body-sm leading-[1.4] text-text-subtle hover:text-white lg:type-body lg:tracking-[-0.01em]"
    >
      {children}
    </Link>
  );
}

function splitAddress(address: string): [string, string | null] {
  const commaIndex = address.indexOf(",");
  if (commaIndex === -1) return [address, null];
  const first = address.slice(0, commaIndex + 1).trim();
  const second = address.slice(commaIndex + 1).trim();
  return [first, second || null];
}
