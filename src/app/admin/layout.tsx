import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { getStaffSession } from "@/features/auth/session";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  const session = await getStaffSession();
  if (!session) redirect("/login");
  if (!session.isStaff) redirect("/");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
      <p className="text-sm text-muted-foreground">
        Signed in as {session.email ?? "staff"} ({session.role})
      </p>
      {children}
    </div>
  );
}

function AdminFallback() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
}
