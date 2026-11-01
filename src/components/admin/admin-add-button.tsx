import Link from "next/link";
import { Plus } from "lucide-react";

import { cn } from "cn";

type AdminAddButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

/** Figma 120:3479 — admin primary “Add …” actions (Inventory and future list pages). */
export function AdminAddButton({ href, children, className }: AdminAddButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-12 min-w-[158px] shrink-0 items-center justify-center gap-2 rounded-full bg-admin-cta px-4 py-3 text-base font-medium text-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <Plus className="size-6 shrink-0" strokeWidth={2} aria-hidden />
      {children}
    </Link>
  );
}
