"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DeleteVehicleDialog } from "@/features/inventory/components/detail/delete-vehicle-dialog";

const iconButton =
  "flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

/** Edit and delete shortcuts on a list row, so a vehicle can be changed without opening it first. */
export function InventoryRowActions({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <div className="absolute top-[18px] right-14 z-10 flex items-center gap-1 sm:right-16 lg:top-[22px]">
        <Link href={`/admin/inventory/${id}/edit`} aria-label={`Edit ${title}`} title="Edit" className={iconButton}>
          <Pencil className="size-[18px]" aria-hidden />
        </Link>
        <button
          type="button"
          aria-label={`Delete ${title}`}
          title="Delete"
          onClick={() => setConfirming(true)}
          className={`${iconButton} hover:text-destructive`}
        >
          <Trash2 className="size-[18px]" aria-hidden />
        </button>
      </div>
      <DeleteVehicleDialog
        id={id}
        title={title}
        open={confirming}
        onOpenChange={setConfirming}
        onDeleted={() => router.refresh()}
      />
    </>
  );
}
