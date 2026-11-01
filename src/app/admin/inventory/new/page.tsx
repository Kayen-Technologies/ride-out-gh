import { AdminPage } from "@/components/admin/admin-page";
import { VehicleWizard } from "@/features/inventory/vehicle-form/components/vehicle-wizard";

export default function AdminInventoryNewPage() {
  return (
    <AdminPage title="Vehicle Inventory" breadcrumb="Workspace / Vehicle Inventory / Add vehicle">
      <VehicleWizard />
    </AdminPage>
  );
}
