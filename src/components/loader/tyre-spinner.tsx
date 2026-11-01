import Image from "next/image";
import { cn } from "cn";

/**
 * The tyre arc from the Ride Out logo, spinning. Decorative: pair it with visible text
 * (a button label, a toast) or pass `label` when it stands alone.
 * `tone="dark"` turns it solid black so it reads on the yellow primary button.
 */
export function TyreSpinner({
  size = 20,
  tone = "brand",
  label,
  className,
}: {
  size?: number;
  tone?: "brand" | "dark";
  label?: string;
  className?: string;
}) {
  return (
    <Image
      src="/brand/tyre-spinner.png"
      alt={label ?? ""}
      role={label ? "status" : undefined}
      width={size}
      height={size}
      unoptimized
      className={cn(
        "ro-tyre shrink-0 object-contain",
        tone === "dark" && "brightness-0",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
