import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { AdminPage } from "@/components/admin/admin-page";
import { BookingDetailView } from "@/features/rental-bookings/components/booking-detail-view";
import { getBookingDetail } from "@/features/rental-bookings/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function AdminRentalDetailPage({ params }: PageProps) {
  return (
    <AdminPage title="Rental Bookings" breadcrumb="Workspace / Rental Bookings / Detail">
      <Suspense fallback={<DetailSkeleton />}>
        <DetailContent params={params} />
      </Suspense>
    </AdminPage>
  );
}

async function DetailContent({ params }: PageProps) {
  await connection();
  const { id } = await params;
  const booking = await getBookingDetail(id);
  if (!booking) notFound();
  return <BookingDetailView booking={booking} />;
}

function DetailSkeleton() {
  return (
    <div className="flex w-full max-w-[1092px] flex-col gap-6" aria-hidden data-page-pending>
      <div className="ro-shimmer h-5 w-64 rounded-md" />
      <div className="ro-shimmer h-28 rounded-xl" />
      <div className="ro-shimmer h-48 rounded-xl" />
      <div className="ro-shimmer h-10 rounded-full" />
    </div>
  );
}
