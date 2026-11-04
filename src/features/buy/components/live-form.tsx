"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";

type LiveFormProps = Omit<
  React.ComponentProps<"form">,
  "onChange" | "onSubmit" | "action" | "method"
> & {
  /** Where the search lives, for example "/buy". */
  path: string;
};

/**
 * A search form that updates the results as soon as anything in it changes, so nobody has to press a button.
 * It builds the address from the form's fields (leaving out the empty ones), swaps it in without a full
 * page load, and marks the page as "filtering" while the new results arrive. Without JavaScript it is still
 * a plain GET form, so the visually hidden submit button keeps working.
 */
export function LiveForm({ path, children, ...props }: LiveFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const timer = useRef<number | undefined>(undefined);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-filtering", pending);
    return () => document.documentElement.removeAttribute("data-filtering");
  }, [pending]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function go() {
    if (!form.current) return;
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form.current)) {
      // "newest" is the default order, so it does not need to clutter the address.
      if (
        typeof value === "string" &&
        value !== "" &&
        !(key === "sort" && value === "newest")
      )
        params.append(key, value);
    }
    const query = params.toString();
    startTransition(() =>
      router.replace(query ? `${path}?${query}` : path, { scroll: false }),
    );
  }

  return (
    <form
      ref={form}
      action={path}
      method="get"
      onChange={() => {
        // A short pause so ticking several boxes in a row makes one search.
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(go, 250);
      }}
      onSubmit={(event) => {
        event.preventDefault();
        window.clearTimeout(timer.current);
        go();
      }}
      {...props}
    >
      {children}
    </form>
  );
}
