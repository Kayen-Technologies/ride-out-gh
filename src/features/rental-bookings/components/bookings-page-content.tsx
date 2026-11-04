import { connection } from "next/server";

import { AdminAddButton } from "@/components/admin/admin-add-button";
import {
  InventoryLoader,
  InventoryNavigationProvider,
  InventoryResultsFrame,
  PendingLink,
} from "@/features/inventory/components/inventory-navigation";
import { BookingFilters } from "@/features/rental-bookings/components/booking-filters";
import { BookingKpiGrid } from "@/features/rental-bookings/components/booking-kpi-grid";
import { BookingList } from "@/features/rental-bookings/components/booking-list";
import { BookingTabs } from "@/features/rental-bookings/components/booking-tabs";
import { getBookingStats, listBookings } from "@/features/rental-bookings/queries";
import {
  bookingTabLabels,
  buildBookingSearchParams,
  parseBookingSearchParams,
} from "@/features/rental-bookings/search-params";
import Link from "next/link";

export async function BookingsPageContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Supabase reads the clock for its token check, so the page must be dynamic before it runs.
  await connection();
  const params = parseBookingSearchParams(await searchParams);

  let stats;
  let list;
  try {
    [stats, list] = await Promise.all([getBookingStats(), listBookings(params)]);
  } catch {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-6 py-8 text-center">
        <p className="font-medium text-foreground">Could not load rental bookings</p>
        <p className="mt-2 text-sm text-muted-foreground">Refresh the page or try again later.</p>
      </div>
    );
  }

  const filtered = params.q.trim() !== "" || params.status !== "all";
  const heading = bookingTabLabels[params.tab];

  return (
    <InventoryNavigationProvider>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4 sm:h-12 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base leading-[19px] font-normal text-foreground">
            Manage rental enquiries, confirmed bookings, pickups and returns.
          </p>
          <AdminAddButton href="/admin/rentals/new" className="min-w-0">
            Add booking
          </AdminAddButton>
        </div>

        <BookingKpiGrid stats={stats} />
        <BookingFilters params={params} />

        <div className="relative overflow-hidden rounded-xl border border-border">
          <InventoryLoader label="Loading bookings" hint="checking the diary…" />
          <BookingTabs params={params} />
          <div className="flex flex-col gap-6 px-6 pt-6 pb-6">
            <div className="flex items-center justify-between gap-4 text-base text-foreground">
              <h2 className="font-medium">{heading}</h2>
              <p>
                {list.total} {list.total === 1 ? "record" : "records"}
              </p>
            </div>
            <InventoryResultsFrame>
              {list.rows.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <h3 className="text-lg font-semibold text-foreground">
                    {filtered ? "No bookings match your filters" : "Nothing here yet"}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {filtered
                      ? "Try clearing the search or the status filter."
                      : "New requests from the website and bookings you add will show up here."}
                  </p>
                  {filtered ? (
                    <Link
                      href={`/admin/rentals${buildBookingSearchParams(params, { q: "", status: "all", page: 1 })}`}
                      className="mt-4 inline-block text-primary underline-offset-4 hover:underline"
                    >
                      Clear filters
                    </Link>
                  ) : null}
                </div>
              ) : (
                <>
                  <BookingList rows={list.rows} />
                  {list.totalPages > 1 ? (
                    <nav className="flex items-center justify-between gap-4 text-sm" aria-label="Pagination">
                      {params.page > 1 ? (
                        <PendingLink
                          className="text-primary underline-offset-4 hover:underline"
                          href={`/admin/rentals${buildBookingSearchParams(params, { page: params.page - 1 })}`}
                        >
                          Previous
                        </PendingLink>
                      ) : (
                        <span />
                      )}
                      <span className="text-muted-foreground">
                        Page {list.page} of {list.totalPages}
                      </span>
                      {params.page < list.totalPages ? (
                        <PendingLink
                          className="text-primary underline-offset-4 hover:underline"
                          href={`/admin/rentals${buildBookingSearchParams(params, { page: params.page + 1 })}`}
                        >
                          Next
                        </PendingLink>
                      ) : (
                        <span />
                      )}
                    </nav>
                  ) : null}
                </>
              )}
            </InventoryResultsFrame>
          </div>
        </div>
      </div>
    </InventoryNavigationProvider>
  );
}
