"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

import { BrandLogo } from "@/components/site/brand-logo";
import { Container } from "@/components/layout/container";
import { SiteMenuOverlay } from "@/components/site/site-menu-overlay";
import type { BusinessProfile } from "@/features/cms/business";

export function SiteHeader({
  items,
  business,
}: {
  items: readonly string[];
  business: BusinessProfile;
}) {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <>
      <header className="relative z-50 bg-black">
        <Container nav className="flex h-[var(--header-h)] items-center justify-between">
          <Link href="/" aria-label="Ride Out" className="block h-12 w-[105px] shrink-0">
            <BrandLogo variant="header" />
          </Link>
          <div
            className={open ? "pointer-events-none invisible flex items-center gap-2" : "flex items-center gap-2"}
            aria-hidden={open}
          >
            <button
              ref={menuButtonRef}
              type="button"
              className="inline-flex h-10 w-12 items-center justify-center rounded-full bg-border-subtle px-3 py-2"
              aria-expanded={open}
              aria-controls="site-menu-overlay"
              onClick={() => setOpen(true)}
            >
              <Image src="/brand/menu.svg" alt="" width={24} height={24} />
              <span className="sr-only">Open menu</span>
            </button>
            <Link
              href="/login"
              className="inline-flex h-10 w-12 items-center justify-center rounded-full bg-border-subtle px-3 py-2"
              aria-label="Account"
            >
              <Image src="/brand/user.svg" alt="" width={24} height={24} />
            </Link>
          </div>
        </Container>
      </header>
      <SiteMenuOverlay
        open={open}
        onClose={() => setOpen(false)}
        menuButtonRef={menuButtonRef}
        items={items}
        business={business}
      />
    </>
  );
}
