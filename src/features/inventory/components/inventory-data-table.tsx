"use client";

import { flexRender } from "@tanstack/react-table";
import {
  getCoreRowModel,
  legacyCreateColumnHelper,
  useLegacyTable,
} from "@tanstack/react-table/legacy";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { InventoryRowActions } from "@/features/inventory/components/row-actions";
import type { InventoryVehicle } from "@/features/inventory/queries";
import { formatVehicleRentPrice, formatVehicleSalePrice } from "@/lib/format";
import { availabilityLabel, listingPurposeLabel } from "@/lib/status";

const columnHelper = legacyCreateColumnHelper<InventoryVehicle>();

function vehicleTitle(row: InventoryVehicle) {
  return `${row.year} ${row.brand} ${row.model}`;
}

function priceLabel(row: InventoryVehicle) {
  if (row.listing_purpose === "rent" && row.rental_daily_rate != null) {
    return formatVehicleRentPrice(Number(row.rental_daily_rate));
  }
  if (row.sale_price != null) {
    return formatVehicleSalePrice(Number(row.sale_price));
  }
  return "—";
}

export function InventoryDataTable({ rows }: { rows: InventoryVehicle[] }) {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "vehicle",
        cell: ({ row }) => {
          const vehicle = row.original;
          return (
            <>
              <ChevronRight
                className="absolute top-6 right-6 size-6 text-foreground lg:hidden"
                strokeWidth={1.33}
                aria-hidden
              />
              <div className="flex flex-col gap-6 pr-8 lg:grid lg:grid-cols-[minmax(0,1fr)_151px] lg:gap-6 lg:pr-0">
                <div className="flex w-full max-w-[293px] flex-col gap-6 lg:max-w-none">
                  <div className="flex h-12 items-start gap-4">
                    <Image
                      src="/brand/icons/inventory-car.svg"
                      alt=""
                      width={24}
                      height={24}
                      className="size-6 shrink-0"
                    />
                    <div className="min-w-0 flex flex-col gap-1">
                      <p className="text-base font-semibold leading-6 text-foreground">
                        {vehicleTitle(vehicle)}
                      </p>
                      <p className="text-base leading-6 text-foreground/70">
                        {vehicle.seller_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex h-[38px] items-center rounded-full border border-primary bg-black/20 px-4 text-sm font-semibold text-foreground">
                      {listingPurposeLabel(vehicle.listing_purpose)}
                    </span>
                    <span className="inline-flex h-9 items-center rounded-full bg-black/20 px-4 text-sm font-semibold text-foreground">
                      {availabilityLabel(vehicle.availability_status)}
                    </span>
                  </div>
                </div>
                <div className="relative flex w-full flex-col items-start gap-4 lg:h-[110px] lg:w-[151px] lg:items-end lg:py-1 lg:pl-3">
                  <ChevronRight
                    className="hidden size-6 shrink-0 text-foreground lg:absolute lg:top-1 lg:right-0 lg:block"
                    strokeWidth={1.33}
                    aria-hidden
                  />
                  <p className="text-xl font-medium leading-6 text-foreground lg:absolute lg:right-0 lg:bottom-1">
                    {priceLabel(vehicle)}
                  </p>
                </div>
              </div>
            </>
          );
        },
      }),
    ],
    [],
  );

  const table = useLegacyTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-6">
      {table.getRowModel().rows.map((row) => (
        <div
          key={row.original.id}
          className="group relative min-h-[158px] rounded-xl bg-white/10 px-6 py-6 transition-colors hover:bg-white/[0.14] sm:px-8"
        >
          {/* The whole row opens the vehicle; the edit and delete buttons sit above this link. */}
          <Link
            href={`/admin/inventory/${row.original.id}`}
            aria-label={`Open ${vehicleTitle(row.original)}`}
            className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="pointer-events-none relative">
            {flexRender(
              row.getVisibleCells()[0].column.columnDef.cell,
              row.getVisibleCells()[0].getContext(),
            )}
          </div>
          <InventoryRowActions id={row.original.id} title={vehicleTitle(row.original)} />
        </div>
      ))}
    </div>
  );
}
