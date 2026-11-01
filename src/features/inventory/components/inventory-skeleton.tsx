/** First-load placeholder for the inventory page, using the Ride Out loader kit shimmer. */
export function InventoryPageSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-hidden data-page-pending>
      <div className="flex items-center justify-between gap-4">
        <div className="ro-shimmer h-5 w-72 max-w-full rounded-md" />
        <div className="ro-shimmer h-12 w-[158px] rounded-full" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="ro-shimmer h-[143px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="ro-shimmer h-10 rounded-full" />
        <div className="ro-shimmer h-10 rounded-full" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="h-20 bg-white/10" />
        <div className="flex flex-col gap-6 px-6 pt-6 pb-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="ro-shimmer h-[158px] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
