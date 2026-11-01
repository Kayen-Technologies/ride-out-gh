function formatGHSAmount(amount: number) {
  const hasFraction = Math.abs(amount - Math.round(amount)) > 1e-9;
  const formatted = new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(amount);
  // Figma: space after symbol (GH₵ 185,000). Intl often omits it.
  return formatted.replace(/^(GH₵|GHS|\u20b5)(?=\S)/, "$1\u00a0");
}

export function formatMoney(amount: number, currency: string) {
  if (currency === "GHS") return formatGHSAmount(amount);
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatGHS(amount: number) {
  return formatGHSAmount(amount);
}

/** Sale listing price (Figma: GH₵ 185,000). */
export function formatVehicleSalePrice(amount: number) {
  return formatGHSAmount(amount);
}

/** Rental daily rate (Figma: GH₵ 650 / day). */
export function formatVehicleRentPrice(amount: number) {
  return `${formatGHSAmount(amount)} / day`;
}
