"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import type { BusinessProfile } from "@/features/cms/business";
import { hrefForLabel } from "@/components/site/links";

export function SiteHeader({
  items,
  business,
}: {
  items: readonly string[];
  business: BusinessProfile;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-black">
      <div className="flex items-center justify-between px-4 py-6 md:px-14 md:py-8">
        <Link href="/" aria-label="Ride Out" className="relative block h-12 w-[105px] overflow-hidden">
          <Image
            src="/brand/logo.png"
            alt=""
            width={1042}
            height={1043}
            className="absolute top-[-127.73%] left-[-33.61%] h-[352.42%] w-[161.22%] max-w-none"
          />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full bg-white/10 px-3 py-2"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((current) => !current)}
          >
            <Image src={open ? "/brand/close.svg" : "/brand/menu.svg"} alt="" width={open ? 16 : 24} height={open ? 16 : 24} />
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
          <Link href="/login" className="rounded-full bg-white/10 px-3 py-2" aria-label="Account">
            <Image src="/brand/user.svg" alt="" width={24} height={24} />
          </Link>
        </div>
      </div>
      {open ? (
        <div
          id="site-menu"
          className="ml-auto flex min-h-[calc(100vh-96px)] w-full flex-col justify-between bg-black/80 p-6 backdrop-blur-[15px] md:min-h-[858px] md:w-[819px] md:rounded-l-[40px] md:p-10"
        >
          <nav className="flex flex-col gap-[3px] text-[32px] leading-[1.1]" aria-label="Pages">
            {items.map((label) => {
              const href = hrefForLabel(label);
              const active = href === pathname;
              return (
                <Link key={label} href={href} className={active ? "text-white" : "text-white/60"} onClick={() => setOpen(false)}>
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-14 flex max-w-[557px] flex-col gap-14 text-sm tracking-[-0.14px]">
            <div className="flex items-start justify-between gap-6">
              <p className="text-white/60">Contact</p>
              <div className="flex w-[170px] flex-col gap-3 text-white">
                <a href={`mailto:${business.email}`}>{business.email}</a>
                <p>
                  {business.phones.map((phone) => (
                    <span key={phone} className="block leading-[1.4]">
                      {phone}
                    </span>
                  ))}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-6">
              <p className="text-white/60">Socials</p>
              <div className="flex w-[170px] gap-2.5">
                <SocialIcon href={business.instagramUrl} src="/brand/instagram.svg" label="Instagram" width={32} height={32} />
                <span className="flex size-8 items-center justify-center rounded-full bg-white">
                  <SocialIcon href={business.tiktokUrl} src="/brand/tiktok.svg" label="TikTok" width={16} height={16} />
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function SocialIcon({
  href,
  src,
  label,
  width,
  height,
}: {
  href: string | null;
  src: string;
  label: string;
  width: number;
  height: number;
}) {
  const image = <Image src={src} alt={label} width={width} height={height} />;
  if (!href) return image;
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {image}
    </a>
  );
}
