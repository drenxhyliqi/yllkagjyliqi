import type { Locale } from "@/i18n/config";
import { formatLongDate as formatDate } from "@/lib/dates";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Service } from "@/types/service";

type PricingCopy = Dictionary["pricing"];

/**
 * "€25" / "25 €". Written out rather than using Intl, which falls back to
 * English in browsers without Albanian locale data.
 */
export function formatEuros(amount: number, locale: Locale): string {
  // Whole euros stay whole; cents show as "12,50 €" / "€12.50".
  const value = Number.isInteger(amount)
    ? String(amount)
    : amount.toFixed(2).replace(".", locale === "sq" ? "," : ".");
  return locale === "sq" ? `${value} €` : `€${value}`;
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

/** "Saturday, 12 October" / "e shtunë, 12 tetor", from a "YYYY-MM-DD" key. */
export function formatLongDate(dateKey: string, locale: Locale): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return formatDate(new Date(year, month - 1, day), locale);
}
