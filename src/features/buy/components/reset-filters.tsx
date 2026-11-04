"use client";

import Link from "next/link";

/**
 * Clears every filter field and searches again. The fields remember what was typed in them, so sending
 * people to a plain /buy address would leave the boxes ticked; this clears them in the form itself first.
 * It stays a real link, so it still works without JavaScript. The sort order is not a filter and stays.
 */
export function ResetFilters({ className, href = "/buy" }: { className?: string; href?: string }) {
  function clear(event: React.MouseEvent<HTMLAnchorElement>) {
    const form = event.currentTarget.closest("form");
    if (!form) return;
    event.preventDefault();

    for (const element of Array.from(form.elements)) {
      if (element instanceof HTMLInputElement) {
        if (element.type === "checkbox") element.checked = false;
        else if (element.type === "radio")
          element.checked = element.value === "";
      } else if (element instanceof HTMLSelectElement) {
        element.value = "";
        // Let the brand chooser know, so the model list goes back to showing every model.
        if (element.name === "brand")
          element.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
    form.requestSubmit();
  }

  return (
    <Link href={href} onClick={clear} className={className}>
      Reset
    </Link>
  );
}
