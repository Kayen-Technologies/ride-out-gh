"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import type { Facets } from "@/features/buy/queries";
import { cn } from "cn";

type Props = {
  facets: Facets;
  brand?: string;
  model?: string;
  /** "card" is the labelled pair in the desktop filter card; "bar" is the compact pair in the mobile bar. */
  variant: "card" | "bar";
};

const matchBrand = (facets: Facets, value: string | undefined) =>
  facets.brands.find((b) => b.toLowerCase() === (value ?? "").toLowerCase()) ??
  "";

/**
 * The brand and model choosers. The model list is rebuilt from the chosen brand as soon as it changes, and
 * the model is cleared when it no longer fits, so a person can never pick a model the brand does not have.
 */
export function BrandModelFields({ facets, brand, model, variant }: Props) {
  const [current, setCurrent] = useState(matchBrand(facets, brand));
  // What the model chooser starts on. Kept here (not read from the address) so clearing the brand also
  // clears a model that no longer fits, even before the new address arrives.
  const [chosenModel, setChosenModel] = useState(model ?? "");
  const models = current
    ? (facets.modelsByBrand[current] ?? [])
    : [...new Set(Object.values(facets.modelsByBrand).flat())].sort((a, b) =>
        a.localeCompare(b),
      );
  const selectedModel =
    models.find((m) => m.toLowerCase() === chosenModel.toLowerCase()) ?? "";

  function onBrandChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setCurrent(event.target.value);
    setChosenModel("");
    // Clear the model in the page itself too, so a form that submits right now sends no stale model.
    const field = event.target.form?.elements.namedItem("model");
    if (field instanceof HTMLSelectElement) field.value = "";
  }

  const brandSelect = (
    <select
      name="brand"
      defaultValue={current}
      onChange={onBrandChange}
      className={cn(
        "w-full cursor-pointer bg-transparent text-sm font-medium outline-none",
        variant === "bar" && "appearance-none pr-7",
      )}
    >
      <option value="">Any brand</option>
      {facets.brands.map((b) => (
        <option key={b} value={b}>
          {b}
        </option>
      ))}
    </select>
  );
  const modelSelect = (
    <select
      key={current}
      name="model"
      defaultValue={selectedModel}
      onChange={(event) => setChosenModel(event.target.value)}
      className={cn(
        "w-full cursor-pointer bg-transparent text-sm font-medium outline-none",
        variant === "bar" && "appearance-none pr-7",
      )}
    >
      <option value="">Any Model</option>
      {models.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  );

  if (variant === "bar") {
    const box =
      "relative flex h-14 min-w-0 flex-1 items-center rounded-md bg-[#efefef] px-2 text-[#1e1e1e]";
    return (
      <>
        <label className={box}>
          <span className="sr-only">Car brand</span>
          {brandSelect}
          <ChevronDown
            className="pointer-events-none absolute right-2 size-5"
            aria-hidden
          />
        </label>
        <label className={box}>
          <span className="sr-only">Model</span>
          {modelSelect}
          <ChevronDown
            className="pointer-events-none absolute right-2 size-5"
            aria-hidden
          />
        </label>
      </>
    );
  }

  const box =
    "flex flex-col gap-0.5 rounded-md border border-[#b9b9b9] bg-white px-3 py-1.5 text-[#1e1e1e]";
  return (
    <>
      <label className={box}>
        <span className="text-xs text-[#555]">Car brand</span>
        {brandSelect}
      </label>
      <label className={box}>
        <span className="text-xs text-[#555]">Model</span>
        {modelSelect}
      </label>
    </>
  );
}
