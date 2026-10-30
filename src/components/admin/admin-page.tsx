import { AdminTopbar } from "@/components/admin/admin-topbar";

type AdminPageProps = {
  title: string;
  breadcrumb?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export function AdminPage({ title, breadcrumb, actions, children }: AdminPageProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AdminTopbar title={title} breadcrumb={breadcrumb} actions={actions} />
      <div className="flex min-h-0 flex-1 flex-col gap-6 px-[var(--admin-content-pl)] pb-6 pr-[var(--admin-content-pr)]">
        {children}
      </div>
    </div>
  );
}
