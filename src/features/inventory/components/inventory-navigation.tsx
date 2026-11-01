"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useTransition,
} from "react";

import { InlineCarLoader } from "@/components/loader/inline-car-loader";

type InventoryNavigation = {
  /** True from the moment a tab, filter, search or page change starts until the new list is on screen. */
  pending: boolean;
  navigate: (href: string) => void;
};

const InventoryNavigationContext = createContext<InventoryNavigation | null>(
  null,
);

export function InventoryNavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const navigate = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href);
      });
    },
    [router],
  );

  const value = useMemo(() => ({ pending, navigate }), [pending, navigate]);

  return (
    <InventoryNavigationContext.Provider value={value}>
      {children}
    </InventoryNavigationContext.Provider>
  );
}

export function useInventoryNavigation() {
  const context = useContext(InventoryNavigationContext);
  if (!context)
    throw new Error(
      "useInventoryNavigation must be used inside InventoryNavigationProvider",
    );
  return context;
}

/** A normal link (prefetch, new tab and copy-link still work) that also reports loading state. */
export function PendingLink({
  href,
  onClick,
  ref,
  ...props
}: React.ComponentProps<typeof Link>) {
  const { navigate } = useInventoryNavigation();

  return (
    <Link
      ref={ref}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        const plainLeftClick =
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey;
        if (
          event.defaultPrevented ||
          !plainLeftClick ||
          typeof href !== "string"
        )
          return;
        event.preventDefault();
        navigate(href);
      }}
      {...props}
    />
  );
}

/** Marks the list busy for assistive tech while the next rows load. */
export function InventoryResultsFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pending } = useInventoryNavigation();

  return (
    <div aria-busy={pending} className="flex flex-col gap-6">
      {children}
    </div>
  );
}

/**
 * Ride Out loader kit: the whole page blurs and the inline car (kit item 03) sits in the centre of the
 * screen while a tab, filter, search or page change loads. A thin progress bar runs along the top.
 */
export function InventoryLoader() {
  const { pending } = useInventoryNavigation();
  if (!pending || typeof document === "undefined") return null;

  return createPortal(
    <div
      data-inventory-loader
      data-ro-loader
      className="fixed inset-0 z-[70] flex cursor-progress items-center justify-center bg-black/40 backdrop-blur-md"
    >
      <div
        className="absolute inset-x-0 top-0 h-[3px] overflow-hidden bg-white/10"
        aria-hidden
      >
        <div className="ro-indeterminate h-full w-[30%] rounded-full bg-primary" />
      </div>
      <InlineCarLoader
        label="Loading inventory"
        hint="checking the lot…"
        className="rounded-2xl bg-card/95 px-12 py-6 shadow-card"
      />
    </div>,
    document.body,
  );
}
