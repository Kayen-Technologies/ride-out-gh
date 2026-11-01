import { Suspense } from "react";

import { AdminPage } from "@/components/admin/admin-page";
import { InventoryPageContent } from "@/features/inventory/components/inventory-page-content";
import { InventoryPageSkeleton } from "@/features/inventory/components/inventory-skeleton";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function AdminInventoryPage({ searchParams }: PageProps) {
  return (
    <AdminPage title="Vehicle Inventory" breadcrumb="Workspace / Vehicle Inventory">
      <Suspense fallback={<InventoryPageSkeleton />}>
        <InventoryPageContent searchParams={searchParams} />
      </Suspense>
    </AdminPage>
  );
}
