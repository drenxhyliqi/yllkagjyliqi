import { adminText } from "@/i18n/admin";
import { formatEuros } from "@/lib/format";
import type { AdminService } from "@/types/admin-content";

const text = adminText.services;

/** "45 min", "1 orë", "1 orë 30 min". */
export function durationLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} ${text.minutes}`;
  return rest === 0 ? `${hours} ${text.hours}` : `${hours} ${text.hours} ${rest} ${text.minutes}`;
}

/** "25 €", "nga 80 €" or "Me marrëveshje". */
export function priceLabel(service: Pick<AdminService, "price" | "price_type">): string {
  if (service.price_type === "on_request" || service.price === null) return text.onRequest;
  const amount = formatEuros(service.price, "sq");
  return service.price_type === "from" ? `${text.from} ${amount}` : amount;
}
