import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Service } from "@/types/service";

type PricingCopy = Dictionary["pricing"];

export function formatEuros(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** "€25", "from €80" or "On request", following the service's price type. */
export function formatPrice(
  service: Service,
  locale: Locale,
  copy: PricingCopy,
): string {
  if (service.priceType === "on_request" || service.price === null)
    return copy.onRequest;
  const amount = formatEuros(service.price, locale);
  return service.priceType === "from" ? `${copy.from} ${amount}` : amount;
}

/** "45 min", "1 h", "1 h 30 min" (Albanian: "1 orë 30 min"). */
export function formatDuration(minutes: number, copy: PricingCopy): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} ${copy.minutes}`;
  return rest === 0
    ? `${hours} ${copy.hours}`
    : `${hours} ${copy.hours} ${rest} ${copy.minutes}`;
}
