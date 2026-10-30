"use client";

import { AdminNavList } from "@/components/admin/admin-nav-list";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type AdminMobileNavProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
};

export function AdminMobileNav({ open, onOpenChange, menuButtonRef }: AdminMobileNavProps) {
  function handleNavigate() {
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id="admin-mobile-nav"
        side="left"
        className="w-[min(100%,var(--width-admin-sidebar))] max-w-[var(--width-admin-sidebar)] border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
        showCloseButton
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          menuButtonRef.current?.focus();
        }}
      >
        <SheetHeader className="border-b border-border-admin px-6 py-4 text-left">
          <SheetTitle className="text-base font-medium text-foreground">Admin menu</SheetTitle>
          <SheetDescription className="sr-only">Navigation links for the admin dashboard</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-4 overflow-y-auto px-6 py-6" aria-label="Admin">
          <AdminNavList onNavigate={handleNavigate} showLogout />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
