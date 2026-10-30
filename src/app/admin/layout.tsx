import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AdminSessionProvider } from "@/components/admin/admin-context";
import { AdminShell } from "@/components/admin/admin-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { getStaffSession } from "@/features/auth/session";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-surface="admin" className="min-h-svh overflow-x-hidden bg-background">
      <Suspense fallback={<AdminFallback />}>
        <AdminGate>{children}</AdminGate>
      </Suspense>
    </div>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  const session = await getStaffSession();
  if (!session) redirect("/login");
  if (!session.isStaff) redirect("/");

  return (
    <AdminSessionProvider
      session={{
        email: session.email,
        fullName: session.fullName,
        role: session.role,
      }}
    >
      <AdminShell>{children}</AdminShell>
    </AdminSessionProvider>
  );
}

function AdminFallback() {
  return (
    <div className="mx-auto flex min-h-svh min-w-0 max-w-[var(--container-max)] flex-col bg-background lg:flex-row">
      <Skeleton className="h-[var(--header-h)] w-full shrink-0 lg:hidden" />
      <aside className="hidden w-[var(--admin-sidebar-w)] shrink-0 bg-sidebar pt-[var(--admin-panel-top)] lg:block">
        <Skeleton className="mx-6 h-[112px] w-[138px]" />
        <div className="mt-[43px] flex flex-col gap-4 px-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-48" />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col lg:pt-[var(--admin-panel-top)] lg:pr-[var(--admin-panel-right)] lg:pb-6">
        <div className="min-h-[12rem] flex-1 bg-card p-4 lg:min-h-[calc(100svh-var(--admin-panel-top)-24px)] lg:rounded-[var(--admin-panel-radius)] lg:p-10">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-2 h-8 w-56" />
        </div>
      </div>
    </div>
  );
}
