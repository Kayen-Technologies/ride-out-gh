import Image from "next/image";

import type { BusinessProfile } from "@/features/cms/business";

export function SocialLinks({
  business,
  size = "md",
}: {
  business: BusinessProfile;
  size?: "sm" | "md";
}) {
  const icon = size === "sm" ? 32 : 40;
  const tiktokInner = size === "sm" ? 16 : 20;
  const tiktokWrap = size === "sm" ? "size-8" : "size-10";

  return (
    <div className="flex gap-2.5">
      <SocialIcon href={business.instagramUrl} src="/brand/instagram.svg" label="Instagram" width={icon} height={icon} />
      <span className={`flex ${tiktokWrap} items-center justify-center rounded-full bg-secondary`}>
        <SocialIcon href={business.tiktokUrl} src="/brand/tiktok.svg" label="TikTok" width={tiktokInner} height={tiktokInner} />
      </span>
    </div>
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
