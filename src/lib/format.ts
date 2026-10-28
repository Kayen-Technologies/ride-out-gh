const money = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
});

export function formatMoney(amount: number, currency: string) {
  if (currency === "GHS") return money.format(amount);
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatGHS(amount: number) {
  return formatMoney(amount, "GHS");
}
