"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  adminDisplayName,
  formatAdminRole,
  useAdminSession,
} from "@/components/admin/admin-context";

type AdminTopbarProps = {
  title: string;
  breadcrumb?: string;
  actions?: React.ReactNode;
};

/** Where each breadcrumb label goes. A label not listed here stays plain text (the page you are on). */
const BREADCRUMB_LINKS: Record<string, string> = {
  Workspace: "/admin",
  Dashboard: "/admin",
  "Vehicle Inventory": "/admin/inventory",
  "Vehicle Orders": "/admin/orders",
  "Rental Bookings": "/admin/rentals",
  Customers: "/admin/customers",
  "Website content": "/admin/content",
  Settings: "/admin/settings",
};

function Breadcrumb({ trail }: { trail: string }) {
  const pathname = usePathname();
  const segments = trail.split(" / ");
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1 text-xs leading-normal text-muted-foreground">
        {segments.map((label, index) => {
          const href = BREADCRUMB_LINKS[label];
          const isLast = index === segments.length - 1;
          const linked = href && href !== pathname;
          return (
            <li key={`${label}-${index}`} className="flex items-center gap-1">
              {linked ? (
                <Link href={href} className="underline-offset-2 hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline focus-visible:outline-none">
                  {label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>{label}</span>
              )}
              {isLast ? null : <span aria-hidden>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function AdminTopbar({ title, breadcrumb, actions }: AdminTopbarProps) {
  const session = useAdminSession();
  const name = adminDisplayName(session.fullName, session.email);
  const roleLabel = formatAdminRole(session.role);

  return (
    <header className="box-border h-[var(--admin-topbar-h)] shrink-0 border-b border-border-admin">
      <div className="flex h-full items-center">
        <div className="flex w-full items-center justify-between gap-4 px-4 lg:gap-6 lg:pl-10 lg:pr-6">
          <div className="min-w-0">
            {breadcrumb ? <Breadcrumb trail={breadcrumb} /> : null}
            <h1 className="text-2xl font-normal leading-tight text-foreground">{title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-6">
            {actions}
            {/* S8: notification tile omitted (bell fill #EFF4FA is Figma 120:682, not the avatar). */}
            <div className="flex h-10 max-w-[149px] items-center gap-2">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[rgb(255_255_255/30%)] bg-admin-user-avatar-fill"
                aria-hidden
              >
                <Image
                  src="/brand/icons/admin-user-profile.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="size-5"
                  unoptimized
                />
              </div>
              <div className="hidden min-w-0 flex-1 sm:block">
                <p className="truncate text-base font-semibold leading-tight text-foreground">
                  {name}
                </p>
                <p className="truncate text-xs font-normal leading-normal text-muted-foreground">
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
