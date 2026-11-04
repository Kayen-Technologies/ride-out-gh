"use client";

import { CircleCheck, Info, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  addBookingNote,
  checkBookingAvailability,
  openGhanaCard,
  setBookingStatus,
} from "@/features/rental-bookings/actions";
import { bookingStatusLabel, bookingStatusOptions, type RentalStatus } from "@/features/rental-bookings/search-params";
import { cn } from "cn";

/** The next step in a booking's life, offered as the one big button (Figma 120:6469 "Confirm booking"). */
const nextStep: Partial<Record<RentalStatus, { to: RentalStatus; label: string }>> = {
  inquiry_received: { to: "confirmed", label: "Confirm booking" },
  confirmed: { to: "ready_for_pickup", label: "Mark ready for pickup" },
  ready_for_pickup: { to: "active", label: "Start rental" },
  active: { to: "returned", label: "Mark as returned" },
};

const outlineButton =
  "inline-flex h-10 w-full max-w-[533px] items-center justify-center rounded-full border border-white/50 bg-transparent px-6 text-sm font-medium text-foreground transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60";

export function StatusControl({ id, status }: { id: string; status: RentalStatus }) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [pending, startTransition] = useTransition();

  function change(next: RentalStatus) {
    const previous = current;
    setCurrent(next);
    startTransition(async () => {
      const result = await setBookingStatus(id, next);
      if (!result.ok) {
        setCurrent(previous);
        toast.error(result.error);
        return;
      }
      toast.success(`Marked as ${bookingStatusLabel(next).toLowerCase()}.`);
      router.refresh();
    });
  }

  const step = nextStep[current];

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor="booking-status" className="text-base leading-[19px] text-text-70">
        Update status
      </label>
      <Select value={current} onValueChange={(value) => change(value as RentalStatus)} disabled={pending}>
        <SelectTrigger
          id="booking-status"
          className="h-10 w-full max-w-[533px] rounded-full border-white/50 bg-transparent px-6 text-sm text-foreground data-[size=default]:h-10 dark:bg-transparent"
        >
          <SelectValue>{bookingStatusLabel(current)}</SelectValue>
        </SelectTrigger>
        <SelectContent position="popper" className="min-w-[200px]">
          {bookingStatusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {current === "inquiry_received" ? (
        <div className="flex max-w-[640px] flex-col gap-2 text-sm text-text-70">
          <p className="flex items-center gap-2 font-medium text-foreground">
            <Info className="size-4 shrink-0" aria-hidden />
            Before confirming
          </p>
          <p className="leading-5">
            Verify availability, agree on the rate and driver option, and confirm the pickup and return arrangements
            with the customer.
          </p>
        </div>
      ) : null}

      {step ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => change(step.to)}
          className="inline-flex h-10 w-full max-w-[533px] items-center justify-center rounded-full bg-admin-cta px-6 text-sm font-medium text-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
        >
          {pending ? "Saving…" : step.label}
        </button>
      ) : null}
    </div>
  );
}

export function NoteForm({ id }: { id: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await addBookingNote(id, body);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setBody("");
      toast.success("Note saved.");
      router.refresh();
    });
  }

  return (
    <div className="flex max-w-[533px] flex-col gap-4">
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={2000}
        aria-label="Internal note"
        placeholder="Record follow-ups, customer conversations or next steps"
        className="min-h-[120px] rounded-lg border-white/30 bg-transparent text-sm text-foreground placeholder:text-text-70 dark:bg-transparent"
      />
      <button type="button" onClick={save} disabled={pending || body.trim() === ""} className={outlineButton}>
        {pending ? "Saving…" : "Save note"}
      </button>
    </div>
  );
}

export function AvailabilityCheck({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ free: boolean; message: string } | null>(null);

  function check() {
    startTransition(async () => {
      const response = await checkBookingAvailability(id);
      if (!response.ok) {
        toast.error(response.error);
        return;
      }
      setResult({ free: response.free, message: response.message });
    });
  }

  return (
    <div className="flex max-w-[533px] flex-col gap-4">
      <button type="button" onClick={check} disabled={pending} className={outlineButton}>
        {pending ? "Checking…" : "Check vehicle availability"}
      </button>
      {result ? (
        <p
          role="status"
          className={cn(
            "flex items-start gap-2 rounded-lg px-4 py-3 text-sm",
            result.free ? "bg-emerald-500/15 text-emerald-200" : "bg-destructive/15 text-red-200",
          )}
        >
          {result.free ? (
            <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          ) : (
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          )}
          {result.message}
        </p>
      ) : null}
    </div>
  );
}

export function GhanaCardButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function open() {
    startTransition(async () => {
      const result = await openGhanaCard(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <button
      type="button"
      onClick={open}
      disabled={pending}
      className="w-fit rounded-sm text-base leading-6 text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
    >
      {pending ? "Opening…" : "View photo"}
    </button>
  );
}
