"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { signOut } from "@/features/auth/actions";

const links = [
  ["Dashboard", "/admin"],
  ["Inventory", "/admin/inventory"],
  ["Vehicle Orders", "/admin/orders"],
  ["Rental Bookings", "/admin/rentals"],
  ["Customers", "/admin/customers"],
  ["Website content", "/admin/content"],
  ["Settings", "/admin/settings"],
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4 md:hidden">
        <p className="text-sm font-semibold">Ride Out</p>
        <button type="button" className="rounded-full bg-white/10 px-3 py-2" onClick={() => setOpen((current) => !current)}>
          <Image src={open ? "/brand/close.svg" : "/brand/menu.svg"} alt="" width={open ? 16 : 24} height={open ? 16 : 24} />
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </div>
      <aside className={`${open ? "flex" : "hidden"} w-full flex-col bg-sidebar px-4 py-6 md:flex md:w-64 md:shrink-0`}>
        <p className="hidden px-3 text-sm font-semibold md:block">Ride Out</p>
        <nav className="mt-4 flex flex-col gap-1" aria-label="Admin">
          {links.map(([label, href]) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-3 py-2 text-sm ${active ? "bg-primary text-primary-foreground" : "text-sidebar-foreground"}`}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <form action={signOut} className="mt-6">
          <button type="submit" className="px-3 py-2 text-sm text-white/60">
            Log out
          </button>
        </form>
      </aside>
    </>
  );
}
