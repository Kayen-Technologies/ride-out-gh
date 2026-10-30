"use client";

import { createContext, useContext } from "react";

export type AdminSessionInfo = {
  email: string | null;
  fullName: string | null;
  role: string | null;
};

const AdminSessionContext = createContext<AdminSessionInfo | null>(null);

export function AdminSessionProvider({
  session,
  children,
}: {
  session: AdminSessionInfo;
  children: React.ReactNode;
}) {
  return <AdminSessionContext.Provider value={session}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession() {
  const session = useContext(AdminSessionContext);
  if (!session) {
    throw new Error("useAdminSession must be used within AdminSessionProvider");
  }
  return session;
}

export function formatAdminRole(role: string | null): string {
  if (!role) return "Staff";
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function adminDisplayName(fullName: string | null, email: string | null): string {
  const trimmed = fullName?.trim();
  if (trimmed) return trimmed;

  if (!email) return "Admin";
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
