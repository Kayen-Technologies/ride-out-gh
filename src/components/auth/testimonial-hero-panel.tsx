import Image from "next/image";
import { ChevronLeft } from "lucide-react";

// Photo panel with a testimonial card: avatar, name, role and two arrows (Figma 120:9731 login, 120:9659 sign up).
// TODO: the arrows stay disabled until there is more than one testimonial (CMS list).
export function TestimonialHeroPanel({
  imageSrc,
  imageWidth,
  imageHeight,
  imageClassName = "absolute inset-0 size-full object-cover",
  quote,
  name,
  role,
  avatarSrc,
  avatarSize,
}: {
  imageSrc: string;
  imageWidth: number;
  imageHeight: number;
  imageClassName?: string;
  quote: string;
  name: string;
  role: string;
  avatarSrc: string;
  avatarSize: number;
}) {
  return (
    <div className="relative h-[min(739px,calc(100vh-7rem))] w-full max-w-[652px] overflow-hidden rounded-xl bg-white">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={imageSrc}
          alt=""
          width={imageWidth}
          height={imageHeight}
          sizes="652px"
          className={imageClassName}
          priority
        />
      </div>
      <div className="absolute inset-x-0 bottom-[21px] flex justify-center px-[23px]">
        <div className="flex w-full max-w-[606px] flex-col gap-8 rounded-xl bg-white/51 p-6 backdrop-blur-[23.5px]">
          <p className="text-base leading-normal tracking-[-0.48px] text-[#111111]/70">{quote}</p>
          <div className="flex h-10 items-center gap-3">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
              <Image src={avatarSrc} alt="" width={avatarSize} height={avatarSize} className="size-full object-cover" />
            </div>
            <div className="min-w-0 flex-1 text-sm leading-5 text-[#111111]/70">
              <p className="font-semibold tracking-[-0.02px]">{name}</p>
              <p className="font-normal tracking-[-0.05px]">{role}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-[#222222]/70 p-2"
                aria-label="Previous testimonial"
                disabled
              >
                <ChevronLeft className="size-4 text-white" aria-hidden />
              </button>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-[#222222]/70 p-2"
                aria-label="Next testimonial"
                disabled
              >
                <ChevronLeft className="size-4 rotate-180 text-white" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
