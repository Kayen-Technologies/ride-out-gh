"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useRef, useState } from "react";

import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { BrandLogo } from "@/components/site/brand-logo";
import { Button } from "@/components/ui/button";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="mx-auto flex min-h-svh min-w-0 max-w-[var(--container-max)] flex-col bg-background lg:flex-row">
      <header className="flex h-[var(--header-h)] shrink-0 items-center justify-between bg-background px-[var(--gutter-nav)] lg:hidden">
        <Link href="/admin" aria-label="Ride Out" className="shrink-0">
          <BrandLogo variant="header" />
        </Link>
        <Button
          ref={menuButtonRef}
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 rounded-full bg-accent text-foreground"
          aria-expanded={menuOpen}
          aria-controls="admin-mobile-nav"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="size-5" strokeWidth={1.75} />
          <span className="sr-only">Open admin menu</span>
        </Button>
      </header>

      <AdminSidebar />

      {/* Figma S4: panel inset 25px top, 35px right (120:646) from lg; mobile uses shell tokens at 0 / 16. */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col pb-0 lg:pt-[var(--admin-panel-top)] lg:pr-[var(--admin-panel-right)] lg:pb-6">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden bg-card lg:min-h-[calc(100svh-var(--admin-panel-top)-24px)] lg:rounded-[var(--admin-panel-radius)]">
          {children}
        </div>
      </div>

      <AdminMobileNav open={menuOpen} onOpenChange={setMenuOpen} menuButtonRef={menuButtonRef} />
    </div>
  );
}
