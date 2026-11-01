import { cn } from "cn";

/**
 * Determinate progress drawn as a road: the filled stretch is yellow and the car rides
 * its front edge. Built for multi-step uploads such as the Sell form's photos.
 */
export function RouteProgress({
  label,
  value,
  max,
  hint,
  className,
}: {
  label: string;
  value: number;
  max: number;
  hint?: string;
  className?: string;
}) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-lg font-extrabold tracking-[-0.02em]">{label}</span>
        <span className="font-mono text-[13px] text-text-70">
          {value} of {max}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value} of ${max}`}
        className="relative flex h-7 items-center"
      >
        <div className="absolute inset-x-0 h-1 rounded-full bg-[repeating-linear-gradient(90deg,rgb(255_255_255/25%)_0_10px,transparent_10px_18px)]" />
        <div
          className="absolute left-0 flex h-1 items-center justify-end rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        >
          <svg
            viewBox="0 0 200 100"
            aria-hidden
            className="-mt-[18px] -mr-[22px] block h-[22px] w-11 shrink-0"
          >
            <g className="ro-bob">
              <path
                d="M20 72 L20 60 L34 55 L62 51 L80 37 L122 37 L142 51 L168 54 L180 60 L180 72 L120 72 L80 72 Z"
                className="fill-primary stroke-primary"
                strokeWidth="8"
                strokeLinejoin="round"
              />
              <path d="M74 51 L85 41 L118 41 L133 51 Z" fill="#1c1c1c" />
            </g>
            <circle cx="56" cy="78" r="13" fill="#1c1c1c" className="stroke-primary" strokeWidth="6" />
            <circle cx="146" cy="78" r="13" fill="#1c1c1c" className="stroke-primary" strokeWidth="6" />
          </svg>
        </div>
        <span className="absolute -right-0.5 box-border size-3 rounded-full border-2 border-input-border bg-card" />
      </div>
      {hint ? <span className="text-[13px] text-muted-foreground">{hint}</span> : null}
    </div>
  );
}
