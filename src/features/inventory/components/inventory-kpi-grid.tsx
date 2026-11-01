import type { InventoryStats } from "@/features/inventory/queries";

type InventoryKpiGridProps = {
  stats: InventoryStats;
};

export function InventoryKpiGrid({ stats }: InventoryKpiGridProps) {
  const cards = [
    { label: "Total vehicles", value: stats.total, hint: "In inventory" },
    {
      label: "Available",
      value: stats.available,
      hint: "Ready for use or listing",
    },
    { label: "For sale", value: stats.forSale, hint: "Sale listings" },
    { label: "For rent", value: stats.forRent, hint: "Rental listings" },
  ] as const;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex h-[143px] flex-col gap-[13px] rounded-xl border border-border bg-transparent p-6 text-base leading-[19px] font-normal text-foreground"
        >
          <p>{card.label}</p>
          <div className="flex flex-col gap-1">
            <p className="text-[32px] leading-[38px]">{card.value}</p>
            <p>{card.hint}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
