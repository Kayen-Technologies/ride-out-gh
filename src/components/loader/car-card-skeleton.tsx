import { cn } from "cn";

/** Placeholder for a car listing card while results load: photo, title lines and price pill. */
export function CarCardSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex gap-3.5", className)}>
      <div className="ro-shimmer aspect-[4/3] w-[150px] shrink-0 rounded-xl" />
      <div className="flex flex-1 flex-col gap-2.5 pt-1">
        <div className="ro-shimmer h-4 w-[85%] rounded-md" />
        <div className="ro-shimmer h-3 w-[60%] rounded-md" />
        <div className="ro-shimmer h-3 w-[70%] rounded-md" />
        <div className="ro-shimmer mt-auto h-8 w-[110px] rounded-full" />
      </div>
    </div>
  );
}
