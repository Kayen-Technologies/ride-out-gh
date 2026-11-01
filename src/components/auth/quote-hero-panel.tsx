import Image from "next/image";

// Photo panel with a quote card (Figma 120:9769 forgot password, 120:9787 reset password).
// 652 x 739, quote card 606 x 148 with no avatar or arrows. The photo files are Figma exports,
// already cropped to the panel.
export function QuoteHeroPanel({
  src,
  quote,
  byline = "~The Ride Out Experience",
}: {
  src: string;
  quote: string;
  byline?: string;
}) {
  return (
    <div className="relative h-[min(739px,calc(100vh-7rem))] w-full max-w-[652px] overflow-hidden rounded-xl bg-white">
      <Image
        src={src}
        alt=""
        width={1304}
        height={1478}
        sizes="652px"
        className="absolute inset-0 size-full object-cover"
        priority
      />
      <div className="absolute inset-x-0 bottom-[21px] flex justify-center px-[23px]">
        <div className="flex w-full max-w-[606px] flex-col gap-8 rounded-xl bg-white/51 p-6 backdrop-blur-[23.5px]">
          <p className="text-base leading-normal tracking-[-0.48px] text-[#111111]/70">{quote}</p>
          <p className="text-sm leading-5 font-semibold tracking-[-0.02px] text-[#111111]/70">{byline}</p>
        </div>
      </div>
    </div>
  );
}
