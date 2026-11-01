export const purposeOptions = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
] as const;

export const conditionOptions = [
  { value: "brand_new", label: "New" },
  { value: "used", label: "Used" },
] as const;

export const fuelOptions = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electric" },
] as const;

export const transmissionOptions = [
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
] as const;

export const bodyTypeOptions = [
  { value: "suv", label: "SUV" },
  { value: "sedan", label: "Sedan" },
  { value: "hatchback", label: "Hatchback" },
  { value: "pickup", label: "Pickup" },
  { value: "other", label: "Other" },
] as const;

/** Newest first, next year included because dealers list upcoming models. */
export function yearOptions() {
  const latest = new Date().getFullYear() + 1;
  return Array.from({ length: latest - 1990 + 1 }, (_, index) => String(latest - index));
}

export function labelFor(
  options: readonly { value: string; label: string }[],
  value: string,
) {
  return options.find((option) => option.value === value)?.label ?? "";
}
