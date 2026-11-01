"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { TyreSpinner } from "@/components/loader/tyre-spinner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { deleteVehicle } from "@/features/inventory/vehicle-form/manage-actions";

/** Confirmation before a vehicle and its photos are removed for good. Used on the detail page and in the list. */
export function DeleteVehicleDialog({
  id,
  title,
  open,
  onOpenChange,
  onDeleted,
}: {
  id: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const result = await deleteVehicle(id);
      if (!result.ok) {
        toast.error(result.error);
        onOpenChange(false);
        return;
      }
      toast.success("Vehicle deleted.");
      onOpenChange(false);
      onDeleted();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className="max-w-[449px] gap-5 rounded-3xl bg-black p-8 text-center sm:max-w-[449px]">
        <DialogTitle className="text-2xl leading-8 font-semibold text-white">Delete this vehicle?</DialogTitle>
        <DialogDescription className="text-base leading-6 text-text-70">
          {title} and all of its photos will be permanently deleted. This cannot be undone.
        </DialogDescription>
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={confirm}
            disabled={pending}
            className="h-12 w-full rounded-full bg-destructive text-base font-medium text-white hover:bg-destructive/90"
          >
            {pending ? <TyreSpinner size={18} label="Deleting" /> : null}
            Yes, delete vehicle
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
            className="h-12 w-full rounded-full border-white bg-transparent text-base font-medium text-white hover:bg-white/10 dark:border-white dark:bg-transparent"
          >
            Keep vehicle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
