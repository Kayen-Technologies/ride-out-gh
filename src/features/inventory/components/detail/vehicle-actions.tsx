"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { TyreSpinner } from "@/components/loader/tyre-spinner";
import { DeleteVehicleDialog } from "@/features/inventory/components/detail/delete-vehicle-dialog";
import { setListingStatus } from "@/features/inventory/vehicle-form/manage-actions";

const pillClass =
  "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-white/50 bg-transparent px-6 text-sm font-medium text-foreground transition-colors hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60";

/** Edit and Hide/Publish under the gallery, as in Figma. */
export function VehicleActions({
  id,
  listingStatus,
}: {
  id: string;
  listingStatus: "draft" | "published" | "hidden";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const published = listingStatus === "published";

  function toggle() {
    startTransition(async () => {
      const result = await setListingStatus(id, published ? "hidden" : "published");
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(published ? "Listing hidden from customers." : "Listing is now live.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
      <Link href={`/admin/inventory/${id}/edit`} className={pillClass}>
        Edit vehicle
      </Link>
      <button type="button" onClick={toggle} disabled={pending} className={pillClass}>
        {pending ? <TyreSpinner size={16} label="Updating" /> : null}
        {published ? "Hide listing" : "Publish listing"}
      </button>
    </div>
  );
}

/** Delete with a confirmation, since it cannot be undone. */
export function DeleteVehicle({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <>
      <section className="flex flex-col gap-3 border-t border-white/20 pt-10">
        <h2 className="text-base font-medium text-foreground">Delete vehicle</h2>
        <p className="text-sm text-text-70">
          Removes this vehicle and its photos for good. To take it off the website but keep it, hide the listing
          instead.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-destructive px-6 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:ring-3 focus-visible:ring-destructive/40"
        >
          <Trash2 className="size-4" aria-hidden />
          Delete vehicle
        </button>
      </section>

      <DeleteVehicleDialog
        id={id}
        title={title}
        open={open}
        onOpenChange={setOpen}
        onDeleted={() => {
          router.push("/admin/inventory");
          router.refresh();
        }}
      />
    </>
  );
}
