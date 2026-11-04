import { Suspense } from "react";

import { AdminPage } from "@/components/admin/admin-page";
import { InventoryPageSkeleton } from "@/features/inventory/components/inventory-skeleton";
import { BookingsPageContent } from "@/features/rental-bookings/components/bookings-page-content";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function AdminRentalsPage({ searchParams }: PageProps) {
  return (
    <AdminPage title="Rental Bookings" breadcrumb="Workspace / Rental Bookings">
      <Suspense fallback={<InventoryPageSkeleton />}>
        <BookingsPageContent searchParams={searchParams} />
      </Suspense>
    </AdminPage>
  );
}
