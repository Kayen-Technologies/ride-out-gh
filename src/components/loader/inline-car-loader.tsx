import { cn } from "cn";

import { RideOutCar } from "./ride-out-car";

/** Small car-on-the-road loader for panels, tables and empty areas while data loads. */
export function InlineCarLoader({
  label = "Loading",
  hint,
  className,
}: {
  label?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      data-ro-loader
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center justify-center gap-3 py-6", className)}
    >
      <svg viewBox="0 0 200 100" aria-hidden className="block h-auto w-[150px]">
        <RideOutCar />
        <path
          d="M0 96 H200"
          className="ro-dash stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
      <span className="text-base font-extrabold tracking-[-0.02em]">{label}</span>
      {hint ? <span className="font-mono text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}
