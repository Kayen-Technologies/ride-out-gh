import { connection } from "next/server";
import { Suspense } from "react";

import { AdminPage } from "@/components/admin/admin-page";
import { AddBookingForm } from "@/features/rental-bookings/components/add-booking-form";
import { listRentableVehicles } from "@/features/rental-bookings/queries";

export default function AdminRentalsNewPage() {
  return (
    <AdminPage title="Rental Bookings" breadcrumb="Workspace / Rental Bookings / Add booking">
      <Suspense fallback={<div className="ro-shimmer mx-auto h-[600px] w-full max-w-[500px] rounded-xl" aria-hidden />}>
        <FormContent />
      </Suspense>
    </AdminPage>
  );
}

async function FormContent() {
  await connection();
  const vehicles = await listRentableVehicles();
  return <AddBookingForm vehicles={vehicles} today={new Date().toISOString().slice(0, 10)} />;
}
