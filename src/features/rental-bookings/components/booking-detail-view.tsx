import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

import {
  AvailabilityCheck,
  GhanaCardButton,
  NoteForm,
  StatusControl,
} from "@/features/rental-bookings/components/booking-controls";
import type { BookingDetail } from "@/features/rental-bookings/queries";
import { bookingStatusLabel, formatDateRange } from "@/features/rental-bookings/search-params";
import { formatGHS } from "@/lib/format";

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const stamp = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Accra",
  });

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <dt className="text-sm leading-[17px] text-text-70">{label}</dt>
      <dd className="text-base leading-6 font-medium break-words text-foreground">{children}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-t border-white/20 pt-10">
      <h2 className="text-base leading-6 font-medium text-foreground">{title}</h2>
      {children}
    </section>
  );
}

/** Figma 120:6469 and 120:6634. */
export function BookingDetailView({ booking }: { booking: BookingDetail }) {
  const title = booking.vehicles
    ? `${booking.vehicles.year} ${booking.vehicles.brand} ${booking.vehicles.model}`
    : "Vehicle removed";
  const days = booking.rental_days ?? 0;
  const driver = booking.driver_option === "with_driver" ? "With driver" : "Self drive";
  const phone = booking.customers?.phone;

  return (
    <div className="flex w-full max-w-[1092px] flex-col gap-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
        <div className="flex min-w-0 flex-col gap-6">
          <Link
            href="/admin/rentals"
            aria-label="Back to rental bookings"
            className="w-fit rounded-sm p-0.5 text-sky-300 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ArrowLeft className="size-[18px]" aria-hidden />
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="text-base leading-6 font-medium text-foreground">{booking.code}</h1>
            <p className="text-base leading-[19px] text-text-70">Review booking details and manage its progress.</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:mt-[22px] sm:items-end">
          <p className="text-sm leading-[17px] text-foreground">Received {longDate(booking.created_at)}</p>
          <span className="inline-flex h-[38px] w-fit items-center rounded-full border border-primary bg-black/20 px-4 text-sm font-semibold text-foreground">
            {bookingStatusLabel(booking.status)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl leading-7 font-semibold text-foreground">{title}</h2>
          <p className="text-sm leading-[17px] text-text-70">Booking reference: {booking.code}</p>
        </div>
        <dl className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
          <Field label="Customer">{booking.customers?.full_name ?? "Unknown customer"}</Field>
          <Field label="Rental duration">
            {days} {days === 1 ? "day" : "days"}
          </Field>
          <Field label="Pickup location">{booking.pickup_location || "Not provided"}</Field>
          <Field label="Driver option">{driver}</Field>
          <Field label="Phone / WhatsApp">{phone || "Not provided"}</Field>
          <Field label="Email">{booking.customers?.email ?? "Not provided"}</Field>
          <Field label="Ghana Card">
            <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>{booking.ghana_card_number || "Number not provided"}</span>
              {booking.ghana_card_image_path ? (
                <GhanaCardButton id={booking.id} />
              ) : (
                <span className="text-text-70">No photo</span>
              )}
            </span>
          </Field>
        </dl>
      </div>

      <Section title="Rental Schedule">
        <div className="flex w-full max-w-[393px] flex-col gap-6 rounded-xl border border-white/20 p-6">
          <div className="flex items-start gap-4">
            <Calendar className="mt-0.5 size-5 shrink-0 text-foreground" strokeWidth={1.5} aria-hidden />
            <div className="flex flex-col gap-2">
              <p className="text-base leading-6 font-medium text-foreground">
                {formatDateRange(booking.pickup_date, booking.return_date)}
              </p>
              <p className="text-sm leading-[17px] text-foreground">Requested pickup and return period</p>
            </div>
          </div>
          <dl className="flex flex-col gap-4 text-sm text-foreground">
            {(
              [
                ["Daily rate", formatGHS(Number(booking.daily_rate))],
                ["Estimated rental subtotal", formatGHS(Number(booking.estimated_subtotal ?? 0))],
                ["Security deposit", formatGHS(Number(booking.security_deposit))],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4">
                <dt className="text-text-70">{label}</dt>
                <dd className="text-right text-base whitespace-nowrap">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section title="Booking status">
        <StatusControl key={booking.status} id={booking.id} status={booking.status} />
        {booking.history.length > 0 ? (
          <ol className="flex max-w-[533px] flex-col gap-2 text-sm text-text-70" aria-label="Status history">
            {booking.history.map((entry) => (
              <li key={entry.id} className="flex items-baseline justify-between gap-4">
                <span className="text-foreground">{bookingStatusLabel(entry.status)}</span>
                <span>{stamp(entry.created_at)}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </Section>

      <Section title="Internal Notes">
        <NoteForm id={booking.id} />
        {booking.notes.length > 0 ? (
          <ul className="flex max-w-[533px] flex-col gap-3">
            {booking.notes.map((note) => (
              <li key={note.id} className="flex flex-col gap-1 rounded-lg bg-white/10 px-4 py-3">
                <p className="text-sm leading-5 whitespace-pre-wrap text-foreground">{note.body}</p>
                <p className="text-xs text-text-70">{stamp(note.created_at)}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </Section>

      {booking.status === "inquiry_received" ||
      booking.status === "confirmed" ||
      booking.status === "ready_for_pickup" ? (
        <Section title="Availability check">
          <p className="max-w-[533px] text-sm leading-5 text-text-70">
            Verify the vehicle is not already booked, rented, unavailable or under maintenance for the requested dates.
          </p>
          <AvailabilityCheck id={booking.id} />
        </Section>
      ) : null}
    </div>
  );
}
