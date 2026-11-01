import { connection } from "next/server";

import { AdminAddButton } from "@/components/admin/admin-add-button";
import { InventoryDataTable } from "@/features/inventory/components/inventory-data-table";
import {
  InventoryFilteredEmptyState,
  InventoryGlobalEmptyState,
} from "@/features/inventory/components/inventory-empty-states";
import { InventoryFilters } from "@/features/inventory/components/inventory-filters";
import {
  InventoryLoader,
  InventoryNavigationProvider,
  InventoryResultsFrame,
  PendingLink,
} from "@/features/inventory/components/inventory-navigation";
import { InventoryKpiGrid } from "@/features/inventory/components/inventory-kpi-grid";
import { InventoryTabs } from "@/features/inventory/components/inventory-tabs";
import { buildInventorySearchParams } from "@/features/inventory/inventory-url";
import { getInventoryStats, listVehicles } from "@/features/inventory/queries";
import { parseInventorySearchParams } from "@/features/inventory/search-params";

type InventoryPageContentProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function InventoryPageContent({
  searchParams,
}: InventoryPageContentProps) {
  // Supabase checks the token expiry with Date.now(); marking the page dynamic first keeps Next from
  // trying to prerender it (that was the "unstable value Date.now()" warning and the "1 Issue" badge).
  await connection();
  const raw = await searchParams;
  const params = parseInventorySearchParams(raw);

  let stats;
  let listResult;
  try {
    [stats, listResult] = await Promise.all([
      getInventoryStats(),
      listVehicles({
        tab: params.tab,
        status: params.status,
        q: params.q,
        page: params.page,
      }),
    ]);
  } catch {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-6 py-8 text-center">
        <p className="font-medium text-foreground">Could not load inventory</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Refresh the page or try again later.
        </p>
      </div>
    );
  }

  if (stats.total === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <InventoryGlobalEmptyState />
      </div>
    );
  }

  return (
    <InventoryNavigationProvider>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4 sm:h-12 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base leading-[19px] font-normal text-foreground">
            Manage vehicles, listings and availability.
          </p>
          <AdminAddButton href="/admin/inventory/new">
            Add vehicle
          </AdminAddButton>
        </div>

        <>
          <InventoryKpiGrid stats={stats} />
          <InventoryFilters params={params} />
          <div className="relative overflow-hidden rounded-xl border border-border">
            <InventoryLoader />
            <InventoryTabs params={params} />
            <div className="px-6 pt-6 pb-6">
              <InventoryResultsFrame>
                {listResult.rows.length === 0 ? (
                  <InventoryFilteredEmptyState />
                ) : (
                  <>
                    <InventoryDataTable rows={listResult.rows} />
                    {listResult.totalPages > 1 ? (
                      <nav
                        className="flex items-center justify-between gap-4 text-sm"
                        aria-label="Pagination"
                      >
                        {params.page > 1 ? (
                          <PendingLink
                            className="text-primary underline-offset-4 hover:underline"
                            href={`/admin/inventory${buildInventorySearchParams(params, { page: params.page - 1 })}`}
                          >
                            Previous
                          </PendingLink>
                        ) : (
                          <span />
                        )}
                        <span className="text-muted-foreground">
                          Page {listResult.page} of {listResult.totalPages}
                        </span>
                        {params.page < listResult.totalPages ? (
                          <PendingLink
                            className="text-primary underline-offset-4 hover:underline"
                            href={`/admin/inventory${buildInventorySearchParams(params, { page: params.page + 1 })}`}
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
        </>
      </div>
    </InventoryNavigationProvider>
  );
}
