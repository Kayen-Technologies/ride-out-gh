import { AdminPage } from "@/components/admin/admin-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminInventoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <AdminPage title="Vehicle detail" breadcrumb="Workspace / Vehicle Inventory / Detail">
      <p className="text-muted-foreground">Vehicle {id} (task 2.3).</p>
    </AdminPage>
  );
}
