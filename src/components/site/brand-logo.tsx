import Image from "next/image";

const variants = {
  header: {
    src: "/brand/logo-header.png",
    src2x: "/brand/logo-header@2x.png",
    width: 105,
    height: 48,
  },
  "footer-desktop": {
    src: "/brand/logo-footer-desktop.png",
    src2x: "/brand/logo-footer-desktop@2x.png",
    width: 175,
    height: 80,
  },
  "footer-mobile": {
    src: "/brand/logo-footer-mobile.png",
    src2x: "/brand/logo-footer-mobile@2x.png",
    width: 140,
    height: 64,
  },
} as const;

export function BrandLogo({ variant }: { variant: keyof typeof variants }) {
  const { src, width, height } = variants[variant];
  return (
    <Image
      src={src}
      alt=""
      width={width}
      height={height}
      className="block h-auto w-full max-w-none"
      unoptimized
    />
  );
}
