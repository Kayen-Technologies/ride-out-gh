import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AdminSessionProvider } from "@/components/admin/admin-context";
import { AdminIntro } from "@/components/admin/admin-intro";
import { AdminShell } from "@/components/admin/admin-shell";
import { FullScreenLoader } from "@/components/loader/full-screen-loader";
import { getStaffSession } from "@/features/auth/session";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-surface="admin"
      className="min-h-svh overflow-x-hidden bg-background"
    >
      {/* First load of any admin URL: the Ride Out route loader while the session is checked. */}
      <Suspense fallback={<FullScreenLoader />}>
        <AdminGate>{children}</AdminGate>
      </Suspense>
    </div>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  await connection();
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
      <AdminIntro />
      <AdminShell>{children}</AdminShell>
    </AdminSessionProvider>
  );
}
