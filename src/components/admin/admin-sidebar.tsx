"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";

import { AdminNavList } from "@/components/admin/admin-nav-list";
import { signOut } from "@/features/auth/actions";

export function AdminSidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh w-[var(--admin-sidebar-w)] shrink-0 flex-col bg-sidebar pt-[var(--admin-panel-top)] lg:flex">
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Figma 120:739 — logo block with bottom border at y ≈ 112 inside sidebar */}
        <div className="flex h-[112px] w-full shrink-0 items-center border-b border-border-admin px-6 py-2">
          <Link href="/admin" aria-label="Ride Out" className="block h-[63px] w-[138px]">
            <Image
              src="/brand/logo-admin-sidebar.png"
              alt=""
              width={138}
              height={63}
              className="h-[63px] w-[138px] object-contain"
              unoptimized
            />
          </Link>
        </div>

        {/* Figma 120:738 — 43 px gap between logo block and nav wrapper */}
        <nav
          className="mt-[43px] flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6"
          aria-label="Admin"
        >
          <AdminNavList showLogout={false} />
        </nav>

        <form action={signOut} className="mt-auto shrink-0 pb-6">
          <button
            type="submit"
            className="flex h-9 w-full items-center gap-2 px-9 py-2 text-sm text-destructive"
          >
            <LogOut className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
