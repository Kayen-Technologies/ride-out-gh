"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "cn";
import { setAvailability } from "@/features/inventory/vehicle-form/manage-actions";
import type { Database } from "@/lib/supabase/database.types";
import { availabilityLabel } from "@/lib/status";

type Availability = Database["public"]["Enums"]["availability_status"];

const order: Availability[] = ["available", "booked", "sold", "rented", "under_maintenance", "unavailable"];

export function AvailabilityControl({ id, value, divided }: { id: string; value: Availability; divided?: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState(value);
  const [pending, startTransition] = useTransition();

  function change(next: string) {
    const previous = current;
    setCurrent(next as Availability);
    startTransition(async () => {
      const result = await setAvailability(id, next);
      if (!result.ok) {
        setCurrent(previous);
        toast.error(result.error);
        return;
      }
      toast.success(`Marked as ${availabilityLabel(next as Availability).toLowerCase()}.`);
      router.refresh();
    });
  }

  return (
    <section className={cn("flex flex-col gap-6", divided && "-mt-4 border-t border-white/20 pt-10")}>
      <h2 className="text-base leading-6 font-medium text-foreground">Availability status</h2>
      <div className="flex flex-col gap-4">
        <label htmlFor="availability-status" className="text-base leading-[19px] text-text-70">
          Update status
        </label>
        <Select value={current} onValueChange={change} disabled={pending}>
          <SelectTrigger
            id="availability-status"
            className="h-10 w-full max-w-[533px] rounded-full border-white/50 bg-transparent px-6 text-sm text-foreground data-[size=default]:h-10 dark:bg-transparent"
          >
            <SelectValue>{availabilityLabel(current)}</SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" className="min-w-[200px]">
            {order.map((status) => (
              <SelectItem key={status} value={status}>
                {availabilityLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
