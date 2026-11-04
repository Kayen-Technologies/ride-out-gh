"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createBooking } from "@/features/rental-bookings/actions";
import { newBookingSchema } from "@/features/rental-bookings/schema";
import type { RentableVehicle } from "@/features/rental-bookings/queries";
import { formatGHS } from "@/lib/format";
import { cn } from "cn";

type Values = {
  fullName: string;
  email: string;
  phone: string;
  vehicleId: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  dailyRate: string;
  notes: string;
};

const empty: Values = {
  fullName: "",
  email: "",
  phone: "",
  vehicleId: "",
  pickupDate: "",
  returnDate: "",
  pickupLocation: "Accra",
  dailyRate: "",
  notes: "",
};

const fieldClass =
  "h-10 rounded-lg border-0 bg-white/15 px-3 text-sm text-foreground placeholder:text-text-70 focus-visible:ring-3 focus-visible:ring-primary/60 dark:bg-white/15";

function Field({
  label,
  error,
  htmlFor,
  required,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-base leading-[19px] text-foreground">
        {label}
        {required ? " *" : ""}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Figma 120:6889. */
export function AddBookingForm({ vehicles, today }: { vehicles: RentableVehicle[]; today: string }) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  };

  function pickVehicle(id: string) {
    const car = vehicles.find((v) => v.id === id);
    setValues((v) => ({ ...v, vehicleId: id, dailyRate: car ? String(car.rate) : v.dailyRate }));
    setErrors((e) => ({ ...e, vehicleId: "", dailyRate: "" }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = newBookingSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      return;
    }
    startTransition(async () => {
      const result = await createBooking(values);
      if (!result.ok) {
        setErrors(result.fields ?? {});
        toast.error(result.error);
        return;
      }
      toast.success(`Booking ${result.code} created.`);
      router.push(`/admin/rentals/${result.id}`);
    });
  }

  const car = vehicles.find((v) => v.id === values.vehicleId);

  return (
    <div className="relative flex flex-col items-center gap-10 pb-6">
      <Link
        href="/admin/rentals"
        aria-label="Close and go back to rental bookings"
        className="absolute top-0 right-0 rounded-sm p-1 text-foreground hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <X className="size-6" aria-hidden />
      </Link>

      <div className="flex w-full flex-col items-center gap-3 border-b border-white/80 pb-9 text-center">
        <h1 className="text-xl leading-7 font-medium text-foreground">Add rental booking</h1>
        <p className="text-sm leading-[17px] text-text-70">Record a booking received outside the website</p>
      </div>

      <form
        onSubmit={submit}
        noValidate
        className="flex w-full max-w-[500px] flex-col gap-6 rounded-2xl bg-black p-6"
        aria-label="Add rental booking"
      >
        <Field label="Customer name" htmlFor="fullName" required error={errors.fullName}>
          <Input
            id="fullName"
            value={values.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="Enter customer name"
            autoComplete="off"
            className={fieldClass}
          />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Email" htmlFor="email" required error={errors.email}>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="name@example.com"
              autoComplete="off"
              className={fieldClass}
            />
          </Field>
          <Field label="Phone / WhatsApp" htmlFor="phone" error={errors.phone}>
            <Input
              id="phone"
              type="tel"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="Optional"
              autoComplete="off"
              className={fieldClass}
            />
          </Field>
        </div>

        <Field label="Vehicle of interest" htmlFor="vehicleId" required error={errors.vehicleId}>
          <Select value={values.vehicleId} onValueChange={pickVehicle}>
            <SelectTrigger id="vehicleId" className={cn(fieldClass, "w-full data-[size=default]:h-10")}>
              <SelectValue placeholder="Choose a rental car" />
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-72">
              {vehicles.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">No rental cars in Inventory yet.</p>
              ) : (
                vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </Field>

        <div className="flex flex-col gap-6 border-y border-white/20 py-6">
          <Field label="Pickup date" htmlFor="pickupDate" required error={errors.pickupDate}>
            <Input
              id="pickupDate"
              type="date"
              min={today}
              value={values.pickupDate}
              onChange={(e) => set("pickupDate", e.target.value)}
              className={cn(fieldClass, "[color-scheme:dark]")}
            />
          </Field>
          <Field label="Return date" htmlFor="returnDate" required error={errors.returnDate}>
            <Input
              id="returnDate"
              type="date"
              min={values.pickupDate || today}
              value={values.returnDate}
              onChange={(e) => set("returnDate", e.target.value)}
              className={cn(fieldClass, "[color-scheme:dark]")}
            />
          </Field>
        </div>

        <Field label="Pickup location" htmlFor="pickupLocation" error={errors.pickupLocation}>
          <Input
            id="pickupLocation"
            value={values.pickupLocation}
            onChange={(e) => set("pickupLocation", e.target.value)}
            maxLength={120}
            className={fieldClass}
          />
        </Field>

        <Field label="Daily rate (GH₵)" htmlFor="dailyRate" required error={errors.dailyRate}>
          <Input
            id="dailyRate"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={values.dailyRate}
            onChange={(e) => set("dailyRate", e.target.value)}
            placeholder="Enter agreed daily rate"
            className={fieldClass}
          />
          {car ? <p className="text-xs text-text-70">Listed rate: {formatGHS(car.rate)} / day</p> : null}
        </Field>

        <Field label="Notes" htmlFor="notes" error={errors.notes}>
          <Textarea
            id="notes"
            value={values.notes}
            onChange={(e) => set("notes", e.target.value)}
            maxLength={2000}
            placeholder="Customer requirements or arrangement"
            className="min-h-[100px] rounded-lg border-0 bg-white/15 text-sm text-foreground placeholder:text-text-70 dark:bg-white/15"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/admin/rentals"
            className="inline-flex h-10 items-center justify-center rounded-full border border-white/60 px-6 text-sm font-medium text-foreground transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center justify-center rounded-full bg-admin-cta px-6 text-sm font-medium text-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Create Booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
