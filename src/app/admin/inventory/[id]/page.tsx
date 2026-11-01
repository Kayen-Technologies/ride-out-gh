import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { AdminPage } from "@/components/admin/admin-page";
import { VehicleDetailView } from "@/features/inventory/components/detail/vehicle-detail-view";
import { getVehicleDetail } from "@/features/inventory/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function AdminInventoryDetailPage({ params }: PageProps) {
  return (
    <AdminPage title="Vehicle Inventory" breadcrumb="Workspace / Vehicle Inventory / Detail">
      <Suspense fallback={<DetailSkeleton />}>
        <DetailContent params={params} />
      </Suspense>
    </AdminPage>
  );
}

async function DetailContent({ params }: PageProps) {
  await connection();
  const { id } = await params;
  const detail = await getVehicleDetail(id);
  if (!detail) notFound();
  return <VehicleDetailView detail={detail} />;
}

function DetailSkeleton() {
  return (
    <div className="flex w-full max-w-[1092px] flex-col gap-6" aria-hidden data-page-pending>
      <div className="ro-shimmer h-5 w-64 rounded-md" />
      <div className="ro-shimmer h-[260px] rounded-xl lg:h-[505px]" />
      <div className="ro-shimmer h-10 rounded-full" />
      <div className="ro-shimmer h-28 rounded-xl" />
    </div>
  );
}
