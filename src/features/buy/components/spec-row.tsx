/** One label and value line in a "Features & Specs" card, shared by the buy and rent car pages. */
export function SpecRow({ label, value, dot }: { label: string; value: string; dot?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#e8e8e8] py-[23.5px] text-sm leading-none last:border-0 lg:py-4 lg:leading-5">
      <dt className="font-medium text-[#4f4d55] lg:font-normal lg:text-[#555]">{label}</dt>
      <dd className="flex items-center gap-2 font-semibold text-[#1e1e1e] lg:font-medium lg:text-[#111]">
        {dot ? <span aria-hidden className="size-3.5 rounded-full lg:size-3" style={{ background: dot }} /> : null}
        {value}
      </dd>
    </div>
  );
}

export const colourDot: Record<string, string> = {
  red: "#e12121",
  blue: "#1751d0",
  green: "#019939",
  black: "#111",
  white: "#fff",
  silver: "#c0c4c8",
  grey: "#888",
  gray: "#888",
};
