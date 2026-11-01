import { cn } from "cn";

export const WIZARD_STEPS = ["Basic Info", "Details", "Images & Features", "Review"] as const;

/**
 * Four-step progress track from Figma (120:1589): a 2 px line through 24 px markers, yellow up to the
 * current step. Labels hang under their marker so the first and last sit flush with the form edges.
 */
export function WizardStepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="flex h-14 items-start pl-[21px] pr-3 sm:pl-[21px]" aria-label="Progress">
      {WIZARD_STEPS.map((label, index) => {
        const step = index + 1;
        const reached = step <= current;
        return (
          <li
            key={label}
            aria-current={step === current ? "step" : undefined}
            className={cn("flex items-start", index < WIZARD_STEPS.length - 1 && "flex-1")}
          >
            <span className="relative block size-6 shrink-0">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border-4",
                  reached ? "border-primary/30 bg-primary" : "border-white/20 bg-white",
                )}
              >
                <span className={cn("size-2 rounded-full", reached ? "bg-white" : "bg-[#9a9a9a]")} />
              </span>
              <span
                className={cn(
                  "absolute top-9 left-1/2 -translate-x-1/2 text-sm leading-5 font-medium whitespace-nowrap",
                  reached ? "text-primary" : "text-foreground",
                  "max-sm:hidden",
                  step === current && "max-sm:block",
                )}
              >
                {label}
              </span>
            </span>
            {index < WIZARD_STEPS.length - 1 ? (
              <span
                aria-hidden
                className={cn("mt-[11px] h-0.5 flex-1", step < current ? "bg-primary" : "bg-white")}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
