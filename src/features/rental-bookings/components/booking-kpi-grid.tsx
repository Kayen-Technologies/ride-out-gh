import type { BookingStats } from "@/features/rental-bookings/queries";

const pad = (n: number) => String(n).padStart(2, "0");

/** Figma 120:6127: four counters. */
export function BookingKpiGrid({ stats }: { stats: BookingStats }) {
  const cards = [
    { label: "New enquiries", value: stats.new, hint: "Need review" },
    { label: "Upcoming", value: stats.upcoming, hint: "Confirmed bookings" },
    { label: "Active rentals", value: stats.active, hint: "Vehicles out" },
    { label: "Past bookings", value: stats.past, hint: "Closed records" },
  ];
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex h-[143px] flex-col gap-[13px] rounded-xl border border-border bg-transparent p-6 text-base leading-[19px] font-normal text-foreground"
        >
          <p>{card.label}</p>
          <div className="flex flex-col gap-1">
            <p className="text-[32px] leading-[38px]">{pad(card.value)}</p>
            <p>{card.hint}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
