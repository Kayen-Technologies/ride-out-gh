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
      {/* From lg the shell is one screen tall: the sidebar and top bar stay put and only this area scrolls. */}
      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:overflow-y-auto px-[var(--admin-content-pl)] pt-6 pb-6 pr-[var(--admin-content-pr)]">
        {children}
      </div>
    </div>
  );
}
