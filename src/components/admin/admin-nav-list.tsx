"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { FileText, LogOut } from "lucide-react";

import { AdminNavIcon } from "@/components/admin/admin-nav-icon";
import { adminNavLinks, isAdminNavActive } from "@/components/admin/admin-nav-links";
import { signOut } from "@/features/auth/actions";

type AdminNavListProps = {
  onNavigate?: () => void;
  showLogout?: boolean;
};

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function AdminNavList({ onNavigate, showLogout = true }: AdminNavListProps) {
  const pathname = usePathname();
  const hydrated = useHydrated();

  return (
    <>
      {adminNavLinks.map(({ label, href, iconSrc }) => {
        const active = hydrated && isAdminNavActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex h-9 w-full max-w-48 items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              active ? "bg-sidebar-accent text-primary" : "text-sidebar-foreground"
            }`}
          >
            {iconSrc ? (
              <AdminNavIcon src={iconSrc} active={active} />
            ) : (
              <FileText
                className={`size-5 shrink-0 ${active ? "text-primary" : "text-sidebar-foreground"}`}
                strokeWidth={1.75}
                aria-hidden
              />
            )}
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
      {showLogout ? (
        <form action={signOut} className="mt-4 w-full max-w-none">
          <button
            type="submit"
            className="flex h-9 w-full items-center gap-2 px-9 py-2 text-sm text-destructive"
          >
            <LogOut className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Log out
          </button>
        </form>
      ) : null}
    </>
  );
}
