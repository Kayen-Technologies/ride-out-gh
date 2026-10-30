"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { hrefForLabel } from "@/components/site/links";
import { SocialLinks } from "@/components/site/social-links";
import type { BusinessProfile } from "@/features/cms/business";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function SiteMenuOverlay({
  open,
  onClose,
  menuButtonRef,
  items,
  business,
}: {
  open: boolean;
  onClose: () => void;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
  items: readonly string[];
  business: BusinessProfile;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const menuButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const nodes = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (node) => !node.hasAttribute("disabled") && node.tabIndex !== -1,
      );
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      menuButton?.focus();
    };
  }, [open, menuButtonRef, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      id="site-menu-overlay"
      className="fixed inset-0 z-[60] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-[var(--menu-scrim)]"
        aria-label="Dismiss menu"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative flex h-full min-h-[var(--menu-panel-min-h)] w-[var(--menu-panel-w)] flex-col justify-between bg-[var(--menu-panel-bg)] p-[var(--menu-panel-padding)] backdrop-blur-[var(--menu-blur)] lg:rounded-tl-[var(--menu-panel-radius)] lg:rounded-bl-[var(--menu-panel-radius)]"
      >
        <div className="flex items-start justify-between gap-4">
          <nav className="flex flex-col gap-[3px] text-[32px] leading-[1.1]" aria-label="Pages">
            <span id={titleId} className="sr-only">
              Site menu
            </span>
            {items.map((label) => {
              const href = hrefForLabel(label);
              return (
                <Link key={label} href={href} className="text-text-subtle hover:text-white" onClick={onClose}>
                  {label}
                </Link>
              );
            })}
          </nav>
          <button
            ref={closeRef}
            type="button"
            className="inline-flex h-8 w-10 shrink-0 items-center justify-center rounded-full bg-border-subtle px-3 py-2"
            onClick={onClose}
          >
            <Image src="/brand/close.svg" alt="" width={16} height={16} />
            <span className="sr-only">Close menu</span>
          </button>
        </div>

        <div className="mt-14 flex w-full max-w-[557px] flex-col gap-14 text-sm tracking-[-0.14px]">
          <div className="flex items-start justify-between gap-6">
            <p className="flex-1 text-text-subtle">Contact</p>
            <div className="flex w-[170px] flex-col gap-3 text-white">
              <a href={`mailto:${business.email}`}>{business.email}</a>
              <p>
                {business.phones.map((phone) => (
                  <span key={phone} className="block leading-[1.4]">
                    {phone}
                  </span>
                ))}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-6">
            <p className="flex-1 text-text-subtle">Socials</p>
            <div className="w-[170px]">
              <SocialLinks business={business} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
