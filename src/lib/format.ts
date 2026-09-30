import { CURRENCIES } from "./types";

export function money(amount: number, currency: string, compact = false) {
  const locale = CURRENCIES.find((c) => c.code === currency)?.locale ?? "en-IN";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(amount);
}

export function currencySymbol(currency: string) {
  const locale = CURRENCIES.find((c) => c.code === currency)?.locale ?? "en-IN";
  return (
    new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? currency
  );
}
