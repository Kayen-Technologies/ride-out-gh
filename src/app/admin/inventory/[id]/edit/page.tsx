import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { AdminPage } from "@/components/admin/admin-page";
import { vehicleImageUrl, categoryFromPath } from "@/features/inventory/image-url";
import { getVehicleDetail } from "@/features/inventory/queries";
import { VehicleWizard } from "@/features/inventory/vehicle-form/components/vehicle-wizard";
import type { VehicleFormValues } from "@/features/inventory/vehicle-form/schema";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function AdminInventoryEditPage({ params }: PageProps) {
  return (
    <AdminPage title="Vehicle Inventory" breadcrumb="Workspace / Vehicle Inventory / Edit vehicle">
      <Suspense fallback={<EditSkeleton />}>
        <EditContent params={params} />
      </Suspense>
    </AdminPage>
  );
}

async function EditContent({ params }: PageProps) {
  await connection();
  const { id } = await params;
  const detail = await getVehicleDetail(id);
  if (!detail) notFound();
  const { vehicle, images } = detail;

  const text = (value: string | null | undefined) => value ?? "";
  const money = (value: number | null) => (value == null ? "" : String(value));
  const initialValues: VehicleFormValues = {
    name: [vehicle.year, vehicle.brand, vehicle.model].join(" "),
    brand: vehicle.brand,
    model: vehicle.model,
    year: String(vehicle.year),
    purpose: vehicle.listing_purpose,
    condition: vehicle.condition,
    mileage: vehicle.mileage_km == null ? "" : String(vehicle.mileage_km),
    exteriorColour: text(vehicle.exterior_colour),
    fuelType: text(vehicle.fuel_type),
    transmission: text(vehicle.transmission),
    bodyType: text(vehicle.body_type),
    salePrice: money(vehicle.sale_price),
    dailyRate: money(vehicle.rental_daily_rate),
    securityDeposit: money(vehicle.rental_security_deposit),
    location: text(vehicle.location),
    registration: text(vehicle.registration),
    description: text(vehicle.description),
  };

  return (
    <VehicleWizard
      edit={{
        id: vehicle.id,
        status: vehicle.listing_status,
        initialValues,
        initialImages: images.map((image) => ({
          key: image.id,
          name: image.path.split("/").pop() ?? "photo",
          previewUrl: vehicleImageUrl(image.path),
          path: image.path,
          category: categoryFromPath(image.path),
        })),
      }}
    />
  );
}

function EditSkeleton() {
  return (
    <div className="flex w-full max-w-[1008px] flex-col gap-6" aria-hidden data-page-pending>
      <div className="ro-shimmer h-12 w-64 rounded-lg" />
      <div className="ro-shimmer h-14 rounded-md" />
      <div className="ro-shimmer h-[300px] rounded-xl" />
    </div>
  );
}
